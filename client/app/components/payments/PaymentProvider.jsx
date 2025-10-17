"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export const PaymentProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState(null);

  const createPaymentIntent = async (bookingData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPayment = async (paymentIntentId, paymentMethodId) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          paymentMethodId
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFees = (subtotal) => {
    const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;
    const paymentProcessingFee = Math.round(subtotal * 0.03 * 100) / 100;
    const total = subtotal + serviceFee + paymentProcessingFee;
    
    return {
      subtotal,
      serviceFee,
      paymentProcessingFee,
      total: Math.round(total * 100) / 100
    };
  };

  const value = {
    isLoading,
    paymentMethods,
    defaultPaymentMethod,
    createPaymentIntent,
    confirmPayment,
    calculateFees,
    setDefaultPaymentMethod
  };

  return (
    <PaymentContext.Provider value={value}>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </PaymentContext.Provider>
  );
};
