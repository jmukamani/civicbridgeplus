const { pgPool } = require('../../config/database');

class User {
  static async findByEmail(email) {
    const result = await pgPool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pgPool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async create({ email, password, firstName, lastName, phone, role, countyId, constituencyId }) {
    const result = await pgPool.query(
      `INSERT INTO users (email, password, first_name, last_name, phone, role, county_id, constituency_id, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [email, password, firstName, lastName, phone, role, countyId, constituencyId, role === 'citizen']
    );
    return result.rows[0];
  }

  static async updateRefreshToken(id, refreshToken) {
    await pgPool.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [refreshToken, id]
    );
  }

  static async verifyUser(id) {
    const result = await pgPool.query(
      'UPDATE users SET is_verified = true WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = User;