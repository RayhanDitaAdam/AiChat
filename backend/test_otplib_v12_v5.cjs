const { TOTP, NobleCryptoPlugin, ScureBase32Plugin } = require('otplib');
const totp = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin()
});

async function run() {
  const secret = totp.generateSecret();
  console.log('Secret:', secret);
  const token = await totp.generate(secret);
  console.log('Token:', token);
  const isValid = await totp.verify({ token, secret });
  console.log('IsValid:', isValid);
}

run().catch(console.error);
