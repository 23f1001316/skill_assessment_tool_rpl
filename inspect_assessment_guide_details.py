import json
import re

with open("assessment_guide_raw.json", "r", encoding="utf-8") as f:
    guide_pages = json.load(f)

print("--- ASSESSING ASSESSMENT GUIDE ---")
full_text = "\n".join([p["full_text"] for p in guide_pages])

# Find title, NSQF level, awarding body
for p in guide_pages[:5]:
    print(f"\n--- Page {p['page_number']} ---")
    lines = [l.strip() for l in p['full_text'].split('\n') if l.strip()]
    for l in lines[:15]:
        print(" ", l.encode('ascii', errors='replace').decode('ascii'))

# Look for Assessment section headers: SECTION 1, SECTION 2, Assessment Strategy, Guidelines, Pass marks, etc.
sections = re.findall(r'(SECTION\s*\d+[^\n]*)', full_text, re.IGNORECASE)
print(f"\nSections found: {sections}")

# Search for assessment methods and rubrics
for p_idx, p in enumerate(guide_pages):
    t = p['full_text']
    if any(k in t.lower() for k in ['assessment method', 'pass mark', 'rubric', 'guideline for assessment', 'weightage', 'theory mark', 'practical mark']):
        print(f"\n[Page {p['page_number']}] Match found! Sample:")
        matching_lines = [l.strip() for l in t.split('\n') if any(k in l.lower() for k in ['assessment', 'pass', 'mark', 'method', 'rubric', 'criteria'])]
        for ml in matching_lines[:6]:
            print("  *", ml.encode('ascii', errors='replace').decode('ascii'))
