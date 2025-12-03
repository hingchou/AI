import { NextResponse } from "next/server";
import { experimental_generateImage as generateImage } from "ai";
import { replicate } from "@ai-sdk/replicate";
import path from "path";
import { writeFile } from "fs/promises";
import { v4 as getUuid } from "uuid";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    
    // 如果没有提供描述，使用默认描述
    const prompt = description || "a beautiful girl running with 2 cats";
    const model = "black-forest-labs/flux-1.1-pro";
    
    const imageModel = replicate.image(model);
    const providerOptions = {
      replicate: {
        output_quality: 90,
      },
    };
    
    const { images, warnings } = await generateImage({
      model: imageModel,
      prompt: prompt,
      n: 1,
      providerOptions,
    });
    
    if (warnings && warnings.length > 0) {
      console.log("Generation warnings:", warnings);
    }
    
    // 保存图像到文件系统
    const batch = getUuid();
    const fileName = `wallpaper_${batch}.png`;
    const filePath = path.join(process.cwd(), "public", fileName);
    const publicUrl = `${process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000"}/${fileName}`;
    
    const buffer = Buffer.from(images[0].base64, "base64");
    await writeFile(filePath, buffer);
    
    return NextResponse.json({
      code: 0,
      data: {
        prompt: prompt,
        imageUrl: publicUrl
      }
    });
  } catch (error) {
    console.error("Generate wallpaper failed:", error);
    return NextResponse.json({
      code: -1,
      message: "generate wallpaper failed"
    }, { status: 500 });
  }
}