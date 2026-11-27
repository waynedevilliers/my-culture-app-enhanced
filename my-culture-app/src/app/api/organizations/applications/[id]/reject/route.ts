// POST /api/organizations/applications/:id/reject (super admin).

import { decideApplication } from '@/lib/applications';
import { RejectSchema } from '@/lib/schemas/organization';
import { readJson, validationError } from '@/lib/route-errors';

type Context = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: Context) {
  const parsed = RejectSchema.safeParse((await readJson(req)) ?? {});
  if (!parsed.success) return validationError(parsed.error);

  return decideApplication(req, (await context.params).id, {
    status: 'rejected',
    rejectionNotes: parsed.data.rejectionNotes,
  });
}
