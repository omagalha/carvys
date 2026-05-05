export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          plan_code: string
          status: TenantStatus
          business_type: BusinessType
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan_code?: string
          status?: TenantStatus
          business_type?: BusinessType
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          plan_code?: string
          status?: TenantStatus
          business_type?: BusinessType
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          tenant_id: string
          name: string
          sku: string | null
          category: string | null
          brand: string | null
          supplier: string | null
          cost_price: number | null
          sale_price: number | null
          photo_path: string | null
          manufacture_date: string | null
          expiry_date: string | null
          quantity: number
          min_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          sku?: string | null
          category?: string | null
          brand?: string | null
          supplier?: string | null
          cost_price?: number | null
          sale_price?: number | null
          photo_path?: string | null
          manufacture_date?: string | null
          expiry_date?: string | null
          quantity?: number
          min_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          sku?: string | null
          category?: string | null
          brand?: string | null
          supplier?: string | null
          cost_price?: number | null
          sale_price?: number | null
          photo_path?: string | null
          manufacture_date?: string | null
          expiry_date?: string | null
          quantity?: number
          min_quantity?: number
          updated_at?: string
        }
      }
      inventory_movements: {
        Row: {
          id: string
          tenant_id: string
          product_id: string
          type: MovementType
          quantity: number
          notes: string | null
          performed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          product_id: string
          type: MovementType
          quantity: number
          notes?: string | null
          performed_by?: string | null
          created_at?: string
        }
        Update: Record<string, never>
      }
      tenant_memberships: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          role: TenantRole
          status: MembershipStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          role?: TenantRole
          status?: MembershipStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          role?: TenantRole
          status?: MembershipStatus
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          tenant_id: string
          brand: string
          model: string
          version: string | null
          year_manufacture: number | null
          year_model: number | null
          mileage: number | null
          color: string | null
          plate: string | null
          price: number
          cost_price: number | null
          status: VehicleStatus
          featured: boolean
          cover_image_path: string | null
          gallery: Json
          details: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          brand: string
          model: string
          version?: string | null
          year_manufacture?: number | null
          year_model?: number | null
          mileage?: number | null
          color?: string | null
          plate?: string | null
          price?: number
          cost_price?: number | null
          status?: VehicleStatus
          featured?: boolean
          cover_image_path?: string | null
          gallery?: Json
          details?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          brand?: string
          model?: string
          version?: string | null
          year_manufacture?: number | null
          year_model?: number | null
          mileage?: number | null
          color?: string | null
          plate?: string | null
          price?: number
          cost_price?: number | null
          status?: VehicleStatus
          featured?: boolean
          cover_image_path?: string | null
          gallery?: Json
          details?: Json
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          tenant_id: string
          assigned_user_id: string | null
          interest_vehicle_id: string | null
          name: string
          phone: string
          email: string | null
          source: string | null
          stage: LeadStage
          notes: string | null
          last_contact_at: string | null
          next_follow_up_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          assigned_user_id?: string | null
          interest_vehicle_id?: string | null
          name: string
          phone: string
          email?: string | null
          source?: string | null
          stage?: LeadStage
          notes?: string | null
          last_contact_at?: string | null
          next_follow_up_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string | null
          interest_vehicle_id?: string | null
          name?: string
          phone?: string
          email?: string | null
          source?: string | null
          stage?: LeadStage
          notes?: string | null
          last_contact_at?: string | null
          next_follow_up_at?: string | null
          updated_at?: string
        }
      }
      follow_ups: {
        Row: {
          id: string
          tenant_id: string
          lead_id: string
          assigned_user_id: string | null
          title: string
          notes: string | null
          channel: string
          due_at: string
          completed_at: string | null
          status: FollowUpStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          lead_id: string
          assigned_user_id?: string | null
          title: string
          notes?: string | null
          channel?: string
          due_at: string
          completed_at?: string | null
          status?: FollowUpStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string | null
          title?: string
          notes?: string | null
          channel?: string
          due_at?: string
          completed_at?: string | null
          status?: FollowUpStatus
          updated_at?: string
        }
      }
      whatsapp_instances: {
        Row: {
          id: string
          tenant_id: string
          provider: string
          instance_external_id: string | null
          phone_number: string | null
          status: IntegrationStatus
          webhook_secret: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          provider?: string
          instance_external_id?: string | null
          phone_number?: string | null
          status?: IntegrationStatus
          webhook_secret?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          provider?: string
          instance_external_id?: string | null
          phone_number?: string | null
          status?: IntegrationStatus
          webhook_secret?: string | null
          updated_at?: string
        }
      }
      billing_subscriptions: {
        Row: {
          id: string
          tenant_id: string
          provider: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          plan_code: string
          status: string
          next_billing_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          provider?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          plan_code?: string
          status?: string
          next_billing_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          plan_code?: string
          status?: string
          next_billing_at?: string | null
          updated_at?: string
        }
      }
      webhook_events: {
        Row: {
          id: string
          tenant_id: string | null
          provider: string
          external_event_id: string | null
          event_type: string
          status: string
          payload: Json
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          provider: string
          external_event_id?: string | null
          event_type: string
          status?: string
          payload: Json
          processed_at?: string | null
          created_at?: string
        }
        Update: {
          status?: string
          processed_at?: string | null
        }
      }
    }
    Enums: {
      tenant_role: TenantRole
      membership_status: MembershipStatus
      tenant_status: TenantStatus
      vehicle_status: VehicleStatus
      lead_stage: LeadStage
      follow_up_status: FollowUpStatus
      integration_status: IntegrationStatus
    }
  }
}

export type TenantRole = 'owner' | 'admin' | 'sales'
export type MembershipStatus = 'active' | 'invited' | 'disabled'
export type TenantStatus = 'trial' | 'active' | 'past_due' | 'canceled'
export type BusinessType = 'car_dealer' | 'makeup_store' | 'garage'
export type VehicleStatus = 'draft' | 'available' | 'reserved' | 'sold' | 'archived'
export type LeadStage = 'new' | 'contacted' | 'negotiating' | 'won' | 'lost'
export type FollowUpStatus = 'pending' | 'done' | 'canceled' | 'overdue'
export type IntegrationStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
export type MovementType = 'in' | 'out' | 'return' | 'discard'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
