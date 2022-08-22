import dynamic from 'next/dynamic';
import type { FunctionComponent, ReactNode } from 'react';

const Sidebar = dynamic(() => import('../Sidebar'));

type LayoutProps = {
  children: ReactNode;
  contentClassName?: string;
};

const Layout: FunctionComponent<LayoutProps> = ({ children, contentClassName }) => {
  return (
    <div className="grid grid-cols-5 gap-10">
      <Sidebar className="hidden lg:block" active={0} onClick={() => {}} /> {/* FIXME: */}
      <div className={`col-span-5 lg:col-span-4 ${contentClassName ?? ''}`}>{children}</div>
    </div>
  );
};

export default Layout;
