from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.middlewares.error_middleware import app_error_handler
from src.routers import auth_router, user_router, cancion_router, album_router, artista_router, favoritos_router, playlist_canciones_router, playlist_router, reproduccion_router, seguidores_router, buscar_router
from src.utils.errors import AppError

app = FastAPI(title="Initial Structure API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite que el frontend se conecte
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppError, app_error_handler)

app.include_router(user_router.router, prefix="/api")
app.include_router(auth_router.router, prefix="/api")
# TODO: registrar product_router cuando se implemente
# app.include_router(product_router.router, prefix="/api")
app.include_router(cancion_router.router, prefix="/api")
app.include_router(album_router.router, prefix="/api")
app.include_router(artista_router.router, prefix="/api")
app.include_router(favoritos_router.router, prefix="/api")
app.include_router(playlist_canciones_router.router, prefix="/api")
app.include_router(playlist_router.router, prefix="/api")
app.include_router(reproduccion_router.router, prefix="/api")
app.include_router(seguidores_router.router, prefix="/api")
app.include_router(buscar_router.router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}
