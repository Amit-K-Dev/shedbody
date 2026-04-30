import { redirect } from "next/navigation";

export async function GET() {
  redirect("/rss.xml");
}
