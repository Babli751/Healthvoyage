import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { getBlogPostBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Article — HealthVoyage" };
  return {
    title: post.meta_title || `${post.title} — HealthVoyage`,
    description: post.meta_description || post.excerpt || undefined,
    keywords: post.keywords || undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
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
              <Link href="/">Home</Link> / <Link href="/blog">Blog</Link> / {post.category_name ?? "Article"}
            </div>
            <h1>{post.title}</h1>
            <p className="post-date">{new Date(post.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>

        <div className="container post-body">
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.body }} />
          <div className="post-foot">
            <Link href="/blog" className="showcase-link">All articles</Link>
            <Link href="/contact" className="btn">Request a consultation</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
