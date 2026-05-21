const { Blog, BlogComment } = require("../models");

exports.getAllByBlog = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {
      blog_id: req.params.blogId,
    };

    if (status) {
      where.status = status;
    }

    const comments = await BlogComment.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    return res.json({
      success: true,
      data: comments,
      message: "Comments fetched successfully",
    });
  } catch (error) {
    console.error("Get blog comments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

exports.createPublic = async (req, res) => {
  try {
    const { blog_id, name, email, website, comment } = req.body;

    const blog = await Blog.findOne({
      where: {
        id: blog_id,
        status: "published",
      },
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const newComment = await BlogComment.create({
      blog_id,
      name,
      email,
      website: website || null,
      comment,
      status: "pending",
      ip_address: req.ip || null,
      user_agent: req.headers["user-agent"] || null,
    });

    return res.status(201).json({
      success: true,
      data: newComment,
      message: "Comment submitted successfully. It will appear after approval.",
    });
  } catch (error) {
    console.error("Create blog comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit comment",
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["pending", "approved", "rejected", "spam"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment status",
      });
    }

    const comment = await BlogComment.findByPk(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    await comment.update({ status });

    return res.json({
      success: true,
      data: comment,
      message: "Comment status updated successfully",
    });
  } catch (error) {
    console.error("Update comment status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update comment status",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const comment = await BlogComment.findByPk(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    await comment.destroy();

    return res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
};