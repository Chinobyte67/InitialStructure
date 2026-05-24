from sqlalchemy.orm import Session
from sqlalchemy import func

from ..db.models.cancion_model import Cancion
from ..db.models.artista_model import Artista
from ..db.models.album_model import Album
from ..dtos.buscar_dto import BuscarResponseDTO
from ..mappers.cancion_mapper import to_cancion_response
from ..mappers.artista_mapper import to_artista_response
from ..mappers.album_mapper import to_album_response


class BuscarService:
    def __init__(self, db: Session):
        self.db = db

    def buscar(self, busqueda: str) -> BuscarResponseDTO:
        busqueda_lower = busqueda.lower()
        
        # Case-insensitive search
        # Search in canciones
        canciones = (
            self.db.query(Cancion)
            .filter(func.lower(Cancion.titulo).contains(busqueda_lower))
            .all()
        )
        
        # Search in artistas
        artistas = (
            self.db.query(Artista)
            .filter(func.lower(Artista.nombre).contains(busqueda_lower))
            .all()
        )
        
        # Search in albumes
        albumes = (
            self.db.query(Album)
            .filter(func.lower(Album.titulo).contains(busqueda_lower))
            .all()
        )

        # Detect exact matches to prioritize results
        artistas_exactos = [a for a in artistas if a.nombre.lower() == busqueda_lower]
        canciones_exactas = [c for c in canciones if c.titulo.lower() == busqueda_lower]

        # Get all album IDs from direct album search and from found artists
        album_ids = {alb.id for alb in albumes}  # Direct album matches
        
        for artista in artistas:
            # For each found artist, add their albums
            artist_albumes = (
                self.db.query(Album)
                .filter(Album.artista_id == artista.id)
                .all()
            )
            for alb in artist_albumes:
                if alb.id not in album_ids:
                    albumes.append(alb)
                    album_ids.add(alb.id)
        
        # Get all canciones from the albumes (direct matches + artist's albums)
        cancion_ids = {c.id for c in canciones}  # Direct cancion matches
        
        for album_id in album_ids:
            canciones_del_album = (
                self.db.query(Cancion)
                .filter(Cancion.album_id == album_id)
                .all()
            )
            for cancion in canciones_del_album:
                if cancion.id not in cancion_ids:
                    canciones.append(cancion)
                    cancion_ids.add(cancion.id)

        # Determine result order: prioritize exact matches
        # If artist matches exactly, show artistas first
        # If cancion matches exactly, show canciones first
        # Otherwise, default order
        canciones_dto = [to_cancion_response(c) for c in canciones]
        artistas_dto = [to_artista_response(a) for a in artistas]
        albumes_dto = [to_album_response(alb) for alb in albumes]

        if artistas_exactos:
            # Artist exact match found: artistas first
            return BuscarResponseDTO(
                artistas=artistas_dto,
                canciones=canciones_dto,
                albumes=albumes_dto,
            )
        elif canciones_exactas:
            # Song exact match found: canciones first
            return BuscarResponseDTO(
                canciones=canciones_dto,
                artistas=artistas_dto,
                albumes=albumes_dto,
            )
        else:
            # No exact matches: default order (canciones, artistas, albumes)
            return BuscarResponseDTO(
                canciones=canciones_dto,
                artistas=artistas_dto,
                albumes=albumes_dto,
            )
