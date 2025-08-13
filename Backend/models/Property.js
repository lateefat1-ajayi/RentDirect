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
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    size: { type: Number }, // in sq ft or m²
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "rented", "under_maintenance"],
      default: "available",
    },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);

export default Property;
