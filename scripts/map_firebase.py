import json
import os

with open('apps/web/public/audio/firebase_catalog.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

folder_files = {}
for item in items:
    name = item['name']
    if '/' in name:
        folder, fname = name.split('/', 1)
        folder_files.setdefault(folder, []).append((fname, item.get('contentType'), item.get('size')))

print(f"Total folders with files: {len(folder_files)}")
for folder in sorted(folder_files.keys()):
    files = folder_files[folder]
    audio_files = [f for f in files if f[0].lower().endswith(('.ogg', '.ts', '.mp3', '.m4a', '.aac'))]
    images = [f for f in files if f[0].lower().endswith(('.jpg', '.png', '.webp'))]
    sample_ext = audio_files[0][0].split('.')[-1] if audio_files else 'none'
    print(f"Folder: '{folder}' -> {len(audio_files)} audio files ({sample_ext}), {len(images)} images")
