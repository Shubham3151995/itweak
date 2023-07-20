// Set the connected Stripe Account to collect payments on behalf of that account
const { stripeTestSecretKey } = require("../config/appConfig");
const stripe = require("stripe")(stripeTestSecretKey);
const moment = require("moment");
const { nodeEnv } = require("../config/appConfig");
const axios = require('axios');
const qs = require('qs');
const createConnectAccount = async ({
  email,
  city,
  dobDay,
  dobMonth,
  dobYear,
  country,
  line1,
  line2,
  postalCode,
  state,
  firstName,
  lastName,
  gender,
  ssnLast4,
  phone,
  clientIp,
}) => {
  if (nodeEnv == "development") {
    city = "New York City";
    dobDay = 01;
    dobMonth = 01;
    dobYear = 1901;
    line1 = 51;
    line2 = "Hideaway Lane";
    postalCode = "14420";
    state = "NY";
    country = "US";
    gender = "male";
    ssnLast4 = "0000";
    phone = "+15857387709";
  }
  const account = await stripe.accounts.create({
    type: "custom",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    individual: {
      address: {
        city,
        country,
        line1,
        line2,
        postal_code: postalCode,
        state,
      },
      registered_address: {
        city,
        country,
        line1,
        line2,
        postal_code: postalCode,
        state,
      },
      dob: {
        day: dobDay,
        month: dobMonth,
        year: dobYear,
      },
      email,
      first_name: firstName,
      last_name: lastName,
      gender,
      ssn_last_4: ssnLast4,
      phone,
    },
    business_profile: {
      mcc: 7210,
      product_description:
        "Web/App based Laundry Service Provider at laundryhero.co",
      support_address: {
        city: "Brockport",
        country: "US",
        line1: "51 Hideaway Lane",
        postal_code: "14420",
        state: "NY",
      },
      support_email: "support@laundry-hero.com",
      support_phone: "+15857387709",
      support_url: "https://www.laundryhero.co/contact",
      url: "https://www.laundryhero.co/",
    },
    settings: {
      payouts: {
        schedule: {
          interval: "manual",
        },
      },
    },
    tos_acceptance: {
      ip: clientIp == "::1" ? "161.123.77.28" : clientIp,
      date: moment().unix(),
    },
  });
  return account;
};

const getAccount = async (stripeAccountId) => {
  const account = await stripe.accounts.retrieve(stripeAccountId);
  return account;
};

const updateAccount = async (stripeAccountId, update) => {
  const account = await stripe.accounts.update(stripeAccountId, {
    ...update,
  });
  return account;
};

const createCustomer = async ({ name, email }) => {
  const customer = await stripe.customers.create({
    name,
    email,
  });

  return customer;
};

const createToken = async () => {

  let data = qs.stringify({
    'card[number]': '4242424242424242',
    'card[exp_month]': '7',
    'card[exp_year]': '2024',
    'card[cvc]': '314'
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.stripe.com/v1/tokens',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic c2tfdGVzdF81MUp6a1NyRFdkR1U1OWxZV2dUbnByNFU1c0RLR3IxbnFYdFV0aHNKN05XS2N6Q3ZycE5mdFVBcTRIelNKS2h0dmw5b2RRQTZublB5Q2ROWlJZS05DOHhtSDAwQ3BMaXhLb0s6',
      'Cookie': '__stripe_orig_props=%7B%22referrer%22%3A%22%22%2C%22landing%22%3A%22https%3A%2F%2Fdashboard.stripe.com%2Ftest%2Flogs%2Freq_8qWeqq9FLihAmN%3Ft%3D1684248274%22%7D; cid=09fde8cc-c5f3-439f-969a-7f373fcd986d; machine_identifier=putyz66Nr96%2F7EWH%2Bka%2FYu8vJV4nH93WutroK2qmdgQus2CcWv7%2Biopl5JwSuDL20dY%3D; private_machine_identifier=BHVKlq6MczdDHshrQNOYdFzAeJStjRVo7EuwAVvjnIm8VuPEkJ3TE9aCHV0WYqjbcec%3D; __stripe_orig_props=%7B%22referrer%22%3A%22%22%2C%22landing%22%3A%22https%3A%2F%2Fconnect.stripe.com%2Fsetup%2Fe%2Facct_1MFYtQDEBqF6FmqD%2Fx8qMxsjE4Buh%22%7D; machine_identifier=JQIi6cO28gHMaQUibCpd2rdJn3KPr54nN1qFPAqBow4YJyaFxV5RMAQiY62Yuw4OXc4%3D; private_machine_identifier=L833dXHt%2FTM0njuN59U50g7T2JvPTG%2F4HDmS6AMM4GdoFAQ0wbLuzI6NgIxO5Pcem%2Bw%3D'
    },
    data: data
  };
  let a = await axios.request(config)
  return a.data;


  // const token = await stripe.tokens.create({
  //   card: {
  //     number: number,
  //     exp_month: exp_month,
  //     exp_year: exp_year,
  //     cvc: cvc,
  //   },
  // });
  // return token;
}



const getCustomer = async (stripeCustomerId) => {
  const customer = await stripe.customers.retrieve(stripeCustomerId);
  return customer;
};

