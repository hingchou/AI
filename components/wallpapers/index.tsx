import React from 'react';
import Image from 'next/image';
import { Avatar } from '@/components/ui/avatar';

interface WallpaperItem {
  id: string;
  title: string;
  imageUrl: string;
  dimension: string;
  author: {
    name: string;
    avatarUrl: string;
  };
}

interface WallpapersProps {
  items: WallpaperItem[];
}

export default function Wallpapers({ items }: WallpapersProps) {
  if (!items) return null;

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-lg overflow-hidden bg-white shadow-md"
        >
          <div className="relative w-full h-48">
            <Image src={item.imageUrl} alt={item.title} layout="fill" objectFit="cover" />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold">{item.title}</h3>
            <p className="text-sm">{item.dimension}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
