from pydantic import BaseModel
from typing import List, Optional

# Kullanıcıdan gelen analiz isteği
class AuditRequest(BaseModel):
    project_name: str
    description: str
    industry: str # Örn: Sağlık, Finans, Perakende

# Yapay Zekanın üreteceği Risk Raporu formatı
class RiskItem(BaseModel):
    risk_type: str        # Örn: Veri Mahremiyeti
    severity: str         # Örn: Kritik, Yüksek, Orta
    description: str      # Riskin açıklaması
    recommendation: str   # Ne yapılmalı?

class AuditResponse(BaseModel):
    project_name: str
    overall_risk_score: int # 0-100 arası (100 çok riskli)
    risk_level: str         # Düşük, Orta, Yüksek, Kritik
    risks: List[RiskItem]
    summary: str            # Genel değerlendirme