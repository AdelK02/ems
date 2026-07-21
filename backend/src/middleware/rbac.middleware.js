const ApiResponse = require('../utils/apiResponse');

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated', 401);
    }

    const userPermissions = req.user.permissions || [];
    const userRoles = req.user.roles || [];

    // Admin role bypass
    if (userRoles.includes('ADMIN') || userPermissions.includes('*') || userPermissions.includes(permission)) {
      return next();
    }

    return ApiResponse.error(
      res,
      `Forbidden. Required permission: ${permission}`,
      403
    );
  };
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthenticated', 401);
    }

    const userRoles = req.user.roles || [];
    if (userRoles.includes('ADMIN') || userRoles.includes(role)) {
      return next();
    }

    return ApiResponse.error(res, `Forbidden. Required role: ${role}`, 403);
  };
};

module.exports = { requirePermission, requireRole };
