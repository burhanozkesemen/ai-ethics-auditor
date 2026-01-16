import json
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.ai import llm
from app.rag import search_laws
from app.schemas import AuditRequest, AuditResponse

# JSON çıktısını garantiye almak için parser
parser = JsonOutputParser(pydantic_object=AuditResponse)

# Ajanın "Sistem Promptu" (Talimatları)
ETHICIST_PROMPT = """
Sen uzman bir 'AI Etik Denetçisi'sin. Görevin, verilen yapay zeka projesini analiz etmek ve etik/hukuki riskleri belirlemektir.

Aşağıdaki YASAL REFERANSLARI kullanarak analizi yap:
{context}

PROJE DETAYLARI:
Adı: {project_name}
Sektör: {industry}
Açıklama: {description}

GÖREVLER:
1. Projenin KVKK, GDPR ve EU AI Act uyumluluğunu kontrol et.
2. Olası riskleri (Veri ihlali, ayrımcılık, şeffaflık vb.) belirle.
3. Her risk için somut çözüm önerisi sun.
4. 0-100 arası bir risk skoru ver (100 = En Yüksek Risk).

ÇIKTI FORMATI:
Sadece saf JSON formatında yanıt ver. Başka hiçbir metin ekleme.
Format şuna uymalıdır:
{{
    "project_name": "Proje Adı",
    "overall_risk_score": 85,
    "risk_level": "Yüksek",
    "summary": "Genel özet metni...",
    "risks": [
        {{
            "risk_type": "Gizlilik İhlali",
            "severity": "Kritik",
            "description": "Risk açıklaması...",
            "recommendation": "Çözüm önerisi..."
        }}
    ]
}}
"""

def analyze_project(request: AuditRequest) -> dict:
    """Projeyi analiz eder ve yapılandırılmış rapor döner."""
    
    # 1. Adım: İlgili yasaları RAG ile bul
    print(f"🔍 Yasalar taranıyor: {request.description[:50]}...")
    relevant_docs = search_laws(request.description + " " + request.industry)
    context_text = "\n".join([f"- {doc.page_content}" for doc in relevant_docs])
    
    # 2. Adım: Promptu hazırla
    prompt = ChatPromptTemplate.from_template(ETHICIST_PROMPT)
    chain = prompt | llm | parser
    
    # 3. Adım: Yapay Zekayı çalıştır
    print("🤖 Analiz yapılıyor...")
    try:
        result = chain.invoke({
            "context": context_text,
            "project_name": request.project_name,
            "industry": request.industry,
            "description": request.description
        })
        return result
    except Exception as e:
        # Hata durumunda boş ama geçerli bir yanıt dönelim
        print(f"HATA: {e}")
        return {
            "project_name": request.project_name,
            "overall_risk_score": 0,
            "risk_level": "Hata",
            "summary": "Analiz sırasında bir hata oluştu.",
            "risks": []
        }