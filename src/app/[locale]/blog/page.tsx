import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { SiteNav } from "@/components/SiteNav";
import type { Locale } from "@/lib/queries";
import { getBlogPosts } from "@/lib/queries";
import { IconArrowRight } from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function BlogIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const t = await getTranslations();
  const posts = await getBlogPosts(true, rawLocale as Locale);

  return (
    <main>
      <SiteNav />
      <section className="page-hero page-hero-nav">
        <div className="container">
          <span className="eyebrow eyebrow-light">{t("blog.title")}</span>
          <h1>{t("blog.title")}</h1>
          <p>{t("blog.subtitle")}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {posts.length === 0 ? (
            <div className="empty">{t("blog.noArticles")}</div>
          ) : (
            <div className="blog-grid">
              {posts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="reveal blogcard">
                  <div className="blogcard-img">
                    <Image src={p.cover ?? "/logo.jpg"} alt={p.title} fill sizes="(max-width:768px) 100vw, 360px" style={{ objectFit: "cover" }} />
                    {p.category_name && <span className="blogcard-cat">{p.category_name}</span>}
                  </div>
                  <div className="blogcard-body">
                    <h3>{p.title}</h3>
                    {p.excerpt && <p>{p.excerpt}</p>}
                    <span className="blogcard-more">{t("blog.readMore")} <IconArrowRight width={15} height={15} /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
