import { PostStatus, findPostBySlug } from "@/models/post";
import { findStaticPost } from "@/lib/staticPosts";

import BlogDetail from "@/components/blocks/blog-detail";
import Empty from "@/components/blocks/empty";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const t = await getTranslations();

  const post = (await findPostBySlug(params.slug, params.locale)) ||
    findStaticPost(params.locale, params.slug);

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/posts/${params.slug}`;

  if (params.locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${params.locale}/posts/${params.slug}`;
  }

  return {
    title: post?.title,
    description: post?.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const post = (await findPostBySlug(params.slug, params.locale)) ||
    findStaticPost(params.locale, params.slug);

  if (!post || ("status" in post && post.status !== PostStatus.Online)) {
    return <Empty message="Post not found" />;
  }

  return <BlogDetail post={post} />;
}
