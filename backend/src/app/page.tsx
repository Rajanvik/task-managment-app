import { redirect } from 'next/navigation';

export default function RootPage() {
  // Automatically redirect to the interactive Swagger API documentation playground
  redirect('/docs');
}
