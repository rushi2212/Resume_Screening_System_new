const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const Candidate = require("../models/Candidate");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  try {
    await Candidate.collection.dropIndex("email_1");
    console.log("Dropped old email_1 unique index");
  } catch (error) {
    if (error.codeName !== "IndexNotFound") {
      throw error;
    }

    console.log("Old email_1 index not found");
  }

  await Candidate.collection.createIndex(
    { email: 1, job: 1 },
    { unique: true }
  );

  console.log("Created email + job unique index");
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
