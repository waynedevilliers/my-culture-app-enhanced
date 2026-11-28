import nodemailer from 'nodemailer';
import { Subscriber } from '../db.js';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secureConnection: false, // TLS requires secureConnection to be false
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
      ciphers:'SSLv3'
  }
})

export const sendEmail = (email, subject, content) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subject,
    html: content,
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  })
}

export const sendVerificationEmail = async (emailToVerify, id) => {
  const VERIFICATION_HTML = `
    <h1>Vielen Dank für dein Interesse!</h1>
    <p>Bitte click auf den Link um deine E-Mail-Adresse zu bestätigen.</p>
    <a href="${process.env.URL}/api/subscribers/verify?id=${id}&email=${emailToVerify}">Hier clicken um zu bestätigen.</a>`;
  sendEmail(emailToVerify, "Musik Leben - Bestätige deine E-Mail-Adresse", VERIFICATION_HTML);
  console.log("Verification email sent to: " + emailToVerify);
}

export const sendBulkEmail = async (subject, content) => {
  console.log('Sending an email to all subscribers...');

  const subscribers = await Subscriber.findAll({ where: { status: "active" } });

  await Promise.allSettled(
    subscribers.map((subscriber) => {
      const bodyWithUnsubscribe = content + `<a href='${process.env.URL}/api/subscribers/remove?email=${subscriber.email}&id=${subscriber.id}'>Unsubscribe</a>`;
      return sendEmail(subscriber.email, subject, bodyWithUnsubscribe);
    })
  )
  console.log('Emails sent to all subscribers.');
}