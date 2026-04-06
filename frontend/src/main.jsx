import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 40, background: '#331111', color: 'white', fontFamily: 'monospace', minHeight: '100vh' }}>
                    <h1 style={{ color: '#ff6666' }}>Tizimda (React) xatolik yuz berdi!</h1>
                    <h2>{this.state.error?.toString()}</h2>
                    <pre style={{ color: '#ffaaaa', marginTop: 20 }}>
                        {this.state.errorInfo?.componentStack}
                    </pre>
                    <p>Iltimos menga (AI) shu matnni nusxalab/rasmga olib yuboring.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
)
