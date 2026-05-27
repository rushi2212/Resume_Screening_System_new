import { useEffect, useState }
  from "react";

import {
  getCandidates,
} from "../api/candidateApi";

import CandidateCard
  from "../components/CandidateCard";

function Candidates() {

  const [candidates, setCandidates] =
    useState([]);

  useEffect(() => {

    getCandidates()
      .then((data) => {
        setCandidates(
          Array.isArray(data.candidates)
            ? data.candidates
            : []
        );
      })
      .catch((error) => {
        console.log(error);
      });

  }, []);

  return (

    <div>

      <h2
        className="
        text-2xl
        font-bold
        mb-6
      "
      >
        Ranked Candidates
      </h2>

      {candidates?.map(
        (candidate) => (

          <CandidateCard
            key={candidate._id}
            candidate={candidate}
          />
        )
      )}

    </div>
  );
}

export default Candidates;
