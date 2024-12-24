from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import json

app = FastAPI()

# CORS הגדרות
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_API_URL = "http://localhost:11434/api/generate"

def create_summary_prompt(text: str, summary_type: str = "short") -> str:
    """יוצר הנחיה מותאמת לפי סוג הסיכום הנדרש"""
    prompts = {
        "short": f"""סכם את הטקסט הבא ב-3 משפטים קצרים בלבד. התמקד רק בנקודות החשובות ביותר:

{text}""",
        
        "bullets": f"""סכם את הטקסט הבא ב-3 נקודות עיקריות:
1.
2.
3.

{text}""",
        
        "very_short": f"""תן סיכום של משפט אחד בלבד (לא יותר מ-20 מילים) לטקסט הבא:

{text}""",
        
        "focused": f"""התמקד בניסיון התעסוקתי וההמלצות העיקריות מהטקסט הבא. סכם ב-3 משפטים לכל היותר:

{text}"""
    }
    return prompts.get(summary_type, prompts["short"])

@app.post("/analyze")
async def analyze_text(request: dict):
    try:
        text = request.get("text", "")
        print(f"Received text: {text[:100]}...")  # הדפסת 100 תווים ראשונים לדיבוג
        
        if not text:
            return {"error": "Text is required"}

        summary_type = request.get("summary_type", "short")
        prompt = create_summary_prompt(text, summary_type)
        
        payload = {
            "model": "aya",
            "prompt": prompt,
            "stream": True
        }

        print("Sending request to Ollama...")
        full_response = ""
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(OLLAMA_API_URL, json=payload)
                print(f"Got response with status: {response.status_code}")
                
                response_text = response.content.decode()
                print(f"Raw response: {response_text[:200]}...")
                
                for line in response_text.split('\n'):
                    if line.strip():
                        try:
                            json_response = json.loads(line)
                            if 'response' in json_response:
                                full_response += json_response['response']
                        except json.JSONDecodeError as je:
                            print(f"JSON decode error: {je}")
                            continue

                return {"result": full_response}
                
            except httpx.RequestError as e:
                print(f"Request error: {str(e)}")
                return {"error": f"Failed to connect to Ollama: {str(e)}"}
                
    except Exception as e:
        print(f"Exception type: {type(e)}")
        print(f"Exception message: {str(e)}")
        return {"error": f"Server error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)