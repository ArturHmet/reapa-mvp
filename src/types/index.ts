/**
 * REAPA Domain Types
 * Mirrors Prisma schema models for use throughout the app.
 * Source of truth: prisma/schema.prisma
 */

export type LeadStatus = "new" | "hot" | "warm" | "cold" | "ice" | "closed_won" | "closed_lost";
export type ClientType = "buyer" | "seller" | "landlord" | "tenant";
export type ClientStatus = "active" | "inactive" | "archived";
export type ListingStatus = "active" | "under_offer" | "sold" | "rented" | "off_market";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TransactionType = "buy" | "sell" | "rent" | "lease";
export type SubscriptionTier = "free" | "starter" | "professional" | "enterprise";

export interface Agent {
  id: string;
  email: string;
  fullName: string;
  agencyName?: string;
  city: string;
  language: string;
  timezone: string;
  subscriptionTier: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  agentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: LeadStatus;
  propertyType?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocations: string[];
  notes?: string;
  score: number;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  agentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  type: ClientType;
  status: ClientStatus;
  nationality?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  agentId: string;
  title: string;
  description?: string;
  propertyType: string;
  transactionType: TransactionType;
  price: number;
  areaSqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  location: string;
  address?: string;
  status: ListingStatus;
  epcRating?: string;
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  agentId: string;
  leadId?: string;
  clientId?: string;
  listingId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API response wrappers
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}
