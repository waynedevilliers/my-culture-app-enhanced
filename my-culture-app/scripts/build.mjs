// `npm run build`, also on Vercel (its Build Command is "npm run build").
// Production deployments first bring the database schema up to date with
// `prisma db push`. Preview deployments, CI and local builds never touch
// the database through this step, so an unmerged branch cannot change
// production data.
//
// No --accept-data-loss: if a change would delete data, Prisma stops, the
// build fails and the live version keeps running. Such a change needs a
// deliberate manual step.

import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

/**
 * The commands to run for this environment, in order.
 * @param {Record<string, string | undefined>} env
 * @returns {Array<[string, string[], Record<string, string>?]>}
 */
export function buildSteps(env = process.env) {
  /** @type {Array<[string, string[], Record<string, string>?]>} */
  const steps = [];
  if (env.VERCEL_ENV === 'production') {
    // Schema changes over a direct connection when there is one (Neon sets
    // DATABASE_URL_UNPOOLED); elsewhere DATABASE_URL is used as it is.
    const direct = env.DATABASE_URL_UNPOOLED;
    steps.push([
      'npx',
      ['prisma', 'db', 'push', '--skip-generate'],
      ...(direct ? [{ DATABASE_URL: direct }] : []),
    ]);
  }
  steps.push(['npx', ['prisma', 'generate']]);
  steps.push(['npx', ['next', 'build']]);
  return steps;
}

function run([command, args, envOverride]) {
  console.log(`> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: { ...process.env, ...envOverride },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  buildSteps().forEach(run);
}
