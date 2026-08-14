import { Router } from "express";
import { authController } from "./auth.controller";
import { validateRequest } from "../../utils/httpHandlers";
import { connectSchema, loginSchema, changePasswordSchema, firstLoginPasswordSchema, mediaStorageSchema, ghlConnectionSchema, bookingCalendarSchema, impersonateSchema } from "./auth.schema";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { authRateLimiter } from "../../middlewares/strictRateLimiter";
import { requireJsonContent } from "../../middlewares/requireJsonContent";

const router = Router();

// Public, state-changing endpoints: strict per-IP rate limit + JSON-only
// content type (CSRF hardening — cross-origin HTML forms cannot send
// application/json without a CORS preflight, which our CORS policy rejects).
router.post("/connect", authRateLimiter, requireJsonContent, validateRequest(connectSchema), authController.connect);
router.post("/login", authRateLimiter, requireJsonContent, validateRequest(loginSchema), authController.login);
// No-login mode: issues a real session for the default owner, no credentials needed.
router.post("/auto-login", authRateLimiter, authController.autoLogin);
router.post("/refresh", authRateLimiter, requireJsonContent, authController.refresh);

// Owner sets/updates the media-storage sub-account credentials (validated live).
router.put("/media-storage", authenticate, authorize("AGENCY_OWNER"), validateRequest(mediaStorageSchema), authController.updateMediaStorage);
// Owner connects/reconnects the agency-level GHL account after signup (validated live).
router.put("/ghl-connection", authenticate, authorize("AGENCY_OWNER"), validateRequest(ghlConnectionSchema), authController.updateGhlConnection);
// Owner connects/reconnects the booking-calendar credential (validated live) and reads its status.
router.put("/booking-calendar", authenticate, authorize("AGENCY_OWNER"), validateRequest(bookingCalendarSchema), authController.updateBookingCalendar);
router.get("/booking-calendar", authenticate, authController.getBookingCalendar);
router.post("/impersonate", authenticate, authorize("AGENCY_OWNER"), validateRequest(impersonateSchema), authController.impersonate);
router.post("/change-password", authenticate, validateRequest(changePasswordSchema), authController.changePassword);
router.post("/first-login-password", authenticate, validateRequest(firstLoginPasswordSchema), authController.firstLoginPassword);
router.get("/me", authenticate, authController.getMe);

export { router as authRouter };
