import { useEffect, useState }
  from "react";

import { getJobs }
  from "../api/jdApi";

import JDUploader
  from "./JDUploader";

function Jobs() {

  const [jobs, setJobs] =
    useState([]);

  const [openPreviewId, setOpenPreviewId] =
    useState("");

  const loadJobs = () => {
    getJobs()
      .then((data) => {
        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {

    loadJobs();

  }, []);

  return (

    <div>

      <JDUploader
        onUploadSuccess={loadJobs}
      />

      <div
        className="
        flex
        items-center
        justify-between
        mb-6
        "
      >
        <h2
          className="
          text-2xl
          font-bold
        "
        >
          Created Jobs
        </h2>

        <span
          className="
          text-sm
          font-semibold
          text-slate-600
        "
        >
          {jobs.length} saved JD profiles
        </span>
      </div>

      {jobs?.map((job) => (

        <div
          key={job._id}
          className="
          bg-white
          shadow
          rounded-xl
          p-4
          mb-4
        "
        >

          <div
            className="
            flex
            flex-col
            md:flex-row
            md:items-start
            md:justify-between
            gap-3
            mb-4
          "
          >
            <div>
              <h3
                className="
                text-xl
                font-bold
              "
              >
                {job.title}
              </h3>

              <p
                className="
                text-sm
                text-slate-500
                mt-1
              "
              >
                JD ID: {job._id?.slice(-8)}
              </p>
            </div>

            <div
              className="
              bg-slate-100
              text-slate-700
              rounded-lg
              px-3
              py-2
              text-sm
              font-semibold
            "
            >
              Experience: {job.minimumExperience || 0} years
            </div>
          </div>

          <div
            className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
          "
          >
            <div>
              <h4 className="font-semibold mb-2">
                Required Skills
              </h4>

              <div>

                {job.requiredSkills?.length ? (
                  job.requiredSkills.map(
                    (skill, index) => (

                      <span
                        key={index}
                        className="
                        bg-blue-100
                        text-blue-700
                        px-3
                        py-1
                        rounded-full
                        mr-2
                        inline-block
                        mb-2
                      "
                      >
                        {skill}
                      </span>
                    )
                  )
                ) : (
                  <p className="text-sm text-slate-500">
                    No skills parsed
                  </p>
                )}

              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                Education Requirements
              </h4>

              <p className="text-sm text-slate-700">
                {job.preferredEducation?.length
                  ? job.preferredEducation.join(", ")
                  : "No education requirement parsed"}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                Uploaded File
              </h4>

              <p className="text-sm text-slate-700">
                {job.uploadedJDFile || "Manual job entry"}
              </p>
            </div>

          </div>

          {job.rawJDText && (
            <div
              className="
              mt-4
              border-t
              border-slate-200
              pt-4
            "
            >
              <button
                type="button"
                onClick={() =>
                  setOpenPreviewId(
                    openPreviewId === job._id
                      ? ""
                      : job._id
                  )
                }
                className="
                w-full
                flex
                items-center
                justify-between
                text-left
                bg-slate-50
                border
                border-slate-200
                rounded-lg
                px-4
                py-3
              "
              >
                <span className="font-semibold">
                  Parsed JD Text Preview
                </span>

                <span className="text-sm font-bold text-slate-500">
                  {openPreviewId === job._id
                    ? "Hide"
                    : "Show"}
                </span>
              </button>

              {openPreviewId === job._id && (
                <div
                  className="
                  mt-3
                  bg-slate-950
                  text-slate-100
                  rounded-lg
                  p-4
                  max-h-72
                  overflow-y-auto
                "
                >
                  <pre
                    className="
                    text-sm
                    leading-6
                    whitespace-pre-wrap
                    font-sans
                  "
                  >
                    {job.rawJDText}
                  </pre>
                </div>
              )}
            </div>
          )}

        </div>
      ))}

    </div>
  );
}

export default Jobs;
