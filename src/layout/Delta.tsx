import * as React from "react";
import * as LiveSplit from "../livesplit";
import { colorToCss, gradientToCss } from "../util/ColorUtil";
import { map } from "../util/OptionUtil";

import "./Delta.scss";

export interface Props { state: LiveSplit.DeltaComponentStateJson }

export default class Delta extends React.Component<Props> {
    public render() {
        return (
            <div
                className="delta-component"
                style={{
                    background: gradientToCss(this.props.state.background),
                }}
            >
                <table>
                    <tbody>
                        <tr>
                            <td
                                className="delta-component-text"
                                style={{
                                    color: map(this.props.state.label_color, colorToCss),
                                }}
                            >
                                {this.props.state.text}
                            </td>
                            <td
                                className="delta-component-time time"
                                style={{
                                    color: colorToCss(this.props.state.visual_color),
                                }}
                            >
                                {this.props.state.time}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
