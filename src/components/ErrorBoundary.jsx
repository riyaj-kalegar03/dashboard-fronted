import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // you could log to an external service here
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:24}}>
          <h2>Something went wrong rendering this page.</h2>
          <pre style={{whiteSpace:'pre-wrap', color:'#b91c1c'}}>{String(this.state.error)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
