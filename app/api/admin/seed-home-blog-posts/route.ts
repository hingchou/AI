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

const AUTHOR_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "AI壁纸工坊";
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
    slug: "prompt-engineering-wallpaper",
    title: "提示词工程：从描述到高质量壁纸",
    description:
      "结构化提示词并结合参考图与ControlNet，稳定产出高质量壁纸。",
    content: `# 提示词工程：从描述到高质量壁纸\n\n## 一、为什么要结构化提示\n生成式模型对信息敏感但不擅长“补全常识”。结构化提示可以明确主题、风格和构图，显著提升一致性与质量。\n\n## 二、提示词模板\n- 主题（Subject）：壁纸主体与场景\n- 风格（Style）：极简/赛博/动漫/风景/抽象等\n- 构图（Composition）：横幅/竖屏、居中/三分、留白区域\n- 光影（Lighting）：golden hour, volumetric light, soft light\n- 细节（Detail Tags）：highly detailed, 4k, texture\n- 负面词（Negative）：lowres, blurry, watermark, oversaturated\n\n示例：\n> A minimalism wallpaper, clean background, geometric shapes, balanced composition, soft light, 4k, highly detailed, --negative lowres blurry watermark\n\n## 三、参考图与 ControlNet\n- 边缘/深度/分割/姿态四类条件可用于布局与主体控制\n- 实操流程：准备参考图→选择Control类型→设置影响强度→生成\n\n## 四、参数建议\n- 采样步数：SDXL 通常 20–40 步，LCM-LoRA 可降至 4–8\n- CFG Scale：7–9，极简风可更低以保持简洁\n- 分辨率：手机竖屏 1290×2796；桌面 3840×2160\n\n## 五、验收清单\n- 构图是否满足设备安全区域\n- 主体与风格是否一致\n- 无明显伪影与噪点\n\n## 六、常见问题\n- 过度堆叠标签导致违背风格→减少标签并提升负面词强度\n- 构图混乱→使用参考图与ControlNet固定布局\n`,
  },
  {
    slug: "sdxl-postprocess-quality",
    title: "分辨率与细节：SDXL生成的后处理技巧",
    description:
      "结合超分与分块渲染，保障4K壁纸的细节与锐度。",
    content: `# 分辨率与细节：SDXL后处理\n\n## 方案概览\n- 先小分辨率生成构图→再超分与细化\n- 分块渲染避免显存瓶颈与边缘撕裂\n\n## 超分工具\n- Real-ESRGAN：通用真实场景\n- AnimeSR：动漫线条保持更好\n\n## 分块技巧\n- 横向壁纸切分 2×2 或 3×2；重叠边界 16–32px\n- 合并后整体进行轻微锐化\n\n## 细节修复\n- 人脸/手部：专用 LoRA 或重绘局部\n- 纹理统一：降噪 + 适度锐化（避免过度）\n\n## 验收标准\n- 放大 200% 仍无严重伪影\n- 图标区域清晰可读\n`,
  },
  {
    slug: "mobile-portrait-wallpaper-fit",
    title: "手机竖屏壁纸适配：构图与安全区域",
    description:
      "针对竖屏设备的尺寸、主体位置与裁剪策略。",
    content: `# 竖屏壁纸适配\n\n## 尺寸建议\n- iPhone：1290×2796 或等比\n- Android：常见 1080×2400/1200×2640\n\n## 构图要点\n- 主体居中或偏上，保留底部图标留白\n- 避免状态栏区域过密元素\n\n## 生成与裁剪\n- 先按目标纵横比生成→再微调裁剪保证安全区\n- 使用参考框辅助预览\n\n## 验收\n- 锁屏与主屏均可读、无遮挡\n`,
  },
  {
    slug: "cyberpunk-color-material-guide",
    title: "赛博朋克风：色彩与材质的进阶指南",
    description:
      "霓虹蓝紫与对比红，结合雨夜与反射材质的构图方法。",
    content: `# 赛博朋克风指南\n\n## 色彩\n- 主色：霓虹蓝紫；强调色：红或橙\n- 控制饱和度与对比，避免难以识别图标\n\n## 材质\n- 反射金属、潮湿路面、玻璃霓虹招牌\n- 雨与雾提升氛围，体积光增强空间感\n\n## 提示示例\n> neon glow, rainy night, reflective surfaces, futuristic city, volumetric light, cinematic\n\n## 构图\n- 居中主体或对称街景，保留左右留白区\n`,
  },
  {
    slug: "landscape-light-depth",
    title: "自然风景壁纸：光影层次与空间感",
    description:
      "使用黄金时刻与体积光构造前中远景层次。",
    content: `# 自然风景壁纸\n\n## 光影\n- golden hour 提升色温与质感\n- volumetric light 形成光束与深度\n\n## 空间层次\n- 前景/中景/远景分层清晰\n- 深度或分割Control保持轮廓关系\n\n## 提示词\n> wide angle landscape, golden hour, depth, volumetric light, atmospheric perspective\n`,
  },
  {
    slug: "minimalism-wallpaper-design",
    title: "极简风壁纸：留白、色块与低刺激配色",
    description:
      "通过低饱和色块与几何构图打造舒适观感。",
    content: `# 极简风壁纸\n\n## 配色\n- 低饱和蓝绿/灰，避免强刺激\n\n## 形态\n- 规则几何，均衡布局，充足留白\n\n## 参数\n- 降低CFG，减少过度细节\n- 负面词包含 oversharpen, noisy\n`,
  },
  {
    slug: "anime-style-consistency-negative",
    title: "动漫风壁纸：风格一致性与负面词",
    description:
      "用 LoRA 保持角色风格一致，负面词滤除常见伪影。",
    content: `# 动漫风壁纸\n\n## 风格一致性\n- 角色/画风 LoRA，控制权重 0.6–0.8\n\n## 线条与颜色\n- cel shading, clean lines, vibrant colors\n\n## 负面词\n- lowres, blurry, watermark, extra fingers\n\n## 验收\n- 线条清晰、五官与手部自然\n`,
  },
  {
    slug: "dark-mode-contrast-noise",
    title: "暗色模式壁纸：对比度与噪点管理",
    description:
      "控制噪点与颗粒，使用柔光保证可读性。",
    content: `# 暗色模式壁纸\n\n## 噪点控制\n- 生成与后期降噪结合，避免大面积纯黑\n\n## 对比度\n- 局部柔光提升可读性；避免过度对比导致压缩失真\n\n## 提示词\n> dark mode, soft light, low noise, subtle texture\n`,
  },
  {
    slug: "color-theory-wallpaper",
    title: "色彩理论在壁纸中的应用",
    description:
      "互补与类似色的搭配，兼顾冲击力与和谐度。",
    content: `# 色彩理论应用\n\n## 互补 vs 类似\n- 互补色：强调点与视觉冲击\n- 类似色：整体氛围统一\n\n## 配色流程\n- 选主色→选强调色→测试在图标区域的可读性\n\n## 工具\n- 色轮/配色方案库辅助快速迭代\n`,
  },
  {
    slug: "batch-workflow-parameterized",
    title: "批量生成工作流：参数化与模板化",
    description:
      "将主题、风格与尺寸参数化，建立模板库进行批量生产。",
    content: `# 批量生成工作流\n\n## 参数化\n- 主题、风格、尺寸、负面词统一参数表\n\n## 模板化\n- 提示词模板 + 风格LoRA集合\n\n## 自动化\n- 脚本批量生成并校验内容完整性与构图\n\n## 质检\n- 设备适配预览与图标区域留白检查\n`,
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
    console.log("seed home blog posts failed:", err);
    return respErr("seed home blog posts failed");
  }
}

export async function GET(req: Request) {
  return respErr("use POST to seed home blog posts");
}

