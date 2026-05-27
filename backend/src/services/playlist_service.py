from sqlalchemy.orm import Session
from sqlalchemy import func

from ..dtos.playlist_dto import CreatePlaylistDTO, PlaylistResponseDTO, PlaylistResumenDTO
from ..repositories.playlist_repository import PlaylistRepository
from ..db.models.playlist_canciones_model import PlaylistCanciones
from ..db.models.cancion_model import Cancion
from ..utils.errors import NotFoundError

class PlaylistController:
    def __init__(self, db: Session):
        self.playlist_repository = PlaylistRepository(db)
        self.db = db

    def create_playlist(self, playlist_dto: CreatePlaylistDTO) -> PlaylistResponseDTO:
        return self.playlist_repository.create(playlist_dto)

    def get_playlist_by_id(self, playlist_id: int, current_user = None) -> PlaylistResponseDTO:
        playlist = self.playlist_repository.find_by_id(playlist_id)
        if not playlist:
            raise NotFoundError("Playlist not found")

        if playlist.es_publica != 1 and not self._can_view_private(playlist, current_user):
            raise NotFoundError("Playlist not found")

        return playlist

    def list_all_playlists(self, current_user = None) -> list[PlaylistResponseDTO]:
        return self.playlist_repository.list_all(current_user)

    def _can_view_private(self, playlist: PlaylistResponseDTO, current_user) -> bool:
        if current_user is None:
            return False
        return current_user.id == playlist.usuario_id or current_user.is_admin

    def delete_playlist(self, playlist_id: int, usuario_id: int) -> bool:
        return self.playlist_repository.delete(playlist_id, usuario_id)
    
    def update_playlist(self, playlist_id: int, playlist_dto: CreatePlaylistDTO) -> PlaylistResponseDTO | None:
        return self.playlist_repository.update(playlist_id, playlist_dto)

    def get_resumen_playlist(self, playlist_id: int, current_user = None) -> PlaylistResumenDTO:
        """
        Retorna el resumen de la playlist con cantidad de canciones y duración total.
        Duración formateada como hh:mm:ss.
        """
        # Verificar que la playlist existe
        playlist = self.playlist_repository.find_by_id(playlist_id)
        if not playlist:
            raise NotFoundError("Playlist not found")

        if playlist.es_publica != 1 and not self._can_view_private(playlist, current_user):
            raise NotFoundError("Playlist not found")
        
        # Query: contar canciones y sumar duración
        resultado = (
            self.db.query(
                func.count(PlaylistCanciones.id).label("cantidad"),
                func.coalesce(func.sum(Cancion.duracion_seg), 0).label("duracion_total_seg")
            )
            .join(Cancion, Cancion.id == PlaylistCanciones.cancion_id)
            .filter(PlaylistCanciones.playlist_id == playlist_id)
            .first()
        )
        
        cantidad_canciones = resultado.cantidad if resultado else 0
        duracion_total_seg = resultado.duracion_total_seg if resultado else 0
        
        # Convertir segundos a hh:mm:ss
        horas = duracion_total_seg // 3600
        minutos = (duracion_total_seg % 3600) // 60
        segundos = duracion_total_seg % 60
        duracion_formateada = f"{horas:02d}:{minutos:02d}:{segundos:02d}"
        
        return PlaylistResumenDTO(
            id=playlist.id,
            nombre=playlist.nombre,
            cantidad_canciones=cantidad_canciones,
            duracion_total=duracion_formateada
        )