ALTER TABLE leads
  ADD COLUMN reference VARCHAR(255) NULL AFTER message,
  ADD COLUMN utm_source VARCHAR(255) NULL AFTER reference,
  ADD COLUMN utm_medium VARCHAR(255) NULL AFTER utm_source,
  ADD COLUMN utm_campaign VARCHAR(255) NULL AFTER utm_medium,
  ADD COLUMN utm_term VARCHAR(255) NULL AFTER utm_campaign,
  ADD COLUMN gclid VARCHAR(255) NULL AFTER utm_term,
  ADD INDEX idx_leads_reference (reference),
  ADD INDEX idx_leads_utm_campaign (utm_campaign),
  ADD INDEX idx_leads_gclid (gclid);
