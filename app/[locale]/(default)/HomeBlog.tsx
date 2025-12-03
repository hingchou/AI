import Blog from "@/components/blocks/blog";
import { Blog as BlogType, BlogItem } from "@/types/blocks/blog";
import { getPostsByLocale } from "@/models/post";
import { getTranslations } from "next-intl/server";
import { zhStaticPosts } from "@/lib/staticPosts";

export default async function HomeBlog({
  locale,
}: {
  locale: string;
}) {
  const t = await getTranslations();

  let items: BlogItem[] = [];
  try {
    const posts = await getPostsByLocale(locale, 1, 10);
    items = posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      author_name: p.author_name,
      author_avatar_url: p.author_avatar_url,
      created_at: p.created_at,
      locale: p.locale,
      cover_url: p.cover_url,
    }));
  } catch (_) {}

  if (!items || items.length === 0) {
    items = zhStaticPosts.map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      locale: p.locale,
    }));
  }

  const blog: BlogType = {
    name: "home-blog",
    title: t("blog.title"),
    description: t("blog.description"),
    read_more_text: t("blog.read_more_text"),
    items,
  };

  return <Blog blog={blog} />;
}
