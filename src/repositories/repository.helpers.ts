import { IAppointment, IBloodDonation, IDonationCenter } from '../models/yarona-models';
import { GenericError } from '../helpers/error-classes';
import { HttpStatusCode } from 'axios';

export interface IDonationCenterStats {
  center_id: string;
  center_name: string;
  location: string;
  AB_POSITIVE: number;
  A_POSITIVE: number;
  B_POSITIVE: number;
  AB_NEGATIVE: number;
  A_NEGATIVE: number;
  B_NEGATIVE: number;
  O_POSITIVE: number;
  O_NEGATIVE: number;
}

export interface IAppointmentData {
  _id: string;
  center_name: string;
  center_id: string;
  user_id: string;
  appointment_date: Date;
  status: boolean;
}

export const calculateDonationCenterStats = (
  bloodDonations: IBloodDonation[],
  donationCenters: IDonationCenter[]
): IDonationCenterStats[] => {
  const centerStatsMap: Map<string, IDonationCenterStats> = new Map();

  // Initialize centerStatsMap with donation centers
  donationCenters.forEach((center) => {
    centerStatsMap.set(center._id, {
      center_id: center._id,
      center_name: center.center_name,
      location: center.location,
      AB_POSITIVE: 0,
      A_POSITIVE: 0,
      B_POSITIVE: 0,
      AB_NEGATIVE: 0,
      A_NEGATIVE: 0,
      B_NEGATIVE: 0,
      O_POSITIVE: 0,
      O_NEGATIVE: 0
    });
  });

  // Update blood group counts for each donation center
  bloodDonations.forEach((donation) => {
    const centerStats = centerStatsMap.get(donation.center_id);
    if (centerStats) {
      switch (donation.blood_group) {
        case 'AB+':
          centerStats.AB_POSITIVE++;
          break;
        case 'A+':
          centerStats.A_POSITIVE++;
          break;
        case 'B+':
          centerStats.B_POSITIVE++;
          break;
        case 'AB-':
          centerStats.AB_NEGATIVE++;
          break;
        case 'A-':
          centerStats.A_NEGATIVE++;
          break;
        case 'B-':
          centerStats.B_NEGATIVE++;
          break;
        case 'O+':
          centerStats.O_POSITIVE++;
          break;
        case 'O-':
          centerStats.O_NEGATIVE++;
          break;
        default:
          break;
      }
    }
  });

  // Convert Map values to array and return
  return Array.from(centerStatsMap.values());
};

export const extractIdsFromDonationCenters = (donationCenters: IDonationCenter[]): string[] => {
  return donationCenters.map((center) => center._id);
};

export const addCenterNameToAppointments = (
  donationCenters: IDonationCenter[],
  appointments: IAppointment[]
): IAppointmentData[] => {
  const adjustedAppointments: IAppointmentData[] = [];

  appointments.forEach((appointment) => {
    const center: IDonationCenter[] = donationCenters.filter(
      (donationCenter) => donationCenter._id == appointment.center_id
    );
    if (center.length === 0) {
      throw new GenericError('Could not find matching center', HttpStatusCode.UnprocessableEntity);
    }
    adjustedAppointments.push({
      _id: appointment._id,
      center_name: center[0].center_name,
      center_id: appointment.center_id,
      user_id: appointment.user_id,
      appointment_date: appointment.appointment_date,
      status: appointment.status
    });
  });

  return adjustedAppointments;
};
