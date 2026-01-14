// GET /api/auth/me
import { getMe } from "../controller";

export async function GET(req: Request) {
  return getMe(req as any);
}
