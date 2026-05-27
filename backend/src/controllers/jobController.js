const Job = require("../models/Job");

const {
  normalizeSkills,
} = require("../utils/skillNormalizer");

const createJob = async (req, res) => {

  try {

    const {
      title,
      requiredSkills,
      minimumExperience,
      preferredEducation,
    } = req.body;

    const job =
      await Job.create({

        title,

        requiredSkills: normalizeSkills(
          requiredSkills || []
        ),

        minimumExperience,

        preferredEducation,
      });

    res.status(201).json({
      success: true,
      job,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getJobs = async (req, res) => {

  try {

    const jobs = await Job.find().select(
      "-jdEmbedding"
    );

    res.status(200).json({
      success: true,
      jobs,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createJob,
  getJobs,
};