import * as React from "react";

export interface Props {
    labels: string[],
}

export const splitLabelHeight = 22;

export default class SplitLabels extends React.Component<Props> {
    public render() {
        return (
            <span
                className="split"
                style={{
                    height: splitLabelHeight,
                }}
            >
                <div className="current-split-background" />
                <div className="split-icon-container-empty" />
                <div className="split-name" />
                {
                    this.props.labels.map((label, i) =>
                        <div
                            key={i}
                            className="split-time"
                        >
                            {label}
                        </div>,
                    ).reverse()
                }
            </span>
        );
    }
}
