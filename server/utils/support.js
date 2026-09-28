
export const getSupportEmail = () => process.env.SUPPORT_EMAIL || "";

export const supportLine = () => {
  const email = getSupportEmail();
  return email
    ? `If you think this is a mistake, reply to this email or contact ${email}.`
    : "If you think this is a mistake, please contact BookBeautiq support.";
};