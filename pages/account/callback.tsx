import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { exchangeCodeForToken } from '../../lib/customer-auth'

export default function AccountCallback() {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    const { code, state } = router.query
    if (!code || !state) return

    exchangeCodeForToken(code as string, state as string)
      .then(() => router.replace('/account'))
      .catch(err => {
        console.error('OAuth callback error:', err)
        router.replace('/account/login')
      })
  }, [router.isReady, router.query])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Inloggen...</p>
    </div>
  )
}
