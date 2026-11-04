import { Component, type ReactNode } from "react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

interface Props {
  /** Called once when the 3D book fails to load or render. */
  onError: (error: unknown) => void;
  children: ReactNode;
}

/** Keeps the page alive if the 3D book fails to load or render. */
export class SceneBoundary extends Component<Props, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    console.error("[book] 3D scene failed:", error);
    reportLovableError(error, { boundary: "book_scene" });
    this.props.onError(error);
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}
