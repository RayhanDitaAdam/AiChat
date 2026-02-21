const { TOTP } = require('otplib');
const totp = new TOTP();
console.log('TOTP instance:', totp);
const secret = totp.generateSecret();
console.log('Secret:', secret);
const token = totp.generate(secret);
console.log('Token:', token);
const isValid = totp.verify({ token, secret });
console.log('IsValid:', isValid);
