const SKILL_ALIASES = {
  reactjs: "react",
  "react.js": "react",
  "react js": "react",
  nodejs: "node.js",
  "node js": "node.js",
  node: "node.js",
  js: "javascript",
  mongo: "mongodb",
  tailwind: "tailwind css",
  tailwindcss: "tailwind css",
  "tailwind css": "tailwind css",
  css3: "css",
  html5: "html",
  express: "express.js",
  expressjs: "express.js",
  "express js": "express.js",
};

const normalizeSkill = (skill = "") => {
  const value = String(skill).toLowerCase().trim();

  return SKILL_ALIASES[value] || value;
};

const normalizeSkills = (skills = []) => {
  const normalized = [];
  const seen = new Set();

  for (const skill of Array.isArray(skills) ? skills : []) {
    const canonical = normalizeSkill(skill);

    if (!canonical || seen.has(canonical)) {
      continue;
    }

    seen.add(canonical);
    normalized.push(canonical);
  }

  return normalized;
};

const getMissingSkills = (candidateSkills = [], requiredSkills = []) => {
  const candidateSet = new Set(normalizeSkills(candidateSkills));

  return normalizeSkills(requiredSkills).filter(
    (skill) => !candidateSet.has(skill)
  );
};

module.exports = {
  normalizeSkill,
  normalizeSkills,
  getMissingSkills,
};