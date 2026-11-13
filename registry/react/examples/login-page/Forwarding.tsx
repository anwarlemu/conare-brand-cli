import { LoginPage } from '@/react/components/site/LoginPage'
// With no error the page only says where it is taking you, while the app forwards to sign-in.

export default function Forwarding() {
  return <LoginPage signInHref="#sign-in" demoHref="#demo" full={false} />
}
