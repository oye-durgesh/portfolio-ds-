import { Component, type ReactNode } from "react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

/** Keeps the page alive if the 3D book fails to load or render. */
export class SceneBoundary extends Component<Props, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    reportLovableError(error, { boundary: "book_scene" });
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
