--- Tablas Principales ---
CREATE TABLE Usuario (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    plan VARCHAR(50) DEFAULT 'free'
);

CREATE TABLE Artista (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    pais VARCHAR(50),
    genero_musical VARCHAR(50)
);

CREATE TABLE Album (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    anio INTEGER,
    artista_id INTEGER REFERENCES Artista(id) ON DELETE CASCADE
);

CREATE TABLE Cancion (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    duracion_seg INTEGER,
    album_id INTEGER REFERENCES Album(id) ON DELETE CASCADE
);

CREATE TABLE Playlist (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario_id INTEGER REFERENCES Usuario(id) ON DELETE CASCADE,
    fecha_creacion VARCHAR(255) NOT NULL,
    es_publica INTEGER NOT NULL
);

--- Tablas de Actividad ---
CREATE TABLE Reproduccion (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES Usuario(id),
    cancion_id INTEGER REFERENCES Cancion(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    segundos_escuchados INTEGER
);

--- Tablas de Relación N a M ---
CREATE TABLE playlist_canciones (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER REFERENCES Playlist(id) ON DELETE CASCADE,
    cancion_id INTEGER REFERENCES Cancion(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL,
    fecha_agregada VARCHAR(255) NOT NULL
);

CREATE TABLE favoritos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES Usuario(id) ON DELETE CASCADE,
    cancion_id INTEGER REFERENCES Cancion(id) ON DELETE CASCADE
);

CREATE TABLE seguidores (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES Usuario(id) ON DELETE CASCADE,
    artista_id INTEGER REFERENCES Artista(id) ON DELETE CASCADE
);
INSERT INTO Artista (nombre, pais, genero_musical) VALUES ('Bizarrap', 'Argentina', 'Trap');
INSERT INTO Usuario (email, password_hash, plan) VALUES ('elvis@example.com', '$2b$12$abcdefghijklmnopqrstuvwxYZ0123456789abcdefghi', 'Premium');

-- Insertar Álbum y Canción
INSERT INTO Album (titulo, anio, artista_id) VALUES ('BZRP Music Sessions', 2023, 1);
INSERT INTO Cancion (titulo, duracion_seg, album_id) VALUES ('Shakira Session #53', 213, 1);

-- Crear una Playlist y agregar la canción
INSERT INTO Playlist (nombre, usuario_id, fecha_creacion, es_publica) VALUES ('Mis Favoritas 2024', 1, '2024-01-15', 1);
INSERT INTO playlist_canciones (playlist_id, cancion_id, orden, fecha_agregada) VALUES (1, 1, 1, '2024-01-15');