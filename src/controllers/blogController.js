const slugify = require("slugify");
const { Op } = require("sequelize");
const { Blog, BlogCategory, BlogComment, User } = require("../models");

const blogInclude = [
  {
    model: BlogCategory,
    as: "category",
    attributes: ["id", "name", "slug"],
    required: false,
  },
  {
    model: User,
    as: "author",
    attributes: ["id", "username", "first_name", "last_name", "email"],
    required: false,
  },
];

const createSlug = (title) => {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });
};

const createUniqueSlug = async (title, ignoreId = null) => {
  const baseSlug = createSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const where = { slug };

    if (ignoreId) {
      where.id = { [Op.ne]: ignoreId };
    }

    const exists = await Blog.findOne({ where });

    if (!exists) return slug;

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

const getImagePath = (file) => {
  if (!file) return null;
  return `/uploads/blogs/${file.filename}`;
};

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, offset = 0 } = req.pagination || {};
    const {
      search,
      status,
      category_id,
      is_featured,
      author_id,
      start_date,
      end_date,
    } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { short_description: { [Op.like]: `%${search}%` } },
        { long_description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) where.status = status;
    if (category_id) where.category_id = category_id;
    if (author_id) where.author_id = author_id;

    if (is_featured !== undefined) {
      where.is_featured = is_featured === "true";
    }

    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      };
    }

    const { rows, count } = await Blog.findAndCountAll({
      where,
      include: blogInclude,
      limit: Number(limit),
      offset: Number(offset),
      order: [["created_at", "DESC"]],
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
      message: "Blogs fetched successfully",
    });
  } catch (error) {
    console.error("Get blogs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id, {
      include: [
        ...blogInclude,
        {
          model: BlogComment,
          as: "comments",
          required: false,
          order: [["created_at", "DESC"]],
        },
      ],
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.json({
      success: true,
      data: blog,
      message: "Blog fetched successfully",
    });
  } catch (error) {
    console.error("Get blog error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
    });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      title,
      short_description,
      long_description,
      category_id,
      status = "draft",
      is_featured = false,
      meta_title,
      meta_description,
      meta_keywords,
    } = req.body;

    const slug = await createUniqueSlug(title);

    const featuredImage = getImagePath(req.file);

    const blog = await Blog.create({
      title,
      slug,
      short_description: short_description || null,
      long_description,
      featured_image: featuredImage,
      category_id: category_id || null,
      author_id: req.user?.id || null,
      status,
      is_featured: is_featured === true || is_featured === "true",
      meta_title: meta_title || null,
      meta_description: meta_description || null,
      meta_keywords: meta_keywords || null,
      published_at: status === "published" ? new Date() : null,
    });

    const createdBlog = await Blog.findByPk(blog.id, {
      include: blogInclude,
    });

    return res.status(201).json({
      success: true,
      data: createdBlog,
      message: "Blog created successfully",
    });
  } catch (error) {
    console.error("Create blog error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create blog",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const {
      title,
      short_description,
      long_description,
      category_id,
      status,
      is_featured,
      meta_title,
      meta_description,
      meta_keywords,
    } = req.body;

    const nextStatus = status || blog.status;

    const data = {
      title,
      short_description: short_description || null,
      long_description,
      category_id: category_id || null,
      status: nextStatus,
      is_featured:
        is_featured !== undefined
          ? is_featured === true || is_featured === "true"
          : blog.is_featured,
      meta_title: meta_title || null,
      meta_description: meta_description || null,
      meta_keywords: meta_keywords || null,
    };

    if (title && title !== blog.title) {
      data.slug = await createUniqueSlug(title, blog.id);
    }

    if (req.file) {
      data.featured_image = getImagePath(req.file);
    }

    if (blog.status !== "published" && nextStatus === "published") {
      data.published_at = new Date();
    }

    await blog.update(data);

    const updatedBlog = await Blog.findByPk(blog.id, {
      include: blogInclude,
    });

    return res.json({
      success: true,
      data: updatedBlog,
      message: "Blog updated successfully",
    });
  } catch (error) {
    console.error("Update blog error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update blog",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    await blog.destroy();

    return res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete blog error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete blog",
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["draft", "published", "archived"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog status",
      });
    }

    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const data = { status };

    if (blog.status !== "published" && status === "published") {
      data.published_at = new Date();
    }

    await blog.update(data);

    return res.json({
      success: true,
      data: blog,
      message: "Blog status updated successfully",
    });
  } catch (error) {
    console.error("Update blog status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update blog status",
    });
  }
};