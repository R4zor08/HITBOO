import React from 'react';

type GameSceneBoundaryProps = {
  children: React.ReactNode;
  fallback: React.ReactNode;
};

type GameSceneBoundaryState = {
  hasError: boolean;
};

export class GameSceneBoundary extends React.Component<
  GameSceneBoundaryProps,
  GameSceneBoundaryState
> {
  constructor(props: GameSceneBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): GameSceneBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Keep this visible in devtools for quick diagnosis.
    // eslint-disable-next-line no-console
    console.error('GameSceneBoundary caught render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
