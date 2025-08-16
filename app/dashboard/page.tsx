import { redirect } from "next/navigation";
import { getSession } from "@/lib/authServer";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function Page() {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/dashboard`);
  }
  return <DashboardClient />;
}
