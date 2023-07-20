const dotenv = require("dotenv");
const assert = require("assert");

dotenv.config();

const {
  PORT,
  DATABASE_URI,
  STRIPE_TEST_SECRET_KEY,
  STRIPE_TEST_PUBLIC_KEY,
} = process.env;

// PORT and DATABASE_URI is required
assert(PORT, "PORT is required");
assert(DATABASE_URI, "DATABASE_URI is required");

module.exports = {
  port: PORT,
  dbString: DATABASE_URI,
  stripeTestSecretKey: STRIPE_TEST_SECRET_KEY,
  stripeTestPublicKey: STRIPE_TEST_PUBLIC_KEY,
};
