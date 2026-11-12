import { Redirect } from 'expo-router'

// The tabs live in real directories (check-routes refuses three group indexes on "/"),
// so the app's root URL sends to the first tab.
export default function Index() {
  return <Redirect href="/summary" />
}
