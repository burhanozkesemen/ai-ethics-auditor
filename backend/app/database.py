from sqlmodel import SQLModel, create_engine, Session
import os
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# Veritabanı adresini al
DATABASE_URL = os.getenv("DATABASE_URL")

# Bağlantı motorunu oluştur
engine = create_engine(DATABASE_URL, echo=True)

# Tabloları veritabanında oluşturma fonksiyonu
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# Dependency (Her istekte veritabanı oturumu açıp kapatan yapı)
def get_session():
    with Session(engine) as session:
        yield session