import re

with open('apps/web/src/data/libraryCatalog.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def repl(match):
    prefix = match.group(1)
    path = match.group(2)
    suffix = match.group(3)
    clean_path = path.replace('/', '%2F')
    return prefix + clean_path + suffix

pattern = re.compile(r'(https://firebasestorage\.googleapis\.com/v0/b/[^/]+/o/)([^?\'"]+)(\?alt=media)')
new_content = pattern.sub(repl, content)

with open('apps/web/src/data/libraryCatalog.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Updated libraryCatalog.ts successfully!')
