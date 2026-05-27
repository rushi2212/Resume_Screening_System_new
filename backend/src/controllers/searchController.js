const Candidate =
  require("../models/Candidate");

const {
  normalizeSkills,
  getMissingSkills,
} = require("../utils/skillNormalizer");

const toPlainCandidate = (candidate) => {
  const plainCandidate = candidate.toObject();

  plainCandidate.skills = normalizeSkills(
    plainCandidate.skills || []
  );

  plainCandidate.requiredSkills = normalizeSkills(
    plainCandidate.requiredSkills || []
  );

  plainCandidate.normalizedSkills = normalizeSkills(
    plainCandidate.normalizedSkills || plainCandidate.skills || []
  );

  plainCandidate.expandedSkills = normalizeSkills(
    plainCandidate.expandedSkills || []
  );

  plainCandidate.missingSkills = getMissingSkills(
    plainCandidate.skills,
    plainCandidate.requiredSkills
  );

  return plainCandidate;
};

const searchCandidates =
  async (req, res) => {

    try {

      const {
        skill,
        minScore,
      } = req.query;

      let query = {};

      if (skill) {

        query.skills = {
          $regex: skill,
          $options: "i",
        };
      }

      if (minScore) {

        query.matchScore = {
          $gte: Number(minScore),
        };
      }

      const candidates =
        await Candidate.find(query).select(
          "-resumeEmbedding"
        );

      const normalizedCandidates = candidates.map(
        toPlainCandidate
      );

      res.status(200).json({
        success: true,
        candidates: normalizedCandidates,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = {
  searchCandidates,
};