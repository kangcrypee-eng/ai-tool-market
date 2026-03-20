function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeInput(str, maxLength = 500) {
  if (typeof str !== 'string') return '';
  return escapeHtml(str.trim().slice(0, maxLength));
}

function validateEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(pw) {
  if (typeof pw !== 'string') return false;
  return pw.length >= 6 && pw.length <= 100;
}

const LIMITS = {
  name: 30,
  email: 100,
  bio: 200,
  postTitle: 100,
  postBody: 5000,
  comment: 1000,
  toolName: 50,
  toolDesc: 200,
  toolLongDesc: 3000,
  tag: 20,
  maxTags: 10,
  toolUrl: 500,
};

module.exports = { escapeHtml, sanitizeInput, validateEmail, validatePassword, LIMITS };
