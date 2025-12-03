import { findOrderByOrderNo, updateOrderStatus } from "@/models/order";
 
import Stripe from "stripe";
import { getIsoTimestr } from "@/lib/time";

export interface Order {
  order_no: string;
  created_at: string;
  user_uuid: string;
  user_email: string;
  amount: number;
  interval: string;
  expired_at: string;
  status: string;
  stripe_session_id?: string;
  credits: number;
  currency: string;
  sub_id?: string;
  sub_interval_count?: number;
  sub_cycle_anchor?: number;
  sub_period_end?: number;
  sub_period_start?: number;
  sub_times?: number;
  product_id?: string;
  product_name?: string;
  valid_months?: number;
  order_detail?: string;
  paid_at?: string;
  paid_email?: string;
  paid_detail?: string;
}
 
export async function handleOrderSession(session: Stripe.Checkout.Session) {
  try {
    if (
      !session ||
      !session.metadata ||
      !session.metadata.order_no ||
      session.payment_status !== "paid"
    ) {
      throw new Error("invalid session");
    }
 
    const order_no = session.metadata.order_no;
    const paid_email =
      session.customer_details?.email || session.customer_email || "";
    const paid_detail = JSON.stringify(session);
 
    const order = await findOrderByOrderNo(order_no);
    if (!order || order.status !== "created") {
      throw new Error("invalid order");
    }
 
    const paid_at = getIsoTimestr();
    await updateOrderStatus(order_no, "paid", paid_at, paid_email, paid_detail);
 
    console.log(
      "handle order session successed: ",
      order_no,
      paid_at,
      paid_email,
      paid_detail
    );
  } catch (e) {
    console.log("handle order session failed: ", e);
    throw e;
  }
}