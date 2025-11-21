import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FiGift, FiCreditCard } from 'react-icons/fi';

export default function GiftCards() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const predefinedAmounts = [500, 1000, 2000, 3000, 5000];

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <FiGift className="text-2xl text-ak-primary" />
          <h1 className="text-3xl font-bold">Gift Cards</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="text-center mb-8">
            <FiGift className="text-6xl text-ak-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Send the Perfect Gift</h2>
            <p className="text-gray-600">Let them choose what they love</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Select Amount</label>
              <div className="grid grid-cols-5 gap-3">
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                      selectedAmount === amount
                        ? 'border-ak-primary bg-ak-primary text-white'
                        : 'border-gray-300 hover:border-ak-primary hover:bg-ak-primary/5'
                    }`}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <input
                  type="number"
                  placeholder="Enter custom amount (min ₹500)"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  className="input-field"
                  min="500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Recipient Email (Optional)</label>
              <input
                type="email"
                placeholder="Enter email to send gift card"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message (Optional)</label>
              <textarea
                placeholder="Add a personal message"
                rows={3}
                className="input-field"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FiCreditCard className="text-ak-primary" />
                How it works
              </h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Gift card will be delivered instantly to recipient's email</li>
                <li>• Valid for 365 days from purchase date</li>
                <li>• Can be used on any product on our platform</li>
                <li>• Can be combined with other offers</li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-ak-primary">
                  ₹{selectedAmount || customAmount || 0}
                </span>
              </div>
              <button
                disabled={!selectedAmount && !customAmount}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  selectedAmount || customAmount
                    ? 'btn-primary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">My Gift Cards</h3>
          <div className="text-center py-8 text-gray-500">
            <FiGift className="text-4xl mx-auto mb-2 opacity-50" />
            <p>You don't have any gift cards yet</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

