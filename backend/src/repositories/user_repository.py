from sqlalchemy.orm import Session

from ..db.models.usuario_model import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, email: str, password_hash: str, age: int) -> User:
        user = User(email=email, password_hash=password_hash, age=age)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def find_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def find_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def list_all(self) -> list[User]:
        # TODO: devolver todos los usuarios
        user = self.db.query(User).all()
        return user

    def update(self, user_id: int, **fields) -> User | None:
        # TODO: actualizar los campos pasados en **fields y devolver el User actualizado
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        for key, value in fields.items():
            setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)  
        return user
    

    def delete(self, user_id: int) -> bool:
        # TODO: borrar el User con ese id; devolver True si lo borró, False si no existía
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        self.db.delete(user)
        self.db.commit()
        return True
