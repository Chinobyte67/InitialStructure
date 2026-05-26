import bcrypt


def _normalize_password(plain: str) -> bytes:
    password_bytes = plain.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    return password_bytes


def hash_password(plain: str) -> str:
    password_bytes = _normalize_password(plain)
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    password_bytes = _normalize_password(plain)
    try:
        return bcrypt.checkpw(password_bytes, hashed.encode('utf-8'))
    except (ValueError, TypeError) as exc:
        print(f"verify_password: hash inválido o error al verificar contraseña: {exc}")
        return False
