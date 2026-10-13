import json
import re

with open("es_extracted_raw.json", "r", encoding="utf-8") as f:
    es_data = json.load(f)

for fname, data in es_data.items():
    print(f"\n==========================================")
    print(f"FILE: {fname} (Duration: {data['duration_hours']} Hours, Pages: {data['pages_count']})")
    print(f"==========================================")
    
    # Check for qualification code or NSQF mentions
    full_text = "\n".join([p["text"] for p in data["full_pages"]])
    codes = re.findall(r'[A-Z0-9_\-/]{6,25}', full_text)
    nsqf_matches = re.findall(r'NSQF\s*Level\s*[:\s]*(\d+)', full_text, re.IGNORECASE)
    print(f"NSQF mentions: {set(nsqf_matches)}")
    
    # Look for modules table on page 1 & 2
    p1 = data["full_pages"][0]["text"]
    lines = [l.strip() for l in p1.split('\n') if l.strip()]
    print("Page 1 Lines (first 25):")
    for l in lines[:25]:
        print("  ", l.encode('ascii', errors='replace').decode('ascii'))
