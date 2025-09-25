import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema({
  fullName: String,
  dob: Date,
  phone: String,
  email: String,
  currentAddress: String,
}, { _id: false });

const employmentSchema = new mongoose.Schema({
  employerName: String,
  jobTitle: String,
  employerPhone: String,
  monthlyIncome: Number,
}, { _id: false });

const rentalHistorySchema = new mongoose.Schema({
  previousAddress: String,
  previousLandlord: String,
  previousLandlordPhone: String,
  previousDuration: String,
  reasonForLeaving: String,
}, { _id: false });

const occupantsSchema = new mongoose.Schema({
  count: Number,
  hasPets: Boolean,
}, { _id: false });

const referenceSchema = new mongoose.Schema({
  name: String,
  relationship: String,
  phone: String,
  email: String,
}, { _id: false });

const consentSchema = new mongoose.Schema({
  agreeChecks: Boolean,
  signature: String,
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true
  },
  moveInDate: Date,
  message: String,
  leaseDuration: { type: Number, default: 1 }, // Lease duration in years

  applicant: applicantSchema,
  employment: employmentSchema,
  rentalHistory: rentalHistorySchema,
  occupants: occupantsSchema,
  reference: referenceSchema,
  consent: consentSchema,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  lease: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lease",
    default: null
  }
}, { timestamps: true });

export default mongoose.model("Application", applicationSchema);
