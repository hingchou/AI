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

// 10 篇中文原创文章（生成式图像技术专题）
const zhPosts: SeedPost[] = [
  {
    slug: "gen-image-overview-2024",
    title: "生成式图像技术总览：从 GAN 到扩散模型",
    description:
      "系统梳理生成式图像的基本原理与发展脉络，比较 GAN 与扩散模型在训练稳定性、质量与速度上的差异。",
    cover_url: "",
    content: `# 生成式图像技术总览：从 GAN 到扩散模型\n\n**摘要**：本文结合顶会论文与开源生态，梳理生成式图像从 GAN（Generative Adversarial Networks）到扩散模型（Diffusion Models）的演进。\n\n## 基本原理\n- **GAN（生成式对抗网络）**：生成器与判别器对抗训练，目标是逼近真实数据分布；代表作 DCGAN、StyleGAN 系列。\n- **扩散模型（Diffusion）**：前向加噪、反向去噪，通过学习从噪声到数据的逐步还原；代表作 DDPM、LDM（潜空间扩散）。\n\n## 关键比较\n- **稳定性**：扩散模型训练更稳定，GAN 易模式崩塌。\n- **质量**：扩散模型在细节一致性与高分辨率上占优。\n- **速度**：GAN 生成快，扩散模型推理步数多（可用 LCM/蒸馏加速）。\n\n## 参考\n- Goodfellow et al., 2014 (NIPS)\n- Ho et al., 2020 (NeurIPS)\n- Rombach et al., 2022 (CVPR)\n`
  },
  {
    slug: "diffusion-models-in-depth",
    title: "扩散模型深入解析：UNet、CFG 与潜空间",
    description:
      "面向工程落地解析扩散模型的网络结构、条件引导与潜空间建模，帮助开发者理解 SD/SDXL。",
    cover_url: "",
    content: `# 扩散模型深入解析：UNet、CFG 与潜空间\n\n## UNet 去噪架构\n- 编码-解码对称结构，跨层跳连保留细节；在 SD 系列承担噪声预测。\n\n## Classifier-Free Guidance (CFG)\n- 通过条件/无条件推断差值增强生成对提示的响应；过高会损失自然性。\n\n## 潜空间（Latent）\n- 先用 VAE 将图像压缩到潜空间再扩散，显著提升速度与可扩展性。\n\n## 工程建议\n- SDXL + Refiner 提升细节；LCM-LoRA 降步数到 4–8。\n\n## 参考\n- Ho & Salimans, 2021\n- Rombach et al., 2022 (CVPR)\n`
  },
  {
    slug: "sd-dalle-midjourney-comparison",
    title: "Stable Diffusion vs DALL·E vs Midjourney：技术与生态对比",
    description:
      "从开源可控性、提示理解、风格美学与企业合规四个维度比较三大主流方案。",
    cover_url: "",
    content: `# SD vs DALL·E vs Midjourney：技术与生态对比\n\n- **Stable Diffusion**：开源，可本地部署与微调；SDXL 提升高分辨率。\n- **DALL·E 2/3**：提示解析更强、平台级合规与审核；闭源服务。\n- **Midjourney**：闭源，强美学评分与风格一致性；社区运营成熟。\n\n**决策建议**：需要定制与私有化选 SD；需要平台能力与审核选 DALL·E/MJ。\n\n参考：\n- Rombach et al., 2022；OpenAI 技术报告 2023\n`
  },
  {
    slug: "design-prototype-style-transfer",
    title: "设计领域实践：快速原型与风格迁移工作流",
    description:
      "给出从提示模板到 ControlNet 条件控制的端到端工作流，提升设计产能与一致性。",
    cover_url: "",
    content: `# 设计领域实践：快速原型与风格迁移\n\n## 工作流\n1. 结构化提示：主题/风格/构图/材质/质量标签/负面提示。\n2. 参考图 + ControlNet（边缘/深度/分割/姿态）确保布局一致性。\n3. Refiner/超分强化细节。\n\n## 交付建议\n- 建立可复用提示模板与风格库；版本化管理。\n\n参考：ControlNet (2023)\n`
  },
  {
    slug: "medical-imaging-augmentation-simulation",
    title: "医疗影像：数据增强与病理模拟的合规指南",
    description:
      "讨论医疗影像合成的价值与风险，提出在合规框架下的数据增强与模拟方法。",
    cover_url: "",
    content: `# 医疗影像：数据增强与病理模拟\n\n- **价值**：提升小样本任务鲁棒性；支持教学与算法迭代。\n- **风险**：隐私与版权、误导诊断。\n- **实践**：匿名化、合成标注、C2PA 内容凭证；人审 + 模型审双通道。\n\n参考：C2PA 标准；医疗 AI 合规研究综述。\n`
  },
  {
    slug: "game-assets-scene-pipeline",
    title: "游戏开发：资产生成与场景构建管线",
    description:
      "用 SDXL + ControlNet 构建可控的概念到资产生产线，结合超分与风格库提高一致性。",
    cover_url: "",
    content: `# 游戏开发：资产生成与场景构建\n\n- 概念到资产：草图/布局 → 条件生成 → 贴图与材质强化。\n- 场景：深度/分割控制构图；分块高分辨率渲染。\n- 版本化风格库与评审指标（美学评分 + 任务指标）。\n`
  },
  {
    slug: "ads-marketing-personalization",
    title: "广告营销：个性化内容生产与A/B优化",
    description:
      "建立多人群/多渠道的素材变体生成与评估体系，在合规审查与水印下规模化生产。",
    cover_url: "",
    content: `# 广告营销：个性化内容生产\n\n- 多变体生成：文案/风格/构图参数化；自动批量输出。\n- 评估：A/B 测试与转化指标闭环。\n- 合规：提示审核 + 输出审核 + 水印（SynthID/C2PA）。\n`
  },
  {
    slug: "quality-control-hq-details",
    title: "图像质量控制：分辨率与细节的工程方法",
    description:
      "总结高质量生成的工程实践：超分、分块、Refiner 与专项 LoRA 提升。",
    cover_url: "",
    content: `# 图像质量控制：分辨率与细节\n\n- 高分辨率：超分（ESRGAN/Real-ESRGAN）、分块合成。\n- 细节：Refiner 阶段、手部/人脸 LoRA、负面提示过滤伪影。\n- 指标：主观评分 + 感知指标（LPIPS, FID 仅参考）。\n`
  },
  {
    slug: "ethics-watermark-moderation",
    title: "伦理与安全：水印、内容审核与版权合规",
    description:
      "讨论生成式图像的伦理风险与企业治理框架，提供可落地的审核与水印方案。",
    cover_url: "",
    content: `# 伦理与安全：水印与审核\n\n- 风险：深度伪造、版权、敏感内容传播。\n- 方案：C2PA 内容凭证、SynthID 水印；人审 + 模型审；日志与留存。\n- 落地：平台侧合规 + 业务侧 SOP。\n\n参考：Google SynthID；c2pa.org\n`
  },
  {
    slug: "deployment-finetune-prompt-engineering",
    title: "实践手册：本地部署、微调与提示工程",
    description:
      "面向落地的操作指南：硬件要求、提示工程最佳实践与 LoRA/DreamBooth 微调步骤。",
    cover_url: "",
    content: `# 实践手册：部署、微调与提示工程\n\n## 部署\n- GPU ≥12GB（SDXL 建议），启用 FP16 与 xFormers；LCM-LoRA 加速。\n\n## 提示工程\n- 结构化提示；CFG/步数/采样器调优；参考图 + ControlNet。\n\n## 微调\n- LoRA（高效参数）、DreamBooth（主体特定）、Textual Inversion（词向量）。\n- 数据治理与验证集；避免过拟合与版权风险。\n`
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
    console.log("seed posts failed:", err);
    return respErr("seed posts failed");
  }
}

export async function GET(req: Request) {
  return respErr("use POST to seed posts");
}

