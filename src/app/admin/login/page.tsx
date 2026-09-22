import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";

export default async function AdminLoginPage() {
  const jar = await cookies();
  if (verifySession(jar.get("lc_admin")?.value)) redirect("/admin");
  return (
    <div className="mx-auto max-w-sm px-5 pt-32 pb-20">
      <h1 className="text-center font-serif text-4xl font-light">Admin sign in</h1>
      <form action="/api/admin/login" method="post" className="mt-8 grid gap-4">
        <label className="block text-sm">Email
          <input name="email" type="email" required className="mt-1 w-full border border-neutral-300 px-3 py-2.5" />
        </label>
        <label className="block text-sm">Password
          <input name="password" type="password" required className="mt-1 w-full border border-neutral-300 px-3 py-2.5" />
        </label>
        <button className="bg-neutral-900 py-3 text-sm tracking-widest text-white uppercase">Sign in</button>
        <p className="text-xs text-neutral-500">Single admin role. Set ADMIN_EMAIL + ADMIN_PASSWORD in .env.local (dev) or ADMIN_PASSWORD_HASH in production.</p>
      </form>
    </div>
  );
}
