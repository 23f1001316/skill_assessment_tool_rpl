import json

with open("assessment_guide_raw.json", "r", encoding="utf-8") as f:
    pages = json.load(f)

print(f"Total pages: {len(pages)}")
for p in pages:
    lines = [l for l in p['full_text'].split('\n') if l.strip()]
    header = " | ".join(lines[:3]) if lines else "EMPTY"
    # clean non-ascii for safe printing
    safe_header = header.encode('ascii', errors='replace').decode('ascii')
    print(f"Page {p['page_number']}: {safe_header[:100]}")
