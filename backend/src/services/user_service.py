from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta

from src.dtos.user_dto import CreateUserDTO, UserResponseDTO, UsuarioResumenAnualDTO
from src.mappers.user_mapper import to_user_response
from src.mappers.cancion_mapper import to_cancion_response
from src.mappers.artista_mapper import to_artista_response
from src.repositories.user_repository import UserRepository
from src.db.models.reproduccion_model import Reproduccion
from src.db.models.cancion_model import Cancion
from src.db.models.album_model import Album
from src.db.models.artista_model import Artista
from src.utils.errors import NotFoundError, ConflictError
from src.utils.hash import hash_password


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
        self.db = db

    def create(self, dto: CreateUserDTO) -> UserResponseDTO:
        # Verificar si ya existe un usuario con ese email
        existing_user = self.repo.find_by_email(dto.email)
        if existing_user:
            raise ConflictError("Email already registered")

        # Hashear la contraseña
        password_hash = hash_password(dto.password)

        # Crear el usuario
        user = self.repo.create(
            email=dto.email,
            password_hash=password_hash,
            nombre=getattr(dto, 'nombre', None),
        )
        return to_user_response(user)


    def get_by_id(self, user_id: int) -> UserResponseDTO:
        user = self.repo.find_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        return to_user_response(user)

    def list_all(self) -> list[UserResponseDTO]:
        users = self.repo.list_all()
        return [to_user_response(user) for user in users]

    def update(self, user_id: int, dto) -> UserResponseDTO:
        # Filtrar campos None (solo actualizar los que fueron enviados)
        update_data = {k: v for k, v in dto.model_dump().items() if v is not None}
        
        # Si se incluye password, hashearla
        if "password" in update_data:
            update_data["password_hash"] = hash_password(update_data.pop("password"))
        
        user = self.repo.update(user_id, **update_data)
        if not user:
            raise NotFoundError("User not found")
        return to_user_response(user)

    def delete(self, user_id: int) -> None:
        if not self.repo.delete(user_id):
            raise NotFoundError("User not found")

    def get_top_canciones_por_usuario(self, usuario_id: int, limit: int = 10) -> list:
        """
        Retorna las canciones más escuchadas por el usuario.
        Solo cuenta reproducciones válidas (cuenta_para_estadisticas = true).
        """
        # Verificar que el usuario existe
        user = self.repo.find_by_id(usuario_id)
        if not user:
            raise NotFoundError("User not found")
        
        # Query: agrupar por cancion_id, contar, ordenar descendente
        resultado = (
            self.db.query(
                Cancion,
                func.count(Reproduccion.id).label("cantidad")
            )
            .join(Reproduccion, Cancion.id == Reproduccion.cancion_id)
            .filter(
                Reproduccion.usuario_id == usuario_id,
                Reproduccion.cuenta_para_estadisticas == True
            )
            .group_by(Cancion.id)
            .order_by(func.count(Reproduccion.id).desc())
            .limit(limit)
            .all()
        )
        
        # Convertir a DTOs
        return [to_cancion_response(cancion) for cancion, cantidad in resultado]

    def get_top_artistas_por_usuario(self, usuario_id: int, limit: int = 10) -> list:
        """
        Retorna los artistas más escuchados por el usuario.
        Solo cuenta reproducciones válidas (cuenta_para_estadisticas = true).
        """
        # Verificar que el usuario existe
        user = self.repo.find_by_id(usuario_id)
        if not user:
            raise NotFoundError("User not found")
        
        # Query: artista -> album -> cancion -> reproduccion, agrupar, contar
        resultado = (
            self.db.query(
                Artista,
                func.count(Reproduccion.id).label("cantidad")
            )
            .join(Album, Album.artista_id == Artista.id)
            .join(Cancion, Cancion.album_id == Album.id)
            .join(Reproduccion, Reproduccion.cancion_id == Cancion.id)
            .filter(
                Reproduccion.usuario_id == usuario_id,
                Reproduccion.cuenta_para_estadisticas == True
            )
            .group_by(Artista.id)
            .order_by(func.count(Reproduccion.id).desc())
            .limit(limit)
            .all()
        )
        
        # Convertir a DTOs
        return [to_artista_response(artista) for artista, cantidad in resultado]

    def get_resumen_anual(self, usuario_id: int, anio: int) -> UsuarioResumenAnualDTO:
        """
        Retorna el resumen anual del usuario.
        Solo cuenta reproducciones válidas del año pedido.
        """
        user = self.repo.find_by_id(usuario_id)
        if not user:
            raise NotFoundError("User not found")

        inicio = datetime(anio, 1, 1)
        fin = datetime(anio, 12, 31, 23, 59, 59, 999999)

        base_filter = [
            Reproduccion.usuario_id == usuario_id,
            Reproduccion.cuenta_para_estadisticas == True,
            Reproduccion.fecha >= inicio,
            Reproduccion.fecha <= fin,
        ]

        total_reproducciones = self.db.query(func.count(Reproduccion.id)).filter(*base_filter).scalar()
        if not total_reproducciones:
            raise NotFoundError("No reproducciones válidas en el año solicitado")

        top_canciones = (
            self.db.query(Cancion)
            .join(Reproduccion, Cancion.id == Reproduccion.cancion_id)
            .filter(*base_filter)
            .group_by(Cancion.id)
            .order_by(func.count(Reproduccion.id).desc())
            .limit(5)
            .all()
        )

        top_artistas = (
            self.db.query(Artista)
            .join(Album, Album.artista_id == Artista.id)
            .join(Cancion, Cancion.album_id == Album.id)
            .join(Reproduccion, Reproduccion.cancion_id == Cancion.id)
            .filter(*base_filter)
            .group_by(Artista.id)
            .order_by(func.count(Reproduccion.id).desc())
            .limit(5)
            .all()
        )

        top_generos_result = (
            self.db.query(Artista.genero_musical)
            .join(Album, Album.artista_id == Artista.id)
            .join(Cancion, Cancion.album_id == Album.id)
            .join(Reproduccion, Reproduccion.cancion_id == Cancion.id)
            .filter(*base_filter)
            .group_by(Artista.genero_musical)
            .order_by(func.count(Reproduccion.id).desc())
            .limit(3)
            .all()
        )
        top_generos = [g[0] for g in top_generos_result]

        total_seconds = self.db.query(func.coalesce(func.sum(Reproduccion.segundos_escuchados), 0)).filter(*base_filter).scalar() or 0
        total_minutos = round(total_seconds / 60, 1)

        canciones_distintas = self.db.query(func.count(func.distinct(Reproduccion.cancion_id))).filter(*base_filter).scalar() or 0

        return UsuarioResumenAnualDTO(
            top_canciones=[to_cancion_response(c) for c in top_canciones],
            top_artistas=[to_artista_response(a) for a in top_artistas],
            top_generos=top_generos,
            total_minutos_escuchados=total_minutos,
            cantidad_canciones_distintas=int(canciones_distintas),
        )

    def get_recomendaciones(self, usuario_id: int, limit: int = 10) -> list:
        """
        Retorna recomendaciones basadas en géneros más escuchados por el usuario.
        
        - Si el usuario tiene >= 5 reproducciones válidas: recomienda canciones de sus géneros más escuchados
        - Si el usuario tiene < 5 reproducciones válidas: retorna canciones del top global
        - Excluye canciones que el usuario ha escuchado en los últimos 30 días
        """
        # Verificar que el usuario existe
        user = self.repo.find_by_id(usuario_id)
        if not user:
            raise NotFoundError("User not found")
        
        # Contar reproducciones válidas del usuario
        valid_plays = self.db.query(func.count(Reproduccion.id)).filter(
            Reproduccion.usuario_id == usuario_id,
            Reproduccion.cuenta_para_estadisticas == True
        ).scalar()
        
        # Calcular fecha límite (hace 30 días)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        # Si el usuario tiene menos de 5 reproducciones válidas, devolver top global
        if valid_plays < 5:
            resultado = (
                self.db.query(Cancion)
                .join(Reproduccion, Cancion.id == Reproduccion.cancion_id)
                .filter(Reproduccion.cuenta_para_estadisticas == True)
                .group_by(Cancion.id)
                .order_by(func.count(Reproduccion.id).desc())
                .limit(limit)
                .all()
            )
            return [to_cancion_response(cancion) for cancion in resultado]
        
        # Obtener los géneros más escuchados por el usuario
        top_generos = (
            self.db.query(Artista.genero_musical)
            .join(Album, Album.artista_id == Artista.id)
            .join(Cancion, Cancion.album_id == Album.id)
            .join(Reproduccion, Reproduccion.cancion_id == Cancion.id)
            .filter(
                Reproduccion.usuario_id == usuario_id,
                Reproduccion.cuenta_para_estadisticas == True
            )
            .group_by(Artista.genero_musical)
            .order_by(func.count(Reproduccion.id).desc())
            .limit(5)
            .all()
        )
        
        # Extraer los géneros
        generos = [g[0] for g in top_generos]
        
        # Si no hay géneros, devolver top global
        if not generos:
            resultado = (
                self.db.query(Cancion)
                .join(Reproduccion, Cancion.id == Reproduccion.cancion_id)
                .filter(Reproduccion.cuenta_para_estadisticas == True)
                .group_by(Cancion.id)
                .order_by(func.count(Reproduccion.id).desc())
                .limit(limit)
                .all()
            )
            return [to_cancion_response(cancion) for cancion in resultado]
        
        # Obtener canciones de los géneros más escuchados que el usuario NO ha escuchado en 30 días
        resultado = (
            self.db.query(Cancion)
            .join(Album, Album.id == Cancion.album_id)
            .join(Artista, Artista.id == Album.artista_id)
            .outerjoin(
                Reproduccion,
                and_(
                    Reproduccion.cancion_id == Cancion.id,
                    Reproduccion.usuario_id == usuario_id,
                    Reproduccion.fecha >= thirty_days_ago
                )
            )
            .filter(
                Artista.genero_musical.in_(generos),
                Reproduccion.id == None  # Excluir canciones escuchadas en los últimos 30 días
            )
            .order_by(func.random())
            .limit(limit)
            .all()
        )
        
        return [to_cancion_response(cancion) for cancion in resultado]