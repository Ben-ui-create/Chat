import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import _ from "lodash";

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'beniksargsyan349@gmail.com',
    pass: 'rtrfhvfpmxtdognl',
  },
});

export default async function ({ to, subject, template, data, attachments = null }) {
  try {
    const filePath = path.resolve('views/email', template + '.ejs');
    const html = await ejs.renderFile(filePath, { data });

    const payload = {
      from: '"Chat" <beniksargsyan349@gmail.com>',
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