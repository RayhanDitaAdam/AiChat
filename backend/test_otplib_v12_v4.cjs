const { TOTP, NobleCryptoPlugin, ScureBase32Plugin } = require('otplib');
const totp = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin()
});
const secret = totp.generateSecret();
console.log('Secret:', secret);
const token = totp.generate(secret);
console.log('Token:', token);
const isValid = totp.verify({ token, secret });
console.log('IsValid:', isValid);
