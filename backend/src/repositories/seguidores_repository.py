from ..db.models.seguidores_model import Seguidores
from ..dtos.seguidores_dto import SeguidoresResponseDTO
from ..mappers.seguidores_mapper import to_seguidores_response

class SeguidoresRepository:
    def create(self, usuario_id: int, artista_id: int) -> SeguidoresResponseDTO:
        seguidores = Seguidores(usuario_id=usuario_id, artista_id=artista_id)
        seguidores.save()
        return to_seguidores_response(seguidores)
    
    def find_by_id(self, id: int) -> SeguidoresResponseDTO:
        seguidores = Seguidores.query.get(id)
        if seguidores:
            return to_seguidores_response(seguidores)
        return None
    def list_all(self) -> list[SeguidoresResponseDTO]:
        seguidores_list = Seguidores.query.all()
        return [to_seguidores_response(seguidores) for seguidores in seguidores_list]
    def delete(self, id: int) -> bool:
        seguidores = Seguidores.query.get(id)
        if seguidores:
            seguidores.delete()
            return True
        return False
    def update(self, id: int, usuario_id: int, artista_id: int) -> SeguidoresResponseDTO:
        seguidores = Seguidores.query.get(id)
        if seguidores:
            seguidores.usuario_id = usuario_id
            seguidores.artista_id = artista_id
            seguidores.save()
            return to_seguidores_response(seguidores)
        return None