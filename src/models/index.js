const sequelize = require('../config/db');

const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const UserRole = require('./UserRole');
const RolePermission = require('./RolePermission');
const Lead = require('./Lead');
const ContactSubmission = require('./ContactSubmission');
const NewsletterSubscription = require('./NewsletterSubscription');
const Blog = require("./Blog");
const BlogCategory = require("./BlogCategory");
const BlogComment = require("./BlogComment");

const models = {
  sequelize,
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Lead,
  ContactSubmission,
  NewsletterSubscription,
  Blog,
  BlogCategory,
  BlogComment,
};

Object.values(models).forEach((model) => {
  if (model && typeof model.associate === 'function') model.associate(models);
});

module.exports = models;
