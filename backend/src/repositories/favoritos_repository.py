from ..db.models.favoritos_model import Favoritos
from ..dtos.favoritos_dto import FavoritosResponseDTO
from ..mappers.favoritos_mapper import to_favoritos_response

class FavoritosRepository:
    def create(self, usuario_id: int, cancion_id: int):
        favoritos = Favoritos(
            usuario_id=usuario_id,
            cancion_id=cancion_id
        )
        favoritos.save()
        return to_favoritos_response(favoritos)
    
    def find_by_id(self, favoritos_id: int):
        favoritos = Favoritos.query.get(favoritos_id)
        if not favoritos:
            return None
        return to_favoritos_response(favoritos)
    
    def list_all(self):
        favoritos_list = Favoritos.query.all()
        return [to_favoritos_response(f) for f in favoritos_list]
    
    def delete(self, favoritos_id: int) -> bool:
        favoritos = Favoritos.query.get(favoritos_id)
        if not favoritos:
            return False
        favoritos.delete()
        return True
    
    def update(self, favoritos_id: int, usuario_id: int, cancion_id: int):
        favoritos = Favoritos.query.get(favoritos_id)
        if not favoritos:
            return None
        favoritos.usuario_id = usuario_id
        favoritos.cancion_id = cancion_id
        favoritos.save()
        return to_favoritos_response(favoritos)