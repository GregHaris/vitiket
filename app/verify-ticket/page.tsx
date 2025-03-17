'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { VerificationResult } from '@/types';

export default function VerifyTicket() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [result, setResult] = useState<VerificationResult>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyTicket = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/verify-ticket?orderId=${orderId}`);
        const data = await response.json();

        if (response.ok) {
          setResult(data);
        } else {
          setError(data.error || 'Failed to verify ticket');
        }
      } catch (err) {
        setError('An error occurred while verifying the ticket');
      } finally {
        setLoading(false);
      }
    };

    verifyTicket();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex-center min-h-screen w-full flex-col gap-3 bg-gray-50">
        <p className="text-lg font-semibold">Verifying Ticket...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-center min-h-screen w-full flex-col gap-3 bg-gray-50">
        <Image
          src="/assets/icons/error.svg"
          alt="Error"
          width={50}
          height={50}
        />
        <h2 className="text-xl font-bold text-red-600">Verification Failed</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!result || !result.valid) {
    return (
      <div className="flex-center min-h-screen w-full flex-col gap-3 bg-gray-50">
        <Image
          src="/assets/icons/error.svg"
          alt="Invalid"
          width={50}
          height={50}
        />
        <h2 className="text-xl font-bold text-red-600">Invalid Ticket</h2>
        <p className="text-gray-600">This ticket could not be verified.</p>
      </div>
    );
  }

  return (
    <div className="flex-center min-h-screen w-full flex-col gap-6 bg-gray-50 p-5">
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/assets/icons/check.svg"
            alt="Valid"
            width={30}
            height={30}
          />
          <h1 className="text-2xl font-bold text-green-600">Ticket Verified</h1>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{result.event.title}</h2>
            <p className="text-sm text-gray-600">{result.event.subtitle}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Date:</p>
            <p className="text-sm text-gray-600">
              {new Date(result.event.startDate).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Location:</p>
            <p className="text-sm text-gray-600">{result.event.location}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Organizer:</p>
            <p className="text-sm text-gray-600">{result.event.organizer}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Quantity:</p>
            <p className="text-sm text-gray-600">{result.quantity}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Paid:</p>
            <p className="text-sm text-gray-600">{result.totalAmount}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Payment Method:</p>
            <p className="text-sm text-gray-600">{result.paymentMethod}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Order Date:</p>
            <p className="text-sm text-gray-600">
              {new Date(result.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
