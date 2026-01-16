from typing import Optional, List, Dict, Any
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import JSON, Column
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    full_name: Optional[str] = None
    projects: List["Project"] = Relationship(back_populates="owner")

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    status: str = Field(default="completed")
    
    # Yeni Eklenenler:
    risk_level: str  # Düşük, Yüksek, Kritik
    risk_score: int
    
    # Raporun tamamını JSON olarak saklayacağız
    # sa_column=Column(JSON) -> Bu sayede liste/dict yapısını olduğu gibi kaydederiz
    audit_report: Dict = Field(default={}, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")
    owner: Optional[User] = Relationship(back_populates="projects")