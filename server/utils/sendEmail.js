import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Use user-provided env variables, or fallback to a test ethereal account if not provided.
  // Warning: in production, EMAIL_USER and EMAIL_PASS must be configured in .env
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Email] No SMTP credentials found. Generating Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    const messageObj = {
      from: '"StayWise.ai" <noreply@staywise.ai>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    const info = await transporter.sendMail(messageObj);
    console.log('\n-----------------------------------------------------------');
    console.log('📧 TEST EMAIL SENT SUCCESSFULLY via Ethereal Email');
    console.log('📬 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    console.log('   (Click the link above to view the mock email in your browser)');
    console.log('-----------------------------------------------------------\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'StayWise.ai'} <${process.env.FROM_EMAIL || 'noreply@staywise.ai'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

export default sendEmail;
