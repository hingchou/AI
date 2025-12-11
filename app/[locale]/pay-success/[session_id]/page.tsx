import { notFound } from "next/navigation";
import { Stripe } from "stripe";
import { updateOrderStatus } from "@/models/order";
import OrderSuccess from "@/components/blocks/order-success";
import { auth } from "@/auth";
import { updateCreditForOrder } from "@/services/credit";
import { findOrderBySessionId } from "@/models/order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export default async function PaySuccessPage({ 
  params 
}: { 
  params: { session_id: string } 
}) {
  const session_id = params.session_id;
  
  if (!session_id) {
    return notFound();
  }

  try {
    console.log("Processing payment success for session:", session_id);
    
    // 获取订单信息
    const order = await findOrderBySessionId(session_id);
    
    if (!order) {
      console.error("Order not found for session:", session_id);
      throw new Error("Order not found");
    }
    
    // 只有当订单状态为created时才处理
    if (order.status === "created") {
      try {
        // 获取Stripe会话信息
        const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
        
        if (checkoutSession && checkoutSession.payment_status === 'paid') {
          console.log("Payment confirmed for order:", order.order_no);
          
          // 更新订单状态为已完成
          await updateOrderStatus(
            order.order_no, 
            "completed", 
            new Date().toISOString(),
            checkoutSession.customer_details?.email || "",
            JSON.stringify(checkoutSession)
          );
          
          // 更新用户积分
          await updateCreditForOrder(order);
        } else {
          console.log("Payment not confirmed yet:", checkoutSession?.payment_status);
        }
      } catch (stripeError) {
        console.error("Error retrieving Stripe session:", stripeError);
        // 继续显示成功页面，即使Stripe API调用失败
      }
    } else {
      console.log("Order already processed:", order.status);
    }

    return <OrderSuccess sessionId={session_id} />;
  } catch (error) {
    console.error("Error in payment success page:", error);
    
    // 即使出错也显示成功页面，避免用户困惑
    return <OrderSuccess sessionId={session_id} />;
  }
}