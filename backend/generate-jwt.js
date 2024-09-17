const crypto = require('crypto');

// Function to base64Url encode
function base64UrlEncode(input) {
  return Buffer.from(input).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Function to base64Url decode
function base64UrlDecode(input) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(input, 'base64').toString();
}

// JWT Token components
const header = JSON.parse(base64UrlDecode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'));
const payload = JSON.parse(base64UrlDecode('eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ'));
const signature = 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Construct the data to be signed
const data = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;

// Your secret key
const secret = 'your-256-bit-secret'; // Replace with the actual secret key

// Generate the HMAC SHA-256 signature
const generatedSignature = crypto.createHmac('sha256', secret)
  .update(data)
  .digest('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');

// Compare the generated signature with the provided signature
if (generatedSignature === signature) {
  console.log('Signature is valid.');
} else {
  console.log('Signature is invalid.');
}
