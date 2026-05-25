const Candidate =
  require("../models/Candidate");

const Job =
  require("../models/Job");

const {
  callAIService,
} = require("../services/aiService");

const matchCandidatesToJob =
  async (req, res) => {

    try {

      const { jobId } = req.params;

      const job =
        await Job.findById(jobId);

      if (!job) {

        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }

      const candidates =
        await Candidate.find();

      const rankedCandidates = [];

      for (const candidate of candidates) {

        const jobData = {
          requiredSkills:
            job.requiredSkills || [],

          minimumExperience:
            job.minimumExperience || 0,

          preferredEducation:
            job.preferredEducation || [],

        };

        const matchData =
          await callAIService(
            "/advanced-match",
            {
              candidate_data: {
                name:
                  candidate.name,

                skills:
                  candidate.skills,

                experience:
                  candidate.experience,

                projects:
                  candidate.projects,

                education:
                  candidate.education,

              },

              job_data: {
                required_skills:
                  jobData.requiredSkills,

                minimum_experience:
                  jobData.minimumExperience,

                preferred_education:
                  jobData.preferredEducation,
              },
            }
          );

        rankedCandidates.push({

          candidate,

          matchData:
            matchData,
        });
      }

      rankedCandidates.sort(
        (a, b) =>
          (b.matchData.finalScore ||
            b.matchData.match_score) -
          (a.matchData.finalScore ||
            a.matchData.match_score)
      );

      res.status(200).json({
        success: true,
        job,
        rankedCandidates,
      });

    } catch (error) {

      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = {
  matchCandidatesToJob,
};
