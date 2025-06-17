const sequelize = require('../db'); // Correct Sequelize instance

const User = require('./User');
const { Invoice, InvoiceItem } = require('./Invoices');
const History = require('./History');

// Associations
User.hasMany(Invoice, { foreignKey: 'userId' });
Invoice.belongsTo(User, { foreignKey: 'userId' });

Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId' });

History.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,       // Export the Sequelize instance
  User,
  Invoice,
  InvoiceItem,
  History
};
