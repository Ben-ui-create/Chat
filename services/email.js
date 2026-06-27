import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import _ from "lodash";

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'beniksargsyan349@gmail.com',
    pass: 'rtrfhvfpmxtdognl'
  }
});

export default async function ({ to, subject, template, data, attachments = null }) {
  try {
    const filePath = path.resolve('views/email', template + '.ejs');
    const html = await ejs.renderFile(filePath, { data });

    const payload = {
      from: '"Example Team" <team@example.com>',
      to,
      subject,
      html,
    }

    if (!_.isEmpty(attachments)) {
      payload.attachments = attachments;
    }

    const info = await transporter.sendMail(payload);

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
}