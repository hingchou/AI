import Blog from "@/components/blocks/blog";
import { Blog as BlogType } from "@/types/blocks/blog";
import { getPostsByLocale } from "@/models/post";
import { getTranslations } from "next-intl/server";
import { zhStaticPosts } from "@/lib/staticPosts";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations();

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/posts`;

  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/posts`;
  }

  return {
    title: t("blog.title"),
    description: t("blog.description"),
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ({ params }: { params: { locale: string } }) {
  const t = await getTranslations();

  const posts = await getPostsByLocale(params.locale);
  let items = posts;

  if (!items || items.length === 0) {
    if (params.locale === "zh") {
      items = zhStaticPosts.map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        locale: p.locale,
        cover_url: p.cover_url,
      }));
    }
  }

  const blog: BlogType = {
    title: t("blog.title"),
    description: t("blog.description"),
    items,
    read_more_text: t("blog.read_more_text"),
  };

  return <Blog blog={blog} />;
}
