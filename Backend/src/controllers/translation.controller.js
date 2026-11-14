
const prisma = require("../config/prisma");

const {
  translateToHindi
} = require("../services/ai.service");
const { governmentGlossary } = require("../services/glossary.service");

// Public translation endpoint adhering to Frontend translation contract:
// POST /api/v1/translate
// Request: { website_id, text, source_language, target_language }
// Response: { original_text, translated_text, source_language, target_language, status }
const translatePublic = async (req, res) => {
  try {
    const {
      text,
      source_language = "en",
      target_language = "hi",
      website_id = 1
    } = req.body;

    if (
      typeof text !== "string" ||
      !text.trim() ||
      text.length > 5000
    ) {
      return res.status(400).json({
        message: "Text must contain 1 to 5000 characters"
      });
    }

    const trimmed = text.trim();

    // 1. If source and target are the same, return as is
    if (source_language === target_language) {
      return res.json({
        website_id: Number(website_id) || 1,
        original_text: text,
        translated_text: text,
        source_language,
        target_language,
        status: "cached"
      });
    }

    // 2. Check government glossary first for high-speed & high-accuracy match
    let translatedText = governmentGlossary[trimmed];

    // Case-insensitive lookup check
    if (!translatedText) {
      const lower = trimmed.toLowerCase();
      for (const [enKey, hiVal] of Object.entries(governmentGlossary)) {
        if (enKey.toLowerCase() === lower) {
          translatedText = hiVal;
          break;
        }
      }
    }

    // 3. Fallback to AI translation model
    if (!translatedText) {
      translatedText = await translateToHindi(trimmed);
      // Cache dynamically generated translation in memory glossary
      governmentGlossary[trimmed] = translatedText;
    }

    return res.json({
      website_id: Number(website_id) || 1,
      original_text: text,
      translated_text: translatedText,
      source_language,
      target_language,
      status: "machine"
    });
  } catch (error) {
    console.error("Public translation error:", error);
    return res.status(502).json({
      message: "Translation service unavailable"
    });
  }
};

const translate = async (req, res) => {
  try {
    const { text, websiteId } = req.body;

    if (
      typeof text !== "string" ||
      !text.trim() ||
      text.length > 5000
    ) {
      return res.status(400).json({
        message: "Text must contain 1 to 5000 characters"
      });
    }

    if (websiteId !== undefined && websiteId !== null) {
      if (typeof websiteId !== "string") {
        return res.status(400).json({
          message: "Invalid website ID"
        });
      }

      const website = await prisma.website.findFirst({
        where: {
          id: websiteId,
          userId: req.user.userId
        }
      });

      if (!website) {
        return res.status(404).json({
          message: "Website not found"
        });
      }
    }

    const hindiText = await translateToHindi(text.trim());

    const translation = await prisma.translation.create({
      data: {
        sourceText: text.trim(),
        translatedText: hindiText,
        sourceLanguage: "en",
        targetLanguage: "hi",
        userId: req.user.userId,
        websiteId: websiteId || null,
        status: "MACHINE"
      }
    });

    return res.status(201).json({
      message: "Translation completed",
      translation
    });
  } catch (error) {
    console.error(error);

    return res.status(502).json({
      message: "Translation service unavailable"
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const translations = await prisma.translation.findMany({
      where: {
        userId: req.user.userId
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50
    });

    return res.json({ translations });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Unable to retrieve history"
    });
  }
};

module.exports = { translate, translatePublic, getHistory };