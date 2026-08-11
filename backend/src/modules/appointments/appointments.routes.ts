import { Router } from "express";
import { appointmentsController } from "./appointments.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

const router = Router();

router.use(authenticate);

router.get("/", authorize("AGENCY_OWNER"), appointmentsController.list);

export { router as appointmentsRouter };
