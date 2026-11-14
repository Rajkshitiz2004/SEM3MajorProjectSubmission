
const prisma = require("../config/prisma");

const createWebsite = async (req, res) => {
  try {
    const { name, domain } = req.body;

    if (
      typeof name !== "string" ||
      typeof domain !== "string" ||
      !name.trim() ||
      !domain.trim()
    ) {
      return res.status(400).json({
        message: "Website name and domain required"
      });
    }

    const normalizedDomain = domain.trim().toLowerCase();

    if (
      !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(normalizedDomain) ||
      normalizedDomain.includes("..")
    ) {
      return res.status(400).json({
        message: "Invalid domain format"
      });
    }

    const website = await prisma.website.create({
      data: {
        name: name.trim(),
        domain: normalizedDomain,
        userId: req.user.userId
      }
    });

    return res.status(201).json({ website });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Domain already registered"
      });
    }

    console.error(error);
    return res.status(500).json({
      message: "Website registration failed"
    });
  }
};

const getWebsites = async (req, res) => {
  try {
    const websites = await prisma.website.findMany({
      where: {
        userId: req.user.userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json({ websites });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to retrieve websites"
    });
  }
};

module.exports = { createWebsite, getWebsites };
