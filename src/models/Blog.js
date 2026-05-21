const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Blog = sequelize.define(
  "blogs",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING(280),
      allowNull: false,
      unique: true,
    },

    short_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    long_description: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },

    featured_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    author_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("draft", "published", "archived"),
      allowNull: false,
      defaultValue: "draft",
    },

    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    meta_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    meta_keywords: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "blogs",
  }
);

Blog.associate = (models) => {
  Blog.belongsTo(models.BlogCategory, {
    foreignKey: "category_id",
    as: "category",
  });

  Blog.belongsTo(models.User, {
    foreignKey: "author_id",
    as: "author",
  });

  Blog.hasMany(models.BlogComment, {
    foreignKey: "blog_id",
    as: "comments",
  });
};

module.exports = Blog;