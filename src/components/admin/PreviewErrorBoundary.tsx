import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; resetKey?: unknown };
type State = { failed: boolean };

export class PreviewErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }
  render() {
    if (this.state.failed) return <div className="p-8 text-center text-sm text-muted-foreground">প্রিভিউ দেখাতে সমস্যা হচ্ছে — তথ্য পূরণ করতে থাকুন।</div>;
    return this.props.children;
  }
}
