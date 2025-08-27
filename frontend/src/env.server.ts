export function getNextAuthUrl(): string {
  const branch = process.env.VERCEL_BRANCH_URL;
  const vercel = process.env.VERCEL_URL;
  if (branch) return `https://${branch}`;
  if (vercel) return `https://${vercel}`;
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}
