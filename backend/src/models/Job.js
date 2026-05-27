const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    requiredSkills: [
      {
        type: String,
      },
    ],

    minimumExperience: {
      type: Number,
      default: 0,
    },

    preferredEducation: [
      {
        type: String,
      },
    ],

    preferredDomains: [
      {
        type: String,
      },
    ],

    responsibilities: [
      {
        type: String,
      },
    ],

    rawJDText: {
      type: String,
    },

    jdEmbedding: {
      type: [Number],
      default: [],
    },

    uploadedJDFile: {
      type: String,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Job",
  jobSchema
);
