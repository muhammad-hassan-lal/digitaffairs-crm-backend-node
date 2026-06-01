const slugify = require("slugify");
const { Op } = require("sequelize");
const { BlogCategory } = require("../models");

const createSlug = (name) => {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
};

exports.getAll = async (req, res) => {
  try {
    const { search, is_active } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (is_active !== undefined) {
      where.is_active = is_active === "true";
    }

    const categories = await BlogCategory.findAll({
      where,
      order: [["name", "ASC"]],
    });

    return res.json({
      success: true,
      data: categories,
      message: "Blog categories fetched successfully",
    });
  } catch (error) {
    console.error("Get blog categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog categories",
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const category = await BlogCategory.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Blog category not found",
      });
    }

    return res.json({
      success: true,
      data: category,
      message: "Blog category fetched successfully",
    });
  } catch (error) {
    console.error("Get blog category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog category",
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, is_active = true } = req.body;

    const slug = createSlug(name);

    const exists = await BlogCategory.findOne({
      where: {
        [Op.or]: [{ name }, { slug }],
      },
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await BlogCategory.create({
      name,
      slug,
      description: description || null,
      is_active,
    });

    return res.status(201).json({
      success: true,
      data: category,
      message: "Blog category created successfully",
    });
  } catch (error) {
    console.error("Create blog category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create blog category",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const category = await BlogCategory.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Blog category not found",
      });
    }

    const { name, description, is_active } = req.body;

    const slug = name ? createSlug(name) : category.slug;

    const duplicate = await BlogCategory.findOne({
      where: {
        id: { [Op.ne]: category.id },
        [Op.or]: [{ name }, { slug }],
      },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Another category with this name already exists",
      });
    }

    await category.update({
      name,
      slug,
      description: description || null,
      is_active: is_active !== undefined ? is_active : category.is_active,
    });

    return res.json({
      success: true,
      data: category,
      message: "Blog category updated successfully",
    });
  } catch (error) {
    console.error("Update blog category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update blog category",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { BlogCategory, Blog, Faq } = require("../models");

    const category = await BlogCategory.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const publishedBlogsCount = await Blog.count({
      where: {
        category_id: category.id,
        status: "published",
      },
    });

    const publishedFaqsCount = await Faq.count({
      where: {
        category_id: category.id,
        is_published: true,
      },
    });

    if (publishedBlogsCount > 0 || publishedFaqsCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This category is linked with published blogs or FAQs. Please unpublish them first before deleting this category.",
        data: {
          published_blogs: publishedBlogsCount,
          published_faqs: publishedFaqsCount,
        },
      });
    }

    await category.destroy();

    return res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};