const Candidate = require("../models/Candidate");

const ensureCandidateIndexes = async () => {
  try {
    await Candidate.collection.dropIndex("email_1");
    console.log("Dropped old Candidate email_1 unique index");
  } catch (error) {
    if (error.codeName !== "IndexNotFound") {
      console.log(
        "Could not drop Candidate email_1 index:",
        error.message
      );
    }
  }

  await Candidate.collection.createIndex(
    { email: 1, job: 1 },
    { unique: true }
  );
};

module.exports = {
  ensureCandidateIndexes,
};
