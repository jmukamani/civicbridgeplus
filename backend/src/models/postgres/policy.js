const { pgPool } = require('../../config/database');

class Policy {
  static async create(policyData) {
    const { title, status, category, description } = policyData;
    const query = `
      INSERT INTO policies (title, status, category, description, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    const values = [title, status, category, description];
    const result = await pgPool.query(query, values);
    return result.rows[0];
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT * FROM policies 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await pgPool.query(query, [limit, offset]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM policies WHERE id = $1';
    const result = await pgPool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, updateData) {
    const { title, status, category, description } = updateData;
    const query = `
      UPDATE policies 
      SET title = $1, status = $2, category = $3, description = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    const values = [title, status, category, description, id];
    const result = await pgPool.query(query, values);
    return result.rows[0];
  }
}

module.exports = Policy;