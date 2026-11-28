// The Vercel build pushes the schema only for production deployments.

import { describe, expect, it } from 'vitest';
import { buildSteps } from '../scripts/vercel-build.mjs';

describe('vercel-build', () => {
  it('pushes the schema before building in production', () => {
    expect(buildSteps({ VERCEL_ENV: 'production' })).toEqual([
      ['npx', ['prisma', 'db', 'push', '--skip-generate']],
      ['npm', ['run', 'build']],
    ]);
  });

  it.each([{ VERCEL_ENV: 'preview' }, { VERCEL_ENV: 'development' }, {}])(
    'only builds for %j',
    (env) => {
      expect(buildSteps(env)).toEqual([['npm', ['run', 'build']]]);
    }
  );

  it('never accepts data loss', () => {
    const commands = JSON.stringify(buildSteps({ VERCEL_ENV: 'production' }));
    expect(commands).not.toContain('accept-data-loss');
  });
});
