import { Router } from "express";
import { webhooksController } from "./webhooks.controller";
import { webhookRateLimiter } from "../../middlewares/strictRateLimiter";

const router = Router();

// Public — GHL calls this directly from a Workflow's Webhook action, no auth
// header available. agencyId in the path identifies which agency's dashboard
// the booking belongs to.
router.post("/ghl/appointments/:agencyId", webhookRateLimiter, webhooksController.receiveAppointment);

export { router as webhooksRouter };
