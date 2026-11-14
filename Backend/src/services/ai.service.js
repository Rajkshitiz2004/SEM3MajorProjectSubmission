
let translatorPromise = null;

async function getTranslator() {
  if (!translatorPromise) {
    translatorPromise = (async () => {
      const { pipeline } = await import(
        "@huggingface/transformers"
      );

      console.log("Loading AI translation model...");

      const translator = await pipeline(
        "translation",
        process.env.TRANSLATION_MODEL ||
          "Xenova/opus-mt-en-hi",
        {
          device: "cpu",
          dtype: "q8"
        }
      );

      console.log("AI translation model loaded");

      return translator;
    })().catch((error) => {
      translatorPromise = null;
      throw error;
    });
  }

  return translatorPromise;
}

async function translateToHindi(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Invalid input text");
  }

  const translator = await getTranslator();

  const result = await translator(text, {
    max_new_tokens: 512
  });

  if (!result[0]?.translation_text) {
    throw new Error("Translation failed");
  }

  return result[0].translation_text;
}

module.exports = { translateToHindi };
