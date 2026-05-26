import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, ApiError, type Plan } from "@/lib/api";
import { useSession } from "@/store/session";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [{ title: "Ingresá a AuraStream" }, { name: "description", content: "Registrate o iniciá sesión." }],
  }),
});

function AuthPage() {
  const nav = useNavigate();
  const setUser = useSession((s) => s.setUser);
  const setToken = useSession((s) => s.setToken);
  const user = useSession((s) => s.user);

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [plan, setPlan] = useState<Plan>("free");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) nav({ to: "/" });
  }, [user, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!password) throw new Error("Ingresá una contraseña.");

        const u = await api.usuarios.crear({
          email: email.trim(),
          password,
          nombre: nombre.trim() || undefined,
          plan,
        });
        setUser(u);
      } else {
        const token = await api.auth.login({ email: email.trim(), password });

        const lista = await api.usuarios.listar();
        const u = lista.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
        if (!u) throw new Error("No se pudo cargar el usuario tras iniciar sesión.");

        setToken(token.access_token);
        setUser(u);
      }
      nav({ to: "/" });
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          setErr("Credenciales incorrectas");
        } else {
          setErr(e.message);
        }
      } else if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr("Error inesperado");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-emboss">
        <h1 className="text-3xl font-semibold mb-1">AuraStream</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "signup" ? "Creá tu cuenta" : "Bienvenido de nuevo"}
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} />
                </div>
                <div>
                  <Label>Plan</Label>
                  <Select value={plan} onValueChange={(v) => setPlan(v as Plan)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="familiar">Familiar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "..." : mode === "signup" ? "Registrarme" : "Entrar"}
          </Button>
        </form>
        <button
          className="mt-4 text-sm text-muted-foreground hover:text-foreground w-full text-center"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
        >
          {mode === "signup" ? "¿Ya tenés cuenta? Iniciá sesión" : "¿No tenés cuenta? Registrate"}
        </button>
        <Link to="/" className="block mt-4 text-xs text-center text-muted-foreground hover:text-foreground">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
