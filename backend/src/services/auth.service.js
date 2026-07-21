const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const RefreshToken = require('../models/RefreshToken');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.util');

class AuthService {
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials or account deactivated');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await userRepository.incrementFailedLogin(user._id);
      throw new Error('Invalid credentials');
    }

    await userRepository.updateLastLogin(user._id);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Hash refresh token for DB storage
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const roles = user.roles ? user.roles.map((r) => r.name) : [];
    const permissions = user.roles ? user.roles.flatMap((r) => r.permissions || []) : [];

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        roles,
        permissions,
        employeeId: user.employeeId,
      },
    };
  }

  async refreshTokens(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await userRepository.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const tokenHash = await bcrypt.hash(newRefreshToken, 10);
    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(userId) {
    await RefreshToken.updateMany({ userId }, { isRevoked: true });
    return true;
  }
}

module.exports = new AuthService();
