import mongoose, { Schema, Document } from 'mongoose';

export interface IDonationCenter extends Document {
  center_name: string;
}

export interface IUser extends Document {
  contact: string;
  password: string;
}

export interface IAppointment extends Document {
  center_id: Schema.Types.ObjectId;
  user_id: Schema.Types.ObjectId;
  appointment_date: Date;
  status: boolean;
}

export interface IBloodRequest extends Document {
  blood_group: string;
  center_id: Schema.Types.ObjectId;
  active: boolean; // if true then blood request is still active
}

export interface IBloodDonation extends Document {
  donor_id: Schema.Types.ObjectId; // Changed type to ObjectId
  blood_group: string;
  donation_date: Date;
  syphilis: boolean;
  HIV: boolean;
  center_id: Schema.Types.ObjectId; // Changed type to ObjectId
  blood_results: boolean;
  has_been_transfused: boolean;
}

export interface IDonor extends Document {
  user_id: Schema.Types.ObjectId; // Changed type to ObjectId
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: Date;
  nationality: string;
  identification: string;
  validation_status: boolean;
}

export interface IDonorPoints extends Document {
  donor_id: Schema.Types.ObjectId;
  total_points: number;
  last_updated: Date;

}
// Define Mongoose  schemas
const DonationCenterSchema = new Schema<IDonationCenter>({
  center_name: String
});

const UserSchema = new Schema<IUser>({
  contact: String,
  password: String
});

UserSchema.index({ contact: 1 }, { unique: true });

const AppointmentSchema = new Schema<IAppointment>({
  center_id: { type: Schema.Types.ObjectId, ref: 'DonationCenter' }, // Added ref
  user_id: { type: Schema.Types.ObjectId, ref: 'User' }, // Added ref
  appointment_date: Date,
  status: { type: Boolean, default: false }
});

const BloodRequestSchema = new Schema<IBloodRequest>({
  blood_group: String,
  center_id: { type: Schema.Types.ObjectId, ref: 'DonationCenter' }, // Added ref
  active: { type: Boolean, default: true }
});

const BloodDonationSchema = new Schema<IBloodDonation>({
  donor_id: { type: Schema.Types.ObjectId, ref: 'User' }, // Added ref
  blood_group: String,
  donation_date: Date,
  syphilis: { type: Boolean, default: false },
  HIV: { type: Boolean, default: false },
  center_id: { type: Schema.Types.ObjectId, ref: 'DonationCenter' }, // Added ref
  blood_results: { type: Boolean, default: false },
  has_been_transfused: { type: Boolean, default: false }
});

const DonorSchema = new Schema<IDonor>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User' }, // Added ref
  first_name: String,
  last_name: String,
  gender: String,
  date_of_birth: Date,
  nationality: String,
  identification: String,
  validation_status: { type: Boolean, default: false }
});

const DonorPointsSchema = new Schema<IDonorPoints>({
  donor_id: {type: Schema.Types.ObjectId,ref: 'User' },
  total_points: { type: Number, default: 0 }, // Total points accumulated by the donor
  last_updated: { type: Date, default: Date.now }

});
DonorPointsSchema.index({donor_id: 1}, {unique: true});
DonorSchema.index({ identification: 1 }, { unique: true });


// Define models
const DonationCenter = mongoose.model<IDonationCenter>('DonationCenter', DonationCenterSchema);
const User = mongoose.model<IUser>('User', UserSchema);
const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
const BloodRequest = mongoose.model<IBloodRequest>('BloodRequest', BloodRequestSchema);
const BloodDonation = mongoose.model<IBloodDonation>('BloodDonation', BloodDonationSchema);
const Donor = mongoose.model<IDonor>('Donor', DonorSchema);
const DonorPoints = mongoose.model<IDonorPoints>('DonorPoints',DonorPointsSchema );

export { DonationCenter, User, Appointment, BloodRequest, BloodDonation, Donor, DonorPoints };
