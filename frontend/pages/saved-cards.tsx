import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/store';
import { FiCreditCard, FiPlus, FiTrash2, FiLock } from 'react-icons/fi';
import Link from 'next/link';

interface SavedCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cardType: 'visa' | 'mastercard' | 'rupay';
  isDefault: boolean;
}

export default function SavedCards() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock saved cards - in real app, this would come from API
  const [savedCards] = useState<SavedCard[]>([
    // Example: you can add mock data here for testing
  ]);

  if (!user) {
    router.push('/login');
    return null;
  }

  const getCardIcon = (cardType: string) => {
    return <FiCreditCard className="text-2xl" />;
  };

  const maskCardNumber = (cardNumber: string) => {
    const last4 = cardNumber.slice(-4);
    return `**** **** **** ${last4}`;
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FiCreditCard className="text-2xl text-ak-primary" />
            <h1 className="text-3xl font-bold">Saved Cards</h1>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus className="text-lg" />
              Add New Card
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Add New Card</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <FiLock className="inline mr-2" />
                Your card details are encrypted and securely stored. We never share your information.
              </p>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Card Number *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Card Holder Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Name as on card"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Month *</label>
                  <select className="input-field">
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Year *</label>
                  <select className="input-field">
                    <option value="">YYYY</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CVV *</label>
                <input
                  type="text"
                  className="input-field w-32"
                  placeholder="123"
                  maxLength={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="setDefault"
                  className="w-4 h-4 text-ak-primary"
                />
                <label htmlFor="setDefault" className="text-sm font-medium">
                  Set as default payment method
                </label>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">
                  Save Card
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {savedCards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FiCreditCard className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Saved Cards</h2>
            <p className="text-gray-600 mb-6">Add a card for faster checkout!</p>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              Add Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedCards.map((card) => (
              <div
                key={card.id}
                className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-lg ${
                  card.isDefault ? 'ring-2 ring-ak-primary' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {getCardIcon(card.cardType)}
                    {card.isDefault && (
                      <span className="bg-white/20 text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <button
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Remove card"
                  >
                    <FiTrash2 className="text-lg" />
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-mono tracking-wider">
                    {maskCardNumber(card.cardNumber)}
                  </p>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-white/70">Card Holder</p>
                      <p className="font-semibold">{card.cardHolder}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Expires</p>
                      <p className="font-semibold">
                        {card.expiryMonth}/{card.expiryYear}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <FiLock className="text-ak-primary" />
            Secure Payment
          </h3>
          <p className="text-sm text-gray-700">
            All card details are encrypted using 256-bit SSL encryption. We comply with PCI-DSS
            security standards to ensure your payment information is safe.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

