const { pgPool } = require('../../config/database');

class User {
  static async create(userData) {
    const { email, phone, hashedPassword, role, county, constituency } = userData;
    const query = `
      INSERT INTO users (email, phone, hashed_password, role, county, constituency, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, email, phone, role, county, constituency, created_at
    `;
    const values = [email, phone, hashedPassword, role, county, constituency];
    const result = await pgPool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pgPool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, phone, role, county, constituency, created_at FROM users WHERE id = $1';
    const result = await pgPool.query(query, [id]);
    return result.rows[0];
  }

  static async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
    await pgPool.query(query, [id]);
  }
}

module.exports = User;