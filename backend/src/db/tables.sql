--- Tablas Principales ---
CREATE TABLE Usuario (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100),
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
    album_id INTEGER REFERENCES Album(id) ON DELETE CASCADE,
    url_audio TEXT  -- URL del audio alojado en Cloudinary
);

-- Si la tabla Cancion ya existe (base creada antes), correr solo esto:
-- ALTER TABLE Cancion ADD COLUMN IF NOT EXISTS url_audio TEXT;

CREATE TABLE Playlist (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario_id INTEGER REFERENCES Usuario(id) ON DELETE CASCADE,
    fecha_creacion VARCHAR(255) NOT NULL,
    es_publica INTEGER NOT NULL,
    colaborativa INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE playlist_colaboradores (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER REFERENCES Playlist(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES Usuario(id) ON DELETE CASCADE,
    UNIQUE (playlist_id, usuario_id)
);

--- Tablas de Actividad ---
CREATE TABLE Reproduccion (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES Usuario(id),
    cancion_id INTEGER REFERENCES Cancion(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    segundos_escuchados INTEGER,
    cuenta_para_estadisticas BOOLEAN DEFAULT TRUE
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
    ,
    UNIQUE (usuario_id, cancion_id)
);

CREATE TABLE seguidores (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES Usuario(id) ON DELETE CASCADE,
    artista_id INTEGER REFERENCES Artista(id) ON DELETE CASCADE,
    UNIQUE (usuario_id, artista_id)
);
-- Insertar Usuarios
INSERT INTO Usuario (email, nombre, password_hash, plan) VALUES
('elvis@example.com', 'Elvis', '$2b$12$abcdefghijklmnopqrstuvwxYZ0123456789abcdefghi', 'Premium'),
('ana@example.com', 'Ana', '$2b$12$1234567890abcdefghijklmnopqrstuvwxYZabcdefghi', 'Free'),
('juan@example.com', 'Juan', '$2b$12$abcdefghi1234567890abcdefghijklmnopqrstuvwxYZ', 'Premium');

-- Insertar Artistas
INSERT INTO Artista (nombre, pais, genero_musical) VALUES
('Laufey', 'Islandia', 'Jazz'),
('Taylor Swift', 'EEUU', 'Pop'),
('Coldplay', 'Reino Unido', 'Rock'),
('Adele', 'Reino Unido', 'Soul'),
('Ed Sheeran', 'Reino Unido', 'Pop');

-- Insertar Albums
INSERT INTO Album (titulo, anio, artista_id) VALUES
('A Matter of Time', 2023, 1),
('Midnights', 2022, 2),
('Parachutes', 2000, 3),
('25', 2015, 4),
('Divide', 2017, 5);

-- Insertar Canciones (2 por álbum)
-- url_audio: archivos de muestra públicos para poder probar la reproducción.
-- Al subir a Cloudinary, reemplazar por el secure_url devuelto por la subida.
INSERT INTO Cancion (titulo, duracion_seg, album_id, url_audio) VALUES
('Lover Girl', 213, 1, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
('From the Start', 200, 1, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),

('Anti-Hero', 240, 2, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),
('Lavender Haze', 230, 2, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'),

('Yellow', 270, 3, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'),
('Shiver', 250, 3, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'),

('Hello', 295, 4, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'),
('Send My Love', 220, 4, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'),

('Shape of You', 240, 5, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'),
('Perfect', 263, 5, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3');

-- Crear Playlists
INSERT INTO Playlist (nombre, usuario_id, fecha_creacion, es_publica) VALUES
('Favoritos Ana', 2, '2024-03-01', 1),
('Rock de Juan', 3, '2024-03-05', 0);

-- Agregar canciones a playlists
INSERT INTO playlist_canciones (playlist_id, cancion_id, orden, fecha_agregada) VALUES
(1, 1, 1, '2024-03-01'),
(1, 2, 2, '2024-03-01'),
(2, 5, 1, '2024-03-05'),
(2, 6, 2, '2024-03-05');

-- Insertar Reproducciones
INSERT INTO Reproduccion (usuario_id, cancion_id, fecha, segundos_escuchados, cuenta_para_estadisticas) VALUES
(2, 1, '2026-05-15 10:00:00', 180, TRUE),
(2, 2, '2026-05-15 10:05:00', 200, TRUE),
(3, 5, '2026-05-15 11:00:00', 250, TRUE),
(3, 6, '2026-05-15 11:10:00', 240, TRUE);

-- Insertar Favoritos
INSERT INTO favoritos (usuario_id, cancion_id) VALUES
(2, 1),
(3, 5);

-- Insertar Seguidores
INSERT INTO seguidores (usuario_id, artista_id) VALUES
(2, 1), -- Ana sigue a Laufey
(3, 3); -- Juan sigue a Coldplay

-- ==================================================
-- Sentencias útiles para bases ya existentes
-- Ejecutar si la base fue creada antes de estos cambios
-- ==================================================
-- Añadir la columna `cuenta_para_estadisticas` si falta
ALTER TABLE reproduccion
ADD COLUMN IF NOT EXISTS cuenta_para_estadisticas BOOLEAN DEFAULT FALSE;

-- Rellenar `cuenta_para_estadisticas` según el 30% de la duración
UPDATE reproduccion r
SET cuenta_para_estadisticas = (r.segundos_escuchados >= (0.3 * c.duracion_seg))
FROM cancion c
WHERE r.cancion_id = c.id;


-- Asegurarte de tener el artista y álbum creados
INSERT INTO Artista (nombre, pais, genero_musical) VALUES
('Chet Baker', 'EEUU', 'Jazz');

-- El id de este artista será 6 si seguiste la secuencia
INSERT INTO Album (titulo, anio, artista_id) VALUES
('Chet Baker Sings', 1954, 6);

-- Canciones nuevas de Jazz (se crearán con id 11 y 12)
INSERT INTO Cancion (titulo, duracion_seg, album_id, url_audio) VALUES
('My Funny Valentine', 270, 6, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3'),
('Let’s Get Lost', 250, 6, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3');

-- Más reproducciones de Jazz para Ana (usuario_id = 2)
INSERT INTO Reproduccion (usuario_id, cancion_id, fecha, segundos_escuchados, cuenta_para_estadisticas) VALUES
(2, 1, '2026-05-10 09:00:00', 180, TRUE),  -- Lover Girl (Jazz)
(2, 2, '2026-05-11 09:15:00', 200, TRUE),  -- From the Start (Jazz)
(2, 11, '2026-05-20 09:00:00', 200, TRUE), -- My Funny Valentine (Jazz)
(2, 12, '2026-05-21 09:15:00', 220, TRUE), -- Let’s Get Lost (Jazz)
(2, 11, '2026-05-22 10:00:00', 250, TRUE), -- My Funny Valentine (Jazz, otra vez)
(2, 12, '2026-05-23 11:00:00', 230, TRUE); -- Let’s Get Lost (Jazz, otra vez)

-- Nuevo Artista de Jazz
INSERT INTO Artista (nombre, pais, genero_musical) VALUES
('Chet Baker', 'EEUU', 'Jazz');

-- Nuevo Álbum de Jazz
INSERT INTO Album (titulo, anio, artista_id) VALUES
('Chet Baker Sings', 1954, 6);

-- Nuevas Canciones de Jazz
INSERT INTO Cancion (titulo, duracion_seg, album_id, url_audio) VALUES
('My Funny Valentine', 270, 6, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3'),
('Let’s Get Lost', 250, 6, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3');

-- Reproducciones de las nuevas canciones de Jazz
INSERT INTO Reproduccion (usuario_id, cancion_id, fecha, segundos_escuchados, cuenta_para_estadisticas) VALUES
(2, 11, '2026-05-20 09:00:00', 200, TRUE), -- Ana escucha My Funny Valentine
(2, 12, '2026-05-21 09:15:00', 220, TRUE), -- Ana escucha Let’s Get Lost
(3, 11, '2026-05-22 10:00:00', 250, TRUE); -- Juan escucha My Funny Valentine
