const parseUserId = (token) => {
    const decoded = decodeURIComponent(
      atob(token.split(".")[1].replace("-", "+").replace("_", "/"))
    );
    const payload = JSON.parse(decoded);
    return payload.id;
  };

  module.exports = parseUserId;