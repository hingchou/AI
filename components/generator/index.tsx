"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface GeneratorProps {
  onGenerate?: (description: string) => void;
}

export default function Generator({ onGenerate }: GeneratorProps) {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const requestGenWallpaper = async () => {
    try {
      setIsLoading(true);
      const resp = await fetch("/api/gen-wallpaper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      const data = await resp.json();
      
      if (data.code === 0 && data.data.imageUrl) {
        setGeneratedImage(data.data.imageUrl);
        onGenerate?.(description);
        toast.success("Wallpaper generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate wallpaper");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate wallpaper");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = () => {
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    requestGenWallpaper();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="flex w-full gap-4 mb-8">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Wallpaper description"
          className="flex-1 rounded-full border-2 border-purple-500/20 bg-white/5 px-6 py-6 text-lg focus-visible:outline-none"
          disabled={isLoading}
        />
        <Button
          onClick={handleGenerate}
          className="bg-purple-600 text-white rounded-full px-6 py-3 hover:bg-purple-700"
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate"}
        </Button>
      </div>

      {isLoading && (
        <div className="w-full flex justify-center my-8">
          <div className="animate-pulse text-center">
            <p className="text-lg">Creating your wallpaper...</p>
            <p className="text-sm text-gray-500">This may take a few seconds</p>
          </div>
        </div>
      )}

      {generatedImage && (
        <div className="w-full mt-8 rounded-lg overflow-hidden shadow-xl">
          <div className="relative w-full h-[600px]">
            <Image 
              src={generatedImage}
              alt="Generated wallpaper"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="bg-white p-4">
            <h3 className="font-bold">Your Wallpaper</h3>
            <p className="text-sm text-gray-600">{description}</p>
            <div className="mt-2">
              <a 
                href={generatedImage}
                download
                className="text-purple-600 hover:text-purple-800 text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Wallpaper
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
