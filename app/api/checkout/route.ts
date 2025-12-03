import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Stripe from "stripe";
import { getSnowId } from "@/lib/hash";
import { insertOrder } from "@/models/order";
import { getIsoTimestr } from "@/lib/time";

// 延迟初始化Stripe，避免构建时错误
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia', // 使用支持的API版本
  });
};

export async function POST(req: Request) {
  try {
    // 验证用户身份
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { code: -1, message: "Please sign in first" }, 
        { status: 401 }
      );
    }

    // 获取请求体并记录日志
    const body = await req.json();
    console.log("Payment request params:", body);

    // 解构请求参数
    const {
      product_id,
      product_name,
      credits,
      interval,
      amount,
      currency = "usd",
      valid_months = 1,
    } = body;

    // 详细的参数验证与日志
    console.log("Parameter validation:", {
      product_id: !!product_id, 
      product_name: !!product_name, 
      amount: !!amount,
      credits: credits,
      interval: interval,
      currency: currency
    });

    if (!product_id || !product_name || amount === undefined || amount === null) {
      return NextResponse.json(
        { 
          code: -1, 
          message: "Missing required parameters", 
          missing: {
            product_id: !product_id,
            product_name: !product_name,
            amount: amount === undefined || amount === null
          }
        },
        { status: 400 }
      );
    }

    // 创建订单号
    const order_no = getSnowId();
    const created_at = getIsoTimestr();

    // 计算订阅过期时间
    const expired_at = new Date();
    expired_at.setMonth(expired_at.getMonth() + valid_months);

    try {
      // Create a Stripe checkout session with proper error handling
      console.log("Creating Stripe checkout session with:", {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: currency,
            product_data: {
              name: product_name,
              description: `${credits} credits for AI wallpaper generation`,
            },
            unit_amount: parseInt(amount.toString()), // Ensure integer
          },
          quantity: 1,
        }],
        success_url: `${process.env.NEXT_PUBLIC_WEB_URL}/${session.user.locale || 'en'}/pay-success/{CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_WEB_URL}/#pricing`,
        metadata: { order_no },
        customer_email: session.user.email,
      });
      
      const stripe = getStripe();
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: product_name,
                description: `${credits} credits for AI wallpaper generation`,
              },
              unit_amount: parseInt(amount.toString()), // Ensure integer
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_WEB_URL}/${session.user.locale || 'en'}/pay-success/{CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_WEB_URL}/#pricing`,
        metadata: {
          order_no,
        },
        customer_email: session.user.email,
      });

      console.log("Stripe session created:", checkoutSession.id);

      // 在数据库中保存订单信息
      await insertOrder({
        order_no,
        created_at,
        user_uuid: session.user.uuid || "",
        user_email: session.user.email || "",
        amount,
        interval,
        expired_at: expired_at.toISOString(),
        status: "created",
        stripe_session_id: checkoutSession.id,
        credits,
        currency,
        product_id,
        product_name,
        valid_months,
      });

      // 返回成功响应
      return NextResponse.json({
        code: 0,
        data: {
          public_key: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
          session_id: checkoutSession.id,
        },
      });
    } catch (stripeError: any) {
      // 处理Stripe特定错误
      console.error("Stripe error:", stripeError);
      return NextResponse.json(
        { 
          code: -1, 
          message: stripeError.message || "Payment processing failed",
          error_type: stripeError.type,
          error_detail: stripeError.raw || stripeError
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // 处理一般服务器错误
    console.error("Server error:", error);
    return NextResponse.json(
      { code: -1, message: error.message || "Payment processing failed" },
      { status: 500 }
    );
  }
}
