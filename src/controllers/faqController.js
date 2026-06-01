const { Op } = require("sequelize");
const { Faq, BlogCategory, User } = require("../models");

const faqInclude = [
  {
    model: BlogCategory,
    as: "category",
    attributes: ["id", "name", "slug"],
    required: false,
  },
  {
    model: User,
    as: "creator",
    attributes: ["id", "username", "first_name", "last_name", "email"],
    required: false,
  },
];

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, offset = 0 } = req.pagination || {};
    const { search, category_id, is_published } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { question: { [Op.like]: `%${search}%` } },
        { answer: { [Op.like]: `%${search}%` } },
      ];
    }

    if (category_id) {
      where.category_id = category_id;
    }

    if (is_published !== undefined) {
      where.is_published = is_published === "true";
    }

    const { rows, count } = await Faq.findAndCountAll({
      where,
      include: faqInclude,
      limit: Number(limit),
      offset: Number(offset),
      order: [
        ["sort_order", "ASC"],
        ["created_at", "DESC"],
      ],
    });

    return res.json({
      success: true,
      data: rows,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        total_pages: Math.ceil(count / Number(limit)),
      },
      message: "FAQs fetched successfully",
    });
  } catch (error) {
    console.error("Get FAQs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id, {
      include: faqInclude,
    });

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    return res.json({
      success: true,
      data: faq,
      message: "FAQ fetched successfully",
    });
  } catch (error) {
    console.error("Get FAQ error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ",
    });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      question,
      answer,
      category_id,
      is_published = true,
      sort_order = 0,
    } = req.body;

    const faq = await Faq.create({
      question,
      answer,
      category_id: category_id || null,
      is_published:
        is_published === true ||
        is_published === "true" ||
        is_published === 1 ||
        is_published === "1",
      sort_order: Number(sort_order) || 0,
      created_by: req.user?.id || null,
    });

    const createdFaq = await Faq.findByPk(faq.id, {
      include: faqInclude,
    });

    return res.status(201).json({
      success: true,
      data: createdFaq,
      message: "FAQ created successfully",
    });
  } catch (error) {
    console.error("Create FAQ error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create FAQ",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    const { question, answer, category_id, is_published, sort_order } = req.body;

    await faq.update({
      question,
      answer,
      category_id: category_id || null,
      is_published:
        is_published === true ||
        is_published === "true" ||
        is_published === 1 ||
        is_published === "1",
      sort_order: Number(sort_order) || 0,
    });

    const updatedFaq = await Faq.findByPk(faq.id, {
      include: faqInclude,
    });

    return res.json({
      success: true,
      data: updatedFaq,
      message: "FAQ updated successfully",
    });
  } catch (error) {
    console.error("Update FAQ error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update FAQ",
    });
  }
};

exports.partialUpdate = async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    const allowedFields = [
      "question",
      "answer",
      "category_id",
      "is_published",
      "sort_order",
    ];

    const data = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    });

    if (data.category_id === "") {
      data.category_id = null;
    }

    if (data.is_published !== undefined) {
      data.is_published =
        data.is_published === true ||
        data.is_published === "true" ||
        data.is_published === 1 ||
        data.is_published === "1";
    }

    if (data.sort_order !== undefined) {
      data.sort_order = Number(data.sort_order) || 0;
    }

    await faq.update(data);

    const updatedFaq = await Faq.findByPk(faq.id, {
      include: faqInclude,
    });

    return res.json({
      success: true,
      data: updatedFaq,
      message: "FAQ updated successfully",
    });
  } catch (error) {
    console.error("Partial update FAQ error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update FAQ",
    });
  }
};

exports.updatePublishStatus = async (req, res) => {
  try {
    const { is_published } = req.body;

    const faq = await Faq.findByPk(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    await faq.update({
      is_published:
        is_published === true ||
        is_published === "true" ||
        is_published === 1 ||
        is_published === "1",
    });

    return res.json({
      success: true,
      data: faq,
      message: faq.is_published
        ? "FAQ published successfully"
        : "FAQ unpublished successfully",
    });
  } catch (error) {
    console.error("Update FAQ publish status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update FAQ publish status",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const faq = await Faq.findByPk(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    await faq.destroy();

    return res.json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error("Delete FAQ error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete FAQ",
    });
  }
};