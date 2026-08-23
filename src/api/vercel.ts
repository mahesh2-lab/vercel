import { Vercel } from '@vercel/sdk';

const token = process.env.EXPO_PUBLIC_VERCEL_TOKEN;

export const vercel = new Vercel({
  bearerToken: token || '',
});
