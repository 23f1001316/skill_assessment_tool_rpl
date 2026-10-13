import json

with open("assessment_guide_raw.json", "r", encoding="utf-8") as f:
    pages = json.load(f)

for p_num in [3, 6, 7, 15, 16, 27, 28]:
    p = pages[p_num - 1]
    print(f"\n==========================================")
    print(f"PAGE {p_num}")
    print(f"==========================================")
    print(p["full_text"].encode('ascii', errors='replace').decode('ascii'))
