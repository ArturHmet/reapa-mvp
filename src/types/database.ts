/**
 * Supabase database type stubs — aligned with actual project schema.
 * Tables: agents, leads, clients, tasks, rate_limits, waitlist
 *
 * Sprint 11: waitlist extended with referral_code + referred_by + name + role + language
 */
export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string; email: string; full_name: string; agency_name: string | null;
          city: string; language: string; timezone: string;
          subscription_tier: string; created_at: string; updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["agents"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["agents"]["Insert"]>;
      };
      leads: {
        Row: {
          id: string; name: string; email: string | null; phone: string | null;
          source: "chat" | "manual" | "email" | "portal" | "instagram" | "facebook" | "whatsapp" | "referral" | null;
          score: number | null;
          temperature: "hot" | "warm" | "cold" | "ice" | null;
          intent: "buy" | "rent" | "sell" | null;
          budget_range: string | null; location: string | null; notes: string | null;
          last_contact_at: string | null; created_at: string;
          // optional FK — only set when lead originated from a chat session
          agent_id?: string | null;
        };
        Insert: Pick<Database["public"]["Tables"]["leads"]["Row"], "name"> &
          Partial<Omit<Database["public"]["Tables"]["leads"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
      };
      clients: {
        Row: {
          id: string; name: string; email: string | null; phone: string | null;
          nationality: string | null;
          budget_min: number | null; budget_max: number | null;
          preferred_areas: string[] | null; property_type: string[] | null;
          status: "active" | "paused" | "closed" | null;
          notes: string | null; aml_verified: boolean | null;
          created_at: string; updated_at: string;
          agent_id?: string | null;
        };
        Insert: Pick<Database["public"]["Tables"]["clients"]["Row"], "name"> &
          Partial<Omit<Database["public"]["Tables"]["clients"]["Row"], "id" | "created_at" | "updated_at">>;
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      tasks: {
        Row: {
          id: string; title: string; description: string | null;
          type: "follow_up" | "viewing" | "document" | "compliance" | "offer" | "other" | null;
          priority: "critical" | "high" | "medium" | "low" | null;
          status: "pending" | "in_progress" | "completed" | "cancelled" | null;
          due_at: string | null; ai_generated: boolean | null;
          lead_id: string | null; client_id: string | null;
          created_at: string; agent_id?: string | null;
        };
        Insert: Pick<Database["public"]["Tables"]["tasks"]["Row"], "title"> &
          Partial<Omit<Database["public"]["Tables"]["tasks"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
      };
      rate_limits: {
        Row: { key: string; count: number; window_start: string; };
        Insert: Omit<Database["public"]["Tables"]["rate_limits"]["Row"], "window_start">;
        Update: Partial<Database["public"]["Tables"]["rate_limits"]["Row"]>;
      };
      /**
       * waitlist table — Sprint 11: extended with referral tracking fields.
       *
       * Insert/Update types are inlined (not self-referential) to ensure
       * TypeScript resolves them correctly inside Supabase generic constraints.
       * Self-referential Pick/Omit patterns can collapse to `never` when the
       * surrounding Database interface is evaluated inside strict generics.
       *
       * DB migration: supabase/migrations/20260418_waitlist_referral.sql
       */
      waitlist: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: string | null;
          language: string;
          /** Unique 6-char invite code for this registrant (e.g. "ABCD12") */
          referral_code: string | null;
          /** referral_code of the person who invited this registrant */
          referred_by: string | null;
          created_at: string;
        };
        Insert: {
          email: string;
          name?: string | null;
          role?: string | null;
          language?: string;
          referral_code?: string | null;
          referred_by?: string | null;
        };
        Update: {
          email?: string;
          name?: string | null;
          role?: string | null;
          language?: string;
          referral_code?: string | null;
          referred_by?: string | null;
        };
      };
    };
    Functions: {
      increment_rate_limit: {
        Args:    { p_key: string; p_window_seconds: number };
        Returns: number;
      };
    };
  };
}
