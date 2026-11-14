
require("dotenv").config();

const {
  translateToHindi
} = require("./src/services/ai.service");

const testSentences = [
  "Welcome to the Ministry of Power.",
  "Government of India",
  "Apply for electricity subsidy.",
  "Check your application status.",
  "Renewable energy is important for India.",
  "Please submit your application before the deadline.",
  "The government provides financial assistance.",
  "Download your electricity bill.",
  "India is a democratic country.",
  "How are you today?"
];

async function test() {
  for (const text of testSentences) {
    try {
      const result = await translateToHindi(text);

      console.log("English:", text);
      console.log("Hindi:", result);
      console.log("-------------------------------");
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
}

test();