const updateCustomer = async (stripeCustomerId, update) => {
  const customer = await stripe.customers.update(stripeCustomerId, update);
  return customer;
};

const getPaymentMethods = async (stripeCustomerId) => {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: stripeCustomerId,
    type: "card",
  });
  return paymentMethods;
};

const addPaymentMethod = async (paymentMethodId, stripeCustomerId) => {
  const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
    customer: stripeCustomerId,
  });
  return paymentMethod;
};

const detachPaymentMethod = async (paymentMethodId) => {
  const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
  return paymentMethod;
};

const setupIntent = async (stripeCustomerId) => {
  const intent = await stripe.setupIntents.create({
    payment_method_types: ["card_present"],
    customer: stripeCustomerId,
    // useage: 'offline',
  });
  return intent;
};

const paymentIntent = async ({
  stripeAccountId,
  amount,
  currency,
  applicationFee,
  stripeCustomerId,
}) => {
  const Intent = await stripe.paymentIntents.create({
    payment_method_types: ["card"],
    amount: amount,
    currency,
    application_fee_amount: applicationFee,
    customer: stripeCustomerId,
    transfer_data: {
      destination: stripeAccountId,
    },
  });
  return Intent;
};

const paymentRefund = async ({
  chargeId,
  stripeAccountId,
  refundApplicationFee = true,
}) => {
  const refund = await stripe.refunds.create(
    {
      charge: chargeId,
      refund_application_fee: refundApplicationFee,
    },
    {
      stripeAccount: stripeAccountId,
    }
  );
  return refund;
};
const payoutFunc = async (amount, destination) => {
  const transferResponse = await stripe.transfers.create({
    amount: amount * 100,
    currency: "usd",
    destination: destination,
  });
  const payoutResponse = await stripe.payouts.create(
    {
      amount: amount * 100,
      currency: "usd",
    },
    {
      stripeAccount: destination,
    }
  );
  return payoutResponse;
};

const getPaymentIntents = async ({
  limit = 20,
  startingBefore,
  endingBefore,
  stripeCustomerId,
}) => {
  const filters = {
    limit,
  };
  if (startingBefore) filters.starting_after = startingBefore;
  if (endingBefore) filters.ending_before = endingBefore;
  if (stripeCustomerId) filters.stripeCustomerId = stripeCustomerId;

  const paymentIntents = await stripe.paymentIntents.list(filters);
  return paymentIntents;
};

const createBankAccount = async ({
  connectAccountId,
  accountHolderName,
  accountHolderType, // can be either individual or company
  routingNumber,
  accountNumber,
}) => {
  if (nodeEnv == "development") {
    routingNumber = "110000000";
    accountNumber = "000123456789";
  }
  const bankAccount = await stripe.accounts.createExternalAccount(
    connectAccountId,
    {
      external_account: {
        object: "bank_account",
        country: "us",
        currency: "usd",
        account_holder_name: accountHolderName,
        account_holder_type: accountHolderType,
        routing_number: routingNumber,
        account_number: accountNumber,
      },
    }
  );
  return bankAccount;
};

const getBankAccounts = async ({ connectAccountId }) => {
  const [bankAccounts, cards] = await Promise.all([
    stripe.accounts.listExternalAccounts(connectAccountId, {
      object: "bank_account",
      limit: 100,
    }),
    stripe.accounts.listExternalAccounts(connectAccountId, {
      object: "card",
      limit: 100,
    }),
  ]);

  let accountDetails = [...bankAccounts?.data, ...cards?.data];

  return accountDetails;
};
const updateStripeAccount = async (stripeAccountId, accountId) => {
  const bankAccount = await stripe.accounts.updateExternalAccount(
    stripeAccountId,
    accountId,

    { default_for_currency: true }
  );
  return bankAccount;
};

const createStripeProduct = async (name) => {
  const product = await stripe.products.create({
    name: name,
  });
  return product;
};
const createStripeProductPrice = async (price, duration, productId) => {
  const priceDetail = await stripe.prices.create({
    unit_amount: price * 100,
    currency: "usd",
    recurring: { interval: duration },
    product: productId,
  });
  return priceDetail;
};
const stripeSubcription = async (customerStripeId, priceId) => {
  let date = new Date();
  let currentDate = Date.now();
  // currentDate = currentDate.toFixed();
  const subscription = await stripe.subscriptions.create({
    customer: customerStripeId,
    items: [{ price: priceId }],
    // billing_cycle_anchor: "now",
  });
  return subscription;
};

const deleteStripeProduct = async (id) => {
  const deleted = await stripe.products.del(id);
  return deleted;
};

module.exports = {
  createConnectAccount,
  getAccount,
  updateAccount,
  paymentIntent,
  paymentRefund,
  getCustomer,
  createCustomer,
  updateCustomer,
  getPaymentMethods,
  addPaymentMethod,
  detachPaymentMethod,
  setupIntent,
  getPaymentIntents,
  payoutFunc,
  createBankAccount,
  getBankAccounts,
  updateStripeAccount,
  createStripeProduct,
  createStripeProductPrice,
  stripeSubcription,
  deleteStripeProduct,
  createToken
};
