import { LoginPage } from '@/react/components/site/LoginPage'
// The sign-in page as it ships when an email has no invite: the reason, then book a demo, request access and sign in
// again. The app passes the error from the sign-in callback and does the forwarding.

export default function Site() {
  return <LoginPage error="private" signInHref="#sign-in" demoHref="#demo" requestHref="#request-access" full={false} />
}
