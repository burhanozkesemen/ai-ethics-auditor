import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document

# .env yükle
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

# 1. Embedding Modelini Seç (Metni sayıya çeviren model)
# Google'ın ücretsiz embedding modeli 'models/embedding-001'
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/text-embedding-004",
    google_api_key=api_key
)

# 2. Vektör Veritabanı Ayarları
# Verileri 'backend/vector_db' klasöründe saklayacağız
PERSIST_DIRECTORY = os.path.join(os.getcwd(), "vector_db")

def get_vector_store():
    """ChromaDB veritabanı bağlantısını getirir."""
    vector_store = Chroma(
        collection_name="regulations",
        embedding_function=embeddings,
        persist_directory=PERSIST_DIRECTORY
    )
    return vector_store

def initialize_laws():
    """Veritabanına temel yasaları yükler (Sadece ilk seferde çalıştır)."""
    vector_store = get_vector_store()
    
    # Şimdilik örnek veri ekliyoruz. İleride buraya PDF okuyucu bağlayacağız.
    laws = [
        Document(
            page_content="KVKK Madde 6: Kişilerin ırkı, etnik kökeni, siyasi düşüncesi, felsefi inancı, dini, mezhebi, kılık ve kıyafeti, dernek, vakıf ya da sendika üyeliği, sağlığı, cinsel hayatı, ceza mahkûmiyeti ve güvenlik tedbirleriyle ilgili verileri ile biyometrik ve genetik verileri özel nitelikli kişisel veridir. İlgili kişinin açık rızası olmaksızın işlenmesi yasaktır.",
            metadata={"source": "KVKK", "topic": "Sensitive Data"}
        ),
        Document(
            page_content="EU AI Act - Yasaklanmış Yapay Zeka Uygulamaları: İnsanların davranışlarını manipüle eden, savunmasız grupları istismar eden veya kamuya açık alanlarda gerçek zamanlı uzaktan biyometrik tanımlama (yüz tanıma) yapan sistemler yasaktır.",
            metadata={"source": "EU AI Act", "risk_level": "Unacceptable Risk"}
        ),
        Document(
            page_content="EU AI Act - Yüksek Riskli Sistemler: Eğitim, istihdam, kredi skorlama, göçmenlik ve kritik altyapı yönetiminde kullanılan yapay zeka sistemleri 'Yüksek Riskli' olarak sınıflandırılır ve sıkı denetime tabidir.",
            metadata={"source": "EU AI Act", "risk_level": "High Risk"}
        ),
        Document(
            page_content="GDPR Madde 22: Veri öznesi, kendisiyle ilgili hukuki sonuçlar doğuran veya benzer şekilde önemli ölçüde etkileyen, sadece otomatik işlemeye (profilleme dahil) dayalı bir karara tabi olmama hakkına sahiptir.",
            metadata={"source": "GDPR", "topic": "Automated Decision Making"}
        )
    ]
    
    # Verileri ekle
    vector_store.add_documents(documents=laws)
    print("✅ Yasalar Vektör Veritabanına Yüklendi!")

def search_laws(query: str, k: int = 2):
    """Verilen soruyla ilgili en yakın yasa maddelerini bulur."""
    vector_store = get_vector_store()
    results = vector_store.similarity_search(query, k=k)
    return results