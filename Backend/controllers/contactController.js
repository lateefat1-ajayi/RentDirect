import Contact from "../models/Contact.js";
import { createNotification } from "./notificationController.js";

// Submit contact form
export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;
    
    // Create new contact
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      category,
      userId: req.user?._id // Optional, user might not be logged in
    });

    await contact.save();

    res.status(201).json({ 
      message: "Contact form submitted successfully",
      contactId: contact._id
    });
  } catch (error) {
    console.error("Error submitting contact:", error);
    res.status(500).json({ message: "Failed to submit contact form" });
  }
};

// Get all contacts (admin only)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .populate("userId", "name email")
      .populate("respondedBy", "name")
      .sort({ createdAt: -1 });

    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

// Get contact by ID
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate("userId", "name email")
      .populate("respondedBy", "name");

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({ message: "Failed to fetch contact" });
  }
};

// Update contact status and add admin response
export const updateContact = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.status = status || contact.status;
    if (adminResponse) {
      contact.adminResponse = adminResponse;
      contact.respondedBy = req.user._id;
      contact.respondedAt = new Date();

      // Create notification for the user who submitted the contact
      if (contact.userId) {
        await createNotification(
          contact.userId,
          "contact",
          "Response to Your Contact",
          `Admin has responded to your contact: "${contact.subject}". Check your contact history for details.`,
          "/user/contact-history",
          { contactId: contact._id },
          req
        );
      }
    }

    await contact.save();

    res.json({ message: "Contact updated successfully", contact });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ message: "Failed to update contact" });
  }
};

// Get user's own contact history
export const getUserContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user._id })
      .populate("respondedBy", "name")
      .sort({ createdAt: -1 });

    res.json(contacts);
  } catch (error) {
    console.error("Error fetching user contacts:", error);
    res.status(500).json({ message: "Failed to fetch contact history" });
  }
};

// Delete contact
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Failed to delete contact" });
  }
};
