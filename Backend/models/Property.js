import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
    },
    description: {
      type: String,
      required: [true, "Property description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String, default: "Nigeria" }
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    size: { type: Number }, // in sq ft or m² (optional)
    type: { type: String, default: "Apartment" }, // Property type
    amenities: [{ type: String }], // Property amenities
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "available", "rented", "rejected", "inactive"],
      default: "pending",
    },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);

export default Property;
