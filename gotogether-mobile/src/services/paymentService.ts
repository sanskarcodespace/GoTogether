import api from './api';

export const paymentService = {
  createOrder: async (amountInPaise: number, rideId: string) => {
    const response = await api.post('/payments/create-order', { amountInPaise, rideId });
    return response.data.data;
  },
  
  verifyPayment: async (paymentData: any, rideId: string) => {
    const response = await api.post('/payments/verify', { ...paymentData, rideId });
    return response.data.data;
  }
};
