#!/usr/bin/env python3
"""
Script para crear un usuario admin.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.db.models.usuario_model import User
from src.utils.hash import hash_password
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_admin():
    db = SessionLocal()
    
    email = "admin@aurastream.com"
    password = "AdminPassword123!"
    
    # Verificar si el admin ya existe
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        print(f"El usuario {email} ya existe")
        db.close()
        return
    
    # Crear el admin
    admin = User(
        email=email,
        nombre="Administrador",
        password_hash=hash_password(password),
        is_admin=True,
        plan="premium"
    )
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    print(f"✅ Cuenta admin creada exitosamente!")
    print(f"📧 Email: {email}")
    print(f"🔑 Contraseña: {password}")
    print(f"👤 ID: {admin.id}")
    
    db.close()

if __name__ == "__main__":
    create_admin()
