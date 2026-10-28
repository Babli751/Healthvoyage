"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [newInquiries, setNewInquiries] = useState(0);

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    fetch("/api/admin/new-inquiries")
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((d) => setNewInquiries(d.count ?? 0))
      .catch(() => {});
  }, [isLogin, pathname]);

  if (isLogin) return <>{children}</>;

  return (
    <div className="asb-shell">
      <AdminSidebar newInquiries={newInquiries} />
      <div className="asb-main">{children}</div>
    </div>
  );
}
