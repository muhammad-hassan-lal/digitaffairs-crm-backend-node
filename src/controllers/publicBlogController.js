const { Op } = require("sequelize");
const { Blog, BlogCategory, BlogComment, User } = require("../models");

const publicBlogInclude = [
  {
    model: BlogCategory,
    as: "category",
    attributes: ["id", "name", "slug"],
    required: false,
  },
  {
    model: User,
    as: "author",
    attributes: ["id", "username", "first_name", "last_name"],
    required: false,
  },
];

exports.getPublishedBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { search, category, featured } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const where = {
      status: "published",
    };

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { short_description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (featured !== undefined) {
      where.is_featured = featured === "true";
    }

    const include = [...publicBlogInclude];

    if (category) {
      include[0] = {
        ...include[0],
        where: {
          slug: category,
        },
        required: true,
      };
    }

    const { rows, count } = await Blog.findAndCountAll({
      where,
      include,
      attributes: [
        "id",
        "title",
        "slug",
        "short_description",
        "featured_image",
        "is_featured",
        "views",
        "published_at",
        "created_at",
      ],
      limit: limitNum,
      offset,
      order: [["published_at", "DESC"]],
    });

    return res.json({
      success: true,
      data: rows,
      meta: {
        page: pageNum,
        limit: limitNum,
        total: count,
        total_pages: Math.ceil(count / limitNum),
      },
      message: "Published blogs fetched successfully",
    });
  } catch (error) {
    console.error("Get public blogs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
    });
  }
};

exports.getPublishedBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      where: {
        slug: req.params.slug,
        status: "published",
      },
      include: [
        ...publicBlogInclude,
        {
          model: BlogComment,
          as: "comments",
          where: {
            status: "approved",
          },
          required: false,
          attributes: ["id", "name", "website", "comment", "created_at"],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    await blog.increment("views");

    return res.json({
      success: true,
      data: blog,
      message: "Blog fetched successfully",
    });
  } catch (error) {
    console.error("Get public blog error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
    });
  }
};

exports.getPublicCategories = async (_req, res) => {
  try {
    const categories = await BlogCategory.findAll({
      where: {
        is_active: true,
      },
      attributes: ["id", "name", "slug", "description"],
      order: [["name", "ASC"]],
    });

    return res.json({
      success: true,
      data: categories,
      message: "Blog categories fetched successfully",
    });
  } catch (error) {
    console.error("Get public blog categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog categories",
    });
  }
};