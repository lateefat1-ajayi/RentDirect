import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { isLandlord } from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty
} from "../controllers/propertyController.js";

const router = express.Router();

router.route("/")
  .post(protect, isLandlord, upload.array("images", 5), createProperty)
  .get(getProperties);

router.route("/:id")
  .get(getProperty)
  .put(protect, isLandlord, updateProperty)
  .delete(protect, isLandlord, deleteProperty);

export default router;
