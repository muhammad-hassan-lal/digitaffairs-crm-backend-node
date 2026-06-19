CREATE DATABASE IF NOT EXISTS consultation_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE consultation_crm;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS newsletter_subscriptions;
DROP TABLE IF EXISTS contact_submissions;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NULL,
  last_name VARCHAR(50) NULL,
  phone VARCHAR(30) NULL,
  profile_image VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  reset_password_code VARCHAR(255) NULL,
  reset_password_expires DATETIME NULL,
  last_login DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_role (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_role_permission (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NULL,
  phone VARCHAR(30) NULL,
  company_name VARCHAR(150) NULL,
  service VARCHAR(150) NOT NULL,
  message TEXT NULL,
  reference VARCHAR(255) NULL,
  utm_source VARCHAR(255) NULL,
  utm_medium VARCHAR(255) NULL,
  utm_campaign VARCHAR(255) NULL,
  utm_term VARCHAR(255) NULL,
  source ENUM('website','contact_form','newsletter','facebook','instagram','google','whatsapp','referral','other') NOT NULL DEFAULT 'website',
  status ENUM('new','contacted','qualified','proposal_sent','converted','closed','spam') NOT NULL DEFAULT 'new',
  priority ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  assigned_to INT NULL,
  last_contacted_at DATETIME NULL,
  next_followup_at DATETIME NULL,
  admin_note TEXT NULL,
  ip_address VARCHAR(100) NULL,
  user_agent TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_leads_status (status),
  INDEX idx_leads_source (source),
  INDEX idx_leads_service (service),
  INDEX idx_leads_reference (reference),
  INDEX idx_leads_utm_campaign (utm_campaign),
  INDEX idx_leads_assigned_to (assigned_to),
  INDEX idx_leads_created_at (created_at),
  CONSTRAINT fk_leads_assigned_user FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE contact_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NULL,
  phone VARCHAR(30) NULL,
  subject VARCHAR(200) NULL,
  message TEXT NOT NULL,
  status ENUM('new','read','replied','spam') NOT NULL DEFAULT 'new',
  ip_address VARCHAR(100) NULL,
  user_agent TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contact_status (status),
  INDEX idx_contact_created_at (created_at)
);

CREATE TABLE newsletter_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  source VARCHAR(50) NOT NULL DEFAULT 'website',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO roles (name, description) VALUES
('admin', 'Full access'),
('manager', 'Manage CRM leads and users'),
('user', 'View assigned CRM data');

INSERT INTO permissions (name, description) VALUES
('dashboard.view', 'View dashboard'),
('leads.view', 'View leads'),
('leads.create', 'Create leads'),
('leads.edit', 'Edit leads'),
('leads.delete', 'Delete leads'),
('users.view', 'View users'),
('users.create', 'Create users'),
('users.edit', 'Edit users'),
('users.delete', 'Delete users'),
('roles.view', 'View roles'),
('roles.create', 'Create roles'),
('roles.edit', 'Edit roles'),
('roles.delete', 'Delete roles'),
('permissions.view', 'View permissions'),
('permissions.assign', 'Assign permissions'),
('blogs.view', 'View blogs'),
('blogs.create', 'Create blogs'),
('blogs.edit', 'Edit blogs'),
('blogs.delete', 'Delete blogs'),
('blog_categories.view', 'View blog categories'),
('blog_categories.create', 'Create blog categories'),
('blog_categories.edit', 'Edit blog categories'),
('blog_categories.delete', 'Delete blog categories'),
('blog_comments.view', 'View blog comments'),
('blog_comments.edit', 'Edit blog comments'),
('blog_comments.delete', 'Delete blog comments');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'admin';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.name = 'manager'
AND p.name IN ('dashboard.view','leads.view','leads.create','leads.edit','users.view');


CREATE TABLE blog_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,

  title VARCHAR(255) NOT NULL,
  slug VARCHAR(280) NOT NULL UNIQUE,

  short_description TEXT DEFAULT NULL,
  long_description LONGTEXT NOT NULL,

  featured_image VARCHAR(255) DEFAULT NULL,

  category_id INT DEFAULT NULL,
  author_id INT DEFAULT NULL,

  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',

  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  views INT NOT NULL DEFAULT 0,

  meta_title VARCHAR(255) DEFAULT NULL,
  meta_description TEXT DEFAULT NULL,
  meta_keywords TEXT DEFAULT NULL,

  published_at DATETIME DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE blog_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,

  blog_id INT NOT NULL,

  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  website VARCHAR(255) DEFAULT NULL,
  comment TEXT NOT NULL,

  status ENUM('pending', 'approved', 'rejected', 'spam') NOT NULL DEFAULT 'pending',

  ip_address VARCHAR(100) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
);

INSERT INTO blog_categories (name, slug, description) VALUES
('Accounting & Bookkeeping', 'accounting-bookkeeping', 'Blogs related to accounting and bookkeeping services.'),
('Internal Audit in UAE', 'internal-audit-in-uae', 'Blogs related to internal audit services in UAE.'),
('External Audit in UAE', 'external-audit-in-uae', 'Blogs related to external audit services in UAE.'),
('Tax Consultancy in UAE', 'tax-consultancy-in-uae', 'Blogs related to tax consultancy in UAE.'),
('Corporate Tax in UAE', 'corporate-tax-in-uae', 'Blogs related to corporate tax in UAE.'),
('Company Formation in UAE', 'company-formation-in-uae', 'Blogs related to company formation in UAE.'),
('Company Liquidation in UAE', 'company-liquidation-in-uae', 'Blogs related to company liquidation in UAE.'),
('Smart Accounting', 'smart-accounting', 'Blogs related to smart accounting.'),
('CFO Advisory', 'cfo-advisory', 'Blogs related to CFO advisory.');


CREATE TABLE faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,

  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,

  category_id INT DEFAULT NULL,

  is_published TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,

  created_by INT DEFAULT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO permissions (name, description) VALUES
('faqs.view', 'View FAQs'),
('faqs.create', 'Create FAQs'),
('faqs.edit', 'Edit FAQs'),
('faqs.delete', 'Delete FAQs');

INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, p.id
FROM permissions p
WHERE p.name IN (
  'faqs.view',
  'faqs.create',
  'faqs.edit',
  'faqs.delete'
)
AND NOT EXISTS (
  SELECT 1
  FROM role_permissions rp
  WHERE rp.role_id = 1
  AND rp.permission_id = p.id
);
