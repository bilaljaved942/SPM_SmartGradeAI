import sys

try:
    import PyPDF2
except ImportError:
    try:
        import pypdf as PyPDF2
    except ImportError:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
        import pypdf as PyPDF2

try:
    reader = PyPDF2.PdfReader('spm.pdf')
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    with open('pdf_text.txt', 'w', encoding='utf-8') as f:
        f.write(text)
    print("PDF extracted successfully to pdf_text.txt")
except Exception as e:
    print(f"Error extracting PDF: {e}")
