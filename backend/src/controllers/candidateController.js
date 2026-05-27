const Candidate = require("../models/Candidate");

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

const getCandidates = async (req, res) => {

  try {

    const candidates =
      await Candidate.find().select(
        "-resumeEmbedding"
      ).sort({
        matchScore: -1,
      });

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
  getCandidates,
};