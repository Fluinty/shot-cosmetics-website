import os
import re

def migrate_map():
    base_dir = r"C:\Users\Adamn\.gemini\antigravity\scratch\shot-cosmetics-website"
    contact_path = os.path.join(base_dir, "pages", "contact.html")
    index_path = os.path.join(base_dir, "index.html")

    # Read Contact content
    with open(contact_path, "r", encoding="utf-8") as f:
        contact_content = f.read()

    # Extract Map Section (using regex or markers)
    # We want the block: <div class="card grid-2-cols" style="gap: 2rem; border: none; align-items: start;"> ... </div> (inclusive)
    # And the script: <script> const distributors = ... </script>

    # Regex for Map Section
    # It starts with the specific class and style
    map_start_marker = '<div class="card grid-2-cols" style="gap: 2rem; border: none; align-items: start;">'
    map_end_marker = '<!-- Info Panel -->'
    
    # Actually, let's just find the start and the matching closing div? 
    # Or just extract by known unique strings. 
    # In contact.html (Step 76), the map section starts around line 154.
    # It ends with closing the card div.
    
    # Let's be more robust. Let's look for the comment <!-- Distributor Map --> in contact.html?
    # Line 148: <!-- Distributor Map -->
    # Then line 154 starts the card.
    
    start_idx = contact_content.find('<!-- Distributor Map -->')
    if start_idx == -1:
        print("Error: Could not find Map section in contact.html")
        return

    # Find the end of the main section. content.html has </main> after the map div closing.
    # The map div is the last big thing before </main>.
    end_idx = contact_content.find('</main>')
    
    # Determine precise range
    # The map section in contact.html is:
    # <div style="margin-top: 6rem;"> ... </div>
    # Let's extract that inner part.
    
    map_content = contact_content[start_idx:end_idx].strip()
    
    # Now extract the script
    script_start = contact_content.find('const distributors = {')
    script_end = contact_content.find('</script>', script_start)
    script_content = contact_content[script_start:script_end].strip()

    # Read Index Content
    with open(index_path, "r", encoding="utf-8") as f:
        index_content = f.read()

    # Prepare new map HTML (adjusting paths in SVG if any... wait, SVG uses internal IDs, images use ../assets. We need to fix image paths!)
    # Image in contact.html (line 250): src="../assets/images/educator1.png"
    # Index.html is in root, so it should be src="assets/images/educator1.png"
    
    # Fix paths in map_content
    map_content_fixed = map_content.replace('../assets/', 'assets/')
    # Also fix any other relative links if necessary. links in contact map are keys only.
    
    # prepare new script content
    # The script uses `document.querySelectorAll('.voivodship')` which relies on the HTML.
    # We need to wrap the script content in <script> tags or replace the existing script block.
    
    # Script in index.html starts around line 227: <script> const distributors = ...
    index_script_start = index_content.find('const distributors = {')
    # Find the opening <script> tag before it
    script_tag_start = index_content.rfind('<script>', 0, index_script_start)
    script_tag_end = index_content.find('</script>', index_script_start) + 9
    
    # HTML Replacement in Index
    # We want to replace the existing "Dystrybucja" section.
    # It starts with <section class="container" style="margin-top: 6rem; margin-bottom: 6rem;">
    # And ends with </section>
    
    section_start = index_content.find('<section class="container" style="margin-top: 6rem; margin-bottom: 6rem;">')
    section_end = index_content.find('</section>', section_start) + 10
    
    if section_start == -1 or index_script_start == -1:
        print("Error: Could not find target sections in index.html")
        return

    # Construct new HTML
    # We'll use the copied map content but wrap it in the section tag if needed, or replace the inner content.
    # The copied `map_content` starts with <!-- Distributor Map --> and <div style="margin-top: 6rem;">
    
    # Ideally we keep index.html's section wrapper but replace inner.
    # Index:
    # <section ...>
    #    <div class="text-center" ...> ... </div>
    #    <div class="card grid-2-cols" ...> ... </div>
    #    iframe div
    # </section>
    
    # Contact Map content includes the header (Znajdź Dystrybutora) and the map card.
    # We can just plop `map_content_fixed` inside the <main>... basically replacing the last section.
    
    new_index_content = index_content[:section_start] + '<section class="container" style="margin-top: 6rem; margin-bottom: 6rem;">\n' + map_content_fixed + '\n</section>' + index_content[section_end:script_tag_start] + '<script>\n' + script_content + '\n</script>' + index_content[script_tag_end:]
    
    # Wait, `map_content` includes `div style="margin-top: 6rem;"`. If we wrap it in `section`, we might have double margins.
    # Let's clean up `map_content`.
    # It has a wrapper div. We can use it.
    
    # Actually, simplest is to Replace the Section in index with the "Distributor Map" div from Contact?
    # Contact: <div style="margin-top: 6rem;"> [Header] [MapCard] </div>
    # Index: <section ...> [Header] [List] [Map] </section>
    
    # Let's replace the Index Section with the Contact Div (and maybe change div to section or keep style).
    # map_content_fixed is the whole block.
    
    new_section_html = map_content_fixed.replace('<div style="margin-top: 6rem;">', '<section class="container" style="margin-top: 6rem; margin-bottom: 6rem;">', 1)
    if new_section_html.endswith('</div>'):
         new_section_html = new_section_html[:-6] + '</section>' # Replace last div with section
         
    # This might be brittle. Let's just create the string manually from what we know is in contact.
    
    # Write result
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(new_index_content)
    
    print("Migration successful.")

# Execute
migrate_map()
