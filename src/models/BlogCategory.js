const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const BlogCategory = sequelize.define(
  "blog_categories",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "blog_categories",
  }
);

BlogCategory.associate = (models) => {
  BlogCategory.hasMany(models.Blog, {
    foreignKey: "category_id",
    as: "blogs",
  });
};

module.exports = BlogCategory;