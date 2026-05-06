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
} from "lucide-react";
import { useApp } from "@/store/app";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  const createPlaylist = useApp((s) => s.createPlaylist);
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = createPlaylist(name, false);
    if (res && "error" in res) {
      setError(res.error);
      return;
    }
    setName("");
    setCreating(false);
    navigate({ to: "/playlist/$id", params: { id: res.id } });
  };

  return (
    <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen sticky top-0">
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
      </nav>

      <div className="px-3 pb-2">
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

      <div className="px-3 pt-2 flex-1 flex flex-col min-h-0">
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

        <div className="flex-1 overflow-y-auto space-y-0.5 pb-4">
          {playlists.map((p) => {
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
          })}
          {playlists.length === 0 && (
            <p className="px-3 text-xs text-muted-foreground">Aún no tenés playlists.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
