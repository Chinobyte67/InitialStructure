import { API_URL, UserResponse, Token } from "@/lib/api";

// Obtener el token del localStorage
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

const getHeaders = (includeAuth = true) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

// Obtener perfil del usuario actual
export async function obtenerPerfil(userId: number): Promise<UserResponse> {
  const url = `${API_URL}/api/users/${userId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(true),
  });

  if (!response.ok) {
    throw new Error(`Error fetching profile: ${response.statusText}`);
  }

  return response.json();
}

// Actualizar datos del usuario
export async function actualizarPerfil(
  userId: number,
  data: { email?: string; age?: number }
): Promise<UserResponse> {
  const url = `${API_URL}/api/users/${userId}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Error updating profile: ${response.statusText}`);
  }

  return response.json();
}

// Login
export async function login(email: string, password: string): Promise<Token> {
  const url = `${API_URL}/api/auth/login`;
  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Error logging in: ${response.statusText}`);
  }

  const data = await response.json();
  // Guardar el token en localStorage
  if (typeof window !== "undefined" && data.access_token) {
    localStorage.setItem("auth_token", data.access_token);
  }
  return data;
}
