import React from 'react';
import formatPrice from '../utils/currency';

const BillSummary = ({ items = [], deliveryFee = 2.5, showCTA = true, ctaLabel = 'Proceed', onCta }) => {
  const subtotal = items.reduce((s, it) => s + (it.dish?.price || it.price || 0) * (it.quantity || 1), 0);
  const tax = +(subtotal * 0.05).toFixed(2); // simple 5% tax
  const total = +(subtotal + tax + deliveryFee).toFixed(2);

  return (
    <aside className="bg-white rounded-lg shadow p-6 sticky top-6">
      <h3 className="text-lg font-semibold mb-4">Bill Summary</h3>
      <div className="text-sm text-gray-600 space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (5%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>{formatPrice(deliveryFee)}</span>
        </div>
      </div>

      <div className="border-t pt-3 mt-3 flex items-center justify-between">
        <span className="font-bold">Total</span>
        <span className="text-xl font-extrabold">{formatPrice(total)}</span>
      </div>

      {showCTA && (
        <button onClick={onCta} className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {ctaLabel}
        </button>
      )}
    </aside>
  );
};

export default BillSummary;
