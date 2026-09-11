import { next } from '@vercel/functions';
import { access } from './server/access.mjs';
export default async function middleware(request) {
  return (
    (await access(request, process.env.ATLAS_ACCESS_PASSWORD, process.env.ATLAS_ACCESS_SECRET)) ||
    next({
      headers: { 'Cache-Control': 'private, no-store', 'Vercel-CDN-Cache-Control': 'no-store' },
    })
  );
}
