// POST /api/organizations/applications/:id/approve (super admin):
// approves and publishes the organisation.

import { decideApplication } from '@/lib/applications';

type Context = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: Context) {
  return decideApplication(req, (await context.params).id, {
    status: 'approved',
  });
}
