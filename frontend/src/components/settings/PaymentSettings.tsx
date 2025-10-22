import { useState } from 'react';
import { toast } from 'react-toastify';
import type { User } from '../../types';

interface PaymentSettingsProps {
  user: User;
}

const PaymentSettings = ({ user }: PaymentSettingsProps) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);

  // Admin users don't need payment settings
  if (user.role === 'admin') {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Payment Settings</h2>
          <p className="text-gray-600 mt-1">Administrator account - payment settings not applicable</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0">
              👑
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Administrator Account</h3>
              <p className="text-gray-600 mb-4">
                As an administrator, you manage the platform and don't need payment methods configured. 
                Payment settings are only applicable for:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Service Providers:</strong> To receive payments for completed work</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span><strong>Clients:</strong> To pay for services they hire</span>
                </li>
              </ul>
              <p className="text-gray-600 mt-4">
                You can view and manage all platform transactions from the admin dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const savedCards = [
    {
      id: 1,
      type: 'Visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true,
    },
  ];

  const savedBanks = [
    {
      id: 1,
      bankName: 'State Bank of India',
      accountNumber: '****6789',
      ifsc: 'SBIN0001234',
      isDefault: true,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payment Settings</h2>
        <p className="text-gray-600 mt-1">
          {user.role === 'provider'
            ? 'Manage how you receive payments'
            : 'Manage payment methods for hiring providers'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Wallet Balance */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100 mb-1">Wallet Balance</p>
              <p className="text-3xl font-bold">₹0.00</p>
            </div>
            <button className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              {user.role === 'provider' ? 'Withdraw' : 'Add Money'}
            </button>
          </div>
        </div>

        {/* Payment Methods (Client) */}
        {user.role === 'client' && (
          <div className="border-b border-gray-200 pb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
              <button
                onClick={() => setShowAddCard(!showAddCard)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Card
              </button>
            </div>

            {/* Saved Cards */}
            <div className="space-y-3 mb-4">
              {savedCards.map((card) => (
                <div key={card.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💳</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {card.type} •••• {card.last4}
                      </p>
                      <p className="text-sm text-gray-600">Expires {card.expiry}</p>
                      {card.isDefault && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-700">Edit</button>
                    <button className="text-red-600 hover:text-red-700">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Card Form */}
            {showAddCard && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Name on card"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      toast.success('Card added successfully!');
                      setShowAddCard(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Card
                  </button>
                  <button
                    onClick={() => setShowAddCard(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bank Accounts (Provider) */}
        {user.role === 'provider' && (
          <div className="border-b border-gray-200 pb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Bank Accounts</h3>
              <button
                onClick={() => setShowAddBank(!showAddBank)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Bank Account
              </button>
            </div>

            {/* Saved Banks */}
            <div className="space-y-3 mb-4">
              {savedBanks.map((bank) => (
                <div key={bank.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏦</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{bank.bankName}</p>
                      <p className="text-sm text-gray-600">Account {bank.accountNumber}</p>
                      <p className="text-xs text-gray-500">IFSC: {bank.ifsc}</p>
                      {bank.isDefault && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-700">Edit</button>
                    <button className="text-red-600 hover:text-red-700">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Bank Form */}
            {showAddBank && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    placeholder="State Bank of India"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Account Number</label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                  <input
                    type="text"
                    placeholder="SBIN0001234"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                  <input
                    type="text"
                    placeholder="As per bank records"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      toast.success('Bank account added successfully!');
                      setShowAddBank(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Account
                  </button>
                  <button
                    onClick={() => setShowAddBank(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment History */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {user.role === 'provider' ? 'Earning History' : 'Payment History'}
          </h3>
          <div className="space-y-3">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">No transactions yet</p>
                  <p className="text-sm text-gray-600">
                    {user.role === 'provider'
                      ? 'Complete jobs to start earning'
                      : 'Hire providers to see payment history'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Preferences</h3>
          <div className="space-y-3">
            {user.role === 'provider' && (
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Automatic withdrawals</p>
                  <p className="text-sm text-gray-600">Auto-withdraw when balance reaches threshold</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>
            )}

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Email receipts</p>
                <p className="text-sm text-gray-600">Receive email confirmation for all transactions</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Payment notifications</p>
                <p className="text-sm text-gray-600">Get notified about payment activities</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
