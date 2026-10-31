import { redirect } from 'next/navigation';

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const callbackUrl = searchParams.callbackUrl ? `&callbackUrl=${encodeURIComponent(String(searchParams.callbackUrl))}` : '';
  redirect(`/login?mode=signup${callbackUrl}`);
}
