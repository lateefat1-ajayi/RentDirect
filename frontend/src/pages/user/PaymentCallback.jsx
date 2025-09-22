import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');

    if (!reference && !trxref) {
      setStatus('error');
      setMessage('No payment reference found');
      return;
    }

    const paymentRef = reference || trxref;
    verifyPayment(paymentRef);
  }, [searchParams]);

  const verifyPayment = async (reference) => {
    try {
      const response = await apiFetch(`/payments/verify/${reference}`);
      
      if (response.payment && response.payment.status === 'success') {
        setStatus('success');
        setMessage('Payment completed successfully! Your lease is now active.');
        toast.success('Payment completed successfully!');
      } else {
        setStatus('error');
        setMessage('Payment verification failed. Please contact support if you were charged.');
        toast.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
      setMessage('Payment verification failed. Please contact support if you were charged.');
      toast.error('Payment verification failed');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <FaSpinner className="animate-spin text-blue-500" size={48} />;
      case 'success':
        return <FaCheckCircle className="text-green-500" size={48} />;
      case 'error':
        return <FaTimesCircle className="text-red-500" size={48} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'verifying':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          
          <h1 className={`text-2xl font-bold ${getStatusColor()}`}>
            {status === 'verifying' && 'Verifying Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'error' && 'Payment Failed'}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>

          {status === 'success' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 w-full">
              <p className="text-green-800 dark:text-green-200 text-sm">
                🎉 Congratulations! Your lease is now active. You can now access your property.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 w-full">
              <p className="text-red-800 dark:text-red-200 text-sm">
                If you were charged but see this error, please contact our support team with your payment reference.
              </p>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <Button
              onClick={() => navigate('/user/applications')}
              variant="outline"
              className="flex-1"
            >
              View Applications
            </Button>
            
            {status === 'success' && (
              <Button
                onClick={() => navigate('/user/leases')}
                className="flex-1"
              >
                View Lease
              </Button>
            )}
            
            {status === 'error' && (
              <Button
                onClick={() => navigate('/user/applications')}
                className="flex-1"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
