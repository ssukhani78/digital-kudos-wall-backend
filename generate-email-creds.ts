import * as nodemailer from "nodemailer";

const generateTestAccount = async () => {
  try {
    const account = await nodemailer.createTestAccount();
    console.log("✅ Ethereal Email Test Account Generated!");
    console.log("-----------------------------------------");
    console.log("Copy these values into your .env file:");
    console.log("");
    console.log(`SMTP_HOST=${account.smtp.host}`);
    console.log(`SMTP_PORT=${account.smtp.port}`);
    console.log(`SMTP_SECURE=${account.smtp.secure}`);
    console.log(`SMTP_USER=${account.user}`);
    console.log(`SMTP_PASS=${account.pass}`);
    console.log(`# You can use the same email for the FROM address, or any other.`);
    console.log(`SMTP_FROM_EMAIL=${account.user}`);
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("Failed to create a test account:", error);
  }
};

generateTestAccount();
