const Order = require("../../../models/order");
const moment = require("moment");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

function orderController() {
  return {
    store(req, res) {
      const { phone, address, stripeToken, paymentType } = req.body;

      // validate request
      if (!phone || !address) {
        return res.status(422).json({ message: "All fields are required" });
      }

      const order = new Order({
        customerId: req.user._id,
        items: req.session.cart.items,
        phone: phone,
        address: address,
      });

      order
        .save()
        .then((result) => {
          Order.populate(
            result,
            { path: "customerId" },
            async (err, placedOrder) => {
              if (paymentType === "card") {
                // Stripe payment
                stripe.paymentIntents
                  .create({
                    amount: req.session.cart.totalPrice * 100,
                    currency: "inr",
                    customer: req.user._id,
                    payment_method_types: ["card"],
                    description: `Food order: ${placedOrder._id}`,
                  })
                  .then((status) => {
                    placedOrder.paymentStatus = true;
                    placedOrder.paymentType = paymentType;

                    // console.log(status.client_secret);

                    placedOrder
                      .save()
                      .then((ord) => {
                        // Emit
                        const eventEmitter = req.app.get("eventEmitter");
                        eventEmitter.emit("orderPlaced", ord);

                        delete req.session.cart;
                        return res.json({
                          message:
                            "Payment successful and Order placed successfully",
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  })
                  .catch((err) => {
                    console.log("strip catch payment unsuccess:" + placedOrder);

                    delete req.session.cart;
                    return res.json({
                      message: "Payment failed, You can pay at delivery time",
                    });
                  });
              } else {
                delete req.session.cart;
                return res.json({ message: "Order placed successfully" });
              }
            }
          );
        })
        .catch((err) => {
          return res.status(500).json({
            message: "Something went wrong",
          });
        });
    },

    async index(req, res) {
      const orders = await Order.find({ customerId: req.user._id }, null, {
        sort: { createdAt: -1 },
      });

      res.header(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
      );
      return res.render("customers/orders", { orders: orders, moment: moment });
    },

    async show(req, res) {
      const order = await Order.findById(req.params.id);
      // Authorize user
      if (req.user._id.toString() === order.customerId.toString()) {
        return res.render("customers/singleOrder", { order: order });
      }
      return res.redirect("/");
    },
  };
}

module.exports = orderController;
