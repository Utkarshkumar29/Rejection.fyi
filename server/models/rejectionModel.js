const mongoose = require("mongoose");

const rejectionSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },
    companyName: {
      type: String,
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    anonymousId: {
      type: String,
      index: true
    },

    stage: {
      type: String,
      enum: ["resume", "oa", "technical", "hr", "final"],
      required: true
    },

    role: {
      type: String,
      required: true
    },

    yoe: {
      type: Number,
      required: true
    },

    suspectedReason: String,
    rejectionMessage: String,

    skills: [{ type: String }],
    location: String
  },
  { timestamps: true }
);

// Indexes
rejectionSchema.index({ createdAt: -1 });
rejectionSchema.index({ company: 1, createdAt: -1 });
rejectionSchema.index({ user: 1 });

const Rejection = mongoose.model("Rejection", rejectionSchema);

module.exports = Rejection;