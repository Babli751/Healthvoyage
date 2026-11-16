import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { getBlogPostBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getBlogPostBySlug(slug, locale as "en"|"ru"|"az");
  if (!post) return { title: "Article — HealthVoyage" };
  return {
    title: post.meta_title || `${post.title} — HealthVoyage`,
    description: post.meta_description || post.excerpt || undefined,
    keywords: post.keywords || undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const tx = await getTranslations();
  const post = await getBlogPostBySlug(slug, locale as "en"|"ru"|"az");
  if (!post || !post.published) notFound();

  return (
    <main>
      <SiteNav />
      <article className="post">
        <div className="post-hero">
          {post.cover && <Image src={post.cover} alt={post.title} fill priority sizes="100vw" style={{ objectFit: "cover" }} />}
          <div className="post-hero-shade" />
          <div className="container post-hero-inner">
            <div className="breadcrumb breadcrumb-light">
              <Link href="/">{tx("nav.home")}</Link> / <Link href="/blog">{tx("nav.blog")}</Link> / {post.category_name ?? ""}
            </div>
            <h1>{post.title}</h1>
            <p className="post-date">{new Date(post.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>

        <div className="container post-body">
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.body }} />
          <div className="post-foot">
            <Link href="/blog" className="showcase-link">{tx("blog.allArticles")}</Link>
            <Link href="/contact" className="btn">{tx("blog.requestConsultation")}</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
