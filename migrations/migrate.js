const fs = require('fs');
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',     // change if needed
    password: '',     // add your password if any
    database: 'iNoteBook'
  });

  // Read JSON files
  const users = JSON.parse(fs.readFileSync('users.json'));
  const invoices = JSON.parse(fs.readFileSync('invoices.json'));
  const history = JSON.parse(fs.readFileSync('history.json'));

  // Map to track old Mongo _id to new MySQL id
  const userIdMap = new Map();
  const invoiceIdMap = new Map();

  // Insert Users
  for (const user of users) {
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, date) VALUES (?, ?, ?, ?)',
      [user.name, user.email, user.password || null, new Date(user.date)]
    );
    userIdMap.set(user._id, result.insertId);
  }

  // Insert Invoices and Invoice Items
  for (const invoice of invoices) {
    const mysqlUserId = userIdMap.get(invoice.user);
    if (!mysqlUserId) {
      console.warn(`User not found for invoice: ${invoice._id}`);
      continue;
    }

    const [result] = await connection.execute(
      `INSERT INTO invoices 
        (user_id, customer, reference, total, currency, date, due_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        mysqlUserId,
        invoice.customer,
        invoice.reference,
        invoice.total,
        invoice.currency,
        new Date(invoice.date),
        invoice.dueDate || null
      ]
    );

    invoiceIdMap.set(invoice._id, result.insertId);

    // Insert invoice items
    if (Array.isArray(invoice.items)) {
      for (const item of invoice.items) {
        await connection.execute(
          `INSERT INTO invoice_items (invoice_id, description, quantity, price)
           VALUES (?, ?, ?, ?)`,
          [result.insertId, item.description, item.quantity, item.price]
        );
      }
    }
  }

  // Insert History
  for (const record of history) {
    const mysqlUserId = userIdMap.get(record.user);
    await connection.execute(
      `INSERT INTO history (user_id, action, title, description, date)
       VALUES (?, ?, ?, ?, ?)`,
      [
        mysqlUserId || null,
        record.action,
        record.title,
        record.description,
        new Date(record.date)
      ]
    );
  }

  console.log('Migration completed!');
  await connection.end();
}

migrate().catch(console.error);
