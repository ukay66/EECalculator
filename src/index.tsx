import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css'; 

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Simple Error Boundary to catch crashes and show a message
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: '2rem', color: '#fff', backgroundColor: '#0f172a', height: '100vh', fontFamily: 'sans-serif'}}>
          <h1>⚠️ Something went wrong</h1>
          <p>The application crashed. Please check the console for details.</p>
          <pre style={{backgroundColor: '#1e293b', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto'}}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
