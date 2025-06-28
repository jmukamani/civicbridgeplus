module.exports = {
  development: {
    username: process.env.POSTGRES_USER || 'aloice',
    password: process.env.POSTGRES_PASSWORD || 'aloice',
    database: process.env.POSTGRES_DB || 'civicdb',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
      acquire: 30000
    }
  },
  test: {
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'civicbridge_test',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
      acquire: 30000
    }
  },
  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
      acquire: 30000
    }
  }
}; 