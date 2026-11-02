import re

with open('apps/web/src/data/libraryCatalog.ts', 'r', encoding='utf-8') as f:
    text = f.read()

urls = re.findall(r'audioUrl:\s*[\'"]([^\'"]+)[\'"]', text)
unencoded_slash = [u for u in urls if '/o/' in u and '/' in u.split('/o/')[1].split('?')[0]]
print('Total audio URLs in catalog:', len(urls))
print('URLs with unencoded slashes after /o/:', len(unencoded_slash))
if unencoded_slash:
    print('Sample unencoded URL:', unencoded_slash[0])
