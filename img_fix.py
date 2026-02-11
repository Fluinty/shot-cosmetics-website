
import os
import re

# --- Switch About Image to IMG Tag ---
index_path = r"C:\Users\Adamn\.gemini\antigravity\scratch\shot-cosmetics-website\index.html"
with open(index_path, 'r', encoding='utf-8') as f:
    idx_content = f.read()

# Logic:
# Instead of el.style.backgroundImage = ...
# Use: el.innerHTML = `<img src="..." ...>`
# And ensure el has overflow: hidden (to keep border radius)

img_logic = """            if (about.image) {
                const imgUrl = StrapiAPI.getImageUrl(about.image);
                if (imgUrl) {
                    const el = document.getElementById('about-image');
                    // Switch to IMG tag for reliability
                    el.innerHTML = `<img src="${imgUrl}" alt="O nas" style="width: 100%; height: 100%; object-fit: cover; display: block;">`;
                    
                    // Reset container styles to support img
                    el.style.backgroundImage = 'none';
                    el.style.backgroundColor = 'transparent';
                    el.style.overflow = 'hidden'; // For border-radius
                    
                    // Ensure visibility
                    el.style.display = 'block';
                    el.parentElement.style.display = 'block';
                    
                    // Mobile height safeguard
                    if (window.innerWidth <= 768) {
                        el.style.minHeight = '250px';
                    }
                } else {
                    document.getElementById('about-image').style.display = 'none';
                }
            } else {
                 document.getElementById('about-image').style.display = 'none';
            }
            """

# Find block (same logic as before)
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
    new_lines = lines[:start_idx] + [img_logic] + lines[end_idx:]
    final_content = "\n".join(new_lines)
    
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print("Index page switched to IMG tag.")
else:
    print("Could not find code block in index.html")
