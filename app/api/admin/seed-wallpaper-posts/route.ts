import { respData, respErr } from "@/lib/resp";
import { insertPost, findPostBySlug, PostStatus } from "@/models/post";

function nowIso() {
  return new Date().toISOString();
}

function requireToken(req: Request) {
  const token = process.env.SEED_TOKEN;
  if (!token) {
    return { ok: false, message: "seed token not set" };
  }
  const header = req.headers.get("x-seed-token");
  if (!header || header !== token) {
    return { ok: false, message: "unauthorized" };
  }
  return { ok: true };
}

const AUTHOR_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "AI Wallpaper";
const AUTHOR_AVATAR = process.env.NEXT_PUBLIC_BRAND_AVATAR_URL || "";

type SeedPost = {
  slug: string;
  title: string;
  description: string;
  content: string;
  cover_url?: string;
};

const zhPosts: SeedPost[] = [
  {
    slug: "ai-wallpaper-keyword-guide",
    title: "AI壁纸关键词优化指南：提升搜索曝光",
    description: "围绕AI壁纸的核心关键词与长尾组合，提升站内搜索与外部曝光。",
    content: `# AI壁纸关键词优化指南\n\nAI壁纸相关的核心词包括“AI壁纸、4K壁纸、手机壁纸、桌面壁纸、Stable Diffusion壁纸”。在网页标题、描述与正文中合理布局主关键词与长尾组合，如“赛博朋克AI壁纸”“iPhone竖屏AI壁纸”。保持自然密度，避免堆砌。配合语义相关词（风格、分辨率、尺寸、下载），提升搜索可见度。`,
  },
  {
    slug: "iphone-ai-wallpaper-vertical-4k",
    title: "iPhone竖屏AI壁纸：尺寸与构图建议",
    description: "适配iPhone竖屏的AI壁纸尺寸与提示词模板，提升屏幕匹配与观感。",
    content: `# iPhone竖屏AI壁纸\n\n建议尺寸 1290×2796 或与机型分辨率等比，采用垂直构图与居中主体，避免状态栏遮挡。提示词可加入“vertical, portrait, clean background”。生成后用超分与轻微裁剪保证清晰度与边缘安全。`,
  },
  {
    slug: "desktop-4k-ai-wallpaper-setup",
    title: "桌面4K AI壁纸：分辨率与清晰度设置",
    description: "4K桌面AI壁纸的生成策略与后处理方法，确保细节与锐度。",
    content: `# 桌面4K AI壁纸\n\n建议 3840×2160 分辨率。先在较低分辨率生成构图，再用超分（Real-ESRGAN）提升细节。避免过度锐化与噪点。桌面布局应为横向宽幅，主体分布均衡，保留任务栏与图标留白区。`,
  },
  {
    slug: "anime-style-ai-wallpaper-prompts",
    title: "动漫风AI壁纸：提示词与风格标签",
    description: "面向动漫风壁纸的提示词组合与负面词清单，提升审美一致性。",
    content: `# 动漫风AI壁纸\n\n提示词可包含“anime style, cel shading, vibrant colors, clean lines”。加入负面提示词如“blurry, lowres, watermark”。若需统一角色风格，可加载LoRA并限制CFG过高导致的失真。`,
  },
  {
    slug: "landscape-ai-wallpaper-prompts",
    title: "自然风景AI壁纸：光影与层次构建",
    description: "自然风景类壁纸的光影设计与层次感提示，提升氛围。",
    content: `# 自然风景AI壁纸\n\n重点在光影对比与空间层次。提示词加入“golden hour, volumetric light, depth, wide angle”。用ControlNet深度或分割控制布局，一致化前景、中景、远景。`,
  },
  {
    slug: "cyberpunk-ai-wallpaper-guide",
    title: "赛博朋克AI壁纸：色彩与材质建议",
    description: "赛博朋克风格的色彩搭配与材质元素，打造高级质感。",
    content: `# 赛博朋克AI壁纸\n\n配色以霓虹蓝紫、对比红为主，加入反射材质与雨夜氛围。提示词如“neon glow, rain, reflective surfaces, futuristic city”。避免过度杂乱导致图标不可辨。`,
  },
  {
    slug: "minimalism-ai-wallpaper-design",
    title: "极简风AI壁纸：留白与色块设计",
    description: "极简风壁纸关注留白与稳定构图，适合工作与阅读场景。",
    content: `# 极简风AI壁纸\n\n采用低饱和色块与规律几何，保留图标区域留白。提示词“minimalism, flat color, clean background”。在SDXL中降低CFG，避免过度细节破坏简洁。`,
  },
  {
    slug: "productivity-ai-wallpaper-themes",
    title: "效率主题AI壁纸：色彩心理与场景搭配",
    description: "结合色彩心理学选择提升专注与效率的壁纸主题。",
    content: `# 效率主题AI壁纸\n\n选择低刺激配色，如蓝绿与中性灰，搭配简洁构图。加入轻微纹理增强质感但不抢眼。提示词“calm, focus, neutral palette”。`,
  },
  {
    slug: "dark-mode-ai-wallpaper-tips",
    title: "暗色模式AI壁纸：对比度与噪点控制",
    description: "暗色壁纸的对比与噪点管理，提升显示与护眼体验。",
    content: `# 暗色模式AI壁纸\n\n暗色背景易暴露噪点，控制去噪强度与纹理颗粒。加入柔和光源提高可读性，避免纯黑大片。提示词“dark mode, soft light, low noise”。`,
  },
  {
    slug: "color-theory-ai-wallpaper",
    title: "色彩理论在AI壁纸中的应用",
    description: "用互补与类似色提升壁纸的和谐度与辨识度。",
    content: `# 色彩理论应用\n\n互补色提升视觉冲击，类似色保证统一氛围。在提示词中明确主色与辅助色，如“primary color teal, accent orange”。生成后校正白平衡与对比度。`,
  },
  {
    slug: "seasonal-ai-wallpaper-collection",
    title: "季节主题AI壁纸：春夏秋冬的元素选择",
    description: "按季节选择合适的色调与元素，打造系列壁纸。",
    content: `# 季节主题AI壁纸\n\n春季建议浅色与花朵元素，夏季清爽蓝绿与海景，秋季金棕与落叶，冬季冷色与雪景。提示词包含季节关键词与材质。`,
  },
  {
    slug: "abstract-ai-wallpaper-textures",
    title: "抽象纹理AI壁纸：形态与材料的结合",
    description: "抽象类壁纸通过纹理与材料组合形成独特质感。",
    content: `# 抽象纹理AI壁纸\n\n结合纸张纹理、金属拉丝与玻璃折射，形成丰富层次。提示词“abstract, texture, metal brushed, glass refraction”。`,
  },
  {
    slug: "nature-ai-wallpaper-leaves-water",
    title: "自然元素AI壁纸：树叶与水的动感表现",
    description: "以自然元素为主题的壁纸，强调动态与宁静的平衡。",
    content: `# 自然元素AI壁纸\n\n树叶与水面可用微风与波纹表达动感，控制快门感与模糊度。提示词“gentle breeze, ripples, clarity”。`,
  },
  {
    slug: "space-ai-wallpaper-nebula-stars",
    title: "太空主题AI壁纸：星云与星空的层次",
    description: "太空类壁纸通过星云与星空层次构建宏大感。",
    content: `# 太空主题AI壁纸\n\n提示词“nebula, star field, cosmic dust, deep space”。控制噪点与伪影，适度增强对比与彩度，保持细节不破碎。`,
  },
  {
    slug: "typography-ai-wallpaper",
    title: "文字排版AI壁纸：字体与布局",
    description: "以文字为主体的壁纸，关注字体选择与层级布局。",
    content: `# 文字排版AI壁纸\n\n选择易读的无衬线或几何字体，布局遵循网格与对齐。提示词“typography poster, grid layout, sans-serif”。避免过度特效影响可读性。`,
  },
  {
    slug: "gradient-ai-wallpaper",
    title: "渐变AI壁纸：色彩过渡与噪点抑制",
    description: "渐变壁纸的平滑过渡与带宽噪点控制方法。",
    content: `# 渐变AI壁纸\n\n采用多段柔和渐变，避免带状条纹。提示词“smooth gradient, subtle, clean”。后期可加轻微纹理掩蔽条纹。`,
  },
  {
    slug: "fashion-ai-wallpaper-aesthetics",
    title: "时尚美学AI壁纸：材质与灯光",
    description: "在时尚主题下用材质与灯光塑造高级感。",
    content: `# 时尚美学AI壁纸\n\n结合丝绒、金属与柔光，强调材质细节与氛围。提示词“velvet texture, softbox lighting, premium aesthetic”。`,
  },
  {
    slug: "mobile-wallpaper-aspect-ratio",
    title: "手机壁纸纵横比：适配不同机型",
    description: "不同手机机型的纵横比与裁剪策略，避免主体被遮挡。",
    content: `# 手机壁纸纵横比\n\n常见纵横比 19.5:9、20:9。生成时采用等比竖屏分辨率，主体居中或偏上。生成后在安全区域内裁剪，避免状态栏与导航栏遮挡。`,
  },
  {
    slug: "wallpaper-licensing-commercial-use",
    title: "壁纸版权与商用：许可与合规建议",
    description: "壁纸的版权与商用许可，降低合规风险。",
    content: `# 壁纸版权与商用\n\n使用自有生成内容并附加水印或内容凭证（C2PA）。如引用他人素材需确认许可。平台分发时保留使用条款与隐私政策入口。`,
  },
  {
    slug: "wallpaper-prompt-library-starter",
    title: "AI壁纸提示词库：入门模板合集",
    description: "为常见风格提供入门提示模板，快速产出。",
    content: `# AI壁纸提示词库\n\n赛博朋克：neon glow, rain, reflective surfaces\n极简：minimalism, flat color, clean background\n自然风景：golden hour, depth, wide angle\n动漫风：anime style, vibrant colors, clean lines\n根据需要加入负面提示词防止伪影。`,
  },
];

export async function POST(req: Request) {
  try {
    const auth = requireToken(req);
    if (!auth.ok) {
      return respErr(auth.message!);
    }

    const locale = "zh";
    const created: string[] = [];
    const skipped: string[] = [];

    for (const p of zhPosts) {
      const exists = await findPostBySlug(p.slug, locale);
      if (exists) {
        skipped.push(p.slug);
        continue;
      }

      await insertPost({
        uuid: globalThis.crypto?.randomUUID?.() || undefined,
        slug: p.slug,
        title: p.title,
        description: p.description,
        content: p.content,
        created_at: nowIso(),
        updated_at: nowIso(),
        status: PostStatus.Online,
        cover_url: p.cover_url || "",
        author_name: AUTHOR_NAME,
        author_avatar_url: AUTHOR_AVATAR,
        locale: locale,
      });

      created.push(p.slug);
    }

    return respData({ created, skipped, count: created.length });
  } catch (err) {
    console.log("seed wallpaper posts failed:", err);
    return respErr("seed wallpaper posts failed");
  }
}

export async function GET(req: Request) {
  return respErr("use POST to seed wallpaper posts");
}

