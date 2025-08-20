import mongoose from "mongoose";
import Revenue from "../models/Revenue.js";

// Admin-only
export const getTotalRevenue = async (req, res) => {
  try {
    const total = await Revenue.aggregate([
      { $group: { _id: null, total: { $sum: "$platformFee" } } },
    ]);
    res.json({ totalRevenue: total[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getRevenueByLandlord = async (req, res) => {
  try {
    const { landlordId } = req.params;

    const earnings = await Revenue.aggregate([
      { $match: { landlord: new mongoose.Types.ObjectId(landlordId) } },
      { $group: { _id: "$landlord", totalEarnings: { $sum: "$landlordEarning" } } },
    ]);

    res.json({ landlordId, totalEarnings: earnings[0]?.totalEarnings || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getRevenueByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const revenues = await Revenue.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
    res.json(revenues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Landlord-only
export const getMyRevenue = async (req, res) => {
  try {
    if (req.user.role !== "landlord") {
      return res.status(403).json({ message: "Access denied. Landlords only." });
    }

    const landlordId = req.user._id;

    //payment recieved history
    const history = await Revenue.find({ landlord: landlordId }).populate("payment");

    //Calculate total earnings
    const earnings = await Revenue.aggregate([
      { $match: { landlord: landlordId } },
      { $group: { _id: "$landlord", totalEarnings: { $sum: "$landlordEarning" } } },
    ]);

    res.json({
      landlordId,
      totalEarnings: earnings[0]?.totalEarnings || 0,
      history, // list of all revenue records
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


