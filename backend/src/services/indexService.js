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

  try {
    await Candidate.collection.dropIndex("email_1_job_1");
    console.log("Dropped old Candidate email_1_job_1 unique index");
  } catch (error) {
    if (error.codeName !== "IndexNotFound") {
      console.log(
        "Could not drop Candidate email_1_job_1 index:",
        error.message
      );
    }
  }

  await Candidate.collection.createIndex(
    { email: 1, job: 1 },
    {
      unique: true,
      partialFilterExpression: {
        job: { $type: "objectId" },
      },
    }
  );
};

module.exports = {
  ensureCandidateIndexes,
};
