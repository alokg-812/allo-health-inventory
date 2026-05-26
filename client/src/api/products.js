import { api } from './client';

export const fetchProducts = async () => {
  const { data } = await api.get('/api/products');
  return data.products;
};
