const { TOTP, NobleCryptoPlugin, ScureBase32Plugin } = require('otplib');
const totpInstance = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin()
});

async function run() {
  const secret = totpInstance.generateSecret();
  console.log('Secret:', secret);
  const token = await totpInstance.generate(secret);
  console.log('Token:', token);
  const isValid = await totpInstance.verify({ token, secret });
  console.log('IsValid:', isValid);
}

run().catch(console.error);
