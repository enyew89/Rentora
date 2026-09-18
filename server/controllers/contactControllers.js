const sendEmail = require("../config/nodemailer.js");

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required." });
    }

    const toEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;

    if (!toEmail) {
      console.error("No CONTACT_EMAIL or EMAIL_USER set in environment.");
      return res.status(500).json({ message: "Contact form is not configured." });
    }

    const subject = `Rentora Contact: ${name}`;
    const text = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">New message from Rentora Contact Form</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
        <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
      </div>
    `;

    await sendEmail(toEmail, subject, text, html);

    res.json({ message: "Message sent successfully." });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ message: "Failed to send message. Please try again later." });
  }
};
