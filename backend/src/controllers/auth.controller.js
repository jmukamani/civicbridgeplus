const AuthService = require('../services/auth.service');
const { response } = require('../utils/response');

class AuthController {
  async register(req, res) {
    try {
      const user = await AuthService.register(req.body);
      response(res, 201, 'User registered successfully', { user });
    } catch (err) {
      response(res, 400, err.message);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      response(res, 200, 'Login successful', result);
    } catch (err) {
      response(res, 401, err.message);
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);
      response(res, 200, 'Token refreshed', tokens);
    } catch (err) {
      response(res, 401, err.message);
    }
  }

  async logout(req, res) {
    try {
      await AuthService.logout(req.user.id);
      response(res, 200, 'Logged out successfully');
    } catch (err) {
      response(res, 400, err.message);
    }
  }
}

module.exports = new AuthController();