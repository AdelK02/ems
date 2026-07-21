const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_10k_users';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_10k_users';

const generateAccessToken = (user) => {
  const permissions = user.roles ? user.roles.flatMap(r => r.permissions || []) : [];
  const roles = user.roles ? user.roles.map(r => r.name) : [];
  const empId = user.employeeId ? (user.employeeId._id ? user.employeeId._id.toString() : user.employeeId.toString()) : null;

  return jwt.sign(
    {
      userId: user._id ? user._id.toString() : user.id,
      email: user.email,
      roles,
      permissions,
      employeeId: empId,
    },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id ? user._id.toString() : user.id,
    },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
