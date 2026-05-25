const axios = require("axios");

const AI_SERVICE_URL = "https://resume-screening-system-ai-service-t38l.onrender.com";
const callAIService = async (path, payload) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}${path}`,
      payload,
      { timeout: 30000 }
    );

    return response.data;
  } catch (error) {
    const serviceError = new Error(
      `AI service unavailable. Set AI_SERVICE_URL to your deployed AI service URL. Tried: ${AI_SERVICE_URL}${path}`
    );

    serviceError.statusCode = 503;
    serviceError.cause = error;

    throw serviceError;
  }
};

module.exports = {
  callAIService,
};
