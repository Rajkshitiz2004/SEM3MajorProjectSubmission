
const prisma = require("../config/prisma");

const {
  translateToHindi
} = require("../services/ai.service");

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

module.exports = { translate, getHistory };
