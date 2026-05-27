#!/usr/bin/env python3
"""
Script para verificar el estado del usuario admin.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.db.models.usuario_model import User
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_admin():
    db = SessionLocal()
    
    admin = db.query(User).filter(User.email == "admin@aurastream.com").first()
    
    if not admin:
        print("❌ El usuario admin NO existe")
        db.close()
        return
    
    print("✅ Admin encontrado:")
    print(f"   ID: {admin.id}")
    print(f"   Email: {admin.email}")
    print(f"   Nombre: {admin.nombre}")
    print(f"   is_admin: {admin.is_admin} {'✅' if admin.is_admin else '❌'}")
    print(f"   Plan: {admin.plan}")
    print(f"   Creado: {admin.created_at}")
    
    # Verificar todas las playlists y quién es el dueño
    from src.db.models.playlist_model import Playlist
    playlists = db.query(Playlist).all()
    print(f"\n📊 Total de playlists: {len(playlists)}")
    for p in playlists:
        print(f"   - ID {p.id}: '{p.nombre}' (owner: {p.usuario_id})")
    
    db.close()

if __name__ == "__main__":
    check_admin()
