export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      albumes: {
        Row: {
          anio: number
          artista_id: string
          created_at: string
          id: string
          titulo: string
        }
        Insert: {
          anio: number
          artista_id: string
          created_at?: string
          id?: string
          titulo: string
        }
        Update: {
          anio?: number
          artista_id?: string
          created_at?: string
          id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "albumes_artista_id_fkey"
            columns: ["artista_id"]
            isOneToOne: false
            referencedRelation: "artistas"
            referencedColumns: ["id"]
          },
        ]
      }
      artistas: {
        Row: {
          created_at: string
          genero_musical: string
          id: string
          nombre: string
          pais: string
        }
        Insert: {
          created_at?: string
          genero_musical: string
          id?: string
          nombre: string
          pais: string
        }
        Update: {
          created_at?: string
          genero_musical?: string
          id?: string
          nombre?: string
          pais?: string
        }
        Relationships: []
      }
      canciones: {
        Row: {
          album_id: string
          created_at: string
          duracion_seg: number
          id: string
          titulo: string
        }
        Insert: {
          album_id: string
          created_at?: string
          duracion_seg: number
          id?: string
          titulo: string
        }
        Update: {
          album_id?: string
          created_at?: string
          duracion_seg?: number
          id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "canciones_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albumes"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          cancion_id: string
          fecha: string
          usuario_id: string
        }
        Insert: {
          cancion_id: string
          fecha?: string
          usuario_id: string
        }
        Update: {
          cancion_id?: string
          fecha?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_cancion_id_fkey"
            columns: ["cancion_id"]
            isOneToOne: false
            referencedRelation: "canciones"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_canciones: {
        Row: {
          agregada_por: string | null
          cancion_id: string
          fecha_agregada: string
          orden: number
          playlist_id: string
        }
        Insert: {
          agregada_por?: string | null
          cancion_id: string
          fecha_agregada?: string
          orden: number
          playlist_id: string
        }
        Update: {
          agregada_por?: string | null
          cancion_id?: string
          fecha_agregada?: string
          orden?: number
          playlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_canciones_cancion_id_fkey"
            columns: ["cancion_id"]
            isOneToOne: false
            referencedRelation: "canciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_canciones_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_colaboradores: {
        Row: {
          playlist_id: string
          usuario_id: string
        }
        Insert: {
          playlist_id: string
          usuario_id: string
        }
        Update: {
          playlist_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_colaboradores_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          colaborativa: boolean
          es_publica: boolean
          fecha_creacion: string
          id: string
          nombre: string
          usuario_id: string
        }
        Insert: {
          colaborativa?: boolean
          es_publica?: boolean
          fecha_creacion?: string
          id?: string
          nombre: string
          usuario_id: string
        }
        Update: {
          colaborativa?: boolean
          es_publica?: boolean
          fecha_creacion?: string
          id?: string
          nombre?: string
          usuario_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          fecha_registro: string
          id: string
          nombre: string
          plan: Database["public"]["Enums"]["plan_tipo"]
        }
        Insert: {
          created_at?: string
          email: string
          fecha_registro?: string
          id: string
          nombre: string
          plan?: Database["public"]["Enums"]["plan_tipo"]
        }
        Update: {
          created_at?: string
          email?: string
          fecha_registro?: string
          id?: string
          nombre?: string
          plan?: Database["public"]["Enums"]["plan_tipo"]
        }
        Relationships: []
      }
      reproducciones: {
        Row: {
          cancion_id: string
          fecha: string
          id: string
          segundos_escuchados: number
          usuario_id: string
        }
        Insert: {
          cancion_id: string
          fecha?: string
          id?: string
          segundos_escuchados: number
          usuario_id: string
        }
        Update: {
          cancion_id?: string
          fecha?: string
          id?: string
          segundos_escuchados?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reproducciones_cancion_id_fkey"
            columns: ["cancion_id"]
            isOneToOne: false
            referencedRelation: "canciones"
            referencedColumns: ["id"]
          },
        ]
      }
      seguidos: {
        Row: {
          artista_id: string
          fecha: string
          usuario_id: string
        }
        Insert: {
          artista_id: string
          fecha?: string
          usuario_id: string
        }
        Update: {
          artista_id?: string
          fecha?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seguidos_artista_id_fkey"
            columns: ["artista_id"]
            isOneToOne: false
            referencedRelation: "artistas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_playlist: {
        Args: { _playlist_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_playlist: {
        Args: { _playlist_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      plan_tipo: "free" | "premium" | "familiar"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      plan_tipo: ["free", "premium", "familiar"],
    },
  },
} as const
