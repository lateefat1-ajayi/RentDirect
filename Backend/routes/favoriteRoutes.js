import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  addFavorite,
  removeFavorite,
  listFavorites,
  isFavorited,
} from "../controllers/favoriteController.js";

const router = express.Router();

router.get("/", protect, listFavorites);
router.get("/check/:propertyId", protect, isFavorited);
router.post("/:propertyId", protect, addFavorite);
router.delete("/:propertyId", protect, removeFavorite);

export default router;
