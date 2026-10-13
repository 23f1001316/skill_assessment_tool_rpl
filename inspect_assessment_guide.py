import os
import pypdfium2 as pdfium
import json

DATA_DIR = r"c:\Users\samta\OneDrive\Desktop\rpl\data"
fpath = os.path.join(DATA_DIR, "Assessment_Guide.pdf.pdf")

doc = pdfium.PdfDocument(fpath)
print(f"Total pages in Assessment Guide: {len(doc)}")

pages_data = []
for i, page in enumerate(doc):
    text = page.get_textpage().get_text_range()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    pages_data.append({
        "page_number": i + 1,
        "char_count": len(text),
        "line_count": len(lines),
        "first_few_lines": lines[:6],
        "full_text": text
    })

# Write to json with utf-8
out_path = os.path.join(r"c:\Users\samta\OneDrive\Desktop\rpl", "assessment_guide_raw.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(pages_data, f, indent=2, ensure_ascii=False)

print("Saved assessment_guide_raw.json successfully!")
for p in pages_data:
    print(f"P{p['page_number']}: {p['first_few_lines'][:3]}")
