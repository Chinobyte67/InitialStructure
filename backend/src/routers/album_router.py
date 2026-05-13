from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.dtos.album_dto import CreateAlbumDTO, AlbumResponseDTO
from src.schemas.album_schema import CreateAlbumSchema, UpdateAlbumSchema
from src.services.album_service import AlbumService