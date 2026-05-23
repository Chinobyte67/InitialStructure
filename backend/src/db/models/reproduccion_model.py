from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, Boolean
from sqlalchemy.sql import func

from src.db.connection import Base

#(id, usuario_id, cancion_id, fecha, segundos_escuchados, cuenta_para_estadisticas)

class Reproduccion(Base):
    __tablename__ = "reproduccion"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, nullable=False)
    cancion_id = Column(Integer, nullable=False)
    fecha = Column(DateTime, nullable=False, server_default=func.now())
    segundos_escuchados = Column(Integer, nullable=False)
    cuenta_para_estadisticas = Column(Boolean, nullable=False, server_default="false")