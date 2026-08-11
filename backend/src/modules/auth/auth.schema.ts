import { z } from "zod";

export const connectSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    agencyName: z.string().min(2).max(120),
    ghlCompanyId: z.string().min(1).max(64).regex(/^[\w-]+$/, "Invalid Company/Location ID format"),
    ghlApiKey: z.string().min(10).max(512),
    // Media storage lives in ONE designated sub-account (agency PITs cannot
    // carry media scopes) — both values are mandatory.
    ghlMediaLocationId: z
      .string({ required_error: "Media storage Location ID is required" })
      .min(1, "Media storage Location ID is required")
      .max(64)
      .regex(/^[\w-]+$/, "Invalid Location ID format"),
    ghlMediaApiKey: z
      .string({ required_error: "Media storage PIT token is required" })
      .min(10, "Media storage PIT token looks too short")
      .max(512),
  }),
});

export const mediaStorageSchema = z.object({
  body: z.object({
    ghlMediaLocationId: z
      .string({ required_error: "Media storage Location ID is required" })
      .min(1, "Media storage Location ID is required")
      .max(64)
      .regex(/^[\w-]+$/, "Invalid Location ID format"),
    ghlMediaApiKey: z
      .string({ required_error: "Media storage PIT token is required" })
      .min(10, "Media storage PIT token looks too short")
      .max(512),
  }),
});


export const ghlConnectionSchema = z.object({
  body: z.object({
    ghlCompanyId: z.string().min(1, "Company/Location ID is required").max(64).regex(/^[\w-]+$/, "Invalid Company/Location ID format"),
    ghlApiKey: z.string().min(10, "GHL Private Integration key is required").max(512),
    // Used as the locationId for calendar/appointment lookups (GHL's
    // Calendars API requires one). Reuses the same slot media storage
    // could later use — most agencies only run one primary location.
    ghlLocationId: z.string().min(1, "Location ID is required").max(64).regex(/^[\w-]+$/, "Invalid Location ID format"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const firstLoginPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const impersonateSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "User ID is required"),
  }),
});
