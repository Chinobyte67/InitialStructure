# TODO: armar el APIRouter de productos siguiendo el patrón de user_router.py
#
# from fastapi import APIRouter, Depends
# router = APIRouter(prefix="/products", tags=["products"])
# ...

from fastapi import APIRouter, Depends, HTTPException
from backend.src.dtos.cancion_dto import CreateCancionDTO, CancionResponseDTO
from backend.src.repositories.cancion_repository import CancionRepository

router = APIRouter(prefix="/canciones", tags=["canciones"])
cancion_repo = CancionRepository()