import { z } from 'zod';

// Define the schema for creating DonorPoints
export const createDonorPointsSchema = z.object({
  donor_id: z.string(), 
  total_points: z.number().default(0), // Default value for total_points is 0 at the beginning,every user has o0 points
  last_updated: z.date().default(() => new Date()) 
}).strict();
