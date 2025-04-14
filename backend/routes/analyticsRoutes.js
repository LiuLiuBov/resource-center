const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const Request = require("../models/Request");
const User = require("../models/User");

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
  
      const activeRequests = await Request.countDocuments({ isActive: true });
      const deactivatedRequests = await Request.countDocuments({ isActive: false });
  
      const locationStats = await Request.aggregate([
        { $group: { _id: "$location", count: { $sum: 1 } } }
      ]);
  
      const statusStats = [
        { status: "Active", count: activeRequests },
        { status: "Deactivated", count: deactivatedRequests },
      ];
  
      res.json({
        totalUsers,
        activeRequests,
        deactivatedRequests,
        locationStats,
        statusStats,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


module.exports = router;
