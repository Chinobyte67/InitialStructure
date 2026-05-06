import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/store/app";
import { canciones, getAlbum } from "@/data/catalog";
import { SongRow } from "@/components/SongRow";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/favoritos")({
  component: FavoritosPage,
  head: () => ({ meta: [{ title: "Favoritos — AuraStream" }] }),
});

function FavoritosPage() {
  const favoritos = useApp((s) => s.favoritos);
  const toggleFav = useApp((s) => s.toggleFavorito);
  const items = favoritos
    .map((id) => canciones.find((c) => c.id === id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <div>
      <div className="bg-gradient-to-b from-primary/30 to-transparent px-8 pt-12 pb-8">
        <div className="flex items-end gap-6">
          <div className="w-44 h-44 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-emboss-lg">
            <Heart className="w-20 h-20" fill="currentColor" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Playlist</div>
            <h1 className="text-5xl font-bold mb-3">Canciones favoritas</h1>
            <div className="text-sm text-muted-foreground">{items.length} canciones</div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1400px]">
        {items.length === 0 ? (
          <p className="text-muted-foreground">
            No marcaste favoritos todavía. Tocá el corazón en cualquier canción.
          </p>
        ) : (
          <div className="bg-card rounded-lg shadow-emboss p-2">
            {items.map((c, i) => (
              <SongRow
                key={c.id}
                cancion={c}
                index={i + 1}
                onRemove={() => toggleFav(c.id)}
                removeLabel="Quitar de favoritos"
              />
            ))}
          </div>
        )}
        <span className="hidden">{!!getAlbum}</span>
      </div>
    </div>
  );
}
