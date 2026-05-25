const SKILL_KEYWORDS = [
  "javascript",
  "typescript",
  "react",
  "redux",
  "node.js",
  "node",
  "express",
  "mongodb",
  "mongoose",
  "mysql",
  "postgresql",
  "sql",
  "html",
  "css",
  "tailwind",
  "bootstrap",
  "python",
  "java",
  "spring boot",
  "c++",
  "c#",
  "php",
  "laravel",
  "django",
  "flask",
  "fastapi",
  "aws",
  "azure",
  "docker",
  "kubernetes",
  "git",
  "github",
  "rest api",
  "graphql",
  "machine learning",
  "deep learning",
  "nlp",
  "pandas",
  "numpy",
  "power bi",
  "excel",
  "tableau",
  "figma",
  "ui/ux",
  "testing",
  "selenium",
];

const EDUCATION_KEYWORDS = [
  "b.tech",
  "b.e",
  "bachelor",
  "degree",
  "m.tech",
  "m.e",
  "master",
  "computer science",
  "engineering",
  "mba",
  "bca",
  "mca",
];

const LABELS = {
  "node.js": "Node.js",
  node: "Node.js",
  mongodb: "MongoDB",
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  javascript: "JavaScript",
  typescript: "TypeScript",
  html: "HTML",
  css: "CSS",
  "rest api": "REST API",
  graphql: "GraphQL",
  "ui/ux": "UI/UX",
  sql: "SQL",
  aws: "AWS",
  c: "C",
  "c++": "C++",
  "c#": "C#",
  "spring boot": "Spring Boot",
  fastapi: "FastAPI",
  "power bi": "Power BI",
  bca: "BCA",
  mca: "MCA",
  "b.tech": "B.Tech",
  "b.e": "B.E",
  "m.tech": "M.Tech",
  "m.e": "M.E",
  mba: "MBA",
};

const toTitleCase = (value) =>
  value
    .split(" ")
    .map((word) =>
      word.charAt(0).toUpperCase() +
      word.slice(1)
    )
    .join(" ");

const normalizeLabel = (value) => {
  const key = value.toLowerCase();

  return LABELS[key] || toTitleCase(key);
};

const unique = (items) =>
  [
    ...new Map(
      items
        .filter(Boolean)
        .map((item) => [
          item.toLowerCase(),
          item,
        ])
    ).values(),
  ];

const parseMinimumExperience = (text) => {
  const match = text.match(
    /(\d+)\s*(?:\+|plus)?\s*(?:-|to)?\s*(?:\d+)?\s*(?:years?|yrs?)/i
  );

  return match ? Number(match[1]) : 0;
};

const parseResponsibilities = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^[-*\u2022\d.)\s]+/, "")
        .trim()
    )
    .filter((line) => line.length > 20);

  return lines.slice(0, 8);
};

const parseJDLocally = (rawText = "") => {
  const text = String(rawText);
  const lowerText = text.toLowerCase();

  const requiredSkills = unique(
    SKILL_KEYWORDS
      .filter((skill) =>
        lowerText.includes(skill)
      )
      .map(normalizeLabel)
  );

  const preferredEducation = unique(
    EDUCATION_KEYWORDS.filter((keyword) =>
      lowerText.includes(keyword)
    ).map(normalizeLabel)
  );

  return {
    required_skills: requiredSkills,
    minimum_experience:
      parseMinimumExperience(text),
    preferred_education:
      preferredEducation,
    responsibilities:
      parseResponsibilities(text),
  };
};

const hasItems = (value) =>
  Array.isArray(value) && value.length > 0;

const mergeParsedJD = (
  aiParsedJD = {},
  localParsedJD = {}
) => ({
  required_skills: hasItems(
    aiParsedJD.required_skills
  )
    ? aiParsedJD.required_skills
    : localParsedJD.required_skills || [],

  minimum_experience:
    Number(
      aiParsedJD.minimum_experience
    ) ||
    localParsedJD.minimum_experience ||
    0,

  preferred_education: hasItems(
    aiParsedJD.preferred_education
  )
    ? aiParsedJD.preferred_education
    : localParsedJD.preferred_education || [],

  responsibilities: hasItems(
    aiParsedJD.responsibilities
  )
    ? aiParsedJD.responsibilities
    : localParsedJD.responsibilities || [],
});

module.exports = {
  parseJDLocally,
  mergeParsedJD,
};
