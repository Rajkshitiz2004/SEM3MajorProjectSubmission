
async function translateToHindi(text) {
  const endpoint = process.env.TRANSLATION_API_URL;
  const apiKey = process.env.TRANSLATION_API_KEY;

  if (!endpoint || !apiKey) {
    throw new Error("Translation provider not configured");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      text,
      source_language: "en",
      target_language: "hi"
    }),
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    throw new Error(
      `Translation provider error: ${response.status}`
    );
  }

  const data = await response.json();

  if (
    typeof data.translated_text !== "string" ||
    !data.translated_text.trim()
  ) {
    throw new Error("Invalid translation response");
  }

  return data.translated_text;
}

module.exports = { translateToHindi };
