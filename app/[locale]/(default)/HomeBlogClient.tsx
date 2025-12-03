"use client";

import { useMemo } from "react";
import Blog from "@/components/blocks/blog";
import { Blog as BlogType, BlogItem } from "@/types/blocks/blog";
import { useTranslations } from "next-intl";

export default function HomeBlogClient({ locale }: { locale: string }) {
  const t = useTranslations();

  const items: BlogItem[] = useMemo(
    () => [
      {
        title: "提示词工程：从描述到高质量壁纸",
        description:
          "如何结构化提示词（主题/风格/构图/光影/负面词），并结合参考图与ControlNet提升一致性。",
        slug: "prompt-engineering-wallpaper",
        locale,
      },
      {
        title: "分辨率与细节：SDXL生成的后处理技巧",
        description:
          "用超分（Real-ESRGAN）与分块渲染提升4K细节，避免过度锐化与噪点伪影。",
        slug: "sdxl-upscaling-workflow-4k-wallpapers",
        locale,
      },
      {
        title: "手机竖屏壁纸适配：构图与安全区域",
        description:
          "为iPhone/Android竖屏设定尺寸与居中主体，注意状态栏与导航栏的安全区域裁剪。",
        slug: "mobile-wallpaper-composition-safe-zones-guide",
        locale,
      },
      {
        title: "赛博朋克风：色彩与材质的进阶指南",
        description:
          "霓虹蓝紫与对比红搭配，结合雨夜与反射材质；控制杂乱度以保留图标可读性。",
        slug: "cyberpunk-aesthetic-guide-colors-materials",
        locale,
      },
      {
        title: "自然风景壁纸：光影层次与空间感",
        description:
          "黄金时刻、体积光与深度控制打造层次分明的前景/中景/远景。",
        slug: "nature-landscape-wallpaper-lighting-depth-guide",
        locale,
      },
      {
        title: "极简风壁纸：留白、色块与低刺激配色",
        description:
          "低饱和色块与规则几何，保留图标留白区；降低CFG避免过度细节破坏简洁。",
        slug: "minimalist-wallpaper-negative-space-color-psychology",
        locale,
      },
      {
        title: "动漫风壁纸：风格一致性与负面词",
        description:
          "使用LoRA保持角色风格一致，负面提示过滤lowres/blurry/watermark等伪影。",
        slug: "anime-wallpaper-style-consistency-negative-prompts",
        locale,
      },
      {
        title: "暗色模式壁纸：对比度与噪点管理",
        description:
          "暗色背景控制噪点与颗粒，加入柔光提升可读性，避免大片纯黑。",
        slug: "dark-mode-wallpaper-oled-contrast-noise-guide",
        locale,
      },
      {
        title: "色彩理论在壁纸中的应用",
        description:
          "用互补色提升冲击力、类似色保持氛围统一；明确主色与强调色。",
        slug: "color-theory-wallpaper-psychology-guide",
        locale,
      },
      {
        title: "批量生成工作流：参数化与模板化",
        description:
          "将主题、风格与尺寸参数化，建立提示模板库，实现多变体批量生成。",
        slug: "batch-generation-workflow-parameterization-templates",
        locale,
      },
    ],
    [locale]
  );

  const blog: BlogType = {
    name: "home-blog",
    title: t("blog.title"),
    description: t("blog.description"),
    read_more_text: t("blog.read_more_text"),
    items,
  };

  return <Blog blog={blog} />;
}
