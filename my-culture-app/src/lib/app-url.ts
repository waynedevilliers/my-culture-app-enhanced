/** Base URL for links in emails: APP_URL, else the request's own origin. */
export function appUrl(req: Request): string {
  return (process.env.APP_URL || new URL(req.url).origin).replace(/\/+$/, '');
}
