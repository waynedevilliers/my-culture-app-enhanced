import { describe, expect, it } from 'vitest';
import { isPathActive } from '@/lib/router';

// Same rules as React Router's NavLink, which the moved components rely on
// for the orange "current page" highlight in the menus.
describe('isPathActive', () => {
  it.each([
    ['/', '/', true],
    ['/organizations', '/', false],
    ['/organizations', '/organizations', true],
    ['/organizations/3', '/organizations', true],
    ['/organizationsX', '/organizations', false],
    ['/organization/1', '/organizations', false],
    ['/dashboard/home', '/dashboard/home', true],
    ['/dashboard/events', '/dashboard/home', false],
    ['/dashboard/events', '/dashboard/', true],
  ])('pathname %s with to=%s -> %s', (pathname, to, expected) => {
    expect(isPathActive(pathname, to)).toBe(expected);
  });

  it('matches only the exact path with end', () => {
    expect(isPathActive('/dashboard/home', '/dashboard', true)).toBe(false);
    expect(isPathActive('/dashboard', '/dashboard', true)).toBe(true);
  });
});
