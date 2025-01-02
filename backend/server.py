import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import json

app = FastAPI()

MAX_RETRIES = 3
RETRY_DELAY = 1  # שניות

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

async def try_ollama_request(payload):
    for attempt in range(MAX_RETRIES):
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(OLLAMA_API_URL, json=payload)
                if response.status_code == 200:
                    return response
                else:
                    print(f"Attempt {attempt + 1} failed with status {response.status_code}")
                    
        except Exception as e:
            print(f"Attempt {attempt + 1} failed with error: {str(e)}")
            if attempt < MAX_RETRIES - 1:  # אם זה לא הניסיון האחרון
                await asyncio.sleep(RETRY_DELAY)
            continue
            
    raise HTTPException(status_code=503, detail="Failed to connect to Ollama after multiple attempts")

@app.post("/analyze")
async def analyze_text(request: dict):
    try:
        text = request.get("text", "")
        if not text:
            return {"error": "Text is required"}

        model = request.get("model", "aya")
        summary_type = request.get("summary_type", "short")
        prompt = create_summary_prompt(text, summary_type)
        
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": True
        }

        full_response = ""
        try:
            response = await try_ollama_request(payload)
            response_text = response.content.decode()
            
            for line in response_text.split('\n'):
                if line.strip():
                    try:
                        json_response = json.loads(line)
                        if 'response' in json_response:
                            full_response += json_response['response']
                    except json.JSONDecodeError:
                        continue

            return {"result": full_response}
            
        except HTTPException as he:
            return {"error": str(he.detail)}
            
    except Exception as e:
        print(f"General error: {str(e)}")
        return {"error": f"Server error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)