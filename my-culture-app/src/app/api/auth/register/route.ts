// POST /api/auth/register
import { register } from "../controller";

export async function POST(req: Request) {
  return register(req as any);
}
