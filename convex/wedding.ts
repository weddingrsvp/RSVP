import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getWeddingDetails = query({
  args: {},
  handler: async (ctx) => {
    const details = await ctx.db.query("weddingDetails").first();
    return details;
  },
});

export const updateWeddingDetails = mutation({
  args: {
    brideName: v.string(),
    groomName: v.string(),
    weddingDate: v.string(),
    venue: v.string(),
    venueAddress: v.string(),
    ceremonyTime: v.string(),
    receptionTime: v.string(),
    dressCode: v.optional(v.string()),
    additionalInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("weddingDetails").first();
    
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("weddingDetails", args);
    }
  },
});
