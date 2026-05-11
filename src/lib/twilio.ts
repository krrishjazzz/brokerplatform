import twilio from "twilio";

function getClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
}

export async function sendSMS(to: string, message: string) {
  try {
    const client = getClient();
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    });
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error("SMS send error:", error);
    return { success: false, error };
  }
}

export const SMS_TEMPLATES = {
  otp: (otp: string) =>
    `Your KrrishJazz OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`,
  brokerApplied: (name: string) =>
    `New broker application from ${name}. Review at /admin`,
  brokerApproved: (name: string) =>
    `Congratulations ${name}! Your broker account on KrrishJazz is approved.`,
  brokerRejected: (name: string, reason: string) =>
    `Hi ${name}, your broker application was not approved. Reason: ${reason}`,
  propertySubmitted: () =>
    `We received your property listing. It will be live after review.`,
  propertyApproved: (title: string) =>
    `Your property "${title}" is now LIVE on KrrishJazz!`,
  propertyRejected: (title: string, reason: string) =>
    `Your property listing "${title}" was rejected. Reason: ${reason}`,
  newEnquiry: (propertyTitle: string, name: string) =>
    `New enquiry on "${propertyTitle}" from ${name}. Login to view details.`,
};
