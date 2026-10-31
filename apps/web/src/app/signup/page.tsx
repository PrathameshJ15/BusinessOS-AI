import { redirect } from 'next/navigation';

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const callbackUrl = searchParams.callbackUrl ? `&callbackUrl=${encodeURIComponent(String(searchParams.callbackUrl))}` : '';
  redirect(`/login?mode=signup${callbackUrl}`);
}
