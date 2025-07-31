import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getFamilyByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const family = await ctx.db
      .query("families")
      .withIndex("by_unique_code", (q) => q.eq("uniqueCode", args.code))
      .unique();
    
    if (!family) {
      return null;
    }

    const guests = await ctx.db
      .query("guests")
      .withIndex("by_family", (q) => q.eq("familyId", family._id))
      .collect();

    return {
      ...family,
      guests,
    };
  },
});

export const submitRSVP = mutation({
  args: {
    familyId: v.id("families"),
    guestResponses: v.array(v.object({
      guestId: v.id("guests"),
      willAttend: v.boolean(),
      dietaryRestrictions: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Update family RSVP status
    await ctx.db.patch(args.familyId, {
      rsvpSubmitted: true,
      rsvpSubmittedAt: Date.now(),
    });

    // Update each guest's response
    for (const response of args.guestResponses) {
      await ctx.db.patch(response.guestId, {
        willAttend: response.willAttend,
        dietaryRestrictions: response.dietaryRestrictions,
      });
    }

    return { success: true };
  },
});

export const getAllFamilies = query({
  args: {},
  handler: async (ctx) => {
    const families = await ctx.db.query("families").collect();
    
    const familiesWithGuests = await Promise.all(
      families.map(async (family) => {
        const guests = await ctx.db
          .query("guests")
          .withIndex("by_family", (q) => q.eq("familyId", family._id))
          .collect();
        
        const attendingGuests = guests.filter(g => g.willAttend === true);
        const notAttendingGuests = guests.filter(g => g.willAttend === false);
        const pendingGuests = guests.filter(g => g.willAttend === undefined);
        
        return {
          ...family,
          totalGuests: guests.length,
          attendingCount: attendingGuests.length,
          notAttendingCount: notAttendingGuests.length,
          pendingCount: pendingGuests.length,
          guests,
        };
      })
    );

    return familiesWithGuests;
  },
});

export const createFamily = mutation({
  args: {
    familyName: v.string(),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    guests: v.array(v.object({
      firstName: v.string(),
      lastName: v.string(),
      isChild: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    // Generate unique code
    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create family
    const familyId = await ctx.db.insert("families", {
      familyName: args.familyName,
      uniqueCode,
      contactEmail: args.contactEmail,
      contactPhone: args.contactPhone,
      rsvpSubmitted: false,
    });

    // Create guests
    for (const guest of args.guests) {
      await ctx.db.insert("guests", {
        familyId,
        firstName: guest.firstName,
        lastName: guest.lastName,
        isChild: guest.isChild,
      });
    }

    return { familyId, uniqueCode };
  },
});

export const addGuestToFamily = mutation({
  args: {
    familyId: v.id("families"),
    guest: v.object({
      firstName: v.string(),
      lastName: v.string(),
      isChild: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const guestId = await ctx.db.insert("guests", {
      familyId: args.familyId,
      firstName: args.guest.firstName,
      lastName: args.guest.lastName,
      isChild: args.guest.isChild,
    });

    return { guestId };
  },
});

export const removeGuestFromFamily = mutation({
  args: {
    guestId: v.id("guests"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.guestId);
    return { success: true };
  },
});

export const importFamiliesFromCSV = mutation({
  args: {
    csvData: v.string(),
  },
  handler: async (ctx, args) => {
    const lines = args.csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Validate headers
    const requiredHeaders = ['Family Name', 'Guest First Name', 'Guest Last Name', 'Is Child'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    const familyMap = new Map<string, {
      familyName: string;
      contactEmail?: string;
      guests: Array<{ firstName: string; lastName: string; isChild: boolean }>;
    }>();

    // Parse CSV data
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < headers.length) continue;

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      const familyName = row['Family Name'];
      const contactEmail = row['Contact Email'] || undefined;
      const firstName = row['Guest First Name'];
      const lastName = row['Guest Last Name'];
      const isChild = row['Is Child'].toLowerCase() === 'true';

      if (!familyName || !firstName || !lastName) continue;

      if (!familyMap.has(familyName)) {
        familyMap.set(familyName, {
          familyName,
          contactEmail,
          guests: [],
        });
      }

      familyMap.get(familyName)!.guests.push({
        firstName,
        lastName,
        isChild,
      });
    }

    let familiesCreated = 0;
    let guestsCreated = 0;

    // Create families and guests
    for (const familyData of familyMap.values()) {
      const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const familyId = await ctx.db.insert("families", {
        familyName: familyData.familyName,
        uniqueCode,
        contactEmail: familyData.contactEmail,
        rsvpSubmitted: false,
      });

      familiesCreated++;

      for (const guest of familyData.guests) {
        await ctx.db.insert("guests", {
          familyId,
          firstName: guest.firstName,
          lastName: guest.lastName,
          isChild: guest.isChild,
        });
        guestsCreated++;
      }
    }

    return { familiesCreated, guestsCreated };
  },
});
