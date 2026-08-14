import type { NextFunction, Request, Response } from "express";
import { webhooksService } from "./webhooks.service";

export class WebhooksController {
  async receiveAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await webhooksService.receiveAppointment(String(req.params.agencyId), req.body ?? {});
      // Always 200 — GHL retries on non-2xx, and a malformed one-off payload
      // shouldn't loop forever. Missing agency is the one real error.
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const webhooksController = new WebhooksController();
