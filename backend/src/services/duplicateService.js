const Candidate = require("../models/Candidate");

const checkDuplicateCandidate = async (
  email,
  jobId
) => {

  const existingCandidate =
    await Candidate.findOne({
      email:
        email?.toLowerCase().trim(),
      job: jobId,
    });

  return existingCandidate;
};

module.exports = {
  checkDuplicateCandidate,
};
