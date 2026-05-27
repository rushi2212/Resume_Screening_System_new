import { useEffect, useState }
  from "react";

import { uploadResume }
  from "../api/resumeApi";

import { getJobs }
  from "../api/jdApi";

import CandidateCard
  from "./CandidateCard";

import Popup
  from "./Popup";

function ResumeUploader() {

  const [file, setFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [jobs, setJobs] =
    useState([]);

  const [selectedJob, setSelectedJob] =
    useState("");

  const [result, setResult] =
    useState(null);

  const [popup, setPopup] =
    useState(null);

  useEffect(() => {

    getJobs()
      .then((data) => {
        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      })
      .catch((error) => {
        console.log(error);
      });

  }, []);

  const handleUpload =
    async () => {

      if (!selectedJob) {
        setPopup({
          type: "error",
          message:
            "Please select a job profile before analyzing the resume.",
        });
        return;
      }

      if (!file) {
        setPopup({
          type: "error",
          message:
            "Please upload a resume file before starting analysis.",
        });
        return;
      }

      try {

        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "resume",
          file
        );

        formData.append(
          "jobId",
          selectedJob
        );

        const data =
          await uploadResume(
            formData
          );

        setResult(data);

        setPopup({
          type: "success",
          message:
            "Resume analyzed successfully.",
        });

      } catch (error) {

        console.log(error);

        setPopup({
          type: "error",
          message:
            error.response?.data?.message ||
            "Resume analysis failed. Please try again.",
        });

      } finally {

        setLoading(false);
      }
    };

  return (

    <div
      className="
      bg-white
      shadow-xl
      rounded-2xl
      p-6
      mb-8
    "
    >
      <Popup
        message={popup?.message}
        type={popup?.type}
        onClose={() =>
          setPopup(null)
        }
      />

      <h2
        className="
        text-2xl
        font-bold
        mb-4
      "
      >
        Upload Resume
      </h2>

      {/* Job Selection */}

      <select
        value={selectedJob}
        onChange={(e) =>
          setSelectedJob(
            e.target.value
          )
        }
        className="
        border
        p-3
        w-full
        mb-4
        rounded-lg
      "
      >

        <option value="">
          Select Job Profile
        </option>

        {jobs?.map((job) => (

          <option
            key={job._id}
            value={job._id}
          >
            {job.title} ({job._id?.slice(-8)})
          </option>
        ))}

      </select>

      {/* File Upload */}

      <input
        type="file"
        onChange={(e) =>
          setFile(
            e.target.files[0]
          )
        }
        className="
        mb-4
      "
      />

      {/* Upload Button */}

      <button
        onClick={handleUpload}
        className="
        bg-black
        text-white
        px-6
        py-3
        rounded-lg
      "
      >

        {loading
          ? "Analyzing Resume..."
          : "Analyze Resume"}

      </button>

      {/* Success Message */}

      {result && (

        <>
          <div
            className="
            mt-4
            text-green-700
            font-semibold
          "
          >
            Resume analyzed successfully
          </div>

          {result.candidate && (
            <div className="mt-6">
              <CandidateCard
                candidate={result.candidate}
                defaultOpen
              />
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default ResumeUploader;
