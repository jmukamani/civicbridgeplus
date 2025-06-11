const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db').sequelize;
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  hashed_password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('citizen', 'rep', 'admin'),
    allowNull: false,
    defaultValue: 'citizen',
  },
  county: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  constituency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  underscored: true,
  tableName: 'users',
});

// Hash password before saving
User.beforeCreate(async (user) => {
  user.hashed_password = await bcrypt.hash(user.hashed_password, 10);
});

module.exports = User;