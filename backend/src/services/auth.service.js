const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const verifyRefreshToken = async (refreshToken) => {
  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const userId = decoded.id;

    // Get stored refresh token from Redis
    const storedToken = await redisClient.get(userId.toString());
    if (storedToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const user = { id: userId };
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Update Redis with new refresh token
    await redisClient.set(userId.toString(), newRefreshToken, 'EX', 604800);

    return { userId, newAccessToken, newRefreshToken };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateTokens,
  verifyRefreshToken
};