import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error: Error | null }

/**
 * Global error boundary. Vangt render-errors in de React tree zodat een
 * enkele crashende component niet de hele pagina zwart maakt.
 *
 * In development: toont de fout inline zodat je deze kan debuggen.
 * In production: toont een nette fallback UI met een reload-knop.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload()
  }

  handleHome = () => {
    if (typeof window !== 'undefined') window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const isDev = process.env.NODE_ENV !== 'production'

    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: 'var(--font-body, system-ui)',
      }}>
        <div style={{
          maxWidth: 480,
          textAlign: 'center',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display, serif)',
            fontSize: 'clamp(28px, 4vw, 40px)',
            marginBottom: 12,
            color: 'var(--color-text, #1a1a1a)',
          }}>
            Er ging iets mis
          </h1>
          <p style={{
            color: 'var(--color-text-muted, #666)',
            lineHeight: 1.5,
            marginBottom: 24,
          }}>
            Er is een onverwachte fout opgetreden. Probeer de pagina te vernieuwen of ga terug naar de homepage.
          </p>

          {isDev && this.state.error && (
            <pre style={{
              textAlign: 'left',
              fontSize: 12,
              padding: 12,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              color: '#b91c1c',
              overflow: 'auto',
              marginBottom: 24,
            }}>
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack?.split('\n').slice(0, 6).join('\n')}
            </pre>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReload}
              style={{
                padding: '12px 24px',
                background: 'var(--color-accent, #F07878)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm, 6px)',
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: 'pointer',
              }}
            >
              Pagina vernieuwen
            </button>
            <button
              onClick={this.handleHome}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: 'var(--color-text, #1a1a1a)',
                border: '1.5px solid var(--color-border, #e5e5e5)',
                borderRadius: 'var(--radius-sm, 6px)',
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: 'pointer',
              }}
            >
              Naar homepage
            </button>
          </div>
        </div>
      </div>
    )
  }
}
