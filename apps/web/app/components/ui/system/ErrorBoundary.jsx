"use client";
import React from "react";
import ErrorView from "./ErrorView";
import { reportError, extractErrorInfo } from "@/lib/utils/errors";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { err: null, errorId: null, details: null };
    }
    static getDerivedStateFromError(err) {
        return { err };
    }
    async componentDidCatch(error, info) {
        const { errorId } = await reportError(error, {
            where: this.props.where || "ErrorBoundary",
            reactInfo: info?.componentStack
        });
        this.setState({ errorId, details: extractErrorInfo(error) });
    }
    handleRetry = () => {
        // Clear and let children re-render (they should re-fetch on mount)
        this.setState({ err: null, errorId: null, details: null });
        this.props.onRetry?.();
    };
    render() {
        if (this.state.err) {
            return (
                <ErrorView
                    title="This section failed to load"
                    message="You can try again, or return later."
                    errorId={this.state.errorId}
                    details={this.state.details}
                    onRetry={this.handleRetry}
                />
            );
        }
        return this.props.children;
    }
}
