const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Your Sequelize connection instance
const User = require('./User'); // Assuming you have a User model

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // Reference User model
      key: 'id'
    }
  },
  customer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'invoices',
  timestamps: false
});

// Invoice has many invoice items in separate table
const InvoiceItem = sequelize.define('InvoiceItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  invoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Invoice,
      key: 'id'
    }
  },
  description: DataTypes.STRING,
  quantity: DataTypes.INTEGER,
  price: DataTypes.FLOAT
}, {
  tableName: 'invoice_items',
  timestamps: false
});

// Associations
Invoice.belongsTo(User, { foreignKey: 'userId' });
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId' });

module.exports = { Invoice, InvoiceItem };
