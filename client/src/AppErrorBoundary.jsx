import { Component } from "react";
export default class AppErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error("Application error:", error);
  }
  render() {
    return this.state.failed ? (
      <main className="not-found">
        <h1>Let's try that again.</h1>
        <p>
          Something interrupted this page. Reload to get back to your journey.
        </p>
        <button
          type="button"
          className="button button-primary"
          onClick={() => window.location.reload()}
        >
          Reload ELOCAB
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
