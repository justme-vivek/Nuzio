import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#0b0b0e",
          color: "#f5f5f7",
          textAlign: "center",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <section>
          <h1 style={{ margin: 0, fontSize: "24px" }}>
            Nuzio could not load this screen
          </h1>
          <p style={{ color: "#8e8e9c" }}>Refresh the page to try again.</p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              border: 0,
              borderRadius: "999px",
              padding: "12px 20px",
              background: "#7c5cfc",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Refresh
          </button>
          {import.meta.env.DEV && (
            <pre
              style={{
                maxWidth: "min(520px, 100%)",
                marginTop: "20px",
                color: "#f87171",
                whiteSpace: "pre-wrap",
              }}
            >
              {this.state.error?.message}
            </pre>
          )}
        </section>
      </main>
    );
  }
}
