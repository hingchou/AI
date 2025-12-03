import { respData, respErr } from "@/lib/resp";
import { getAllPosts } from "@/models/post";
import { validatePost } from "@/lib/blogValidation";

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

export async function GET(req: Request) {
  try {
    const auth = requireToken(req);
    if (!auth.ok) {
      return respErr(auth.message!);
    }

    const issues: any[] = [];
    let page = 1;
    const limit = 100;
    while (true) {
      const posts = await getAllPosts(page, limit);
      if (!posts || posts.length === 0) break;
      for (const p of posts) {
        const { completeness, score } = validatePost(p.title, p.content);
        const problems: string[] = [];
        if (!completeness.ok) problems.push(`content_${completeness.reason}`);
        if (score < 0.2) problems.push("title_content_mismatch");
        if (problems.length > 0) {
          issues.push({ slug: p.slug, locale: p.locale, problems, score });
        }
      }
      if (posts.length < limit) break;
      page++;
    }

    return respData({ issues, count: issues.length });
  } catch (err) {
    console.log("validate posts failed:", err);
    return respErr("validate posts failed");
  }
}

