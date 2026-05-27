import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home,
  Search,
  Library,
  Heart,
  Plus,
  ListMusic,
  Disc3,
  Sparkles,
  CalendarHeart,
  LogIn,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSession } from "@/store/session";
import { useApp } from "@/store/app";
import { api } from "@/lib/api";
import { listarPlaylists } from "@/lib/playlists.functions";

type PlaylistItem = { id: string | number; nombre: string };

const mainNav = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/buscar", label: "Buscar", icon: Search },
  { to: "/biblioteca", label: "Biblioteca", icon: Library },
];

const libraryNav = [
  { to: "/favoritos", label: "Canciones favoritas", icon: Heart },
  { to: "/seguidos", label: "Artistas seguidos", icon: Disc3 },
  { to: "/recomendaciones", label: "Para vos", icon: Sparkles },
  { to: "/wrapped", label: "Resumen anual", icon: CalendarHeart },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const playlists = useApp((s) => s.playlists);
  const setPlaylists = useApp((s) => s.setPlaylists);
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const sessionUser = useSession((s) => s.user);
  const setUser = useSession((s) => s.setUser);
  const authedEmail = sessionUser?.email ?? null;

  useEffect(() => {
    let active = true;
    listarPlaylists()
      .then((data) => {
        if (!active) return;
        setPlaylists(data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setPlaylists([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [setPlaylists]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sessionUser?.id) {
      setError("Debes iniciar sesión para crear una playlist.");
      return;
    }

    try {
      const result = await api.playlists.crear({
        nombre: name,
        es_publica: 0,
        colaborativa: 0,
        usuario_id: sessionUser.id,
      });

      if (!result || typeof result.id !== "number") {
        throw new Error("No se pudo crear la playlist. Intenta de nuevo.");
      }

      setPlaylists([result, ...playlists]);
      setName("");
      setCreating(false);
      navigate({ to: "/playlist/$id", params: { id: String(result.id) } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la playlist");
    }
  };

  return (
    <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen pb-24 sticky top-0">
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-emboss">
          ◉
        </div>
        <div>
          <div className="text-base font-semibold leading-tight">Crate Records</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            AuraStream
          </div>
        </div>
      </div>

      <nav className="px-3 py-4 space-y-0.5">
        {mainNav.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-deboss"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
        {sessionUser?.is_admin && (
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              pathname === "/admin"
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-deboss"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <Settings className="w-4 h-4" />
            Admin
          </Link>
        )}
      </nav>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-sidebar-bg">
        <div className="pb-2">
          <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground px-3 py-2">
            Tu biblioteca
          </h3>
          <div className="space-y-0.5">
            {libraryNav.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-deboss"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2">
          <h3 className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            Playlists
          </h3>
          <button
            onClick={() => setCreating((v) => !v)}
            className="text-muted-foreground hover:text-primary"
            aria-label="Nueva playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {creating && (
          <form onSubmit={handleCreate} className="px-3 pb-2 space-y-1">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la playlist"
              className="w-full bg-input text-sidebar-foreground px-2.5 py-1.5 rounded text-sm border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </form>
        )}

        <div className="space-y-0.5 pb-6">
          {loading ? (
            <p className="px-3 text-xs text-muted-foreground">Cargando playlists...</p>
          ) : playlists.length === 0 ? (
            <p className="px-3 text-xs text-muted-foreground">Aún no tenés playlists.</p>
          ) : (
            playlists.map((p) => {
              const active = pathname === `/playlist/${p.id}`;
              return (
                <Link
                  key={p.id}
                  to="/playlist/$id"
                  params={{ id: p.id }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-deboss"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <ListMusic className="w-4 h-4 shrink-0" />
                  <span className="truncate">{p.nombre}</span>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-sidebar-border bg-sidebar px-3 py-3 text-sm">
        {authedEmail ? (
          <button
            onClick={() => {
              setUser(null);
              navigate({ to: "/auth" });
            }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
          >
            <LogOut className="w-4 h-4" />
            <span className="truncate">Cerrar sesión</span>
          </button>
        ) : (
          <Link
            to="/auth"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
          >
            <LogIn className="w-4 h-4" />
            Iniciar sesión
          </Link>
        )}
        {authedEmail && (
          <p className="px-3 pt-1 text-[10px] text-muted-foreground truncate">{authedEmail}</p>
        )}
      </div>
    </aside>
  );
}
