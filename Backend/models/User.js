import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["tenant", "landlord", "admin"], default: "tenant" },
    phone: { type: String },
    profileImage: { type: String, default: "" },
    status: { type: String, enum: ["active", "suspended", "pending"], default: "active" },
    verificationStatus: { type: String, enum: ["pending", "approved", "rejected"] },
    verificationDocuments: {
      businessName: { type: String },
      businessAddress: { type: String },
      phoneNumber: { type: String },
      identificationType: { type: String },
      identificationNumber: { type: String },
      bankName: { type: String },
      accountNumber: { type: String },
      accountName: { type: String },
      documents: {
        identification: { type: String },
        utilityBill: { type: String },
        bankStatement: { type: String },
        propertyDocuments: { type: String }
      },
      submittedAt: { type: Date }
    },
    verificationNote: { type: String },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastLogin: { type: Date },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    confirmationToken: { type: String },
    isConfirmed: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    businessName: { type: String },
    bankName: { type: String },
    bankAccount: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
