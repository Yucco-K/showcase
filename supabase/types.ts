export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          query?: string
          variables?: Json
          extensions?: Json
          operationName?: string
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
      blogs: {
        Row: {
          author: string | null
          id: string
          platform: string | null
          published_at: string
          read_time: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          author?: string | null
          id?: string
          platform?: string | null
          published_at: string
          read_time?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          author?: string | null
          id?: string
          platform?: string | null
          published_at?: string
          read_time?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          admin_notes: string | null
          checked_at: string | null
          checked_by: string | null
          created_at: string | null
          email: string
          id: string
          is_checked: boolean | null
          is_replied: boolean | null
          message: string
          name: string
          replied_at: string | null
          replied_by: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_checked?: boolean | null
          is_replied?: boolean | null
          message: string
          name: string
          replied_at?: string | null
          replied_by?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          checked_at?: string | null
          checked_by?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_checked?: boolean | null
          is_replied?: boolean | null
          message?: string
          name?: string
          replied_at?: string | null
          replied_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          plan_type: string
          status: string
          stripe_payment_intent_id: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          plan_type: string
          status: string
          stripe_payment_intent_id: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_payment_intent_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_likes: {
        Row: {
          created_at: string | null
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_likes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          product_id: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          description: string
          features: string[] | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_popular: boolean | null
          last_updated: string | null
          likes: number
          long_desc: string | null
          name: string
          price: number
          requirements: string[] | null
          stars_count: number
          stars_total: number
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_popular?: boolean | null
          last_updated?: string | null
          likes?: number
          long_desc?: string | null
          name: string
          price: number
          requirements?: string[] | null
          stars_count?: number
          stars_total?: number
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_popular?: boolean | null
          last_updated?: string | null
          likes?: number
          long_desc?: string | null
          name?: string
          price?: number
          requirements?: string[] | null
          stars_count?: number
          stars_total?: number
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          biography: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          stripe_customer_id: string | null
          subscription_plan: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          biography?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          biography?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          demo_url: string | null
          description: string | null
          featured: boolean | null
          github_url: string | null
          id: string
          image_url: string | null
          technologies: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_type: string
          status: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          plan_type: string
          status: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_type?: string
          status?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_exists: {
        Args: { email_address: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

