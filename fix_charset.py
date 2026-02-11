
import os

# --- Fix Contact Page ---
contact_path = r"C:\Users\Adamn\.gemini\antigravity\scratch\shot-cosmetics-website\pages\contact.html"
with open(contact_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Fix text explicitly
# The user sees replacement chars, implying current file bytes are bad.
# We replace the whole h1 line with correct chars.
if 'Skontaktuj si' in content:
    # Use loose matching to catch "Skontaktuj si z nami" or similar
    import re
    content = re.sub(r'<h1[^>]*>.*?Skontaktuj.*?</h1>', '<h1 style="margin-bottom: 1rem; color: var(--color-purple-dark);">Skontaktuj się z nami</h1>', content, flags=re.DOTALL)
else:
    # If not found (maybe already correct?), just ensure it's there?
    # It might be that I can't find it if it's garbled.
    pass

# Fix padding - bump to 12rem
content = content.replace("padding-top: 10.5rem", "padding-top: 12rem")
content = content.replace("padding-top: 8.5rem", "padding-top: 12rem")
content = content.replace("padding-top: 7rem", "padding-top: 12rem")

# Write back as nice UTF-8
with open(contact_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Contact page fixed.")

# --- Fix Index Page About Image Debug ---
index_path = r"C:\Users\Adamn\.gemini\antigravity\scratch\shot-cosmetics-website\index.html"
with open(index_path, 'r', encoding='utf-8') as f:
    index_content = f.read()

# Add pink background for debugging visibility
if "el.style.backgroundColor = 'transparent';" in index_content:
    index_content = index_content.replace(
        "el.style.backgroundColor = 'transparent';", 
        "el.style.backgroundColor = 'pink'; // DEBUG: Pink if image link broken"
    )

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(index_content)

print("Index page updated with pink debug background.")
