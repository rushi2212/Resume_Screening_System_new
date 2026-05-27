const Candidate =
  require("../models/Candidate");

const Job =
  require("../models/Job");

const {
  normalizeSkills,
  getMissingSkills,
} = require("../utils/skillNormalizer");

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

      const normalizedJobSkills = normalizeSkills(
        job.requiredSkills || []
      );

      for (const candidate of candidates) {

        const jobData = {
          requiredSkills:
            normalizedJobSkills,

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

                domains:
                  candidate.domains || [],

                resume_text:
                  candidate.resumeText || "",

              },

              job_data: {
                required_skills:
                  jobData.requiredSkills,

                minimum_experience:
                  jobData.minimumExperience,

                preferred_education:
                  jobData.preferredEducation,

                preferred_domains:
                  job.preferredDomains || [],

                jd_text:
                  job.rawJDText || "",
              },

              candidate_embedding:
                candidate.resumeEmbedding || [],

              job_embedding:
                job.jdEmbedding || [],

              candidate_text:
                candidate.resumeText || "",

              job_text:
                job.rawJDText || "",
            }
          );

        rankedCandidates.push({

          candidate: (() => {
            const plainCandidate =
              candidate.toObject();

            plainCandidate.skills = normalizeSkills(
              plainCandidate.skills || []
            );

            plainCandidate.requiredSkills = normalizedJobSkills;

            plainCandidate.normalizedSkills = normalizeSkills(
              plainCandidate.normalizedSkills || plainCandidate.skills || []
            );

            plainCandidate.expandedSkills = normalizeSkills(
              plainCandidate.expandedSkills || []
            );

            plainCandidate.missingSkills = getMissingSkills(
              plainCandidate.skills,
              normalizedJobSkills
            );

            delete plainCandidate.resumeEmbedding;

            return plainCandidate;
          })(),

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
        job: (() => {
          const plainJob = job.toObject();

          delete plainJob.jdEmbedding;

          return plainJob;
        })(),
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
