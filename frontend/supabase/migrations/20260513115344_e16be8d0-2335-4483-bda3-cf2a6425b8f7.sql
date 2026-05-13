
-- ============== ENUMS ==============
CREATE TYPE public.plan_tipo AS ENUM ('free', 'premium', 'familiar');
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- ============== PROFILES ==============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  plan public.plan_tipo NOT NULL DEFAULT 'free',
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============== USER ROLES ==============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============== CATALOGO ==============
CREATE TABLE public.artistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  pais TEXT NOT NULL,
  genero_musical TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.artistas ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.albumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  anio INT NOT NULL CHECK (anio BETWEEN 1900 AND 2100),
  artista_id UUID NOT NULL REFERENCES public.artistas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_albumes_artista ON public.albumes(artista_id);
ALTER TABLE public.albumes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.canciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  duracion_seg INT NOT NULL CHECK (duracion_seg > 0),
  album_id UUID NOT NULL REFERENCES public.albumes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_canciones_album ON public.canciones(album_id);
CREATE INDEX idx_canciones_titulo ON public.canciones USING gin (to_tsvector('simple', titulo));
ALTER TABLE public.canciones ENABLE ROW LEVEL SECURITY;

-- ============== PLAYLISTS ==============
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  es_publica BOOLEAN NOT NULL DEFAULT false,
  colaborativa BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (usuario_id, nombre)
);
CREATE INDEX idx_playlists_usuario ON public.playlists(usuario_id);
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.playlist_colaboradores (
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (playlist_id, usuario_id)
);
ALTER TABLE public.playlist_colaboradores ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.playlist_canciones (
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  cancion_id UUID NOT NULL REFERENCES public.canciones(id) ON DELETE CASCADE,
  orden INT NOT NULL,
  fecha_agregada TIMESTAMPTZ NOT NULL DEFAULT now(),
  agregada_por UUID REFERENCES auth.users(id),
  PRIMARY KEY (playlist_id, cancion_id)
);
CREATE INDEX idx_pc_playlist_orden ON public.playlist_canciones(playlist_id, orden);
ALTER TABLE public.playlist_canciones ENABLE ROW LEVEL SECURITY;

-- ============== FAVORITOS / SEGUIDOS ==============
CREATE TABLE public.favoritos (
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cancion_id UUID NOT NULL REFERENCES public.canciones(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, cancion_id)
);
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.seguidos (
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artista_id UUID NOT NULL REFERENCES public.artistas(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, artista_id)
);
ALTER TABLE public.seguidos ENABLE ROW LEVEL SECURITY;

-- ============== REPRODUCCIONES ==============
CREATE TABLE public.reproducciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cancion_id UUID NOT NULL REFERENCES public.canciones(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  segundos_escuchados INT NOT NULL CHECK (segundos_escuchados >= 0)
);
CREATE INDEX idx_reproducciones_usuario ON public.reproducciones(usuario_id);
CREATE INDEX idx_reproducciones_cancion ON public.reproducciones(cancion_id);
CREATE INDEX idx_reproducciones_fecha ON public.reproducciones(fecha);
ALTER TABLE public.reproducciones ENABLE ROW LEVEL SECURITY;

-- ============== HELPER: puede editar playlist ==============
CREATE OR REPLACE FUNCTION public.can_edit_playlist(_playlist_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.playlists p
    WHERE p.id = _playlist_id AND (
      p.usuario_id = _user_id
      OR (p.colaborativa AND EXISTS (
        SELECT 1 FROM public.playlist_colaboradores pc
        WHERE pc.playlist_id = p.id AND pc.usuario_id = _user_id
      ))
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.can_view_playlist(_playlist_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.playlists p
    WHERE p.id = _playlist_id AND (
      p.es_publica
      OR p.usuario_id = _user_id
      OR EXISTS (SELECT 1 FROM public.playlist_colaboradores pc WHERE pc.playlist_id = p.id AND pc.usuario_id = _user_id)
    )
  )
$$;

-- ============== RLS POLICIES ==============
-- profiles
CREATE POLICY "profiles self select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- user_roles (solo lectura propia)
CREATE POLICY "roles self select" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- catálogo (lectura pública autenticada, escritura solo admin)
CREATE POLICY "artistas read" ON public.artistas FOR SELECT TO authenticated USING (true);
CREATE POLICY "artistas admin write" ON public.artistas FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "albumes read" ON public.albumes FOR SELECT TO authenticated USING (true);
CREATE POLICY "albumes admin write" ON public.albumes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "canciones read" ON public.canciones FOR SELECT TO authenticated USING (true);
CREATE POLICY "canciones admin write" ON public.canciones FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- playlists
CREATE POLICY "playlists view" ON public.playlists FOR SELECT TO authenticated USING (
  es_publica OR usuario_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.playlist_colaboradores pc WHERE pc.playlist_id = id AND pc.usuario_id = auth.uid())
);
CREATE POLICY "playlists insert" ON public.playlists FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "playlists owner update" ON public.playlists FOR UPDATE TO authenticated USING (usuario_id = auth.uid());
CREATE POLICY "playlists owner delete" ON public.playlists FOR DELETE TO authenticated USING (usuario_id = auth.uid());

-- playlist_colaboradores
CREATE POLICY "pc view" ON public.playlist_colaboradores FOR SELECT TO authenticated USING (
  usuario_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.usuario_id = auth.uid())
);
CREATE POLICY "pc owner manage" ON public.playlist_colaboradores FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.usuario_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.usuario_id = auth.uid()));

-- playlist_canciones
CREATE POLICY "pcanc view" ON public.playlist_canciones FOR SELECT TO authenticated USING (public.can_view_playlist(playlist_id, auth.uid()));
CREATE POLICY "pcanc insert" ON public.playlist_canciones FOR INSERT TO authenticated WITH CHECK (public.can_edit_playlist(playlist_id, auth.uid()));
CREATE POLICY "pcanc update" ON public.playlist_canciones FOR UPDATE TO authenticated USING (public.can_edit_playlist(playlist_id, auth.uid()));
CREATE POLICY "pcanc delete" ON public.playlist_canciones FOR DELETE TO authenticated USING (public.can_edit_playlist(playlist_id, auth.uid()));

-- favoritos / seguidos / reproducciones (cada usuario sólo lo suyo)
CREATE POLICY "fav own" ON public.favoritos FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "seg own" ON public.seguidos FOR ALL TO authenticated USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
CREATE POLICY "rep own select" ON public.reproducciones FOR SELECT TO authenticated USING (usuario_id = auth.uid());
CREATE POLICY "rep own insert" ON public.reproducciones FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());

-- admin puede ver todas reproducciones (para HU14)
CREATE POLICY "rep admin select" ON public.reproducciones FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============== TRIGGER signup -> profile ==============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_plan public.plan_tipo;
  v_nombre TEXT;
BEGIN
  v_plan := COALESCE((NEW.raw_user_meta_data->>'plan')::public.plan_tipo, 'free');
  v_nombre := COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email,'@',1));
  INSERT INTO public.profiles (id, email, nombre, plan)
  VALUES (NEW.id, NEW.email, v_nombre, v_plan);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
