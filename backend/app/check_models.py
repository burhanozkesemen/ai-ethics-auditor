import os
from dotenv import load_dotenv
import google.generativeai as genai

# .env yükle
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("HATA: API Key bulunamadı!")
else:
    print(f"API Key bulundu: {api_key[:5]}...")
    
    # Google SDK'sını yapılandır
    genai.configure(api_key=api_key)
    
    print("\n--- ERİŞİLEBİLİR MODELLER LİSTESİ ---")
    try:
        # Tüm modelleri listele
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as e:
        print(f"Bir hata oluştu: {e}")