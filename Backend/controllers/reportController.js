import Report from "../models/Report.js";

export const createReport = async (req, res) => {
  try {
    const { leaseId, targetUserId, targetRole, reporterRole, category, message } = req.body;
    const reporter = req.user._id;

    const report = await Report.create({
      leaseId: leaseId || null,
      reporter,
      reporterRole,
      targetUserId,
      targetRole,
      category,
      message,
    });

    return res.status(201).json(report);
  } catch (error) {
    console.error("createReport error:", error);
    return res.status(500).json({ message: "Failed to create report" });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate("targetUserId", "name email role")
      .sort({ createdAt: -1 });
    return res.json(reports);
  } catch (error) {
    console.error("getMyReports error:", error);
    return res.status(500).json({ message: "Failed to fetch reports" });
  }
};

export const adminListReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "name email role")
      .populate("targetUserId", "name email role")
      .sort({ createdAt: -1 });
    return res.json(reports);
  } catch (error) {
    console.error("adminListReports error:", error);
    return res.status(500).json({ message: "Failed to fetch reports" });
  }
};

export const adminUpdateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const report = await Report.findByIdAndUpdate(
      id,
      { status, adminNotes },
      { new: true }
    );
    return res.json(report);
  } catch (error) {
    console.error("adminUpdateReport error:", error);
    return res.status(500).json({ message: "Failed to update report" });
  }
};


