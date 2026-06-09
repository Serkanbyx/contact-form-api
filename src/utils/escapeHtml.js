const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escapes HTML-special characters in a string so user-provided content can be
 * safely embedded inside an HTML document (e.g. email bodies) without enabling
 * HTML/script injection.
 */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}

module.exports = escapeHtml;
