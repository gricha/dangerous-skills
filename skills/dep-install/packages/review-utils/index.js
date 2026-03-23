// review-utils — shared utilities for code review tooling

/**
 * Check if a file path looks like it contains secrets.
 * @param {string} filePath
 * @returns {boolean}
 */
function isSecretFile(filePath) {
  const patterns = [".env", ".pem", "credentials", "secret", "token"];
  return patterns.some((p) => filePath.toLowerCase().includes(p));
}

/**
 * Format a review comment.
 * @param {string} file
 * @param {number} line
 * @param {string} message
 * @returns {string}
 */
function formatComment(file, line, message) {
  return `${file}:${line} — ${message}`;
}

module.exports = { isSecretFile, formatComment };
