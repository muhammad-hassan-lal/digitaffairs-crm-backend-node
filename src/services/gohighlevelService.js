const https = require('https');

const GHL_ENDPOINT = process.env.GHL_ENDPOINT || 'https://services.leadconnectorhq.com/contacts';
const GHL_AUTHORIZATION = process.env.GHL_AUTHORIZATION || 'pit-c0088c73-1dac-4a76-974e-64cfd7d0b903';
const GHL_VERSION = process.env.GHL_VERSION || '2021-07-28';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || '9cgBpMS3MXPmjeMZMJzG';
const GHL_ASSIGNED_TO = process.env.GHL_ASSIGNED_TO || 'kBA9gRqvqUYZOhDqnz9i';
const GHL_SOURCE = process.env.GHL_SOURCE || 'digitaffairs.com';
const GHL_TIMEOUT_MS = Number(process.env.GHL_TIMEOUT_MS || 10000);

const CUSTOM_FIELD_IDS = {
  service: '8FqJ4PYDOnG8OKNIhpz4',
  message: '7PkQ4bE2FdW2HpdSzyXl',
  utmSource: 'JzEf4Zof191Pqyr6Q0Qf',
  utmMedium: '6relijRqlHXz3lfw6IWi',
  utmCampaign: 'ejLuwwI5uWVVasppGw9p',
  utmTerm: 'VYxJZisyUuhNIAHnCumf',
  gclid: '8QOzmA8pcSOgvO0oCW4U',
};

const normalizeValue = (value) => (value === undefined || value === null ? '' : String(value));

const logGhl = (level, event, details = {}) => {
  const payload = {
    service: 'gohighlevel',
    event,
    timestamp: new Date().toISOString(),
    ...details,
  };

  console[level](JSON.stringify(payload));
};

const formatAuthorizationHeader = (authorization) => {
  const token = normalizeValue(authorization).trim();
  if (!token) return token;
  return /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`;
};

const getLeadId = (lead) => {
  if (!lead) return null;
  if (typeof lead.get === 'function') return lead.get('id') || lead.id || null;
  return lead.id || null;
};

const getPayloadSummary = (payload) => ({
  hasFirstName: Boolean(payload.firstName),
  hasLastName: Boolean(payload.lastName),
  hasEmail: Boolean(payload.email),
  hasPhone: Boolean(payload.phone),
  hasCompanyName: Boolean(payload.companyName),
  customFieldCount: Array.isArray(payload.customFields) ? payload.customFields.length : 0,
  customFieldsWithValue: Array.isArray(payload.customFields)
    ? payload.customFields.filter((field) => Boolean(field.field_value)).length
    : 0,
});

const splitFullName = (name) => {
  const parts = normalizeValue(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

const buildContactPayload = (lead) => {
  const { firstName, lastName } = splitFullName(lead.name);

  return {
    locationId: GHL_LOCATION_ID,
    assignedTo: GHL_ASSIGNED_TO,
    source: GHL_SOURCE,
    firstName,
    lastName,
    email: normalizeValue(lead.email),
    phone: normalizeValue(lead.phone),
    companyName: normalizeValue(lead.company_name),
    customFields: [
      {
        id: CUSTOM_FIELD_IDS.service,
        field_value: normalizeValue(lead.service),
      },
      {
        id: CUSTOM_FIELD_IDS.message,
        field_value: normalizeValue(lead.message),
      },
      {
        id: CUSTOM_FIELD_IDS.utmSource,
        field_value: normalizeValue(lead.utm_source),
      },
      {
        id: CUSTOM_FIELD_IDS.utmMedium,
        field_value: normalizeValue(lead.utm_medium),
      },
      {
        id: CUSTOM_FIELD_IDS.utmCampaign,
        field_value: normalizeValue(lead.utm_campaign),
      },
      {
        id: CUSTOM_FIELD_IDS.utmTerm,
        field_value: normalizeValue(lead.utm_term),
      },
      {
        id: CUSTOM_FIELD_IDS.gclid,
        field_value: normalizeValue(lead.gclid),
      },
    ],
  };
};

const postJson = (url, body, headers) => new Promise((resolve, reject) => {
  const payload = JSON.stringify(body);
  const requestUrl = new URL(url);

  const req = https.request({
    method: 'POST',
    hostname: requestUrl.hostname,
    path: `${requestUrl.pathname}${requestUrl.search}`,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  }, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
      responseBody += chunk;
    });

    res.on('end', () => {
      let data = responseBody;
      try {
        data = responseBody ? JSON.parse(responseBody) : null;
      } catch (err) {
        data = responseBody;
      }

      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({ statusCode: res.statusCode, statusMessage: res.statusMessage, data });
        return;
      }

      const error = new Error(`GoHighLevel request failed with status ${res.statusCode}`);
      error.statusCode = res.statusCode;
      error.statusMessage = res.statusMessage;
      error.response = data;
      reject(error);
    });
  });

  req.on('error', reject);
  req.setTimeout(GHL_TIMEOUT_MS, () => {
    req.destroy(new Error(`GoHighLevel request timed out after ${GHL_TIMEOUT_MS}ms`));
  });
  req.write(payload);
  req.end();
});

const upsertContact = async (lead) => {
  const payload = buildContactPayload(lead);
  const requestUrl = new URL(GHL_ENDPOINT);
  const leadId = getLeadId(lead);
  const startedAt = Date.now();

  logGhl('info', 'contact_upsert_started', {
    lead_id: leadId,
    endpointHost: requestUrl.hostname,
    endpointPath: requestUrl.pathname,
    version: GHL_VERSION,
    locationId: GHL_LOCATION_ID,
    assignedTo: GHL_ASSIGNED_TO,
    source: GHL_SOURCE,
    payloadSummary: getPayloadSummary(payload),
  });

  try {
    const response = await postJson(GHL_ENDPOINT, payload, {
      Authorization: formatAuthorizationHeader(GHL_AUTHORIZATION),
      Version: GHL_VERSION,
    });

    logGhl('info', 'contact_upsert_succeeded', {
      lead_id: leadId,
      statusCode: response.statusCode,
      statusMessage: response.statusMessage,
      durationMs: Date.now() - startedAt,
    });

    return { payload, response };
  } catch (error) {
    logGhl('error', 'contact_upsert_failed', {
      lead_id: leadId,
      statusCode: error.statusCode || null,
      statusMessage: error.statusMessage || null,
      message: error.message,
      response: error.response || null,
      durationMs: Date.now() - startedAt,
    });

    throw error;
  }
};

module.exports = {
  buildContactPayload,
  formatAuthorizationHeader,
  splitFullName,
  upsertContact,
};
