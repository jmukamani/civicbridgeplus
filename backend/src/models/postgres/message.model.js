const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  recipient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  thread_id: {
    type: DataTypes.UUID,
    references: {
      model: 'Messages',
      key: 'id'
    }
  },
  message_type: {
    type: DataTypes.ENUM('general', 'complaint', 'suggestion', 'request'),
    defaultValue: 'general'
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'read', 'replied', 'archived'),
    defaultValue: 'sent'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  read_at: {
    type: DataTypes.DATE
  },
  replied_at: {
    type: DataTypes.DATE
  },
  parent_message_id: {
    type: DataTypes.UUID,
    references: {
      model: 'Messages',
      key: 'id'
    }
  },
  attachments: {
    type: DataTypes.JSONB
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['sender_id'],
      using: 'BTREE'
    },
    {
      fields: ['recipient_id'],
      using: 'BTREE'
    },
    {
      fields: ['thread_id'],
      using: 'BTREE'
    },
    {
      fields: ['status'],
      using: 'BTREE'
    }
  ]
});

Message.associate = (models) => {
  Message.belongsTo(models.User, { as: 'Sender', foreignKey: 'sender_id' });
  Message.belongsTo(models.User, { as: 'Recipient', foreignKey: 'recipient_id' });
  Message.belongsTo(models.Message, { as: 'ParentMessage', foreignKey: 'parent_message_id' });
};

module.exports = Message;