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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      budget_items: {
        Row: {
          allocated: number
          category: string
          created_at: string
          description: string | null
          id: string
          priority: string | null
          spent: number
          status: string | null
          updated_at: string
        }
        Insert: {
          allocated?: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          spent?: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          allocated?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          spent?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      buildings: {
        Row: {
          address: string | null
          assigned_representative_id: string | null
          building_number: number
          city_id: string | null
          created_at: string
          id: string
          surveyed_apartments: number | null
          total_apartments: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          assigned_representative_id?: string | null
          building_number: number
          city_id?: string | null
          created_at?: string
          id?: string
          surveyed_apartments?: number | null
          total_apartments?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          assigned_representative_id?: string | null
          building_number?: number
          city_id?: string | null
          created_at?: string
          id?: string
          surveyed_apartments?: number | null
          total_apartments?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buildings_assigned_representative_id_fkey"
            columns: ["assigned_representative_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buildings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          id: string
          name_ar: string
          name_fr: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_ar: string
          name_fr?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name_ar?: string
          name_fr?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      districts: {
        Row: {
          coordinator_name: string | null
          created_at: string
          id: string
          name_ar: string
          name_fr: string | null
          priority_level: string | null
          status: string | null
          target_votes: number | null
          updated_at: string
        }
        Insert: {
          coordinator_name?: string | null
          created_at?: string
          id?: string
          name_ar: string
          name_fr?: string | null
          priority_level?: string | null
          status?: string | null
          target_votes?: number | null
          updated_at?: string
        }
        Update: {
          coordinator_name?: string | null
          created_at?: string
          id?: string
          name_ar?: string
          name_fr?: string | null
          priority_level?: string | null
          status?: string | null
          target_votes?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          assigned_district: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_district?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_district?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      residential_squares: {
        Row: {
          assigned_representative_id: string | null
          building_codes: string[] | null
          building_id: string | null
          city_id: string | null
          created_at: string
          district_id: string | null
          id: string
          square_number: number
          surveyed_buildings: number | null
          total_buildings: number | null
          updated_at: string
        }
        Insert: {
          assigned_representative_id?: string | null
          building_codes?: string[] | null
          building_id?: string | null
          city_id?: string | null
          created_at?: string
          district_id?: string | null
          id?: string
          square_number: number
          surveyed_buildings?: number | null
          total_buildings?: number | null
          updated_at?: string
        }
        Update: {
          assigned_representative_id?: string | null
          building_codes?: string[] | null
          building_id?: string | null
          city_id?: string | null
          created_at?: string
          district_id?: string | null
          id?: string
          square_number?: number
          surveyed_buildings?: number | null
          total_buildings?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "residential_squares_assigned_representative_id_fkey"
            columns: ["assigned_representative_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residential_squares_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residential_squares_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residential_squares_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_items: {
        Row: {
          created_at: string
          id: string
          priority: string | null
          progress: number | null
          status: string | null
          tactics: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          priority?: string | null
          progress?: number | null
          status?: string | null
          tactics?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          priority?: string | null
          progress?: number | null
          status?: string | null
          tactics?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          name: string
          responsibilities: string[] | null
          role: string
          status: string | null
          team_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          responsibilities?: string[] | null
          role: string
          status?: string | null
          team_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          responsibilities?: string[] | null
          role?: string
          status?: string | null
          team_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      voter_census: {
        Row: {
          apartment_number: string | null
          building_code: string
          created_at: string
          head_of_household: string
          id: string
          notes: string | null
          phone_number: string | null
          residential_square_id: string
          survey_status: string | null
          surveyed_at: string | null
          surveyed_by: string | null
          total_potential_voters: number | null
          updated_at: string
          voters_with_cards: number | null
          voters_without_cards: number | null
        }
        Insert: {
          apartment_number?: string | null
          building_code: string
          created_at?: string
          head_of_household: string
          id?: string
          notes?: string | null
          phone_number?: string | null
          residential_square_id: string
          survey_status?: string | null
          surveyed_at?: string | null
          surveyed_by?: string | null
          total_potential_voters?: number | null
          updated_at?: string
          voters_with_cards?: number | null
          voters_without_cards?: number | null
        }
        Update: {
          apartment_number?: string | null
          building_code?: string
          created_at?: string
          head_of_household?: string
          id?: string
          notes?: string | null
          phone_number?: string | null
          residential_square_id?: string
          survey_status?: string | null
          surveyed_at?: string | null
          surveyed_by?: string | null
          total_potential_voters?: number | null
          updated_at?: string
          voters_with_cards?: number | null
          voters_without_cards?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "voter_census_residential_square_id_fkey"
            columns: ["residential_square_id"]
            isOneToOne: false
            referencedRelation: "residential_squares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voter_census_surveyed_by_fkey"
            columns: ["surveyed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      coordinator_progress_view: {
        Row: {
          accepted: number | null
          area: string | null
          contacted: number | null
          name: string | null
          progress: number | null
          rejected: number | null
          target: number | null
        }
        Relationships: []
      }
      pipeline_stages_view: {
        Row: {
          color: string | null
          count: number | null
          probability: number | null
          stage: string | null
        }
        Relationships: []
      }
      voter_database_view: {
        Row: {
          accepted: number | null
          building_codes: string[] | null
          contacted: number | null
          manager: string | null
          manager_phone: string | null
          potential: number | null
          square_number: number | null
          with_cards: number | null
          without_cards: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_campaign_overview: {
        Args: Record<PropertyKey, never>
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
    Enums: {},
  },
} as const
