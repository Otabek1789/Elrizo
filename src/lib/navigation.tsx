'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import NextLink from 'next/link';
import {
  useRouter as useNextRouter,
  usePathname as useNextPathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from 'next/navigation';

export function useNavigate() {
  const router = useNextRouter();
  return useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === 'number') {
        if (typeof window !== 'undefined') {
          if (to === -1) {
            window.history.back();
          } else {
            window.history.go(to);
          }
        }
        return;
      }
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router]
  );
}

export function useLocation() {
  const pathname = useNextPathname() || '/';
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearch(window.location.search || '');
    }
  }, [pathname]);

  return useMemo(
    () => ({
      pathname,
      search,
      hash: typeof window !== 'undefined' ? window.location.hash : '',
      state: null,
      key: pathname,
    }),
    [pathname, search]
  );
}

export function useParams<T extends Record<string, string | string[]> = Record<string, string>>(): T {
  const params = useNextParams();
  return (params || {}) as T;
}

export function useSearchParams(): [
  URLSearchParams,
  (
    newParams:
      | URLSearchParams
      | Record<string, any>
      | ((prev: URLSearchParams) => URLSearchParams),
    options?: { replace?: boolean }
  ) => void
] {
  const nextSearchParams = useNextSearchParams();
  const router = useNextRouter();
  const pathname = useNextPathname();

  const searchParams = useMemo(
    () => new URLSearchParams(nextSearchParams?.toString() || ''),
    [nextSearchParams]
  );

  const setSearchParams = useCallback(
    (newParams: any, options?: { replace?: boolean }) => {
      let sp: URLSearchParams;
      if (typeof newParams === 'function') {
        sp = newParams(new URLSearchParams(nextSearchParams?.toString() || ''));
      } else if (newParams instanceof URLSearchParams) {
        sp = newParams;
      } else {
        sp = new URLSearchParams(newParams);
      }
      const query = sp.toString();
      const safePath = pathname || '/';
      const url = query ? `${safePath}?${query}` : safePath;
      if (options?.replace) {
        router.replace(url, { scroll: false });
      } else {
        router.push(url, { scroll: false });
      }
    },
    [pathname, router, nextSearchParams]
  );

  return [searchParams, setSearchParams];
}

export type LinkProps = Omit<React.ComponentPropsWithoutRef<typeof NextLink>, 'href'> & {
  href?: string;
  to?: string;
  replace?: boolean;
};

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, href, children, ...props },
  ref
) {
  const targetHref = href || to || '/';
  return (
    <NextLink ref={ref} href={targetHref} {...props}>
      {children}
    </NextLink>
  );
});

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to, replace }) => {
  const router = useNextRouter();
  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, to, replace]);
  return null;
};

