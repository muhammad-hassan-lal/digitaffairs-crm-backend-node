const { Op } = require("sequelize");
const { Faq, BlogCategory } = require("../models");

exports.getPublishedFaqs = async (req, res) => {
  try {
    const { category, category_id, search } = req.query;

    const where = {
      is_published: true,
    };

    if (category_id) {
      where.category_id = category_id;
    }

    if (search) {
      where[Op.or] = [
        { question: { [Op.like]: `%${search}%` } },
        { answer: { [Op.like]: `%${search}%` } },
      ];
    }

    const include = [
      {
        model: BlogCategory,
        as: "category",
        attributes: ["id", "name", "slug"],
        required: false,
      },
    ];

    if (category) {
      include[0] = {
        ...include[0],
        where: {
          slug: category,
        },
        required: true,
      };
    }

    const faqs = await Faq.findAll({
      where,
      include,
      attributes: [
        "id",
        "question",
        "answer",
        "category_id",
        "sort_order",
        "created_at",
      ],
      order: [
        ["sort_order", "ASC"],
        ["created_at", "DESC"],
      ],
    });

    return res.json({
      success: true,
      data: faqs,
      message: "Published FAQs fetched successfully",
    });
  } catch (error) {
    console.error("Get public FAQs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
    });
  }
};

exports.getPublishedFaqsByCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const faqs = await Faq.findAll({
      where: {
        is_published: true,
      },
      include: [
        {
          model: BlogCategory,
          as: "category",
          attributes: ["id", "name", "slug"],
          where: {
            slug,
          },
          required: true,
        },
      ],
      attributes: [
        "id",
        "question",
        "answer",
        "category_id",
        "sort_order",
        "created_at",
      ],
      order: [
        ["sort_order", "ASC"],
        ["created_at", "DESC"],
      ],
    });

    return res.json({
      success: true,
      data: faqs,
      message: "Published FAQs fetched successfully",
    });
  } catch (error) {
    console.error("Get public FAQs by category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
    });
  }
};