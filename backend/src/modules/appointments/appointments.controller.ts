import type { NextFunction, Request, Response } from "express";
import { appointmentsService } from "./appointments.service";

export class AppointmentsController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const calendarId = String(req.query.calendarId ?? "");
      const data = await appointmentsService.listBookedAppointments(req.user!.agencyId, calendarId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentsController = new AppointmentsController();
