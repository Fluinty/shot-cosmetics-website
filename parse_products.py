import re

try:
    with open('temp_products.html', 'r', encoding='utf-8') as f:
        content = f.read()
except UnicodeDecodeError:
    with open('temp_products.html', 'r', encoding='latin-1') as f:
        content = f.read()

# Regex to find product items (heuristic based on common patterns)
# Looking for images and titles near each other
# Pattern: <img ... src="(...)" ...> ... <a ...>(Product Name)</a>
# This is a guess, I'll refine it by looking at the file content via grep first if this fails, 
# but let's try to dump all images and potential titles.

print("--- IMAGES ---")
images = re.findall(r'<img[^>]+src="([^">]+)"', content)
for img in images:
    if 'product' in img or 'upload' in img:
        print(img)

print("\n--- POTENTIAL TITLES ---")
titles = re.findall(r'<h[34][^>]*>(.*?)</h[34]>', content)
for title in titles:
    print(title.strip())

print("\n--- LINKS ---")
links = re.findall(r'<a[^>]+href="([^">]+)"[^>]*>(.*?)</a>', content)
for link, text in links:
    if 'product' in link or len(text) > 5:
        print(f"{link} : {text.strip()}")
