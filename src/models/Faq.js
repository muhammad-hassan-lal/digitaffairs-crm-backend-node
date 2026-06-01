const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Faq = sequelize.define(
  "faqs",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    question: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    created_by: {
      type: DataTypes.INTEGER,
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
    tableName: "faqs",
  }
);

Faq.associate = (models) => {
  Faq.belongsTo(models.BlogCategory, {
    foreignKey: "category_id",
    as: "category",
  });

  Faq.belongsTo(models.User, {
    foreignKey: "created_by",
    as: "creator",
  });
};

module.exports = Faq;