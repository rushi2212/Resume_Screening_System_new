const fs = require("fs");

const {
  extractTextFromPDF,
} = require(
  "../services/pdfService"
);

const mammoth = require("mammoth");

const Candidate =
  require("../models/Candidate");

const Job =
  require("../models/Job");

const {
  checkDuplicateCandidate,
} = require("../services/duplicateService");

const {
  resolveJobTitle,
} = require("../utils/jobTitleHelper");

const {
  callAIService,
} = require("../services/aiService");

const uploadResume = async (req, res) => {

  try {

    const { jobId } = req.body;

    if (!req.file) {

      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // Get Selected Job
    const selectedJob =
      await Job.findById(jobId);

    if (!selectedJob) {

      return res.status(404).json({
        success: false,
        message: "Selected job not found",
      });
    }

    const selectedJobData = {
      requiredSkills:
        selectedJob.requiredSkills || [],

      minimumExperience:
        selectedJob.minimumExperience || 0,

      preferredEducation:
        selectedJob.preferredEducation || [],

      title:
        resolveJobTitle(
          selectedJob.title,
          selectedJob.rawJDText
        ),
    };

    const filePath = req.file.path;

    let extractedText = "";

    // PDF Parsing
    if (
      req.file.mimetype ===
      "application/pdf"
    ) {
        extractedText =
          await extractTextFromPDF(
            filePath
          );
    }

    // DOCX Parsing
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

    // Parse Resume Using AI Service
    const parsedData =
      await callAIService(
        "/parse-resume",
        {
          resume_text: extractedText,
        }
      );

    // Duplicate Check
    const existingCandidate =
      await checkDuplicateCandidate(
        parsedData.email
      );

    if (existingCandidate) {

      return res.status(400).json({
        success: false,
        message:
          "Candidate already exists",
      });
    }

    // Multi-parameter AI Matching
    const matchData =
      await callAIService(
        "/advanced-match",
        {
          candidate_data: {
            name:
              parsedData.name,

            skills:
              parsedData.skills,

            experience:
              parsedData.experience,

            projects:
              parsedData.projects,

            education:
              parsedData.education,

          },

          job_data: {
            required_skills:
              selectedJobData.requiredSkills,

            minimum_experience:
              selectedJobData.minimumExperience,

            preferred_education:
              selectedJobData.preferredEducation,
          },
        }
      );

    // Save Candidate
    const candidate =
      await Candidate.create({

        // Basic Info
        name: parsedData.name,

        email: parsedData.email,

        phone: parsedData.phone,

        // Selected Job Info
        jobTitle:
          selectedJobData.title,

        requiredSkills:
          selectedJobData.requiredSkills,

        // Candidate Skills
        skills:
          parsedData.skills,

        normalizedSkills:
          matchData.normalized_skills,

        expandedSkills:
          matchData.expanded_skills,

        missingSkills:
          matchData.missingSkills ||
          matchData.missing_skills,

        projects:
          parsedData.projects,

        // Resume Data
        experience:
          parsedData.experience,

        education:
          parsedData.education,

        jobTitles:
          parsedData.job_titles,

        resumeText:
          extractedText,

        // AI Match Data
        matchScore:
          matchData.finalScore ||
          matchData.match_score,

        skillsScore:
          matchData.skillsScore ||
          matchData.skills_score,

        experienceScore:
          matchData.experienceScore ||
          matchData.experience_score,

        projectScore:
          matchData.projectScore ||
          matchData.project_score,

        educationScore:
          matchData.educationScore ||
          matchData.education_score,

        explanation:
          matchData.aiExplanation ||
          matchData.explanation,

        experienceAnalysis:
          matchData.experienceAnalysis,

        projectAnalysis:
          matchData.projectAnalysis,

        educationAnalysis:
          matchData.educationAnalysis,

        uploadedFile:
          req.file.filename,
      });

    res.status(201).json({

      success: true,

      candidate,
    });

  } catch (error) {

    console.log(error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadResume,
};
