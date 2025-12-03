import { getLandingPage } from "@/services/page";

export default async function ServerLandingPage({ locale }: { locale: string }) {
  const page = await getLandingPage(locale);
  return page;
} 