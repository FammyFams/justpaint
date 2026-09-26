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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_login_log: {
        Row: {
          created_at: string
          id: number
          ip_hash: string
        }
        Insert: {
          created_at?: string
          id?: never
          ip_hash: string
        }
        Update: {
          created_at?: string
          id?: never
          ip_hash?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          body: string
          created_at: string
          id: string
          painting_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          painting_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          painting_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_painting_id_fkey"
            columns: ["painting_id"]
            isOneToOne: false
            referencedRelation: "paintings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          contact_email: string
          created_at: string
          details: string
          id: number
          painting_id: string | null
          painting_title: string | null
          reason: string
          removed_count: number
          reporter_hash: string
          resolved_at: string | null
          signature: string
          status: string
        }
        Insert: {
          contact_email: string
          created_at?: string
          details?: string
          id?: never
          painting_id?: string | null
          painting_title?: string | null
          reason: string
          removed_count?: number
          reporter_hash: string
          resolved_at?: string | null
          signature: string
          status?: string
        }
        Update: {
          contact_email?: string
          created_at?: string
          details?: string
          id?: never
          painting_id?: string | null
          painting_title?: string | null
          reason?: string
          removed_count?: number
          reporter_hash?: string
          resolved_at?: string | null
          signature?: string
          status?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          painting_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          painting_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          painting_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_painting_id_fkey"
            columns: ["painting_id"]
            isOneToOne: false
            referencedRelation: "paintings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      painting_hearts: {
        Row: {
          created_at: string
          ip_hash: string
          painting_id: string
        }
        Insert: {
          created_at?: string
          ip_hash: string
          painting_id: string
        }
        Update: {
          created_at?: string
          ip_hash?: string
          painting_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "painting_hearts_painting_id_fkey"
            columns: ["painting_id"]
            isOneToOne: false
            referencedRelation: "paintings"
            referencedColumns: ["id"]
          },
        ]
      }
      paintings: {
        Row: {
          aspect: string
          created_at: string
          description: string
          guest_name: string | null
          heart_count: number
          id: string
          image_path: string
          image_sha256: string | null
          owner_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          aspect?: string
          created_at?: string
          description?: string
          guest_name?: string | null
          heart_count?: number
          id?: string
          image_path: string
          image_sha256?: string | null
          owner_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          aspect?: string
          created_at?: string
          description?: string
          guest_name?: string | null
          heart_count?: number
          id?: string
          image_path?: string
          image_sha256?: string | null
          owner_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "paintings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      paintings_tags: {
        Row: {
          painting_id: string
          tag_id: string
        }
        Insert: {
          painting_id: string
          tag_id: string
        }
        Update: {
          painting_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paintings_tags_painting_id_fkey"
            columns: ["painting_id"]
            isOneToOne: false
            referencedRelation: "paintings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paintings_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      upload_log: {
        Row: {
          created_at: string
          id: number
          ip_hash: string
        }
        Insert: {
          created_at?: string
          id?: never
          ip_hash: string
        }
        Update: {
          created_at?: string
          id?: never
          ip_hash?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_comment: {
        Args: { p_body: string; p_painting_id: string; p_user_id: string }
        Returns: string
      }
      claim_admin_login_attempt: {
        Args: { p_ip_hash: string }
        Returns: undefined
      }
      claim_upload_slot: { Args: { p_ip_hash: string }; Returns: undefined }
      create_painting: {
        Args: {
          p_aspect: string
          p_description: string
          p_guest_name?: string
          p_id: string
          p_image_path: string
          p_owner_id?: string
          p_tag_names?: string[]
          p_title: string
        }
        Returns: string
      }
      display_name_taken: {
        Args: { p_exclude?: string; p_name: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
