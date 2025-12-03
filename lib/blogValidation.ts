export function isContentComplete(content?: string): { ok: boolean; reason?: string } {
  if (!content || content.trim().length === 0) {
    return { ok: false, reason: "empty" };
  }
  const len = content.trim().length;
  if (len < 200) {
    return { ok: false, reason: "too_short" };
  }
  return { ok: true };
}

function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/([\u4e00-\u9fa5])/g, " $1 ")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && (t.length > 1 || /[\u4e00-\u9fa5]/.test(t)));
}

export function titleContentMatchScore(title?: string, content?: string): number {
  if (!title || !content) return 0;
  const tks = tokenize(title);
  const cks = new Set(tokenize(content));
  if (tks.length === 0 || cks.size === 0) return 0;
  let hit = 0;
  for (const tk of tks) {
    if (cks.has(tk)) hit++;
  }
  return hit / tks.length;
}

export function validatePost(title?: string, content?: string) {
  const completeness = isContentComplete(content);
  const score = titleContentMatchScore(title, content);
  return { completeness, score };
}

