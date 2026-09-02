import os
import math
import numpy as np
import cv2
from PIL import Image
import imageio

SOURCE_IMAGE_PATH = r"C:/Users/ADMIN/.gemini/antigravity/brain/1b443f03-bb68-4598-9337-4b5aae3e46b6/.user_uploaded/media_1788347357290.webp"
ASSETS_DIR = r"c:/Users/ADMIN/Desktop/blood_donation/assets"
os.makedirs(ASSETS_DIR, exist_ok=True)

# 1. Load Source Image
img_pil = Image.open(SOURCE_IMAGE_PATH).convert("RGB")
orig_w, orig_h = img_pil.size
print(f"Loaded source image: {orig_w}x{orig_h}")

# Save high-quality poster images
img_pil.save(os.path.join(ASSETS_DIR, "blood-cells-bg.webp"), "WEBP", quality=90)
img_pil.save(os.path.join(ASSETS_DIR, "blood-cells-bg.jpg"), "JPEG", quality=90)
print("Saved poster images: blood-cells-bg.webp and blood-cells-bg.jpg")

# 2. Setup Video Render Parameters
TARGET_W, TARGET_H = 1280, 720  # Fast, crisp 720p HD motion background
FPS = 30
DURATION_SEC = 8  # 8-second seamless loop (240 frames)
TOTAL_FRAMES = FPS * DURATION_SEC

# Convert base image to OpenCV BGR
base_cv = np.array(img_pil)
base_bgr = cv2.cvtColor(base_cv, cv2.COLOR_RGB2BGR)

# Resize base to fit canvas with safety margin for pan/zoom
MARGIN = 1.25
render_w = int(TARGET_W * MARGIN)
render_h = int(TARGET_H * MARGIN)
base_resized = cv2.resize(base_bgr, (render_w, render_h), interpolation=cv2.INTER_LANCZOS4)

# Generate synthetic floating blood cell particles
np.random.seed(42)
NUM_PARTICLES = 45
particles = []
for _ in range(NUM_PARTICLES):
    particles.append({
        'x': np.random.uniform(0, render_w),
        'y': np.random.uniform(0, render_h),
        'radius': np.random.uniform(6, 24),
        'speed_x': np.random.uniform(0.8, 2.5),
        'speed_y': np.random.uniform(-0.4, 0.4),
        'alpha': np.random.uniform(0.25, 0.65),
        'phase': np.random.uniform(0, math.pi * 2),
        'wobble_freq': np.random.uniform(1.0, 3.0)
    })

frames = []

print("Rendering motion video frames...")
for f in range(TOTAL_FRAMES):
    t = f / TOTAL_FRAMES  # 0.0 to 1.0
    angle = t * 2 * math.pi
    
    # 1. Dynamic Camera Zoom & Pan (smooth sinusoidal loop)
    zoom = 1.0 + 0.08 * (0.5 + 0.5 * math.cos(angle))
    pan_x = int((render_w - TARGET_W) / 2 + math.sin(angle) * 35)
    pan_y = int((render_h - TARGET_H) / 2 + math.cos(angle) * 20)
    
    # Crop viewing window
    crop_w = int(TARGET_W / zoom)
    crop_h = int(TARGET_H / zoom)
    
    crop_x1 = max(0, min(render_w - crop_w, pan_x))
    crop_y1 = max(0, min(render_h - crop_h, pan_y))
    crop_x2 = crop_x1 + crop_w
    crop_y2 = crop_y1 + crop_h
    
    frame_crop = base_resized[crop_y1:crop_y2, crop_x1:crop_x2]
    frame_curr = cv2.resize(frame_crop, (TARGET_W, TARGET_H), interpolation=cv2.INTER_LINEAR)
    
    # 2. Heartbeat Vascular Bioluminescent Pulse (gentle vascular glow)
    pulse = math.sin(t * 8 * math.pi) ** 2 * 0.12
    pulse_overlay = np.zeros_like(frame_curr, dtype=np.float32)
    # Brighten red and subtle magenta glow
    pulse_overlay[:, :, 2] = 255.0 * pulse * 0.7   # Red channel
    pulse_overlay[:, :, 0] = 120.0 * pulse * 0.25  # Blue channel
    
    frame_f = frame_curr.astype(np.float32) + pulse_overlay
    frame_f = np.clip(frame_f, 0, 255).astype(np.uint8)
    
    # 3. Animate Flowing Floating Erythrocytes (Blood Particles)
    particle_overlay = np.zeros((TARGET_H, TARGET_W, 3), dtype=np.uint8)
    for p in particles:
        # Move particle with periodic boundary wrap-around
        px = (p['x'] + p['speed_x'] * f * (render_w / TOTAL_FRAMES)) % render_w
        py = (p['y'] + p['speed_y'] * f * (render_h / TOTAL_FRAMES) + math.sin(p['phase'] + angle * p['wobble_freq']) * 12) % render_h
        
        # Transform to target screen coords
        sx = int((px - crop_x1) * (TARGET_W / crop_w))
        sy = int((py - crop_y1) * (TARGET_H / crop_h))
        
        if 0 <= sx < TARGET_W and 0 <= sy < TARGET_H:
            sr = int(p['radius'] * zoom)
            # Draw glowing red erythrocyte disc
            color = (int(30 * p['alpha']), int(40 * p['alpha']), int(220 * p['alpha']))
            cv2.circle(particle_overlay, (sx, sy), sr, color, -1)
            # Soft inner highlight
            cv2.circle(particle_overlay, (int(sx - sr*0.25), int(sy - sr*0.25)), max(1, int(sr*0.35)), (int(60 * p['alpha']), int(90 * p['alpha']), int(255 * p['alpha'])), -1)
            
    # Soften particles with blur for bokeh depth of field
    particle_overlay = cv2.GaussianBlur(particle_overlay, (15, 15), 0)
    
    # Blend particles into frame
    frame_blended = cv2.addWeighted(frame_f, 1.0, particle_overlay, 0.45, 0)
    
    # Convert back to RGB for imageio writer
    frame_rgb = cv2.cvtColor(frame_blended, cv2.COLOR_BGR2RGB)
    frames.append(frame_rgb)
    
    if (f + 1) % 60 == 0 or (f + 1) == TOTAL_FRAMES:
        print(f"Rendered {f + 1}/{TOTAL_FRAMES} frames")

# 4. Save Video in MP4 Format
mp4_path = os.path.join(ASSETS_DIR, "blood-cells-motion.mp4")
print("Encoding MP4 video...")
with imageio.get_writer(mp4_path, fps=FPS, codec="libx264", quality=8, pixelformat="yuv420p") as writer:
    for frame in frames:
        writer.append_data(frame)
print(f"Successfully saved MP4: {mp4_path} ({os.path.getsize(mp4_path)} bytes)")

print("Video and asset generation complete!")
