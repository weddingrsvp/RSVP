import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  families: defineTable({
    familyName: v.string(),
    uniqueCode: v.string(),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    rsvpSubmitted: v.boolean(),
    rsvpSubmittedAt: v.optional(v.number()),
  }).index("by_unique_code", ["uniqueCode"]),

  guests: defineTable({
    familyId: v.id("families"),
    firstName: v.string(),
    lastName: v.string(),
    isChild: v.boolean(),
    dietaryRestrictions: v.optional(v.string()),
    willAttend: v.optional(v.boolean()),
  }).index("by_family", ["familyId"]),

  weddingDetails: defineTable({
    brideName: v.string(),
    groomName: v.string(),
    weddingDate: v.string(),
    venue: v.string(),
    venueAddress: v.string(),
    ceremonyTime: v.string(),
    receptionTime: v.string(),
    dressCode: v.optional(v.string()),
    additionalInfo: v.optional(v.string()),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
