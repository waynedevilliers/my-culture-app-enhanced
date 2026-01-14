// POST /api/auth/login
import { login } from "../controller";

export async function POST(req: Request) {
  return login(req as any);
}
