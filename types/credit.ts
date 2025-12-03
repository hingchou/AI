export interface Credit {
  trans_no: string;
  created_at: string;
  user_uuid: string;
  trans_type: string;
  credits: number;
  order_no: string;
  expired_at?: string;
}

export enum CreditsTransType {
  NewUser = "new_user",
  Consume = "consume",
  Recharge = "recharge",
  Ping = "ping",
  OrderPay = "order_pay",
}

export enum CreditsAmount {
  NewUserGet = 10,  // 新用户获得的积分数量
} 