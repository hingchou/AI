"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";

import Crumb from "./crumb";
import Markdown from "@/components/markdown";
import { Post } from "@/types/post";
import moment from "moment";
import { isContentComplete, titleContentMatchScore } from "@/lib/blogValidation";

export default function BlogDetail({ post }: { post: Post }) {
  const completeness = isContentComplete(post.content);
  const matchScore = titleContentMatchScore(post.title, post.content);
  return (
    <section className="py-16">
      <div className="container">
        <Crumb post={post} />
        <h1 className="mb-7 mt-9 max-w-3xl text-2xl font-bold md:mb-10 md:text-4xl">
          {post.title}
        </h1>
        {matchScore < 0.2 && (
          <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
            文章内容可能与标题不完全匹配，请谨慎阅读。
          </div>
        )}
        <div className="flex items-center gap-3 text-sm md:text-base">
          {post.author_avatar_url && (
            <Avatar className="h-8 w-8 border">
              <AvatarImage
                src={post.author_avatar_url}
                alt={post.author_name}
              />
            </Avatar>
          )}
          <div>
            {post.author_name && (
              <a href="javascript:void(0)" className="font-medium">
                {post.author_name}
              </a>
            )}

            <span className="ml-2 text-muted-foreground">
              on {post.created_at && moment(post.created_at).fromNow()}
            </span>
          </div>
        </div>
        <div className="relative mt-0 grid max-w-screen-xl gap-4 lg:mt-0 lg:grid lg:grid-cols-12 lg:gap-6">
          <div className="order-2 lg:order-none lg:col-span-8">
            {completeness.ok ? (
              <Markdown content={post.content!} />
            ) : (
              <div className="rounded-md border border-muted bg-muted/20 p-4 text-sm text-muted-foreground">
                文章内容暂不可用或不完整（{completeness.reason}）。请稍后再试，或返回博客列表浏览其他内容。
              </div>
            )}
          </div>
          <div className="order-1 flex h-fit flex-col text-sm lg:sticky lg:top-8 lg:order-none lg:col-span-3 lg:col-start-10 lg:text-xs"></div>
        </div>
      </div>
    </section>
  );
}
