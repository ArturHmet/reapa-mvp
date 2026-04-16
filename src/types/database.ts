/**
 * Supabase database type stubs.
 * Run `supabase gen types typescript` to regenerate once Supabase project is created.
 */
export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          agency_name: string | null;
          city: string;
          language: string;
          timezone: string;
          subscription_tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["agents"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["agents"]["Insert"]>;
      };
      leads: {
        Row: {
          id: string;
          agent_id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          status: "new" | "hot" | "warm" | "cold" | "ice" | "closed_won" | "closed_lost";
          property_type: string | null;
          budget_min: number | null;
          budget_max: number | null;
          preferred_locations: string[];
          notes: string | null;
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leads"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
      };
      clients: {
        Row: {
          id: string;
          agent_id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          type: "buyer" | "seller" | "landlord" | "tenant";
          status: "active" | "inactive" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["clients"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      tasks: {
        Row: {
          id: string;
          agent_id: string;
          lead_id: string | null;
          client_id: string | null;
          title: string;
          description: string | null;
          status: "pending" | "in_progress" | "completed" | "cancelled";
          priority: "low" | "medium" | "high" | "urgent";
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tasks"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
      };
    };
  };
}
