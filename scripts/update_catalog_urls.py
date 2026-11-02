import json
import re
import urllib.parse

with open('apps/web/public/audio/firebase_catalog.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

folder_audio = {}
for item in items:
    name = item['name']
    if '/' in name:
        folder, fname = name.split('/', 1)
        ext = fname.split('.')[-1].lower() if '.' in fname else ''
        if ext in ['mp3', 'ogg', 'ts']:
            folder_audio.setdefault(folder, []).append(fname)

def sort_key(s):
    return [int(c) if c.isdigit() else c.lower() for c in re.split(r'(\d+)', s)]

for f in folder_audio:
    folder_audio[f].sort(key=sort_key)

with open('apps/web/src/data/libraryCatalog.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
arthashastram_mp3_url = 'https://firebasestorage.googleapis.com/v0/b/vaagai-audio-books-36a4e.appspot.com/o/Arthashastram%2F01.mp3?alt=media&token=f23cdc19-d206-4e89-bd98-51dc916e7804'

current_folder = None
updated_count = 0

for line in lines:
    folder_match = re.search(r'folderName:\s*["\']([^"\']+)["\']', line)
    if folder_match:
        current_folder = folder_match.group(1)

    url_match = re.search(r'audioUrl:\s*["\'](https://storage\.googleapis\.com/vaagai-audio-books-36a4e\.appspot\.com/stories/[^"\']+)["\']', line)
    if url_match:
        old_url = url_match.group(1)
        is_ch1 = 'chapter1' in old_url
        is_ch2 = 'chapter2' in old_url
        
        if current_folder == 'Arthashastram' and is_ch1:
            new_url = arthashastram_mp3_url
        elif current_folder and current_folder in folder_audio:
            files = folder_audio[current_folder]
            chosen_file = None
            if is_ch1 and len(files) > 0:
                chosen_file = files[0]
            elif is_ch2 and len(files) > 1:
                chosen_file = files[1]
            elif len(files) > 0:
                chosen_file = files[0]
            
            if chosen_file:
                encoded_path = urllib.parse.quote(f'{current_folder}/{chosen_file}')
                new_url = f'https://firebasestorage.googleapis.com/v0/b/vaagai-audio-books-36a4e.appspot.com/o/{encoded_path}?alt=media'
            else:
                encoded_path = urllib.parse.quote(f'{current_folder}/01.ogg')
                new_url = f'https://firebasestorage.googleapis.com/v0/b/vaagai-audio-books-36a4e.appspot.com/o/{encoded_path}?alt=media'
        else:
            # Fallback direct path
            clean = old_url.replace('https://storage.googleapis.com/vaagai-audio-books-36a4e.appspot.com/stories/', '')
            clean = urllib.parse.unquote(clean)
            encoded_path = urllib.parse.quote(clean)
            new_url = f'https://firebasestorage.googleapis.com/v0/b/vaagai-audio-books-36a4e.appspot.com/o/{encoded_path}?alt=media'

        new_line = line.replace(old_url, new_url)
        new_lines.append(new_line)
        updated_count += 1
    else:
        new_lines.append(line)

with open('apps/web/src/data/libraryCatalog.ts', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f'Successfully updated {updated_count} URLs in libraryCatalog.ts!')
