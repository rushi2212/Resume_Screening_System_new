const fs = require("fs");

const {
  extractTextFromPDF,
} = require(
  "../services/pdfService"
);

const mammoth = require("mammoth");

const Job =
  require("../models/Job");

const {
  resolveJobTitle,
} = require("../utils/jobTitleHelper");

const {
  callAIService,
} = require("../services/aiService");

const {
  parseJDLocally,
  mergeParsedJD,
} = require("../utils/jdParser");

const uploadJD = async (
  req,
  res
) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        success: false,
        message:
          "No JD file uploaded",
      });
    }

    const filePath = req.file.path;

    let extractedText = "";

    // PDF
    if (
      req.file.mimetype ===
      "application/pdf"
    ) {

            extractedText =
        await extractTextFromPDF(
            filePath
        );
    }

    // DOCX
    else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {

      const result =
        await mammoth.extractRawText({
          path: filePath,
        });

      extractedText = result.value;
    }

    if (!extractedText.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Could not extract text from the JD file. Please upload a text-based PDF or DOCX.",
      });
    }

    const embeddingResponse =
      await callAIService(
        "/embeddings",
        {
          text: extractedText,
        }
      );

    const localParsedJD =
      parseJDLocally(extractedText);

    let aiParsedJD = {};

    try {
      aiParsedJD = await callAIService(
        "/parse-jd",
        {
          jd_text:
            extractedText,
        }
      );
    } catch (error) {
      console.log(
        "AI JD parsing failed, using local parser:",
        error.message
      );
    }

    const parsedJD = mergeParsedJD(
      aiParsedJD,
      localParsedJD
    );

    const resolvedTitle =
      resolveJobTitle(
        req.body.title,
        extractedText
      );

    // Create Job
    const job =
      await Job.create({

        title:
          resolvedTitle,

        requiredSkills:
          parsedJD.required_skills,

        minimumExperience:
          parsedJD.minimum_experience,

        preferredEducation:
          parsedJD.preferred_education,

        preferredDomains:
          parsedJD.preferred_domains,

        responsibilities:
          parsedJD.responsibilities,

        rawJDText:
          extractedText,

        jdEmbedding:
          embeddingResponse.embedding || [],

        uploadedJDFile:
          req.file.filename,
      });

    res.status(201).json({

      success: true,

      job,
    });

  } catch (error) {

    console.log(error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

const getJobs =
  async (req, res) => {

    try {

      const jobs =
        await Job.find({}).select(
          "-jdEmbedding"
        ).sort({
          createdAt: -1,
        });

      const displayJobs =
        jobs.map((job) => {
          const plainJob =
            job.toObject();

          return {
            ...plainJob,
            title: resolveJobTitle(
              plainJob.title,
              plainJob.rawJDText
            ),
          };
        });

      res.status(200).json({
        success: true,
        jobs: displayJobs,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = {
  uploadJD,
  getJobs,
};
