import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('画面の読み込みに失敗しました', error, info.componentStack); }
  render() {
    if (this.state.failed) return <div className="error-screen" role="alert"><h1>画面を読み込めませんでした</h1><p>ページを再読み込みして、もう一度お試しください。</p><button className="button" onClick={() => window.location.reload()}>再読み込み</button></div>;
    return this.props.children;
  }
}
