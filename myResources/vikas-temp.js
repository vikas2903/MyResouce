const one_data = {
  _id: 1,
  orderId: 'ORD1001',
  customer: {
    customerId: 'CUST101',
    name: 'Vikas Prasad',
    email: 'vikas@example.com',
    phone: '9876543210',
    address: { street: 'Sector 62', city: 'Noida', state: 'UP', pincode: '201301' }
  },
  products: [
    {
      productId: 'P101',
      title: 'Oversized T-Shirt',
      category: 'Fashion',
      price: 799,
      quantity: 2,
      tags: [ 'cotton', 'summer' ]
    },
    {
      productId: 'P102',
      title: 'Cargo Pants',
      category: 'Fashion',
      price: 1499,
      quantity: 1,
      tags: [ 'casual', 'streetwear' ]
    }
  ],
  payment: { method: 'UPI', status: 'Paid', transactionId: 'TXN9001' },
  shipping: { status: 'Shipped', trackingNumber: 'TRK12345' },
  coupon: { code: 'SUMMER20', discount: 200 },
  totalAmount: 2897,
  createdAt: '2026-05-01T10:00:00Z'
}




// Place this script after the button HTML.
const button = document.getElementById('bundle_addtocart');

button.addEventListener('click', function (e) {
  e.preventDefault();
  AddtoCart_FixingSpray_Foundation();
});

function AddtoCart_FixingSpray_Foundation() {
  const variantID_one = document.querySelector(
    'input[data-sticky-variant-input]'
  );

  const variantId_two = 48239750414593;


  if (!variantID_one) {
    console.error('Variant input not found.');
    return;
  }

  button.textContent = 'Adding to Cart...';
  console.log('Selected Variant:', variantID_one.value);
  console.log('Second Variant ID:', variantId_two);

  const cartData = {
    items: [
      {
        id: variantID_one.value,
        quantity: 1
      },
      {
        id: variantId_two,
        quantity: 1
      }
    ]
  };


  setTimeout(() => {
    button.textContent = 'Add to Cart';
  }, 1400);
}