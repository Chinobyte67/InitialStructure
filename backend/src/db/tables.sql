--- Tablas Principales ---
CREATE TABLE Usuario (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100),
    fecha_registro DATE DEFAULT CURRENT_DATE,
    plan VARCHAR(50) -- ej: 'Gratis', 'Premium'
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
    fecha_creacion DATE DEFAULT CURRENT_DATE,
    es_publica BOOLEAN DEFAULT TRUE
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
    playlist_id INTEGER REFERENCES Playlist(id) ON DELETE CASCADE,
    cancion_id INTEGER REFERENCES Cancion(id) ON DELETE CASCADE,
    orden INTEGER,
    fecha_agregada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, cancion_id)
);

CREATE TABLE favoritos (
    usuario_id INTEGER REFERENCES Usuario(id) ON DELETE CASCADE,
    cancion_id INTEGER REFERENCES Cancion(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, cancion_id)
);

CREATE TABLE seguidores (
    usuario_id INTEGER REFERENCES Usuario(id) ON DELETE CASCADE,
    artista_id INTEGER REFERENCES Artista(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, artista_id)
);
INSERT INTO Artista (nombre, pais, genero_musical) VALUES ('Bizarrap', 'Argentina', 'Trap');
INSERT INTO Usuario (email, nombre, plan) VALUES ('elvis@example.com', 'Elvis', 'Premium');

-- Insertar Álbum y Canción
INSERT INTO Album (titulo, anio, artista_id) VALUES ('BZRP Music Sessions', 2023, 1);
INSERT INTO Cancion (titulo, duracion_seg, album_id) VALUES ('Shakira Session #53', 213, 1);

-- Crear una Playlist y agregar la canción
INSERT INTO Playlist (nombre, usuario_id) VALUES ('Mis Favoritas 2024', 1);
INSERT INTO playlist_canciones (playlist_id, cancion_id, orden) VALUES (1, 1, 1);