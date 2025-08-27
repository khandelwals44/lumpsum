import { requireRole } from "@/lib/authServer";

export default async function Page() {
  await requireRole(["ADMIN"]);
  return (
    <div className="container">
      <h1 className="text-2xl font-semibold mb-2">Admin</h1>
      <p className="text-sm text-zinc-600">
        Coming soon: manage users, funds, and platform settings.
      </p>
    </div>
  );
}
