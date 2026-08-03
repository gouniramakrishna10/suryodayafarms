import nodemailer from 'nodemailer';

// Helper to create mail transporter
const createTransporter = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass }
    });
  }
  return null;
};

/**
 * Send confirmation email to applicant upon partner request submission
 */
export const sendApplicantConfirmationEmail = async (partnerData) => {
  const { name, companyName, email, partnershipType } = partnerData;
  const transporter = createTransporter();

  const subject = `Partnership Request Received - Suryodaya Farms`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F9F6F0; color: #2F3B0C; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #EDE7D9; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #4E641A; color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { font-family: Georgia, serif; margin: 0; font-size: 24px; letter-spacing: 1px; }
        .header p { color: #D1E2C4; font-size: 12px; text-transform: uppercase; tracking: 2px; margin-top: 5px; margin-bottom: 0; }
        .content { padding: 30px 24px; line-height: 1.6; }
        .quote-box { background: #F4EFE6; border-left: 4px solid #B8833E; padding: 15px 20px; margin: 20px 0; border-radius: 4px; font-style: italic; color: #4E641A; }
        .details-box { background: #FAF7F2; border: 1px solid #EDE7D9; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .footer { background: #F4EFE6; padding: 20px; text-align: center; font-size: 12px; color: #666666; border-top: 1px solid #EDE7D9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Suryodaya Farms</h1>
          <p>Building a Healthier Future Together</p>
        </div>
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Thank you for reaching out to <strong>Suryodaya Farms & Organics</strong>. We have received your partnership request for <strong>${companyName || 'your organization'}</strong> as a <strong>${partnershipType}</strong> partner.</p>
          
          <div class="quote-box">
            "A true partnership is not simply about doing business together. It is about growing together, learning together, creating lasting value, and building relationships founded on trust, integrity, and shared success."
          </div>

          <p>Our business partnerships team is currently reviewing your details and requirement overview. We will contact you via email or phone shortly to discuss potential collaboration opportunities.</p>

          <div class="details-box">
            <p style="margin: 0 0 8px 0; font-weight: bold;">Application Details Summary:</p>
            <p style="margin: 4px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 4px 0;"><strong>Company:</strong> ${companyName}</p>
            <p style="margin: 4px 0;"><strong>Partnership Type:</strong> ${partnershipType}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
          </div>

          <p>If you have any urgent questions, please feel free to reach out directly to our corporate desk at <a href="mailto:care@suryodayafarms.com" style="color: #4E641A;">care@suryodayafarms.com</a>.</p>
          
          <p>Warm regards,<br><strong>Suryodaya Farms Business Development Team</strong></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Suryodaya Farms & Organics. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[Email Service Mock] Applicant Email to ${email}:\nSubject: ${subject}`);
    return { success: true, mocked: true };
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.SENDER_NAME || 'Suryodaya Farms Partnerships'}" <${process.env.SMTP_USER || 'care@suryodayafarms.com'}>`,
      to: email,
      subject,
      html: htmlContent
    });
    return { success: true };
  } catch (err) {
    console.error(`Failed to send applicant confirmation email to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send notification email to admin when a new partner request is submitted
 */
export const sendAdminPartnerNotificationEmail = async (partnerData) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || 'care@suryodayafarms.com';
  const transporter = createTransporter();

  const { name, companyName, businessType, email, phone, country, state, city, partnershipType, monthlyRequirement, businessDescription, message } = partnerData;
  const subject = `🔔 NEW PARTNER REQUEST: ${companyName} (${partnershipType})`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; margin: 0; padding: 20px; }
        .card { max-width: 650px; margin: 0 auto; background: #fff; border-radius: 8px; border: 1px solid #ddd; padding: 25px; }
        .header { border-bottom: 2px solid #4E641A; padding-bottom: 12px; margin-bottom: 20px; }
        .header h2 { color: #4E641A; margin: 0; }
        .badge { display: inline-block; background: #4E641A; color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2>New Partner Application Received</h2>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">Submitted on ${new Date().toLocaleString('en-IN')}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <span class="badge">${partnershipType}</span>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px; font-weight: bold; width: 35%;">Applicant Name:</td><td style="padding: 6px;">${name}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Company Name:</td><td style="padding: 6px;">${companyName}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Business Type:</td><td style="padding: 6px;">${businessType}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Email:</td><td style="padding: 6px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Phone:</td><td style="padding: 6px;"><a href="tel:${phone}">${phone}</a></td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Location:</td><td style="padding: 6px;">${city}, ${state}, ${country}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Monthly Requirement:</td><td style="padding: 6px;">${monthlyRequirement || 'N/A'}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Business Description:</td><td style="padding: 6px;">${businessDescription || 'N/A'}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Message:</td><td style="padding: 6px;">${message || 'N/A'}</td></tr>
        </table>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[Email Service Mock] Admin Notification Email for Partner Request from ${companyName}`);
    return { success: true, mocked: true };
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.SENDER_NAME || 'Suryodaya Farms Partnerships'}" <${process.env.SMTP_USER || 'care@suryodayafarms.com'}>`,
      to: adminEmail,
      subject,
      html: htmlContent
    });
    return { success: true };
  } catch (err) {
    console.error(`Failed to send admin partner notification email:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send confirmation email to customer upon customer support request submission
 */
export const sendCustomerSupportConfirmationEmail = async (supportData) => {
  const { name, email, subject, category, message } = supportData;
  const transporter = createTransporter();

  const mailSubject = `Support Ticket Received: ${subject} - Suryodaya Farms`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F9F6F0; color: #2F3B0C; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #EDE7D9; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #4E641A; color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { font-family: Georgia, serif; margin: 0; font-size: 24px; letter-spacing: 1px; }
        .content { padding: 30px 24px; line-height: 1.6; }
        .details-box { background: #FAF7F2; border: 1px solid #EDE7D9; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .footer { background: #F4EFE6; padding: 20px; text-align: center; font-size: 12px; color: #666666; border-top: 1px solid #EDE7D9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Suryodaya Farms</h1>
          <p>Customer Support Centre</p>
        </div>
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Thank you for reaching out to <strong>Suryodaya Farms Customer Support</strong>. We have received your inquiry regarding <strong>${subject}</strong>.</p>
          
          <p>Our Customer Care team is reviewing your message and will respond to you within 24 hours.</p>

          <div class="details-box">
            <p style="margin: 0 0 8px 0; font-weight: bold;">Inquiry Summary:</p>
            <p style="margin: 4px 0;"><strong>Category:</strong> ${category}</p>
            <p style="margin: 4px 0;"><strong>Subject:</strong> ${subject}</p>
            <p style="margin: 4px 0;"><strong>Message:</strong> ${message}</p>
          </div>

          <p>If you need urgent assistance, you can call our support desk directly at <a href="tel:+919100422140" style="color: #4E641A; font-weight: bold;">+91 9100422140</a>.</p>
          
          <p>Warm regards,<br><strong>Suryodaya Farms Care Team</strong></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Suryodaya Farms & Organics. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[Email Service Mock] Customer Support Confirmation Email to ${email}:\nSubject: ${mailSubject}`);
    return { success: true, mocked: true };
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.SENDER_NAME || 'Suryodaya Farms Support'}" <${process.env.SMTP_USER || 'care@suryodayafarms.com'}>`,
      to: email,
      subject: mailSubject,
      html: htmlContent
    });
    return { success: true };
  } catch (err) {
    console.error(`Failed to send customer support confirmation email to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send notification email to admin when a new customer support request is submitted
 */
export const sendAdminSupportNotificationEmail = async (supportData) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || 'care@suryodayafarms.com';
  const transporter = createTransporter();

  const { name, email, phone, subject, category, message, orderNumber } = supportData;
  const mailSubject = `📩 NEW SUPPORT TICKET: [${category}] ${subject}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; margin: 0; padding: 20px; }
        .card { max-width: 650px; margin: 0 auto; background: #fff; border-radius: 8px; border: 1px solid #ddd; padding: 25px; }
        .header { border-bottom: 2px solid #4E641A; padding-bottom: 12px; margin-bottom: 20px; }
        .header h2 { color: #4E641A; margin: 0; }
        .badge { display: inline-block; background: #4E641A; color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2>New Customer Support Ticket Received</h2>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">Submitted on ${new Date().toLocaleString('en-IN')}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <span class="badge">${category}</span>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px; font-weight: bold; width: 35%;">Customer Name:</td><td style="padding: 6px;">${name}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Email:</td><td style="padding: 6px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Phone:</td><td style="padding: 6px;"><a href="tel:${phone}">${phone}</a></td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Order Number:</td><td style="padding: 6px;">${orderNumber || 'N/A'}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Subject:</td><td style="padding: 6px;">${subject}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Message:</td><td style="padding: 6px;">${message}</td></tr>
        </table>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[Email Service Mock] Admin Support Notification Email for ${subject} from ${name}`);
    return { success: true, mocked: true };
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.SENDER_NAME || 'Suryodaya Farms Support'}" <${process.env.SMTP_USER || 'care@suryodayafarms.com'}>`,
      to: adminEmail,
      subject: mailSubject,
      html: htmlContent
    });
    return { success: true };
  } catch (err) {
    console.error(`Failed to send admin support notification email:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send acknowledgement email to customer when contact form is submitted
 */
export const sendContactAcknowledgementEmail = async (contactData) => {
  const { name, email, subject, category, message } = contactData;
  const transporter = createTransporter();

  const mailSubject = `We Have Received Your Message - Suryodaya Farms`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F9F6F0; color: #2F3B0C; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #EDE7D9; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #4E641A; color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { font-family: Georgia, serif; margin: 0; font-size: 24px; letter-spacing: 1px; }
        .content { padding: 30px 24px; line-height: 1.6; }
        .quote-box { background: #F4EFE6; border-left: 4px solid #B8833E; padding: 15px 20px; margin: 20px 0; border-radius: 4px; font-style: italic; color: #4E641A; }
        .details-box { background: #FAF7F2; border: 1px solid #EDE7D9; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .footer { background: #F4EFE6; padding: 20px; text-align: center; font-size: 12px; color: #666666; border-top: 1px solid #EDE7D9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Suryodaya Farms</h1>
          <p>Every Message Matters. Every Customer Matters.</p>
        </div>
        <div class="content">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Thank you for reaching out to <strong>Suryodaya Farms & Organics</strong>.</p>
          
          <div class="quote-box">
            "Every message matters. Every customer matters. We are committed to responding with professionalism, respect, and genuine care because lasting relationships are built on trust and honest communication."
          </div>

          <p>Our care team is reviewing your message and will respond to you within 24 business hours.</p>

          <div class="details-box">
            <p style="margin: 0 0 8px 0; font-weight: bold;">Message Details:</p>
            <p style="margin: 4px 0;"><strong>Category:</strong> ${category || 'General Enquiry'}</p>
            <p style="margin: 4px 0;"><strong>Subject:</strong> ${subject}</p>
            <p style="margin: 4px 0;"><strong>Message:</strong> ${message}</p>
          </div>

          <p>Warm regards,<br><strong>Suryodaya Farms Customer Care Team</strong></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Suryodaya Farms & Organics. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[Email Service Mock] Contact Acknowledgement Email to ${email}:\nSubject: ${mailSubject}`);
    return { success: true, mocked: true };
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.SENDER_NAME || 'Suryodaya Farms'}" <${process.env.SMTP_USER || 'care@suryodayafarms.com'}>`,
      to: email,
      subject: mailSubject,
      html: htmlContent
    });
    return { success: true };
  } catch (err) {
    console.error(`Failed to send contact acknowledgement email to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send notification email to admin when contact form is submitted
 */
export const sendAdminContactNotificationEmail = async (contactData) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || 'care@suryodayafarms.com';
  const transporter = createTransporter();

  const { name, email, phone, subject, category, message } = contactData;
  const mailSubject = `📬 NEW CONTACT MESSAGE: [${category || 'General'}] ${subject}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; margin: 0; padding: 20px; }
        .card { max-width: 650px; margin: 0 auto; background: #fff; border-radius: 8px; border: 1px solid #ddd; padding: 25px; }
        .header { border-bottom: 2px solid #4E641A; padding-bottom: 12px; margin-bottom: 20px; }
        .header h2 { color: #4E641A; margin: 0; }
        .badge { display: inline-block; background: #4E641A; color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2>New Contact Message Received</h2>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">Submitted on ${new Date().toLocaleString('en-IN')}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <span class="badge">${category || 'General Enquiry'}</span>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px; font-weight: bold; width: 35%;">Customer Name:</td><td style="padding: 6px;">${name}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Email:</td><td style="padding: 6px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Phone:</td><td style="padding: 6px;"><a href="tel:${phone}">${phone}</a></td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Subject:</td><td style="padding: 6px;">${subject}</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Message:</td><td style="padding: 6px;">${message}</td></tr>
        </table>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`[Email Service Mock] Admin Contact Notification Email for ${subject} from ${name}`);
    return { success: true, mocked: true };
  }

  try {
    await transporter.sendMail({
      from: `"${process.env.SENDER_NAME || 'Suryodaya Farms'}" <${process.env.SMTP_USER || 'care@suryodayafarms.com'}>`,
      to: adminEmail,
      subject: mailSubject,
      html: htmlContent
    });
    return { success: true };
  } catch (err) {
    console.error(`Failed to send admin contact notification email:`, err.message);
    return { success: false, error: err.message };
  }
};
