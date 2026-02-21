const { authenticator } = require('otplib');
const secret = authenticator.generateSecret();
console.log('Secret:', secret);
const token = authenticator.generate(secret);
console.log('Token:', token);
const isValid = authenticator.verify({ token, secret });
console.log('IsValid:', isValid);
