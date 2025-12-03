"use client";

import { Check, Loader } from "lucide-react";
import { PricingItem, Pricing as PricingType } from "@/types/blocks/pricing";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icon";
import { Label } from "@/components/ui/label";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/app";
import { Card } from "@/components/ui/card";
import { OrderInterval, PricingPlan } from "@/types/pricing";
import { useTranslations } from "next-intl";

const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Try our AI wallpaper generator",
    price: 0,
    interval: OrderInterval.Monthly,
    credits: 5,
    features: [
      "5 free AI wallpaper generations",
      "Standard resolution wallpapers",
      "Basic style options",
      "Watermarked downloads",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    description: "Perfect for wallpaper enthusiasts",
    price: 19,
    originalPrice: 29,
    interval: OrderInterval.Monthly,
    credits: 100,
    features: [
      "100 AI wallpaper generations per month",
      "HD resolution wallpapers",
      "All style options for your AI wallpapers",
      "Watermark-free downloads",
      "Batch wallpaper generation",
      "Priority generation",
    ],
    popular: true,
  },
  {
    id: "professional",
    name: "Professional",
    description: "For professional wallpaper creators",
    price: 49,
    originalPrice: 69,
    interval: OrderInterval.Monthly,
    credits: -1, // unlimited
    features: [
      "Unlimited AI wallpaper generations",
      "4K Ultra HD resolution wallpapers",
      "All advanced AI features",
      "Commercial usage rights for your wallpapers",
      "AI wallpaper generator API access",
      "Priority support",
    ],
  },
];

export default function Pricing({ pricing }: { pricing: PricingType }) {
  if (pricing.disabled) {
    return null;
  }

  const { user, setShowSignModal } = useAppContext();
  const t = useTranslations();

  const [group, setGroup] = useState(pricing.groups?.[0]?.name);
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  const handleChoosePlan = async (item: PricingItem) => {
    try {
      if (!user) {
        setShowSignModal(true);
        return;
      }

      setIsLoading(true);
      setProductId(item.product_id || item.title);
      
      const price = typeof item.price === 'number' ? item.price : 0;
      
      const params = {
        product_id: item.product_id || `wallpaper_${item.title.toLowerCase().replace(/\s+/g, '_')}`,
        product_name: item.title || "AI Wallpaper Plan",
        credits: item.credits || (price === 0 ? 5 : (price === 19 ? 100 : 500)),
        interval: "month",
        amount: Math.round(price * 100),
        currency: "usd",
        valid_months: 1,
      };

      console.log("Payment params:", params);
      
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      console.log("Server response status:", response.status);
      
      const responseData = await response.json();
      console.log("Server response data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      if (responseData.code !== 0 || !responseData.data) {
        throw new Error(responseData.message || "Checkout failed");
      }

      const { public_key, session_id } = responseData.data;

      if (!public_key || !session_id) {
        throw new Error("Invalid payment session");
      }

      const stripe = await loadStripe(public_key);
      if (!stripe) {
        throw new Error("Failed to initialize payment system");
      }

      await stripe.redirectToCheckout({
        sessionId: session_id,
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error?.message || "Payment system error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pricing.items && pricing.items.length > 0) {
      setGroup(pricing.items[0].group || '');
      setProductId(pricing.items[0].product_id || null);
      setIsLoading(false);
    }
  }, [pricing.items]);

  return (
    <section id={pricing.name} className="py-16">
      <div className="container">
        <div className="mx-auto mb-12 text-center">
          <h2 className="mb-4 text-4xl font-semibold lg:text-5xl">
            {pricing.title}
          </h2>
          <p className="text-muted-foreground lg:text-lg">
            {pricing.description}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          {pricing.groups && pricing.groups.length > 0 && (
            <div className="flex h-12 mb-12 items-center rounded-md bg-muted p-1 text-lg">
              <RadioGroup
                value={group}
                className={`h-full grid-cols-${pricing.groups.length}`}
                onValueChange={(value) => {
                  setGroup(value);
                }}
              >
                {pricing.groups.map((item, i) => {
                  return (
                    <div
                      key={i}
                      className='h-full rounded-md transition-all has-[button[data-state="checked"]]:bg-white'
                    >
                      <RadioGroupItem
                        value={item.name || ""}
                        id={item.name}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={item.name}
                        className="flex h-full cursor-pointer items-center justify-center px-7 font-semibold text-muted-foreground peer-data-[state=checked]:text-primary"
                      >
                        {item.title}
                        {item.label && (
                          <Badge
                            variant="outline"
                            className="border-primary bg-primary px-1.5 ml-1 text-primary-foreground"
                          >
                            {item.label}
                          </Badge>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {pricing.items?.map((item, index) => {
              if (item.group && item.group !== group) {
                return null;
              }

              return (
                <Card key={index} className="relative p-6 flex flex-col">
                  {item.popular && (
                    <div className="absolute top-0 right-0 px-3 py-1 text-sm text-white transform translate-y-0 bg-purple-600 rounded-bl-lg rounded-tr-lg">
                      Popular
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <p className="text-gray-500">{item.description}</p>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-baseline">
                      {item.original_price && (
                        <span className="text-xl line-through text-gray-500 mr-2">
                          ${item.original_price.toString().replace('$', '')}
                        </span>
                      )}
                      <span className="text-4xl font-bold">
                        {item.price === 0 
                          ? "Free" 
                          : `$${item.price.toString().replace('$', '')}`}
                      </span>
                      <span className="ml-1 text-gray-500">
                        /{t('pricing.month')}
                      </span>
                    </div>
                  </div>
                  <ul className="mb-6 space-y-2 flex-grow">
                    {item.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleChoosePlan(item)}
                    disabled={isLoading && productId === item.product_id}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12"
                  >
                    {isLoading && productId === item.product_id ? (
                      <div className="flex items-center justify-center">
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      `Choose ${item.title}`
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
