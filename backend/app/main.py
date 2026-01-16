from fastapi import FastAPI, Depends
from sqlmodel import Session, select
from contextlib import asynccontextmanager
from app.database import create_db_and_tables, get_session
from app.models import User, Project
from app.schemas import AuditRequest, AuditResponse
from app.agents import analyze_project
from fastapi.middleware.cors import CORSMiddleware
from app.models import User, Project
from typing import List

# Uygulama açılırken tabloları oluştur (Lifespan)
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan, title="AI Ethics Auditor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Güvenlik için normalde domain yazılır ama geliştirmede "*" (herkes) diyebiliriz.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Ethics Auditor API Çalışıyor 🚀"}

# --- YENİ EKLENEN KISIMLAR ---

# TEST İÇİN: Yeni kullanıcı ekleme endpoint'i
@app.post("/users/")
def create_user(user: User, session: Session = Depends(get_session)):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

# TEST İÇİN: Kullanıcıları listeleme endpoint'i
@app.get("/users/")
def read_users(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    return users


from app.ai import test_ai_connection

@app.get("/test-ai/")
def trigger_ai_test():
    """Gemini API bağlantısını test eder."""
    result = test_ai_connection()
    return result


from app.rag import initialize_laws, search_laws

@app.post("/rag/init/")
def init_knowledge_base():
    """Bilgi bankasını (ChromaDB) temel yasalarla doldurur."""
    try:
        initialize_laws()
        return {"status": "success", "message": "Bilgi bankası oluşturuldu ve yasalar yüklendi."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/rag/search/")
def search_knowledge_base(query: str):
    """Soruyla ilgili yasa maddelerini arar."""
    results = search_laws(query)
    # Sonuçları temiz bir formatta dön
    data = [{"content": doc.page_content, "source": doc.metadata["source"]} for doc in results]
    return {"results": data}


@app.post("/audit/analyze", response_model=AuditResponse)
def run_audit(request: AuditRequest, session: Session = Depends(get_session)):
    """Projeyi analiz eder, sonucu VERİTABANINA KAYDEDER ve döner."""
    
    # 1. Yapay Zeka Analizi Yap
    result = analyze_project(request)
    
    # 2. Sonucu Veritabanı Objesine Çevir
    new_project = Project(
        name=request.project_name,
        description=request.description,
        risk_score=result["overall_risk_score"],
        risk_level=result["risk_level"],
        audit_report=result, # Tüm raporu JSON olarak gömüyoruz
        status="completed"
    )
    
    # 3. Kaydet
    session.add(new_project)
    session.commit()
    session.refresh(new_project)
    
    return result

@app.get("/projects/", response_model=List[Project])
def get_projects(session: Session = Depends(get_session)):
    """Veritabanındaki tüm analiz geçmişini getirir."""
    # En yeniden eskiye doğru sırala
    statement = select(Project).order_by(Project.created_at.desc())
    projects = session.exec(statement).all()
    return projects

from fastapi import HTTPException 

@app.get("/projects/{project_id}", response_model=Project)
def get_project_detail(project_id: int, session: Session = Depends(get_session)):
    """ID'si verilen projenin detaylarını getirir."""
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
    return project