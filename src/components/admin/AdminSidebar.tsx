"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import {
  IconSearch, IconMapPin, IconBadge, IconMessage, IconArrowRight,
} from "@/components/Icon";

const links = [
  { name: "Dashboard", href: "/admin", icon: IconBadge, exact: true },
  { name: "Sanatoriums", href: "/admin/sanatoriums", icon: IconMapPin },
  { name: "Inquiries", href: "/admin/inquiries", icon: IconMessage },
];

export function AdminSidebar({ newInquiries = 0 }: { newInquiries?: number }) {
  const pathname = usePathname();

  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="asb">
      <div className="asb-head">
        <span className="asb-mark grad-primary"><img src="/logo-icon.jpg" alt="" width={20} height={19} /></span>
        <div>
          <div className="asb-title">HealthVoyage</div>
          <div className="asb-sub">Admin panel</div>
        </div>
      </div>

      <nav className="asb-nav">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`asb-link ${active(l.href, l.exact) ? "active" : ""}`}>
            <l.icon width={18} height={18} />
            <span>{l.name}</span>
            {l.name === "Inquiries" && newInquiries > 0 && <span className="asb-badge">{newInquiries}</span>}
          </Link>
        ))}

        <div className="asb-divider" />
        <Link href="/admin/sanatoriums/new" className="asb-link asb-link-sub">
          <IconArrowRight width={18} height={18} />
          <span>Add sanatorium</span>
        </Link>
        <Link href="/" className="asb-link asb-link-sub" target="_blank">
          <IconSearch width={18} height={18} />
          <span>View site</span>
        </Link>
      </nav>

      <form action={logoutAction} className="asb-foot">
        <button type="submit" className="asb-logout">Sign out</button>
      </form>
    </aside>
  );
}
