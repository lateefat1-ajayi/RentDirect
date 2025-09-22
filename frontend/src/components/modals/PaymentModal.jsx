import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { FaCreditCard, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { apiFetch } from '../../lib/api';

export default function PaymentModal({ isOpen, onClose, lease, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    email: '',
    amount: '',
    reference: '',
    callback_url: '',
    public_key: ''
  });

  useEffect(() => {
    if (isOpen && lease) {
      // Initialize payment data
      setPaymentData({
        email: lease.tenant?.email || '',
        amount: (lease.rentAmount * 100).toString(), // Convert to kobo
        reference: `RENT_${lease._id}_${Date.now()}`,
        callback_url: `${window.location.origin}/payment/callback`,
        public_key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
      });
    }
  }, [isOpen, lease]);

  const handlePayment = async () => {
    if (!paymentData.email || !paymentData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Initialize payment with Paystack inline popup
      const handler = window.PaystackPop.setup({
        key: paymentData.public_key,
        email: paymentData.email,
        amount: parseInt(paymentData.amount),
        currency: 'NGN',
        ref: paymentData.reference,
        callback: function(response) {
          // Payment successful
          console.log('Payment successful:', response);
          toast.success('Payment successful!');
          onSuccess(response);
          onClose();
        },
        onClose: function() {
          // Payment cancelled
          console.log('Payment cancelled');
          toast.info('Payment cancelled');
          setLoading(false);
        }
      });
      
      handler.openIframe();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initialize payment');
      setLoading(false);
    }
  };

  if (!lease) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Details" size="lg">
      <div className="space-y-4">
        {/* Property Information */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Property Details</h3>
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Property:</span> {lease.property?.title}</p>
            <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Location:</span> {lease.property?.location}</p>
            <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Rent Amount:</span> ₦{lease.rentAmount?.toLocaleString()}</p>
            <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Lease Period:</span> {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-lg mb-2 text-blue-900 dark:text-blue-100">Payment Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Rent Amount:</span>
              <span className="font-medium text-gray-900 dark:text-white">₦{lease.rentAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Platform Fee (5%):</span>
              <span className="font-medium text-gray-900 dark:text-white">₦{Math.round(lease.rentAmount * 0.05).toLocaleString()}</span>
            </div>
            <div className="border-t border-blue-300 dark:border-blue-700 pt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900 dark:text-blue-100">Total Amount:</span>
                <span className="font-bold text-blue-900 dark:text-blue-100">₦{lease.rentAmount?.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              Note: The platform fee is included in the rent amount. The landlord receives 95% of the payment.
            </p>
          </div>
        </div>

        {/* Payment Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              value={paymentData.email}
              onChange={(e) => setPaymentData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount (₦)
            </label>
            <input
              type="text"
              value={(parseInt(paymentData.amount) / 100).toLocaleString()}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Amount is fixed based on your lease agreement</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reference
            </label>
            <input
              type="text"
              value={paymentData.reference}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            />
          </div>
        </div>

        {/* Payment Button */}
        <div className="flex space-x-3">
          <Button
            onClick={handlePayment}
            disabled={loading || !paymentData.email}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaCreditCard />
                Pay ₦{lease.rentAmount?.toLocaleString()}
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-6"
          >
            <FaTimes />
          </Button>
        </div>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <p>🔒 Your payment is secured by Paystack</p>
          <p>We never store your card details</p>
        </div>
      </div>
    </Modal>
  );
}
