import { Suspense } from 'react';
import SetPassword from '@/views/SetPassword.jsx';

export default function Page() {
  // The token is read from the URL on the client.
  return (
    <Suspense>
      <SetPassword />
    </Suspense>
  );
}
