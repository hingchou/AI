"use client";

import { useState, useEffect } from "react";
import Branding from "@/components/blocks/branding";
import CTA from "@/components/blocks/cta";
import FAQ from "@/components/blocks/faq";
import Feature from "@/components/blocks/feature";
import Feature1 from "@/components/blocks/feature1";
import Feature2 from "@/components/blocks/feature2";
import Feature3 from "@/components/blocks/feature3";
import Hero from "@/components/blocks/hero";
import Pricing from "@/components/blocks/pricing";
import Showcase from "@/components/blocks/showcase";
import Stats from "@/components/blocks/stats";
import Testimonial from "@/components/blocks/testimonial";
import Generator from "@/components/generator";
import Wallpapers from "@/components/wallpapers";
import ServerLandingPage from "./ServerLandingPage";
import HomeBlogClient from "./HomeBlogClient";

export default function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const [page, setPage] = useState<any>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const pageData = await ServerLandingPage({ locale });
      setPage(pageData);
    }
    fetchData();
  }, [locale]);

  const handleGenerate = (description: string) => {
    // 可以在这里添加其他逻辑，如保存到历史记录等
    console.log('Generated wallpaper with description:', description);
  };

  if (!page)
    return (
      <>
        <HomeBlogClient locale={locale} />
      </>
    );

  // 示例壁纸数据
  const wallpapers = [
    {
      id: '1',
      title: '春节张灯结彩',
      imageUrl: 'https://aiwallpaper.shop/_next/image?url=https%3A%2F%2Fr2.trys.ai%2Fwallpapers%2F2e191f22-856c-469c-b4f4-984d878987cd.png&w=3840&q=75',
      dimension: '1792×1024',
      author: {
        name: 'Author1',
        avatarUrl: '/avatars/author1.jpg',
      },
    },
    {
      id: '2',
      title: '北国风光',
      imageUrl: 'https://aiwallpaper.shop/_next/image?url=https%3A%2F%2Fr2.trys.ai%2Fwallpapers%2F%2525E5%25258C%252597%2525E5%25259B%2525BD%2525E9%2525A3%25258E%2525E5%252585%252589.png&w=3840&q=75',
      dimension: '1792×1024',
      author: {
        name: 'Author2',
        avatarUrl: '/avatars/author2.jpg',
      },
    },
    {
      id: '3',
      title: '大漠孤烟直',
      imageUrl: 'https://aiwallpaper.shop/_next/image?url=https%3A%2F%2Fr2.trys.ai%2Fwallpapers%2F%2525E5%2525A4%2525A7%2525E6%2525BC%2525A0%2525E5%2525AD%2525A4%2525E7%252583%25259F%2525E7%25259B%2525B4%252520%2525E9%252595%2525BF%2525E6%2525B2%2525B3%2525E8%252590%2525BD%2525E6%252597%2525A5%2525E5%25259C%252586.png&w=3840&q=75',
      dimension: '1792×1024',
      author: {
        name: 'Author3',
        avatarUrl: '/avatars/author3.jpg',
      },
    },
    {
      id: '4',
      title: '可爱的小女孩',
      imageUrl: 'https://aiwallpaper.shop/_next/image?url=https%3A%2F%2Fr2.trys.ai%2Fwallpapers%2F4b2ac720-280d-485e-a453-ade47d5523b1.png&w=3840&q=75',
      dimension: '1792×1024',
      author: {
        name: 'Author4',
        avatarUrl: '/avatars/author4.jpg',
      },
    },
  ];

  return (
    <>
      {page.hero && <Hero hero={page.hero} />}
      <Generator onGenerate={handleGenerate} />
      <Wallpapers items={wallpapers} />
      {page.branding && <Branding section={page.branding} />}
      {page.introduce && <Feature1 section={page.introduce} />}
      {page.benefit && <Feature2 section={page.benefit} />}
      {page.usage && <Feature3 section={page.usage} />}
      {page.feature && <Feature section={page.feature} />}
      {page.showcase && <Showcase section={page.showcase} />}
      {page.stats && <Stats section={page.stats} />}
      {page.pricing && <Pricing pricing={page.pricing} />}
      {page.testimonial && <Testimonial section={page.testimonial} />}
      {page.faq && <FAQ section={page.faq} />}
      <HomeBlogClient locale={locale} />
      {page.cta && <CTA section={page.cta} />}
      
      {generatedImage && (
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img 
              src={generatedImage} 
              alt="Generated wallpaper" 
              className="w-full"
            />
          </div>
        </div>
      )}
    </>
  );
}
