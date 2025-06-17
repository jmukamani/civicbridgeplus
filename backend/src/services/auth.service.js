const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/postgres/user.model');
const { redisClient } = require('../config/redis');
const EmailService = require('./email.service');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../utils/constants');

class AuthService {
  async register(userData) {
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await User.create({
      ...userData,
      password: hashedPassword
    });

    if (userData.role !== 'citizen') {
      const verificationToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
      await EmailService.sendVerificationEmail(user.email, verificationToken);
    }

    return user;
  }

  async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new Error('Invalid credentials');

    if (!user.is_verified) throw new Error('Account not verified');

    const accessToken = jwt.sign(
      { id: user.id, role: user.role, countyId: user.county_id },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await redisClient.set(`refresh_${user.id}`, refreshToken, { EX: 604800 }); // 7 days

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      },
      accessToken,
      refreshToken
    };
  }

  async refreshToken(refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      const storedToken = await redisClient.get(`refresh_${payload.id}`);
      
      if (storedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      const user = await User.findById(payload.id);
      if (!user) throw new Error('User not found');

      const newAccessToken = jwt.sign(
        { id: user.id, role: user.role, countyId: user.county_id },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      await redisClient.set(`refresh_${user.id}`, newRefreshToken, { EX: 604800 });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  async logout(userId) {
    await redisClient.del(`refresh_${userId}`);
  }
}

module.exports = new AuthService();