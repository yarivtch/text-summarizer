# text-summarizer
Text summarization application using AI models
# Text Summarizer


## דרישות מערכת
- Python 3.8+
- Ollama מותקן עם מודל Aya
- דפדפן מודרני

## התקנה

### Backend
1. התקן את הספריות הנדרשות:
```bash
cd backend
pip install -r requirements.txt
```

2. הפעל את השרת:
```bash
python server.py
```

### Frontend
1. פתח את קובץ `frontend/index.html` בדפדפן
2. או השתמש בשרת מקומי:
```bash
cd frontend
python -m http.server 8080
```

## שימוש
1. הכנס טקסט לשדה הטקסט
2. בחר את סוג הסיכום הרצוי
3. לחץ על "סכם טקסט"

## מבנה הפרויקט
- `backend/` - קוד צד שרת
  - `server.py` - שרת FastAPI
  - `requirements.txt` - תלויות Python
- `frontend/` - קוד צד לקוח
  - `index.html` - דף ראשי
  - `css/` - קבצי עיצוב
  - `js/` - קוד JavaScript
  - `assets/` - משאבים נוספים