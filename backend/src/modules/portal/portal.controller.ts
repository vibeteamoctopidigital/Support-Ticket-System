import type { NextFunction, Request, Response } from "express";
import { portalService } from "./portal.service";

export class PortalController {
  async resolveEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const locationId = typeof req.query.locationId === "string" ? req.query.locationId : null;
      const result = await portalService.resolveEntry(locationId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async enter(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await portalService.enter(req.body.locationId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const portalController = new PortalController();
