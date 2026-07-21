const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return ApiResponse.success(res, 'Login successful', {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      return ApiResponse.error(res, error.message, 401);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      if (!token) {
        return ApiResponse.error(res, 'Refresh token missing', 401);
      }

      const result = await authService.refreshTokens(token);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return ApiResponse.success(res, 'Token refreshed', {
        accessToken: result.accessToken,
      });
    } catch (error) {
      return ApiResponse.error(res, error.message, 401);
    }
  }

  async logout(req, res, next) {
    try {
      if (req.user) {
        await authService.logout(req.user.userId);
      }
      res.clearCookie('refreshToken');
      return ApiResponse.success(res, 'Logged out successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  async getMe(req, res, next) {
    return ApiResponse.success(res, 'Current user profile', { user: req.user });
  }
}

module.exports = new AuthController();
