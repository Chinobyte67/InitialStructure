from fastapi import Depends, Header
from sqlalchemy.orm import Session

from src.db.connection import get_db
from src.repositories.user_repository import UserRepository
from src.utils.errors import UnauthorizedError
from src.utils.jwt import decode_token
from src.mappers.user_mapper import to_user_response
from src.dtos.user_dto import UserResponseDTO


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> UserResponseDTO:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise UnauthorizedError("Missing or malformed Authorization header")

    token = authorization.split(" ", 1)[1].strip()
    payload = decode_token(token)

    user_id = payload.get("sub")
    if user_id is None:
        raise UnauthorizedError("Invalid token payload")

    user = UserRepository(db).find_by_id(int(user_id))
    if user is None:
        raise UnauthorizedError("User no longer exists")

    return to_user_response(user)
