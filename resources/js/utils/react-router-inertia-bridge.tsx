import React, { createContext, useContext, useEffect } from 'react';
import { Link as InertiaLink, router, usePage } from '@inertiajs/react';

// Context for rendering nested child components (simulating Outlet)
const OutletContext = createContext<React.ReactNode>(null);

export function OutletProvider({ children }: { children: React.ReactNode }) {
  return <OutletContext.Provider value={children}>{children}</OutletContext.Provider>;
}

export function Outlet() {
  const children = useContext(OutletContext);
  return <>{children}</>;
}

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> {
  to?: string;
  href?: string;
  replace?: boolean;
  state?: any;
  className?: string | ((props: { isActive: boolean }) => string);
}

export function Link({ to, href, children, className, replace, ...props }: LinkProps) {
  const target = href || to || '/';
  const computedClassName = typeof className === 'function' ? className({ isActive: false }) : className;
  
  // Handle external links or hash links
  if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('mailto:') || target.startsWith('#')) {
    return (
      <a href={target} className={computedClassName} {...(props as any)}>
        {children}
      </a>
    );
  }

  return (
    <InertiaLink href={target} className={computedClassName} replace={replace} {...(props as any)}>
      {children}
    </InertiaLink>
  );
}

export function NavLink({ to, href, children, className, ...props }: LinkProps) {
  const page = usePage();
  const target = href || to || '/';
  const isActive = page.url === target || (target !== '/' && page.url.startsWith(target));

  const computedClassName = typeof className === 'function' ? className({ isActive }) : className;

  return (
    <Link to={target} className={computedClassName} {...props}>
      {children}
    </Link>
  );
}

export function useNavigate() {
  return (to: string | number, options?: { replace?: boolean; state?: any }) => {
    if (typeof to === 'number') {
      window.history.go(to);
    } else {
      router.visit(to, {
        replace: options?.replace ?? false,
        preserveScroll: true,
      });
    }
  };
}

export function useLocation() {
  try {
    const page = usePage();
    const url = page?.url || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/');
    const [pathname, search] = url.split('?');
    return {
      pathname: pathname || '/',
      search: search ? `?${search}` : '',
      hash: typeof window !== 'undefined' ? window.location.hash : '',
      state: null,
      key: 'inertia',
    };
  } catch (e) {
    return {
      pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
      search: typeof window !== 'undefined' ? window.location.search : '',
      hash: typeof window !== 'undefined' ? window.location.hash : '',
      state: null,
      key: 'inertia',
    };
  }
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string>>(): T {
  try {
    const page = usePage();
    return (page.props as any)?.params || {} as T;
  } catch {
    return {} as T;
  }
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  useEffect(() => {
    if (to) {
      router.visit(to, { replace: replace ?? true });
    }
  }, [to, replace]);

  return null;
}

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Router({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Routes({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Route({ element }: { path?: string; element?: React.ReactNode; index?: boolean }) {
  return <>{element}</>;
}

export default {
  Link,
  NavLink,
  useNavigate,
  useLocation,
  useParams,
  Navigate,
  Outlet,
  BrowserRouter,
  Router,
  Routes,
  Route,
};
