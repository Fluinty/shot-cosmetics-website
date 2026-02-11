
import os
import re

# --- Tune Contact Page Padding ---
contact_path = r"C:\Users\Adamn\.gemini\antigravity\scratch\shot-cosmetics-website\pages\contact.html"
with open(contact_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Reduce padding from 12rem to 10rem
content = content.replace("padding-top: 12rem", "padding-top: 10rem")

with open(contact_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Contact page padding updated to 10rem.")

# --- Fix Index Page About Image Debug ---
index_path = r"C:\Users\Adamn\.gemini\antigravity\scratch\shot-cosmetics-website\index.html"
with open(index_path, 'r', encoding='utf-8') as f:
    idx_content = f.read()

# Replace the whole if/else block for about image with robust debug logic
# Find the block safely
start_marker = "if (about.image) {"
end_marker = "// Reveal about section"

# We'll regex replace the block between these markers
# The block handles the logic: gets URL, sets style OR sets height=0
# We want: 
# if URL: set styles, RED BORDER, minHeight=250px
# else: set BLUE BG, minHeight=250px (so visible even if broken)
# ALSO: force remove display:none if present

new_logic = """            if (about.image) {
                const imgUrl = StrapiAPI.getImageUrl(about.image);
                console.log('About Image Debug:', { about, imgUrl });
                const el = document.getElementById('about-image');
                // Force visibility reset
                el.style.display = 'block'; 
                el.parentElement.style.display = 'block'; 
                
                if (imgUrl) {
                    el.style.backgroundImage = `url('${imgUrl}')`;
                    el.style.backgroundPosition = 'center top';
                    el.style.backgroundSize = 'cover';
                    el.style.backgroundColor = 'transparent';
                    // Debug: Red Border
                    el.style.border = '5px solid red';
                    el.style.minHeight = '250px'; 
                } else {
                    // Debug: Blue Box if URL missing
                    el.style.backgroundColor = 'blue';
                    el.style.height = '250px';
                    el.style.minHeight = '250px';
                }
            } else {
                // Debug: Orange Box if no image object matches
                const el = document.getElementById('about-image');
                el.style.backgroundColor = 'orange';
                el.style.height = '250px';
                el.style.minHeight = '250px';
                el.style.display = 'block';
            }
            """

# Regex to find the original block
# Pattern matches content between "if (about.image) {" and "// Reveal about section"
# Note: we need to be careful with nested braces. 
# Simpler approach: match specific strings unique to the old code.

# Old code has:
# el.style.backgroundColor = 'pink'; ...
# else { document.getElementById('about-image').style.height = '0'; ... }

# Let's construct a pattern that covers most of it
pattern = r"if \(about\.image\) \{.*?console\.log\('About Image Debug'.*?\}\s*else\s*\{.*?\}"
# This is risky due to newlines and ".*?" non-greedy matching.

# Alternative: Read files, find line numbers, replace range.
lines = idx_content.splitlines()
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "if (about.image) {" in line:
        start_idx = i
    if "// Reveal about section" in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    # Replace lines between start_idx and end_idx
    new_lines = lines[:start_idx] + [new_logic] + lines[end_idx:]
    final_content = "\n".join(new_lines)
    
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print("Index page about logic updated.")
else:
    print("Could not find code block in index.html")

