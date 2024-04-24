import { z } from 'zod';
import {
  createBloodDonationSchema,
  getBloodDonationSchema,
  getCenterStatsSchema,
  transfuseBloodSchema,
  updateBloodDonationResultsSchema
} from '../helpers/validations/blood-donation.validation';
import { BloodDonation, DonationCenter, IBloodDonation } from '../models/yarona-models';
import mongoose from 'mongoose';
import { IDonationCenterStats } from './repository.helpers';

const createBloodDonation = async (
  createDonationBody: z.infer<typeof createBloodDonationSchema>,
  user_id: string
): Promise<boolean> => {
  const result = await BloodDonation.create({ donor_id: user_id, center_id: createDonationBody.center_id });
  if (!result._id) return false;
  return true;
};

const getBloodDonation = async (
  bloodDonationQuery?: z.infer<typeof getBloodDonationSchema>,
  donor_id?: string,
  is_donatable?: boolean,
  has_been_transfused?: boolean
): Promise<IBloodDonation[]> => {
  let query = BloodDonation.find();
  if (bloodDonationQuery) {
    if (bloodDonationQuery.blood_group) {
      query = query.where('blood_group', bloodDonationQuery.blood_group);
    }
    if (bloodDonationQuery.center_id) {
      query = query.where('center_id', bloodDonationQuery.center_id);
    }
  }

  if (donor_id) {
    query = query.where('donor_id', donor_id);
  }
  if (has_been_transfused !== undefined) {
    query.where('has_been_transfused', has_been_transfused);
  }

  query = query.select('-__v');
  query = query.sort({ donation_date: 'desc' });
  return query.exec();
};

const getCenterBloodDonations = async (center_id: string[]): Promise<IBloodDonation[]> => {
  let query: any; // Change IBloodDonation[] to any as Mongoose returns a Query object

  if (center_id.length === 0) {
    query = BloodDonation.find(); // If center_id array is empty, return all blood donations
  } else {
    query = BloodDonation.find({ center_id: { $in: center_id } });
  }
  query = query.where('has_been_transfused', false);
  query = query.select('-__v');
  return query.exec();
};
const updateBloodDonationResults = async (
  bloodDonationBody: z.infer<typeof updateBloodDonationResultsSchema>,
  is_donatable: boolean
): Promise<boolean> => {
  const result: mongoose.UpdateWriteOpResult = await BloodDonation.updateOne(
    { _id: bloodDonationBody.donation_id, blood_results: false },
    {
      $set: {
        blood_group: bloodDonationBody.blood_group,
        HIV: bloodDonationBody.hiv,
        syphilis: bloodDonationBody.syphilis,
        blood_results: true,
        is_donatable: is_donatable
      }
    }
  );

  return !!result.modifiedCount;
};

const transfuseBlood = async (transfuseBloodQuery: z.infer<typeof transfuseBloodSchema>): Promise<boolean> => {
  const result: mongoose.UpdateWriteOpResult = await BloodDonation.updateOne(
    { _id: transfuseBloodQuery.donation_id, has_been_transfused: false },
    {
      $set: {
        has_been_transfused: true
      }
    }
  );

  return !!result.modifiedCount;
};

const getDonationCenterStats = async (donationStatsQuery: z.infer<typeof getCenterStatsSchema>) => {
  const matchStage: any = {
    is_donatable: true,
    has_been_transfused: false
  };
  if (donationStatsQuery.center_id) {
    matchStage.$match.center_id = donationStatsQuery.center_id;
  } else if (donationStatsQuery.center_name) {
    matchStage.$match.center_name = donationStatsQuery.center_name;
  } else if (donationStatsQuery.location) {
    matchStage.$match.location = donationStatsQuery.location;
  }

  // Define the pipeline for aggregation
  const pipeline: any[] = [
    {
      $group: {
        _id: '$center_id',
        bloodA: { $sum: { $cond: [{ $eq: ['$blood_group', 'A+'] }, 1, 0] } },
        bloodB: { $sum: { $cond: [{ $eq: ['$blood_group', 'B+'] }, 1, 0] } },
        bloodAB: { $sum: { $cond: [{ $eq: ['$blood_group', 'AB+'] }, 1, 0] } },
        bloodO: { $sum: { $cond: [{ $eq: ['$blood_group', 'O+'] }, 1, 0] } }
      }
    },
    {
      $project: {
        center_id: '$_id',
        bloodA: 1,
        bloodB: 1,
        bloodAB: 1,
        bloodO: 1,
        _id: 0
      }
    }
  ];

  const result: IDonationCenterStats[] = await DonationCenter.aggregate(pipeline);

  return result;
};

export const DonationRepository = {
  createBloodDonation,
  getBloodDonation,
  updateBloodDonationResults,
  transfuseBlood,
  getDonationCenterStats,
  getCenterBloodDonations
};
