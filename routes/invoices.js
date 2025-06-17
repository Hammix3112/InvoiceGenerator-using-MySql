const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");

const { Invoice, User } = require("../models"); // Adjust import as per your setup

// POST: Create a new invoice
router.post("/", fetchuser, async (req, res) => {
  try {
    const {
      customer,
      reference,
      total,
      currency,
      dueDate,
      items,
      poNumber,
      paymentTerms,
    } = req.body;

    // Create the invoice record
    const newInvoice = await Invoice.create({
      customer,
      reference,
      total,
      currency,
      items,          // This assumes items is JSON/string, check your model type
      poNumber,
      paymentTerms,
      dueDate,
      userId: req.user.id, // Foreign key to User table
    });

    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(500).json({ message: "Error saving invoice", error: err.message });
  }
});

// GET: Fetch invoices for the logged-in user
router.get("/", fetchuser, async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: { userId: req.user.id }
    });
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ message: "Error fetching invoices", error: err.message });
  }
});

// GET: Fetch a single invoice by its ID
router.get("/:id", fetchuser, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json(invoice);
  } catch (err) {
    res.status(500).json({ message: "Error fetching invoice", error: err.message });
  }
});

// DELETE: Delete an invoice by its ID
router.delete("/:id", fetchuser, async (req, res) => {
  try {
    const deletedCount = await Invoice.destroy({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting invoice", error: err.message });
  }
});

// DELETE: Delete all invoices for the logged-in user
router.delete("/", fetchuser, async (req, res) => {
  try {
    const deletedCount = await Invoice.destroy({
      where: { userId: req.user.id }
    });

    res.status(200).json({
      message: "All invoices deleted",
      deletedCount
    });
  } catch (err) {
    res.status(500).json({ message: "Error deleting all invoices", error: err.message });
  }
});

// PUT: Update an existing invoice by ID
router.put("/:id", fetchuser, async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // Find the invoice for this user
    const invoice = await Invoice.findOne({
      where: { id: invoiceId, userId: req.user.id }
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found or unauthorized" });
    }

    // Update invoice with new data
    await invoice.update(req.body);

    res.status(200).json(invoice);
  } catch (err) {
    res.status(500).json({ message: "Error updating invoice", error: err.message });
  }
});

module.exports = router;
