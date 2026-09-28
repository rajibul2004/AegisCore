const deliver = async (user, otp, purpose = '2fa') => {
  const title = purpose === 'email_verification' 
    ? 'Email Verification' 
    : 'Two-Factor Authentication';

  console.log(`\n========================================`);
  console.log(`  ${title} OTP for ${user.email}`);
  console.log(`  Code: ${otp}`);
  console.log(`  Expires in 5 minutes`);
  console.log(`========================================\n`);
};

module.exports = { deliver };
