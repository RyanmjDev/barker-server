const parseUserId = (token) => {
  if (!token || typeof token !== 'string') {
    console.error('Invalid token:', token);
    return null;
  }

  try {
    const decoded = decodeURIComponent(
      atob(token.split(".")[1].replace("-", "+").replace("_", "/"))
    );
    const payload = JSON.parse(decoded);
    return payload.id;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

module.exports = parseUserId; 