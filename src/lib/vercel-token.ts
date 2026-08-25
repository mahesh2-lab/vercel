/**
 * Shim: re-exports token-storage under the legacy `vercel-token` name.
 * Many files import `getCachedVercelToken` from this module.
 */
export { getToken as getCachedVercelToken } from './token-storage';
