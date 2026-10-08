import type { Metadata } from "next";
import { ShopLineDemo } from "@/components/shop-line/shop-line-demo";

export const metadata: Metadata = {
  title: "518 Shop Line · Call the AI front desk | Albany AI Guy",
  description:
    "Your phone rings mid-cut. It still gets booked. Call a demo barbershop, book a time by voice or text, and watch the owner get the text.",
  openGraph: {
    title: "518 Shop Line: call the AI front desk",
    description:
      "Talk to it like a customer. It books you and texts the owner. Free 14-day trial for 518 shops.",
    url: "https://albanyaiguy.com/shop-line",
  },
};

export default function ShopLinePage() {
  return <ShopLineDemo />;
}
