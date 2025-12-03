import { Wallpaper } from "@/types/wallpaper";
import { getSupabaseClient } from "./db";

export async function insertWallpaper(wallpaper: Wallpaper) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("wallpapers")
    .insert(wallpaper);

  if (error) throw error;

  return data;
}

export async function getWallpapers(
  page: number = 1,
  limit: number = 50
): Promise<Wallpaper[] | undefined> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("wallpapers")
    .select("*")
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;

  return data;
}
