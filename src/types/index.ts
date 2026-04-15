// REAPA Core Types

export type Temperature = "hot" | "warm" | "cold" | "ice";
export type LeadIntent = "buy" | "sell" | "rent" | "valuation" | "browse";
export type LeadSource = "chat" | "email" | "whatsapp" | "portal" | "instagram" | "facebook" | "referral" | "manual";
export type LeadStatus = "new" | "contacted" | "qualified" | "negotiating" | "closed_won" | "closed_lost" | "nurture";
export type PropertyType = "apartment" | "house" | "villa" | "penthouse" | "townhouse" | "commercial" | "land";
export type ListingStatus = "draft" | "active" | "pending" | "sold" | "withdrawn";
export type TaskType = "follow_up" | "viewing" | "offer" | "document" | "compliance" | "general";
export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type ClientStatus = "active" | "paused" | "closed";
export type Plan = "starter" | "pro" | "enterprise";
export type ComplianceType = "aml_check" | "kyc" | "epc" | "housing_authority" | "promise_of_sale" | "final_deed" | "fiau_report";
export type ComplianceStatus = "pending" | "submitted" | "approved" | "rejected" | "expired";
export type EpcRating = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface LeadScoreResult {
  score: number;
  temperature: Temperature;
  factors: {
    intent: number;
    timeline: number;
    budget: number;
    financing: number;
    location: number;
    contact: number;
  };
}

export interface DashboardStats {
  totalLeads: number;
  hotLeads: number;
  activeClients: number;
  pendingTasks: number;
  revenue: number;
  conversionRate: number;
}
