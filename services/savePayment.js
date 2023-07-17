const Payment = require("../models/Payment");
const User = require("../models/Users");
const Order = require("../models/Orders");
const sendEmailNotification =  require("../utils/sendNotifications")

const savePayment = async (
  orderId,
  customerId,
  status,
  processor,
  amount,
  taxes,
  plateformFee,
  discount,
  tip,
  paymethod,
  promoCodeDiscount,
  bags
) => {
  try {
    let user = await User.findOne({ _id: customerId });

    let paymentMethod = user.paymentMethod.find(
      (method) => method.methodId == paymethod
    );
    const newPayment = new Payment({
      orderId,
      customerId,
      status,
      processor,
      amount,
      taxes,
      plateformFee,
      discount,
      tip,
      paymentMethod,
      promoCodeDiscount,
      bags,
    });
    let data = await newPayment.save();

    // Email should user details, purchased item details (eg. subscription, fee, etc) and transaction details

    // let user = await User.findOne({ _id: customerId });
    let itemdetails = await Order.findOne({ _id: orderId });

    let msg = {
      title: `<strong>Your Hero Status has been changed</strong>`,
      body:
        `<h6 style="margin-top:20px;margin-bottom:20px;padding:20px 0px;font-weight:400;text-align:center">  A new payment has been done to Laundry Hero for orderId: ${orderId} See the details Below : </h6>` +
        `<table>` +
        `<tr> ` +
        `   <th>User Id</th>` +
        `   <th>User Name</th>` +
        `   <th>User Email</th>` +
        `   <th>User Phone</th>` +
        ` </tr>` +
        ` <tr>` +
        `   <td>${customerId}</td>` +
        `   <td>${user.firstName}</td>` +
        `   <td>${user.email}</td>` +
        `   <td>${user.phone}</td>` +
        ` </tr> ` +
        `</table>` +
        `<table>` +
        `<tr> ` +
        `   <th>Order Id</th>` +
        `   <th>Order Delivery Date </th>` +
        `   <th>Hero Id</th>` +
        `   <th>Bags</th>` +
        `   <th>Address</th>` +
        ` </tr>` +
        ` <tr>` +
        `   <td>${itemdetails?._id}</td>` +
        `   <td>${itemdetails?.orderDeliveryDate}</td>` +
        `   <td>${itemdetails?.hero}</td>` +
        `   <td>${itemdetails?.bags}</td>` +
        `   <td>${itemdetails?.address}</td>` +
        ` </tr> ` +
        `</table>` +
        `<table>` +
        `<tr> ` +
        `   <th>Payment Id</th>` +
        `   <th>Payment Status </th>` +
        `   <th>Platform Fee</th>` +
        `   <th>Taxes</th>` +
        `   <th>Total Amount</th>` +
        ` </tr>` +
        ` <tr>` +
        `   <td>${data?._id}</td>` +
        `   <td>${data?.status}</td>` +
        `   <td>$ ${data?.plateformFee}</td>` +
        `   <td>$ ${data?.taxes}</td>` +
        `   <td>$ ${data?.amount}</td>` +
        ` </tr> ` +
        `</table>` +
        `<br><br></br></br><h6><i>For any further query, contact our support team.</i> <br><br></br></br> Thanks <br><br></br></br> Have a Great Day!</h6>`,
    };
    // const admins = await User.find({ role: "ADMINISTRATOR" });
    // admins.forEach((ind) => {
    //   delete ind.email
    //   ind.email = "rakesh123@yopmail.com"
    //   sendEmailNotification(ind, msg);
    // });

    return data;
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = { savePayment };
