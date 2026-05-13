from ..db.models.album_model import Album
from ..dtos.album_dto import CreateAlbumDTO, CancionAlbumDTO
from ..mappers.cancion_mapper import to_cancion_response 

class AlbumRepository:
    def create(self, album_dto: CreateAlbumDTO) -> CancionAlbumDTO:
        album = Album(
            titulo=album_dto.titulo,
            artista=album_dto.artista,
            anio=album_dto.anio,
            artista_id=album_dto.artista_id
        )
        album.save()
        return to_cancion_response(album)

    def find_by_id(self, album_id: int) -> CancionAlbumDTO:
        album = Album.query.get(album_id)
        if not album:
            return None
        return to_cancion_response(album)

    def list_all(self) -> list[CancionAlbumDTO]:
        albums = Album.query.all()
        return [to_cancion_response(a) for a in albums]

    def update(self, album_id: int, album_dto: CreateAlbumDTO) -> CancionAlbumDTO:
        album = Album.query.get(album_id)
        if not album:
            return None
        album.titulo = album_dto.titulo
        album.artista = album_dto.artista
        album.anio = album_dto.anio
        album.artista_id = album_dto.artista_id
        album.save()
        return to_cancion_response(album)

    def delete(self, album_id: int) -> bool:
        album = Album.query.get(album_id)
        if not album:
            return False
        album.delete()
        return True