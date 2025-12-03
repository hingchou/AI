"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrderSuccess({ sessionId }: { sessionId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    async function loadOrderDetails() {
      try {
        const response = await fetch(`/api/orders/session/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data.data);
        }
      } catch (error) {
        console.error("Failed to load order details", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrderDetails();
  }, [sessionId]);

  return (
    <div className="container max-w-3xl py-16">
      <div className="bg-background rounded-lg border p-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        
        <p className="mb-6 text-muted-foreground">
          Thank you for your purchase. Your wallpaper credits have been added to your account.
        </p>
        
        {isLoading ? (
          <p>Loading order details...</p>
        ) : orderDetails ? (
          <div className="mb-6 bg-muted p-4 rounded-md text-left">
            <h3 className="font-semibold mb-2">Order Details</h3>
            <p><span className="font-medium">Order ID:</span> {orderDetails.order_no}</p>
            <p><span className="font-medium">Plan:</span> {orderDetails.product_name}</p>
            <p><span className="font-medium">Credits Added:</span> {orderDetails.credits}</p>
            <p><span className="font-medium">Amount:</span> ${(orderDetails.amount / 100).toFixed(2)}</p>
          </div>
        ) : (
          <p className="mb-6">Order details are not available at the moment.</p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/">
              Return to Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/my-orders">
              View My Orders
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 