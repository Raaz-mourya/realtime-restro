import { loadStripe } from "@stripe/stripe-js";
import { placeOrder } from "./apiService";
import { CardWidget } from "./CardWidget";

export async function initStripe() {
  const stripe = await loadStripe(
    "pk_test_51OjH7tSG82MYjw5KqUPSjM8kddzkh55uv75JvF6m3VIEVva6kj8obCWGj3gTvonrRHPfbGTsGg52VUw8Wlz42dgh006h26hJUb"
  );

  let card = null;

  // Payment card input field box show
  const paymentType = document.querySelector("#paymentType");
  if (!paymentType) {
    return;
  }
  paymentType.addEventListener("change", (e) => {
    if (e.target.value === "card") {
      // Display widget
      card = new CardWidget(stripe);
      card.mount();
    } else {
      card.destroy();
    }
  });

  // AJAX call for order placed
  const paymentForm = document.querySelector("#payment-form");

  if (paymentForm) {
    paymentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      let formData = new FormData(paymentForm);
      let formObject = {};
      for (let [key, value] of formData.entries()) {
        formObject[key] = value;
      }

      if (!card) {
        // Ajax call without card detail
        placeOrder(formObject);
        return;
      }

      const token = await card.createToken();
      formObject.stripeToken = token.id;
      placeOrder(formObject);

      // Verify card details
      // await stripe
      //   .createToken(card)
      //   .then((result) => {
      //     formObject.stripeToken = result.token.id;
      //     placeOrder(formObject);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   });
    });
  }
}
