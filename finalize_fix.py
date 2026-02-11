
import os
import re

# --- Finalize Index Page About Logic ---
index_path = r"C:\Users\Adamn\.gemini\antigravity\scratch\shot-cosmetics-website\index.html"
with open(index_path, 'r', encoding='utf-8') as f:
    idx_content = f.read()

# We want to replace the debug logic with clean production logic
# The debug logic we added was:
# if (about.image) { ... el.style.border = '5px solid red'; ... }

# New clean logic:
# - Get URL
# - Set BG Image
# - Set BG Color transparent
# - Ensure MinHeight (to safe-guard against collapse)
# - Force Display block

clean_logic = """            if (about.image) {
                const imgUrl = StrapiAPI.getImageUrl(about.image);
                if (imgUrl) {
                    const el = document.getElementById('about-image');
                    el.style.backgroundImage = `url('${imgUrl}')`;
                    el.style.backgroundPosition = 'center top';
                    el.style.backgroundSize = 'cover';
                    el.style.backgroundColor = 'transparent';
                    // Ensure visibility on mobile
                    el.style.minHeight = '250px'; 
                    el.style.display = 'block';
                    el.parentElement.style.display = 'block';
                } else {
                    // Fallback if URL invalid but object exists
                    document.getElementById('about-image').style.display = 'none';
                }
            } else {
                // No image data
                 document.getElementById('about-image').style.display = 'none';
            }
            """

# Find the block again.
# We look for "About Image Debug" log as a marker since we added it 
# But wait, I added the log inside the block.
# Start marker: "if (about.image) {"
# End marker: "// Reveal about section"

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
    new_lines = lines[:start_idx] + [clean_logic] + lines[end_idx:]
    final_content = "\n".join(new_lines)
    
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print("Index page normalized.")
else:
    print("Could not find code block in index.html")

