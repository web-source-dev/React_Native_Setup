import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Property storage schema
export const properties = sqliteTable('properties', {
  // Primary key
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Remote ID from server (MongoDB _id)
  remoteId: text('remote_id').unique(), // Server ID (MongoDB _id)

  // Homeowner/Owner reference (stored as string ID from server)
  homeownerId: text('homeowner_id'), // Reference to User (from server)

  // Property Address
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  country: text('country').default('USA'),

  // Property Details
  propertyType: text('property_type').notNull(), // 'Single Family', 'Townhouse', 'Condo', 'Multi-Family', 'Other'
  bedrooms: integer('bedrooms'),
  bathrooms: real('bathrooms'),
  squareFootage: integer('square_footage'),
  yearBuilt: integer('year_built'),
  lotSize: real('lot_size'),

  // Assigned Teams (stored as string IDs from server)
  assignedAPS_RenoId: text('assigned_aps_reno_id'),
  assignedAPS_REId: text('assigned_aps_re_id'),
  assignedExternalAgentId: text('assigned_external_agent_id'),
  assignedAPS_OpsId: text('assigned_aps_ops_id'),

  // Timeline Targets
  targetStartDate: integer('target_start_date'), // Unix timestamp in milliseconds
  targetListingDate: integer('target_listing_date'), // Unix timestamp in milliseconds
  targetBackstopDate: integer('target_backstop_date'), // Unix timestamp in milliseconds

  // Flags
  permitsLikely: integer('permits_likely', { mode: 'boolean' }).default(false),
  structuralRisk: integer('structural_risk', { mode: 'boolean' }).default(false),
  occupancy: text('occupancy').default('Unknown'), // 'Occupied', 'Vacant', 'Unknown'

  // Status and Phase
  status: text('status').notNull().default('new'), // 'new', 'contacted', 'scheduled', 'qualified', etc.
  phase: text('phase').notNull().default('inquiry'), // 'inquiry', 'intake', 'site-visit', etc.

  // Additional Notes
  notes: text('notes'),
  goals: text('goals'),
  painPoints: text('pain_points'),
  budgetComfort: text('budget_comfort'),

  // Lead source information
  leadSource: text('lead_source').default('Homeowner'), // 'Homeowner', 'External Agent'
  createdById: text('created_by_id'), // User ID who created the property

  // Sync status
  syncStatus: text('sync_status').notNull().default('pending'), // 'pending', 'syncing', 'synced', 'failed'

  // Soft delete flag
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),

  // Timestamps (epoch milliseconds)
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// Type definitions for TypeScript
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

