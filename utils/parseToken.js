
const parseUserId = (token) => {
  if (!token) {
    console.error('Token is missing or empty');
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    console.error('Token format is incorrect:', token);
    return null;
  }

  const base64Url = parts[1];
  if (!base64Url) {
    console.error('Base64Url is undefined');
    return null;
  }

  const base64 = base64Url.replace('-', '+').replace('_', '/');
  const payload = Buffer.from(base64, 'base64').toString('utf8');
  const userId = JSON.parse(payload).id;

  return userId;
}

module.exports = parseUserId;

