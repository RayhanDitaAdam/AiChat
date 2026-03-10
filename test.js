function calculateTotal(cart) {
  let total = 0;

  for (let i = 0; i < cart.length; i++) {
    total += cart[i].price * cart[i].qty;
  }

  return total;
}

const cart = [
  { name: "Keyboard", price: 200000, qty: 1 },
  { name: "Mouse", price: 100000, qty: 2 },
  { name: "Headset", price: 300000, qty: 1 }
];

console.log(calculateTotal(cart));