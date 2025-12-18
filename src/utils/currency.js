const formatPrice = (price) => {
  const inr = Number(price);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(inr);
};

export default formatPrice;
