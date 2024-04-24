import { CreateRouter } from '../middleware/request-handler.middleware';
import { Request, RequestHandler, Response } from 'express';
import {
  appointmentSchema,
  getAppointmentSchema,
  getCenterAppointmentSchema,
  getUserAppointmentSchema,
  updateAppointmentSchema
} from '../helpers/validations/appointment.validation';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { GenericError, NotFoundError } from '../helpers/error-classes';
import { HttpStatusCode } from 'axios';
import { successResponse } from '../helpers/functions';
import { UserRepository } from '../repositories/user.repository';
import { DonationCenterRepository } from '../repositories/donation-center.repository';
import { IAppointment } from '../models/yarona-models';
import { addCenterNameToAppointments } from '../repositories/repository.helpers';

const AppointmentRoutes = CreateRouter();

const createAppointment: RequestHandler = async (req: Request, res: Response) => {
  const appointmentBody = appointmentSchema.parse(req.body);

  const user = await UserRepository.getUser(appointmentBody.user_id.toString());
  const center = await DonationCenterRepository.getDonationCenters({ center_id: appointmentBody.center_id.toString() });

  if (!user) {
    throw new GenericError('Cannot create appointment for non-user', HttpStatusCode.UnprocessableEntity);
  }
  if (center.length === 0) {
    throw new GenericError(
      'Cannot create appointment at a center that does not exist',
      HttpStatusCode.UnprocessableEntity
    );
  }
  const createAppointment = await AppointmentRepository.createAppointment(appointmentBody);

  if (!createAppointment) throw new GenericError('Could not create appointment', HttpStatusCode.UnprocessableEntity);

  return successResponse(res, HttpStatusCode.Created, 'Appointment created');
};

const getUserAppointment: RequestHandler = async (req: Request, res: Response) => {
  const appointmentQuery = getUserAppointmentSchema.parse(req.query);

  const appointments: IAppointment[] = await AppointmentRepository.getAppointment(appointmentQuery);

  if (appointments.length === 0) throw new NotFoundError('Appointment not found');

  return successResponse(res, HttpStatusCode.Ok, 'Appointment(s) found', appointments);
};
const getCenterAppointment: RequestHandler = async (req: Request, res: Response) => {
  const appointmentQuery = getCenterAppointmentSchema.parse(req.query);

  const appointments = await AppointmentRepository.getAppointment(appointmentQuery);

  const getCenters = await DonationCenterRepository.getDonationCenters({});

  const adjustedAppointments = addCenterNameToAppointments(getCenters, appointments);

  if (adjustedAppointments.length === 0) throw new NotFoundError('Appointment not found');

  return successResponse(res, HttpStatusCode.Ok, 'Appointment(s) found', adjustedAppointments);
};

const getAppointment: RequestHandler = async (req: Request, res: Response) => {
  const appointmentQuery = getAppointmentSchema.parse(req.query);

  const appointments = await AppointmentRepository.getAppointment(appointmentQuery);

  const getCenters = await DonationCenterRepository.getDonationCenters({});

  const adjustedAppointments = addCenterNameToAppointments(getCenters, appointments);

  if (adjustedAppointments.length === 0) throw new NotFoundError('Appointment not found');

  return successResponse(res, HttpStatusCode.Ok, 'Appointment(s) found', adjustedAppointments);
};

const updateAppointment: RequestHandler = async (req: Request, res: Response) => {
  const appointmentBody = updateAppointmentSchema.parse(req.body);

  const appointment = await AppointmentRepository.getAppointment({ appointment_id: appointmentBody.appointment_id });
  if (appointment.length > 0) {
    if (appointment[0].status) {
      throw new GenericError('Appointment has already been verified', HttpStatusCode.UnprocessableEntity);
    }
  }
  const update = AppointmentRepository.updateAppointment(appointmentBody);

  if (!update) {
    throw new GenericError('Could not update appointment', HttpStatusCode.UnprocessableEntity);
  }

  return successResponse(res, HttpStatusCode.Ok, 'Appointment updated');
};

AppointmentRoutes.post('/', createAppointment)
  .get('/', getAppointment)
  .get('/center', getCenterAppointment)
  .get('/user', getUserAppointment)
  .put('/', updateAppointment);

export { AppointmentRoutes };
