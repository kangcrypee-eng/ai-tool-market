const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET = process.env.JWT_SECRET || 'dev-secret';

const hashPassword = (pw) => bcrypt.hashSync(pw, 10);
const comparePassword = (pw, hash) => bcrypt.compareSync(pw, hash);
const signToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: '7d' });
const verifyToken = (token) => { try { return jwt.verify(token, SECRET); } catch { return null; } };

function getAuthFromRequest(req) {
  const cookie = req.headers.get('cookie') || '';
  const m = cookie.match(/token=([^;]+)/);
  return m ? verifyToken(m[1]) : null;
}
function requireAuth(req) {
  const u = getAuthFromRequest(req);
  if (!u) throw new Error('UNAUTHORIZED');
  return u;
}
function requireAdmin(req) {
  const u = requireAuth(req);
  if (u.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return u;
}

module.exports = { hashPassword, comparePassword, signToken, verifyToken, getAuthFromRequest, requireAuth, requireAdmin };
