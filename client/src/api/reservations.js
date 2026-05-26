import { api } from './client';

export const createReservation = async ({ inventoryId, quantity }) => {
  const { data } = await api.post('/api/reservations', { inventoryId, quantity });
  return data.reservation;
};

export const confirmReservation = async (id) => {
  const { data } = await api.post(`/api/reservations/${id}/confirm`);
  return data.reservation;
};

export const releaseReservation = async (id) => {
  const { data } = await api.post(`/api/reservations/${id}/release`);
  return data.reservation;
};
