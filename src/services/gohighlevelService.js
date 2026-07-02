const https = require('https');

const GHL_ENDPOINT = process.env.GHL_ENDPOINT || 'https://services.leadconnectorhq.com/contacts/upsert';
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
        resolve({ statusCode: res.statusCode, data });
        return;
      }

      const error = new Error(`GoHighLevel request failed with status ${res.statusCode}`);
      error.statusCode = res.statusCode;
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
  const response = await postJson(GHL_ENDPOINT, payload, {
    Authorization: GHL_AUTHORIZATION,
    Version: GHL_VERSION,
  });

  return { payload, response };
};

module.exports = {
  buildContactPayload,
  splitFullName,
  upsertContact,
};
