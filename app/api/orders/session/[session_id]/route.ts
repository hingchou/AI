import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrderBySessionId } from "@/models/order";

export async function GET(
  request: Request,
  { params }: { params: { session_id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { code: -1, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const sessionId = params.session_id;
    if (!sessionId) {
      return NextResponse.json(
        { code: -1, message: "Session ID is required" },
        { status: 400 }
      );
    }

    const order = await getOrderBySessionId(sessionId);
    
    if (!order) {
      return NextResponse.json(
        { code: -1, message: "Order not found" },
        { status: 404 }
      );
    }

    // 确保用户只能查看自己的订单
    if (order.user_email !== session.user.email) {
      return NextResponse.json(
        { code: -1, message: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      code: 0,
      data: order,
    });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { code: -1, message: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
} 