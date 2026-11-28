// Build command on Vercel (npm runs "vercel-build" instead of "build" there).
// Production deployments first bring the database schema up to date with
// `prisma db push`. Preview deployments never touch the database, so an
// unmerged branch cannot change production data.
//
// No --accept-data-loss: if a change would delete data, Prisma stops, the
// build fails and the live version keeps running. Such a change needs a
// deliberate manual step.

import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

/**
 * The commands to run for this environment, in order.
 * @param {Record<string, string | undefined>} env
 * @returns {Array<[string, string[]]>}
 */
export function buildSteps(env = process.env) {
  const steps = [];
  if (env.VERCEL_ENV === 'production') {
    steps.push(['npx', ['prisma', 'db', 'push', '--skip-generate']]);
  }
  steps.push(['npm', ['run', 'build']]);
  return steps;
}

function run([command, args]) {
  console.log(`> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  buildSteps().forEach(run);
}
