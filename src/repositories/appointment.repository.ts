import { Appointment, IAppointment } from '../models/yarona-models';
import { z } from 'zod';
import {
  appointmentSchema,
  approveAppointmentSchema,
  getAppointmentSchema,
  updateAppointmentSchema
} from '../helpers/validations/appointment.validation';
import mongoose from 'mongoose';

const createAppointment = async (appointmentData: z.infer<typeof appointmentSchema>): Promise<boolean> => {
  const result = await Appointment.create(appointmentData);

  if (!result._id) return false;
  return true;
};

const getAppointment = async (appointmentQuery: z.infer<typeof getAppointmentSchema>): Promise<IAppointment[]> => {
  let query = Appointment.find();
  if (appointmentQuery.user_id) {
    query = query.where('user_id', appointmentQuery.user_id);
  }
  if (appointmentQuery.status !== undefined) {
    query = query.where('status', appointmentQuery.status);
  }
  if (appointmentQuery.center_id) {
    query.where('center_id', appointmentQuery.center_id);
  }
  if (appointmentQuery.appointment_id) {
    query.where('_id', appointmentQuery.appointment_id);
  }

  query = query.select('-__v');
  return query.exec();
};

const updateAppointment = async (appointmentBody: z.infer<typeof updateAppointmentSchema>): Promise<boolean> => {
  const result: mongoose.UpdateWriteOpResult = await Appointment.updateOne(
    { _id: appointmentBody.appointment_id },
    { $set: { appointment_date: appointmentBody.appointment_date } }
  );

  return !!result.modifiedCount;
};

const verifyAppointment = async (appointmentBody: z.infer<typeof approveAppointmentSchema>): Promise<boolean> => {
  const result: mongoose.UpdateWriteOpResult = await Appointment.updateOne(
    { _id: appointmentBody.appointment_id },
    { $set: { status: appointmentBody.status } }
  );

  return !!result.modifiedCount;
};
export const AppointmentRepository = { createAppointment, getAppointment, updateAppointment, verifyAppointment };
