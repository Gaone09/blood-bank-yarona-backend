import { CreateRouter } from '../middleware/request-handler.middleware';
import { Request, RequestHandler, Response } from 'express';
import { createDonorSchema, validateDonorSchema } from '../helpers/validations/donor.validation';
import { UserRepository } from '../repositories/user.repository';
import { IDonor, IUser,  } from '../models/yarona-models';
import { successResponse } from '../helpers/functions';
import { HttpStatusCode } from 'axios';
import { getUserSchema } from '../helpers/validations/user.validation';
import { GenericError, NotFoundError } from '../helpers/error-classes';

const UserRoutes = CreateRouter();

export const createDonor: RequestHandler = async (req: Request, res: Response) => {
  const donorBody = createDonorSchema.parse(req.body);

  const donorData = {
    first_name: donorBody.first_name,
    last_name: donorBody.last_name,
    gender: donorBody.gender,
    date_of_birth: donorBody.date_of_birth,
    nationality: donorBody.nationality,
    identification: donorBody.identification
  };

  const userData = {
    contact: donorBody.contact,
    password: donorBody.password
  };

  const createDonorUser = await UserRepository.createUserAndDonor(userData as IUser, donorData as IDonor);

  return successResponse(res, HttpStatusCode.Created, 'User created', createDonorUser);
};

export const getUser: RequestHandler = async (req: Request, res: Response) => {
  const userQuery = getUserSchema.parse(req.query);

  const userDetails = await UserRepository.getUser(userQuery.user_id, userQuery.contact);

  if (!userDetails) {
    throw new NotFoundError();
  }

  return successResponse(res, HttpStatusCode.Ok, 'User details found', userDetails);
};

export const validateDonor: RequestHandler = async (req: Request, res: Response) => {
  const userValidationBody = validateDonorSchema.parse(req.body);

  const verifyDonor = await UserRepository.verifyDonor(userValidationBody);
  if (!verifyDonor) {
    throw new GenericError('Could not be verify donor', HttpStatusCode.UnprocessableEntity);
  }
  return successResponse(res, HttpStatusCode.Created, 'Verification success');
};

UserRoutes.post('/', createDonor).get('/', getUser).put('/verification', validateDonor);

export { UserRoutes };
