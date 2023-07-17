const Payout = require("../models/Payout");
const Hero = require("../models/Heros");
const User = require("../models/Users");
const Order = require("../models/Orders");

const savePayout = async (orderId, heroId, status, amount, plateformFee) => {
  try {
    const newPayout = new Payout({
      orderId,
      heroId,
      status,
      amount,
      plateformFee,
    });

    let data = await newPayout.save();

    let user = await User.findOne({ _id: heroId });
    let itemdetails = await Order.findOne({ _id: orderId });

    let msg = {
      title: `<strong>Your Hero Status has been changed</strong>`,
      body:
        `<h6 style="margin-top:20px;margin-bottom:20px;padding:20px 0px;font-weight:400;text-align:center">  A new Payout has been done to Laundry Hero for orderId: ${orderId} See the details Below : </h6>` +
        `<table>` +
        `<tr> ` +
        `   <th>Hero Id</th>` +
        `   <th>Hero Name</th>` +
        `   <th>Hero Email</th>` +
        `   <th>Hero Phone</th>` +
        ` </tr>` +
        ` <tr>` +
        `   <td>${heroId}</td>` +
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
        `   <th>Payout Id</th>` +
        `   <th>Payout Status </th>` +
        `   <th>Platform Fee</th>` +
        `   <th>Total Amount</th>` +
        ` </tr>` +
        ` <tr>` +
        `   <td>${data?._id}</td>` +
        `   <td>${data?.status}</td>` +
        `   <td>$ ${data?.plateformFee}</td>` +
        `   <td>$ ${data?.amount}</td>` +
        ` </tr> ` +
        `</table>` +
        `<br><br></br></br><h6><i>For any further query, contact our support team.</i> <br><br></br></br> Thanks <br><br></br></br> Have a Great Day!</h6>`,
    };
    const admins = await User.find({ role: "ADMINISTRATOR" });
    admins.forEach((ind) => {
      sendEmailNotification(ind, msg);
    });

    return data;
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = { savePayout };
