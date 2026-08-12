import { Router } from "express";
import { portalController } from "./portal.controller";
import { validateRequest } from "../../utils/httpHandlers";
import { portalEnterSchema } from "./portal.schema";
import { portalRateLimiter } from "../../middlewares/strictRateLimiter";
import { requireJsonContent } from "../../middlewares/requireJsonContent";

const router = Router();


router.get("/resolve-entry", portalRateLimiter, portalController.resolveEntry);
router.post("/enter", portalRateLimiter, requireJsonContent, validateRequest(portalEnterSchema), portalController.enter);

export { router as portalRouter };
