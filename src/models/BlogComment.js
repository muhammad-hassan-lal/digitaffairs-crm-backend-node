const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const BlogComment = sequelize.define(
  "blog_comments",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    blog_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },

    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "spam"),
      allowNull: false,
      defaultValue: "pending",
    },

    ip_address: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    user_agent: {
      type: DataTypes.TEXT,
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
    tableName: "blog_comments",
  }
);

BlogComment.associate = (models) => {
  BlogComment.belongsTo(models.Blog, {
    foreignKey: "blog_id",
    as: "blog",
    onDelete: "CASCADE",
  });
};

module.exports = BlogComment;