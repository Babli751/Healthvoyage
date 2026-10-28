import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SiteNav } from "@/components/SiteNav";
import { getBlogPosts } from "@/lib/queries";
import { IconArrowRight } from "@/components/Icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — HealthVoyage",
  description: "Guides and articles on balneology, rehabilitation and medical travel.",
};

export default async function BlogIndex() {
  const posts = await getBlogPosts(true);

  return (
    <main>
      <SiteNav />
      <section className="page-hero page-hero-nav">
        <div className="container">
          <span className="eyebrow eyebrow-light">Blog</span>
          <h1>Guides &amp; articles</h1>
          <p>Insights on balneology, rehabilitation and planning treatment abroad.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {posts.length === 0 ? (
            <div className="empty">No articles yet.</div>
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
                    <span className="blogcard-more">Read more <IconArrowRight width={15} height={15} /></span>
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
