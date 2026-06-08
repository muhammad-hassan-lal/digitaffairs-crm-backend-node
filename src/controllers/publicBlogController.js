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

exports.getRelatedBlogsByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const limitNum = Math.min(Number(req.query.limit) || 5, 20);

    const selectedBlogs = [];
    const selectedIds = new Set();

    const addUniqueBlogs = (blogs) => {
      blogs.forEach((blog) => {
        if (selectedBlogs.length < limitNum && !selectedIds.has(blog.id)) {
          selectedBlogs.push(blog);
          selectedIds.add(blog.id);
        }
      });
    };

    const category = await BlogCategory.findOne({
      where: {
        slug: categorySlug,
        is_active: true,
      },
      attributes: ["id", "name", "slug", "description"],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    /**
     * 1. First priority:
     * Get blogs from same category.
     */
    const categoryBlogs = await Blog.findAll({
      where: {
        status: "published",
        category_id: category.id,
      },
      include: publicBlogInclude,
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
      order: [
        ["is_featured", "DESC"],
        ["published_at", "DESC"],
      ],
    });

    addUniqueBlogs(categoryBlogs);

    /**
     * 2. Second priority:
     * If category blogs are less than limit,
     * find relevant blogs using category name/slug keywords.
     */
    if (selectedBlogs.length < limitNum) {
      const remainingLimit = limitNum - selectedBlogs.length;

      const categoryWords = [
        category.name,
        category.slug.replace(/-/g, " "),
        ...category.slug.split("-"),
      ]
        .filter(Boolean)
        .map((word) => word.trim())
        .filter((word) => word.length > 2);

      const relevanceConditions = categoryWords.flatMap((word) => [
        { title: { [Op.like]: `%${word}%` } },
        { short_description: { [Op.like]: `%${word}%` } },
      ]);

      if (relevanceConditions.length > 0) {
        const relevantBlogs = await Blog.findAll({
          where: {
            status: "published",
            id: {
              [Op.notIn]: Array.from(selectedIds),
            },
            [Op.or]: relevanceConditions,
          },
          include: publicBlogInclude,
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
          limit: remainingLimit,
          order: [
            ["is_featured", "DESC"],
            ["views", "DESC"],
            ["published_at", "DESC"],
          ],
        });

        addUniqueBlogs(relevantBlogs);
      }
    }

    /**
     * 3. Third priority:
     * If still less than limit,
     * add any latest published blogs.
     */
    if (selectedBlogs.length < limitNum) {
      const remainingLimit = limitNum - selectedBlogs.length;

      const fallbackBlogs = await Blog.findAll({
        where: {
          status: "published",
          id: {
            [Op.notIn]: Array.from(selectedIds),
          },
        },
        include: publicBlogInclude,
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
        limit: remainingLimit,
        order: [
          ["is_featured", "DESC"],
          ["published_at", "DESC"],
        ],
      });

      addUniqueBlogs(fallbackBlogs);
    }

    return res.json({
      success: true,
      data: selectedBlogs,
      meta: {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
        limit: limitNum,
        total: selectedBlogs.length,
      },
      message: "Related category blogs fetched successfully",
    });
  } catch (error) {
    console.error("Get related category blogs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch related category blogs",
    });
  }
};