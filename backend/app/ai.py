import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

# .env dosyasını yükle
load_dotenv()

# API Anahtarını kontrol et
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("UYARI: GOOGLE_API_KEY bulunamadı! .env dosyasını kontrol et.")

try:
    # GÜNCELLEME: Listendeki 'gemini-flash-latest' en güvenli limandır.
    # Bu model, mevcut en iyi ve ücretsiz versiyona otomatik yönlenir.
    llm = ChatGoogleGenerativeAI(
        model="gemini-flash-latest", 
        temperature=0.7,
        google_api_key=api_key
    )
except Exception as e:
    llm = None
    print(f"Model başlatılamadı: {e}")

def test_ai_connection():
    """AI bağlantısını test etmek için basit bir fonksiyon."""
    if not llm:
        return {"status": "error", "message": "Model başlatılamadı, API key eksik olabilir."}
        
    try:
        messages = [
            SystemMessage(content="Sen yardımcı bir AI asistanısın."),
            HumanMessage(content="Merhaba! Python projemiz için kısa ve motive edici bir cümle söyle.")
        ]
        
        response = llm.invoke(messages)
        return {"status": "success", "reply": response.content}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}