from sqlalchemy.orm import Session

from ..db.models.album_model import Album
from ..dtos.album_dto import CreateAlbumDTO, UpdateAlbumDTO, AlbumResponseDTO
from ..mappers.album_mapper import to_album_response

class AlbumRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, album_dto: CreateAlbumDTO) -> AlbumResponseDTO:
        album = Album(
            titulo=album_dto.titulo,
            anio=album_dto.anio,
            artista_id=album_dto.artista_id,
        )
        self.db.add(album)
        self.db.commit()
        self.db.refresh(album)
        return to_album_response(album)

    def find_by_id(self, album_id: int) -> AlbumResponseDTO | None:
        album = self.db.query(Album).filter(Album.id == album_id).first()
        if not album:
            return None
        return to_album_response(album)

    def list_all(self, artista_id: int | None = None) -> list[AlbumResponseDTO]:
        query = self.db.query(Album)
        if artista_id is not None:
            query = query.filter(Album.artista_id == artista_id)
        albums = query.all()
        return [to_album_response(a) for a in albums]

    def update(self, album_id: int, album_dto: UpdateAlbumDTO) -> AlbumResponseDTO | None:
        album = self.db.query(Album).filter(Album.id == album_id).first()
        if not album:
            return None
        if album_dto.titulo is not None:
            album.titulo = album_dto.titulo
        if album_dto.anio is not None:
            album.anio = album_dto.anio
        if album_dto.artista_id is not None:
            album.artista_id = album_dto.artista_id
        self.db.commit()
        self.db.refresh(album)
        return to_album_response(album)

    def delete(self, album_id: int) -> bool:
        album = self.db.query(Album).filter(Album.id == album_id).first()
        if not album:
            return False
        self.db.delete(album)
        self.db.commit()
        return True