"use client";
import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { usePayment } from './PaymentProvider';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

export function PaymentForm({ bookingData, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const { calculateFees, isLoading } = usePayment();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const fees = calculateFees(bookingData.subtotal);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setPaymentError(error.message);
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          paymentMethodId: paymentMethod.id
        })
      });

      const { clientSecret } = await response.json();

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret);

      if (confirmError) {
        setPaymentError(confirmError.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        setPaymentSuccess(true);
        onSuccess(paymentIntent);
      }
    } catch (error) {
      setPaymentError('An unexpected error occurred. Please try again.');
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <Card className="p-8 rounded-3xl border-border/40 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-4">
          Your booking has been confirmed. You'll receive a confirmation email shortly.
        </p>
        <Button 
          onClick={() => window.location.href = '/dashboard'}
          className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500"
        >
          View Booking
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-3xl border-border/40">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-pink-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Payment Details</h3>
          <p className="text-sm text-muted-foreground">Secure payment powered by Stripe</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-4 mb-6">
        <h4 className="font-semibold mb-3">Booking Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Chef: {bookingData.chefName}</span>
            <span>R{bookingData.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Event Date: {bookingData.eventDate}</span>
            <span>{bookingData.partySize} guests</span>
          </div>
          <div className="flex justify-between">
            <span>Service Fee (5%)</span>
            <span>R{fees.serviceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Processing (3%)</span>
            <span>R{fees.paymentProcessingFee.toLocaleString()}</span>
          </div>
          <div className="border-t border-border/40 pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>R{fees.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Card Information</label>
          <div className="border border-border/40 rounded-2xl p-4">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        {paymentError && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-500/10 border border-red-200/20">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500">{paymentError}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        <Button
          type="submit"
          disabled={!stripe || isProcessing || isLoading}
          className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
        >
          {isProcessing ? 'Processing...' : `Pay R${fees.total.toLocaleString()}`}
        </Button>
      </form>
    </Card>
  );
}
