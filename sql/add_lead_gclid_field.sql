ALTER TABLE leads
  ADD COLUMN gclid VARCHAR(255) NULL AFTER utm_term,
  ADD INDEX idx_leads_gclid (gclid);
