import { z } from 'zod';
export const bloodTypeRegex = /^(A|B|AB|O)[+-]$/;
export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-'
}
export const createBloodDonationSchema = z
  .object({
    identification: z.string(),
    center_id: z.string()
  })
  .strict();

export const getBloodDonationSchema = z
  .object({
    donor_identification: z.string().optional(),
    center_id: z.string().optional(),
    blood_group: z.nativeEnum(BloodType).optional()
  })
  .strict();

export const updateBloodDonationResultsSchema = z
  .object({
    donation_id: z.string(),
    blood_group: z.nativeEnum(BloodType),
    syphilis: z.boolean(),
    hiv: z.boolean()
  })
  .strict();

export const transfuseBloodSchema = z
  .object({
    donation_id: z.string()
  })
  .strict();

export const getCenterStatsSchema = z
  .object({
    center_id: z.string().optional(),
    center_name: z.string().optional(),
    location: z.string().optional()
  })
  .strict();
