'use client';

// React Router compatibility layer on top of Next.js navigation.
// Lets the components moved from the Vite app keep their markup and
// behaviour unchanged. New code should use next/link and next/navigation
// directly; this file can go once the moved components are converted.

import NextLink from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
import {
  forwardRef,
  useEffect,
  type ComponentProps,
  type ReactNode,
} from 'react';

type AnchorProps = Omit<ComponentProps<'a'>, 'href' | 'className' | 'children'>;

/**
 * React Router's NavLink matching: active when the path equals `to`, or
 * (unless `end`) when it continues below `to`. "/" matches only itself,
 * because the next character after "/" is never "/".
 */
export function isPathActive(
  pathname: string,
  to: string,
  end = false
): boolean {
  const target = to.length > 1 && to.endsWith('/') ? to.slice(0, -1) : to;
  if (pathname === target) return true;
  if (end) return false;
  return pathname.startsWith(target) && pathname.charAt(target.length) === '/';
}

interface LinkProps extends AnchorProps {
  to: string;
  replace?: boolean;
  className?: string;
  children?: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, ...props },
  ref
) {
  return <NextLink ref={ref} href={to} replace={replace} {...props} />;
});

type ActiveState = { isActive: boolean; isPending: boolean };

interface NavLinkProps extends AnchorProps {
  to: string;
  end?: boolean;
  replace?: boolean;
  className?: string | ((state: ActiveState) => string | undefined);
  style?: ComponentProps<'a'>['style'];
  children?: ReactNode | ((state: ActiveState) => ReactNode);
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  function NavLink({ to, end, replace, className, children, ...props }, ref) {
    const pathname = usePathname() ?? '/';
    const state: ActiveState = {
      isActive: isPathActive(pathname, to, end),
      isPending: false,
    };
    const resolvedClassName =
      typeof className === 'function' ? className(state) : className;

    return (
      <NextLink
        ref={ref}
        href={to}
        replace={replace}
        className={resolvedClassName || undefined}
        aria-current={state.isActive ? 'page' : undefined}
        {...props}
      >
        {typeof children === 'function' ? children(state) : children}
      </NextLink>
    );
  }
);

type NavigateOptions = { replace?: boolean };

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options: NavigateOptions = {}) => {
    if (typeof to === 'number') {
      if (to < 0) router.back();
      else router.forward();
      return;
    }
    if (options.replace) router.replace(to);
    else router.push(to);
  };
}

export function useParams<
  T extends Record<string, string> = Record<string, string>,
>(): T {
  return (useNextParams() ?? {}) as T;
}

export function useSearchParams(): [
  URLSearchParams,
  (next: URLSearchParams | Record<string, string>) => void,
] {
  const searchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? '/';

  const setSearchParams = (next: URLSearchParams | Record<string, string>) => {
    const query = new URLSearchParams(
      next as Record<string, string>
    ).toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return [new URLSearchParams(searchParams?.toString() ?? ''), setSearchParams];
}

export function Navigate({
  to,
  replace = false,
}: {
  to: string;
  replace?: boolean;
}) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}
