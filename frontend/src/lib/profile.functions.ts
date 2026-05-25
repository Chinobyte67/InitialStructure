import { api, type UserResponse, type Token, type Plan } from "@/lib/api";

export async function obtenerPerfil(userId: number): Promise<UserResponse> {
  return api.usuarios.obtener(userId);
}

export async function actualizarPerfil(
  userId: number,
  data: { email?: string; nombre?: string; plan?: Plan }
): Promise<UserResponse> {
  return api.usuarios.actualizar(userId, data as any);
}

export async function login(email: string, password: string): Promise<Token> {
  return api.auth.login({ email, password });
}
