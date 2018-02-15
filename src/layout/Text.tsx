import * as React from "react";
import * as LiveSplit from "../livesplit";
import { gradientToCss } from "../util/ColorUtil";

export interface Props { state: LiveSplit.TextComponentStateJson }

export default class Text extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { background, text } = this.props.state;

        const rendered = "Center" in text ? (
            <tr>
                <td className="text-component-text center-text">{text.Center}</td>
            </tr>
        ) : (
                <tr>
                    <td className="text-component-text">{text.Split[0]}</td>
                    <td className="text-component-text">{text.Split[1]}</td>
                </tr>
            );

        return (
            <div
                className="text-component"
                style={{
                    background: gradientToCss(background),
                }}
            >
                <table>
                    <tbody>
                        {rendered}
                    </tbody>
                </table>
            </div>
        );
    }
}
