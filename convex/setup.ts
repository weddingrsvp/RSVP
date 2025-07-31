import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const initializeWeddingData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if wedding details already exist
    const existingDetails = await ctx.db.query("weddingDetails").first();
    
    if (!existingDetails) {
      // Create default wedding details
      await ctx.db.insert("weddingDetails", {
        brideName: "Sarah",
        groomName: "Michael",
        weddingDate: "June 15, 2024",
        venue: "Garden Manor Estate",
        venueAddress: "123 Rose Garden Lane, Countryside, CA 90210",
        ceremonyTime: "4:00 PM",
        receptionTime: "6:00 PM",
        dressCode: "Cocktail Attire",
        additionalInfo: "Join us for an evening of love, laughter, and celebration!",
      });
    }

    // Check if families already exist
    const existingFamilies = await ctx.db.query("families").collect();
    
    if (existingFamilies.length === 0) {
      // Create sample families
      const sampleFamilies = [
        {
          familyName: "The Johnson Family",
          contactEmail: "johnson@email.com",
          guests: [
            { firstName: "Robert", lastName: "Johnson", isChild: false },
            { firstName: "Linda", lastName: "Johnson", isChild: false },
            { firstName: "Emma", lastName: "Johnson", isChild: true },
          ],
        },
        {
          familyName: "The Smith Family",
          contactEmail: "smith@email.com",
          guests: [
            { firstName: "David", lastName: "Smith", isChild: false },
            { firstName: "Jennifer", lastName: "Smith", isChild: false },
          ],
        },
        {
          familyName: "The Williams Family",
          contactEmail: "williams@email.com",
          guests: [
            { firstName: "James", lastName: "Williams", isChild: false },
            { firstName: "Mary", lastName: "Williams", isChild: false },
            { firstName: "Alex", lastName: "Williams", isChild: true },
            { firstName: "Sophie", lastName: "Williams", isChild: true },
          ],
        },
      ];

      for (const family of sampleFamilies) {
        const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const familyId = await ctx.db.insert("families", {
          familyName: family.familyName,
          uniqueCode,
          contactEmail: family.contactEmail,
          rsvpSubmitted: false,
        });

        for (const guest of family.guests) {
          await ctx.db.insert("guests", {
            familyId,
            firstName: guest.firstName,
            lastName: guest.lastName,
            isChild: guest.isChild,
          });
        }
      }
    }

    return { success: true };
  },
});
