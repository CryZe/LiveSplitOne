import * as React from "react";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";
import * as LiveSplit from "../livesplit";
import { openFileAsArrayBuffer } from "../util/FileUtil";
import { TextBox } from "./TextBox";
import { toast } from "react-toastify";
import {
    downloadGameList, searchGames, getCategories, downloadCategories,
    downloadLeaderboard, getLeaderboard, downloadPlatformList, getPlatforms,
    downloadRegionList, getRegions, downloadGameInfo, getGameInfo, downloadGameInfoByGameId, downloadCategoriesByGameId,
} from "../api/GameList";
import { Category, Run, getRun } from "../api/SpeedrunCom";
import { Option, expect, map, assert, unwrapOr } from "../util/OptionUtil";
import { downloadById } from "../util/SplitsIO";
import { formatLeaderboardTime } from "../util/TimeUtil";
import { resolveEmbed } from "./Embed";
import { SettingsComponent, JsonSettingValueFactory } from "./Settings";
import { renderMarkdown, replaceFlag } from "../util/Markdown";

export interface Props { editor: LiveSplit.RunEditor }
export interface State {
    editor: LiveSplit.RunEditorStateJson,
    offsetIsValid: boolean,
    attemptCountIsValid: boolean,
    rowState: RowState,
    tab: Tab,
}

interface RowState {
    splitTimeIsValid: boolean,
    segmentTimeIsValid: boolean,
    bestSegmentTimeIsValid: boolean,
    comparisonIsValid: boolean[],
    index: number,
}

enum Tab {
    RealTime,
    GameTime,
    Variables,
    Rules,
    Leaderboard,
}

interface Filters {
    region?: string,
    platform?: string,
    isEmulated?: boolean,
    showObsolete: boolean,
    variables: Map<string, string>,
}

export class RunEditor extends React.Component<Props, State> {
    private gameIcon: string;
    private segmentIconUrls: string[];
    private dragIndex: number = 0;
    private expandedLeaderboardRows: Map<number, boolean> = new Map();
    private filters: Filters = { variables: new Map(), showObsolete: false };

    constructor(props: Props) {
        super(props);

        const state = props.editor.stateAsJson() as LiveSplit.RunEditorStateJson;
        this.state = {
            attemptCountIsValid: true,
            editor: state,
            offsetIsValid: true,
            rowState: {
                bestSegmentTimeIsValid: true,
                comparisonIsValid: [],
                index: 0,
                segmentTimeIsValid: true,
                splitTimeIsValid: true,
            },
            tab: state.timing_method === "RealTime" ? Tab.RealTime : Tab.GameTime,
        };

        this.gameIcon = "";
        this.segmentIconUrls = [];

        this.processIconChanges(state);

        // TODO Handle closing the Run Editor
        this.refreshGameList();
        this.refreshGameInfo(state.game);
        this.refreshCategoryList(state.game);
        this.refreshLeaderboard(state.game, state.category);
        this.refreshPlatformList();
        this.refreshRegionList();
    }

    public render() {
        const gameIcon = this.getGameIcon();
        const gameIconSize = 138;

        let gameIconContextTrigger: any = null;
        const gameIconToggleMenu = (e: any) => {
            if (gameIconContextTrigger) {
                gameIconContextTrigger.handleContextClick(e);
            }
        };

        const tab = this.getTab();

        let categoryNames = ["Any%", "Low%", "100%"];
        let category = null;
        const categoryList = getCategories(this.state.editor.game);
        if (categoryList != null) {
            categoryNames = categoryList.map((c) => c.name);
            const categoryIndex = categoryNames.indexOf(this.state.editor.category);
            if (categoryIndex >= 0) {
                category = categoryList[categoryIndex];
            }
        }

        return (
            <div className="run-editor">
                <div className="run-editor-info">
                    <div
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid hsl(0, 0%, 25%)",
                            cursor: "pointer",
                            height: gameIconSize,
                            marginTop: 5,
                            padding: 10,
                            width: gameIconSize,
                        }}
                        onClick={(e) => {
                            gameIconToggleMenu(e);
                        }}
                    >
                        <ContextMenuTrigger
                            id="game-icon-context-menu"
                            ref={(c) => gameIconContextTrigger = c}
                        >
                            {
                                gameIcon !== "" &&
                                <img
                                    src={gameIcon}
                                    style={{
                                        height: gameIconSize,
                                        objectFit: "contain",
                                        width: gameIconSize,
                                    }}
                                />
                            }
                        </ContextMenuTrigger>
                    </div>
                    <ContextMenu id="game-icon-context-menu">
                        <MenuItem onClick={(_) => this.changeGameIcon()}>
                            Set Icon
                        </MenuItem>
                        <MenuItem onClick={(_) => this.downloadBoxArt()}>
                            Download Box Art
                        </MenuItem>
                        <MenuItem onClick={(_) => this.downloadIcon()}>
                            Download Icon
                        </MenuItem>
                        {
                            gameIcon !== "" &&
                            <MenuItem onClick={(_) => this.removeGameIcon()}>
                                Remove Icon
                            </MenuItem>
                        }
                    </ContextMenu>
                    <table className="run-editor-info-table">
                        <tbody>
                            <tr>
                                <td>
                                    <TextBox
                                        className="run-editor-game"
                                        value={this.state.editor.game}
                                        onChange={(e) => this.handleGameChange(e)}
                                        label="Game"
                                        list={[
                                            "run-editor-game-list",
                                            searchGames(this.state.editor.game),
                                        ]}
                                    />
                                </td>
                                <td>
                                    <TextBox
                                        className="run-editor-category"
                                        value={this.state.editor.category}
                                        onChange={(e) => this.handleCategoryChange(e)}
                                        label="Category"
                                        list={[
                                            "run-editor-category-list",
                                            categoryNames,
                                        ]}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <TextBox
                                        className="run-editor-offset"
                                        value={this.state.editor.offset}
                                        onChange={(e) => this.handleOffsetChange(e)}
                                        onBlur={(_) => this.handleOffsetBlur()}
                                        small
                                        invalid={!this.state.offsetIsValid}
                                        label="Offset"
                                    />
                                </td>
                                <td>
                                    <TextBox
                                        className="run-editor-attempts"
                                        value={this.state.editor.attempts}
                                        onChange={(e) => this.handleAttemptsChange(e)}
                                        onBlur={(_) => this.handleAttemptsBlur()}
                                        small
                                        invalid={!this.state.attemptCountIsValid}
                                        label="Attempts"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="timing-selection tab-bar">
                    <button
                        className={"toggle-left" + (
                            tab === Tab.RealTime
                                ? " button-pressed"
                                : ""
                        )}
                        onClick={(_) => this.switchTab(Tab.RealTime)}
                    >
                        Real Time
                    </button>
                    <button
                        className={"toggle-middle" + (
                            tab === Tab.GameTime
                                ? " button-pressed"
                                : ""
                        )}
                        onClick={(_) => this.switchTab(Tab.GameTime)}
                    >
                        Game Time
                    </button>
                    <button
                        className={"toggle-middle" + (
                            tab === Tab.Variables
                                ? " button-pressed"
                                : ""
                        )}
                        onClick={(_) => this.switchTab(Tab.Variables)}
                    >
                        Variables
                    </button>
                    <button
                        className={"toggle-middle" + (
                            tab === Tab.Rules
                                ? " button-pressed"
                                : ""
                        )}
                        onClick={(_) => this.switchTab(Tab.Rules)}
                    >
                        Rules
                    </button>
                    <button
                        className={"toggle-right" + (
                            tab === Tab.Leaderboard
                                ? " button-pressed"
                                : ""
                        )}
                        onClick={(_) => this.switchTab(Tab.Leaderboard)}
                    >
                        Leaderboard
                    </button>
                </div>
                <div className="editor-group">
                    {this.renderTab(tab, category)}
                </div>
            </div >
        );
    }

    private renderSegmentListButtons(): JSX.Element {
        let otherButtonContextTrigger: any = null;
        const otherButtonToggleMenu = (e: any) => {
            if (otherButtonContextTrigger) {
                otherButtonContextTrigger.handleContextClick(e);
            }
        };

        return (
            <div className="btn-group">
                <button onClick={(_) => this.insertSegmentAbove()}>
                    Insert Above
                </button>
                <button onClick={(_) => this.insertSegmentBelow()}>
                    Insert Below
                </button>
                <button
                    onClick={(_) => this.removeSegments()}
                    className={this.state.editor.buttons.can_remove ? "" : "disabled"}
                >
                    Remove Segment
                </button>
                <button
                    onClick={(_) => this.moveSegmentsUp()}
                    className={this.state.editor.buttons.can_move_up ? "" : "disabled"}
                >
                    Move Up
                </button>
                <button
                    onClick={(_) => this.moveSegmentsDown()}
                    className={this.state.editor.buttons.can_move_down ? "" : "disabled"}
                >
                    Move Down
                </button>
                <button onClick={(_) => this.addComparison()}>
                    Add Comparison
                </button>
                <button onClick={(_) => this.importComparison()}>
                    Import Comparison
                </button>
                <button onClick={(e) => otherButtonToggleMenu(e)}>
                    <ContextMenuTrigger
                        id="other-button-context-menu"
                        ref={(c) => otherButtonContextTrigger = c}
                    >
                        Other…
                    </ContextMenuTrigger>
                </button>
                <ContextMenu id="other-button-context-menu">
                    <MenuItem onClick={(_) => this.clearHistory()}>
                        Clear History
                    </MenuItem>
                    <MenuItem onClick={(_) => this.clearTimes()}>
                        Clear Times
                    </MenuItem>
                    <MenuItem onClick={(_) => this.cleanSumOfBest()}>
                        Clean Sum of Best
                    </MenuItem>
                    <MenuItem onClick={(_) => this.generateGoalComparison()}>
                        Generate Goal Comparison
                    </MenuItem>
                </ContextMenu>
            </div>
        );
    }

    private renderGeneralButtons(): JSX.Element {
        return (
            <div className="btn-group" style={{ width: 160, marginRight: 5 }}>
                <button onClick={(_) => this.interactiveAssociateRunOrOpenPage()}>
                    {this.state.editor.metadata.run_id !== "" ? "Open PB Page" : "Associate Run"}
                </button>
            </div>
        );
    }

    private renderVariablesButtons(): JSX.Element {
        return (
            <div className="btn-group" style={{ width: 160, marginRight: 5 }}>
                <button onClick={(_) => this.addCustomVariable()}>
                    Add Variable
                </button>
            </div>
        );
    }

    private addCustomVariable() {
        const variableName = prompt("Variable Name:");
        if (variableName) {
            this.props.editor.addCustomVariable(variableName);
            this.update();
        }
    }

    private renderTab(tab: Tab, category: Option<Category>): JSX.Element[] {
        switch (tab) {
            case Tab.RealTime:
            case Tab.GameTime:
                return [this.renderSegmentListButtons(), this.renderSegmentsTable()];
            case Tab.Variables:
                return [this.renderVariablesButtons(), this.renderVariablesTab(category)];
            case Tab.Rules:
                return [this.renderGeneralButtons(), this.renderRulesTab(category)];
            case Tab.Leaderboard:
                return [this.renderLeaderboardButtons(category), this.renderLeaderboard(category)];
        }
    }

    private renderLeaderboardButtons(category: Option<Category>): JSX.Element {
        const gameInfo = getGameInfo(this.state.editor.game);
        if (gameInfo == null) {
            return this.renderGeneralButtons();
        }

        const regionList = [""];
        const platformList = [""];
        const allRegions = getRegions();
        const allPlatforms = getPlatforms();

        const filterList = [];
        const subcategoryBoxes = [];

        if (allRegions.size !== 0) {
            for (const regionId of gameInfo.regions) {
                const regionName = allRegions.get(regionId);
                if (regionName != null) {
                    regionList.push(regionName);
                }
            }
        }

        if (allPlatforms.size !== 0) {
            for (const platformId of gameInfo.platforms) {
                const platformName = allPlatforms.get(platformId);
                if (platformName != null) {
                    platformList.push(platformName);
                }
            }
        }

        if (regionList.length > 2) {
            filterList.push(<tr><td>Region:</td></tr>);
            filterList.push(
                <tr>
                    <td>
                        <select
                            value={unwrapOr<string>(this.filters.region, "")}
                            style={{
                                width: "100%",
                            }}
                            onChange={(e) => {
                                this.filters.region = e.target.value;
                                this.updateFilters();
                            }}
                        >
                            {regionList.map((v) => <option value={v}>{v}</option>)}
                        </select>
                    </td>
                </tr>,
            );
        }

        if (platformList.length > 2) {
            filterList.push(<tr><td>Platform:</td></tr>);
            filterList.push(
                <tr>
                    <td>
                        <select
                            value={unwrapOr<string>(this.filters.platform, "")}
                            style={{
                                width: "100%",
                            }}
                            onChange={(e) => {
                                this.filters.platform = e.target.value;
                                this.updateFilters();
                            }}
                        >
                            {platformList.map((v) => <option value={v}>{v}</option>)}
                        </select>
                    </td>
                </tr>,
            );
        }

        if (gameInfo.ruleset["emulators-allowed"]) {
            filterList.push(<tr><td>Emulator:</td></tr>);
            filterList.push(
                <tr>
                    <td>
                        <select
                            value={
                                this.filters.isEmulated === true
                                    ? "Yes"
                                    : this.filters.isEmulated === false
                                        ? "No"
                                        : ""
                            }
                            style={{
                                width: "100%",
                            }}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "Yes") {
                                    this.filters.isEmulated = true;
                                } else if (value === "No") {
                                    this.filters.isEmulated = false;
                                } else {
                                    this.filters.isEmulated = undefined;
                                }
                                this.updateFilters();
                            }}
                        >
                            {["", "Yes", "No"].map((v) => <option value={v}>{v}</option>)}
                        </select>
                    </td>
                </tr>,
            );
        }

        const variables = expect(gameInfo.variables, "We need the variables to be embedded");
        for (const variable of variables.data) {
            if (
                (variable.category == null || (variable.category === map(category, (c) => c.id)))
                && (variable.scope.type === "full-game" || variable.scope.type === "global")
            ) {
                if (variable["is-subcategory"]) {
                    let currentFilterValue = this.filters.variables.get(variable.name);
                    if (currentFilterValue === undefined) {
                        const runValue = this.state.editor.metadata.speedrun_com_variables[variable.name];
                        if (runValue != null) {
                            currentFilterValue = runValue;
                            this.filters.variables.set(variable.name, currentFilterValue);
                        } else {
                            const defaultValueId = variable.values.default;
                            if (defaultValueId != null) {
                                currentFilterValue = variable.values.values[defaultValueId].label;
                                this.filters.variables.set(variable.name, currentFilterValue);
                            }
                        }
                    }
                    subcategoryBoxes.push(
                        <table className="table filter-table subcategory-table">
                            <thead className="table-header">
                                <tr>
                                    <th>{variable.name}</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {Object.values(variable.values.values).map(({ label }) => {
                                    const isSelected = currentFilterValue === label;
                                    return (
                                        <tr>
                                            <td
                                                className={isSelected ? "selected" : ""}
                                                onClick={(_) => {
                                                    this.filters.variables.set(variable.name, isSelected ? "" : label);
                                                    this.updateFilters();
                                                }}
                                            >
                                                {label}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>,
                    );
                } else {
                    filterList.push(<tr><td>{variable.name}:</td></tr>);
                    filterList.push(
                        <tr>
                            <td>
                                <select
                                    value={unwrapOr<string>(this.filters.variables.get(variable.name), "")}
                                    style={{
                                        width: "100%",
                                    }}
                                    onChange={(e) => {
                                        this.filters.variables.set(variable.name, e.target.value);
                                        this.updateFilters();
                                    }}
                                >
                                    <option value="" />
                                    {Object.values(variable.values.values).map(
                                        ({ label }) => <option value={label}>{label}</option>,
                                    )}
                                </select>
                            </td>
                        </tr>,
                    );
                }
            }
        }

        filterList.push(<tr><td>Obsolete Runs:</td></tr>);
        filterList.push(
            <tr>
                <td>
                    <select
                        value={this.filters.showObsolete ? "Shown" : "Hidden"}
                        style={{
                            width: "100%",
                        }}
                        onChange={(e) => {
                            const value = e.target.value;
                            this.filters.showObsolete = value === "Shown";
                            this.updateFilters();
                        }}
                    >
                        {["Shown", "Hidden"].map((v) => <option value={v}>{v}</option>)}
                    </select>
                </td>
            </tr>,
        );

        return (
            <div className="btn-group" style={{ width: 160, marginRight: 5 }}>
                <button
                    onClick={(_) => {
                        if (category != null) {
                            window.open(category.weblink, "_blank");
                        }
                    }}
                    className={category == null ? "disabled" : ""}
                >
                    Open Leaderboard
                </button>
                <button className="disabled">
                    Submit Run
                </button>
                <button onClick={(_) => this.interactiveAssociateRunOrOpenPage()}>
                    {this.state.editor.metadata.run_id !== "" ? "Open PB Page" : "Associate Run"}
                </button>
                {subcategoryBoxes}
                <table className="table filter-table">
                    <thead className="table-header">
                        <tr>
                            <th>Filters</th>
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {filterList}
                    </tbody>
                </table>
            </div>
        );
    }

    private updateFilters() {
        this.resetIndividualLeaderboardState();
        this.update();
    }

    private renderVariablesTab(category: Option<Category>): JSX.Element {
        const metadata = this.state.editor.metadata;
        const gameInfo = getGameInfo(this.state.editor.game);
        const fields: LiveSplit.SettingsDescriptionFieldJson[] = [];
        const customVariableFields: LiveSplit.SettingsDescriptionFieldJson[] = [];
        const additionalVariables: LiveSplit.SettingsDescriptionFieldJson[] = [];
        let regionOffset = -1;
        let platformOffset = -1;
        let emulatorOffset = -1;
        if (gameInfo != null) {
            const regionList = [""];
            const platformList = [""];
            const allRegions = getRegions();
            const allPlatforms = getPlatforms();
            if (allRegions.size !== 0) {
                for (const regionId of gameInfo.regions) {
                    const regionName = allRegions.get(regionId);
                    if (regionName != null) {
                        regionList.push(regionName);
                    }
                }
            }
            if (allPlatforms.size !== 0) {
                for (const platformId of gameInfo.platforms) {
                    const platformName = allPlatforms.get(platformId);
                    if (platformName != null) {
                        platformList.push(platformName);
                    }
                }
            }
            const variables = expect(gameInfo.variables, "We need the variables to be embedded");
            for (const variable of variables.data) {
                if (
                    (variable.category == null || (variable.category === map(category, (c) => c.id)))
                    && (variable.scope.type === "full-game" || variable.scope.type === "global")
                ) {
                    additionalVariables.push({
                        text: variable.name,
                        value: {
                            CustomCombobox: {
                                value: unwrapOr(metadata.speedrun_com_variables[variable.name], "" as string),
                                list: ["", ...Object.values(variable.values.values).map((v) => v.label)],
                                mandatory: variable.mandatory,
                            },
                        },
                    });
                }
            }

            if (regionList.length > 1) {
                regionOffset = fields.length;
                fields.push({
                    text: "Region",
                    value: {
                        CustomCombobox: {
                            value: metadata.region_name,
                            list: regionList,
                            mandatory: false,
                        },
                    },
                });
            }
            if (platformList.length > 1) {
                platformOffset = fields.length;
                fields.push({
                    text: "Platform",
                    value: {
                        CustomCombobox: {
                            value: metadata.platform_name,
                            list: platformList,
                            mandatory: true,
                        },
                    },
                });
            }
            if (gameInfo.ruleset["emulators-allowed"]) {
                emulatorOffset = fields.length;
                fields.push({
                    text: "Uses Emulator",
                    value: {
                        Bool: metadata.uses_emulator,
                    },
                });
            }
        }

        for (const [name, value] of Object.entries(metadata.custom_variables)) {
            customVariableFields.push({
                text: name,
                value: {
                    String: expect(value, "We iterate over only existing values").value,
                },
            });
        }

        const speedrunComVariablesOffset = fields.length;

        fields.push(...additionalVariables);

        function unwrapString(value: LiveSplit.SettingsDescriptionValueJson): string {
            if ("String" in value) {
                return value.String;
            } else {
                throw new Error("Expected Setting value to be a string.");
            }
        }
        function unwrapBool(value: LiveSplit.SettingsDescriptionValueJson): boolean {
            if ("Bool" in value) {
                return value.Bool;
            } else {
                throw new Error("Expected Setting value to be a boolean.");
            }
        }

        return (
            <div className="run-editor-tab">
                <SettingsComponent
                    factory={new JsonSettingValueFactory()}
                    state={{ fields }}
                    setValue={(index, value) => {
                        if (index === regionOffset) {
                            const region = unwrapString(value);
                            this.props.editor.setRegionName(region);
                        } else if (index === platformOffset) {
                            const platform = unwrapString(value);
                            this.props.editor.setPlatformName(platform);
                        } else if (index === emulatorOffset) {
                            const emulatorUsage = unwrapBool(value);
                            this.props.editor.setEmulatorUsage(emulatorUsage);
                        } else {
                            const stringValue = unwrapString(value);
                            const key = additionalVariables[index - speedrunComVariablesOffset].text;
                            if (stringValue !== "") {
                                this.props.editor.setSpeedrunComVariable(key, stringValue);
                            } else {
                                this.props.editor.removeSpeedrunComVariable(key);
                            }
                        }
                        this.update();
                    }}
                />
                <h4>Custom Variables</h4>
                <SettingsComponent
                    factory={new JsonSettingValueFactory()}
                    state={{ fields: customVariableFields }}
                    setValue={(index, value) => {
                        const key = Object.keys(this.state.editor.metadata.custom_variables)[index];
                        const stringValue = unwrapString(value);
                        this.props.editor.setCustomVariable(key, stringValue);
                        this.update();
                    }}
                />
            </div>
        );
    }

    private renderLeaderboard(category: Option<Category>): JSX.Element {
        const leaderboard = getLeaderboard(this.state.editor.game, this.state.editor.category);
        if (leaderboard == null) {
            return <div />;
        }
        const gameInfo = getGameInfo(this.state.editor.game);
        const platformList = getPlatforms();
        const regionList = getRegions();

        let hideMilliseconds: boolean;
        if (gameInfo != null) {
            hideMilliseconds = !gameInfo.ruleset["show-milliseconds"];
        } else {
            hideMilliseconds = leaderboard.every((r) => {
                return r.times.primary_t === Math.floor(r.times.primary_t);
            });
        }

        let rank = 0;
        let visibleRowCount = 0;
        let uniqueCount = 0;
        let lastTime = "";

        function isFiltered(value: string | undefined, filter: string | undefined): boolean {
            return filter !== undefined
                && filter !== ""
                && value !== filter;
        }

        const uniquenessSet = new Set();

        return (
            <table className="table run-editor-tab" style={{ width: 450 }}>
                <thead className="table-header">
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Time</th>
                        <th>Splits</th>
                    </tr>
                </thead>
                <tbody className="table-body">
                    {leaderboard.map((run) => {
                        const platform = platformList.get(run.system.platform);
                        if (isFiltered(platform, this.filters.platform)) {
                            return null;
                        }

                        const region = map(run.system.region, (r) => regionList.get(r));
                        if (isFiltered(region, this.filters.region)) {
                            return null;
                        }

                        if (this.filters.isEmulated != null && run.system.emulated !== this.filters.isEmulated) {
                            return null;
                        }

                        const renderedVariables = [];

                        const variables = map(gameInfo, (g) => g.variables);
                        if (variables != null) {
                            for (const [keyId, valueId] of Object.entries(run.values)) {
                                const variable = variables.data.find((v) => v.id === keyId);
                                if (variable != null) {
                                    const value = Object.entries(variable.values.values).find(
                                        ([listValueId]) => listValueId === valueId,
                                    );
                                    const valueName = map(value, (v) => v[1].label);
                                    if (valueName != null) {
                                        renderedVariables.push(
                                            <tr>
                                                <td>{variable.name}:</td>
                                                <td>{valueName}</td>
                                            </tr>,
                                        );
                                    }
                                }
                            }

                            for (const variable of variables.data) {
                                if (
                                    (variable.category == null || (variable.category === map(category, (c) => c.id)))
                                    && (variable.scope.type === "full-game" || variable.scope.type === "global")
                                ) {
                                    const variableValueId = run.values[variable.id];
                                    const variableValue = map(variableValueId, (i) => variable.values.values[i]);
                                    const filterValue = this.filters.variables.get(variable.name);
                                    if (isFiltered(map(variableValue, (v) => v.label), filterValue)) {
                                        return null;
                                    }
                                }
                            }
                        }

                        const uniquenessKeys = run.players.data.map(
                            (p) => p.rel === "guest" ? `guest:${p.name}` : p.id,
                        );

                        const uniquenessKey = JSON.stringify(uniquenessKeys);
                        const isUnique = !uniquenessSet.has(uniquenessKey);
                        if (!isUnique && !this.filters.showObsolete) {
                            return null;
                        }
                        uniquenessSet.add(uniquenessKey);

                        const rowIndex = visibleRowCount;
                        const evenOdd = rowIndex % 2 === 0 ? "table-row-odd" : "table-row-even";
                        let expandedRow = null;

                        if (this.expandedLeaderboardRows.get(rowIndex) === true) {
                            let embed = null;
                            if (run.videos != null && run.videos.links != null && run.videos.links.length > 0) {
                                const videoUri = run.videos.links[run.videos.links.length - 1].uri;
                                embed = resolveEmbed(videoUri);
                            }
                            const comment = unwrapOr(run.comment, "");
                            const renderedComment = renderMarkdown(comment);

                            expandedRow =
                                <tr key={`${run.id}_expanded`} className={evenOdd}>
                                    <td colSpan={4}>
                                        {embed}
                                        <div className="markdown" style={{
                                            minHeight: 5,
                                        }}>{renderedComment}</div>
                                        <table style={{
                                            borderSpacing: "10px 2px",
                                            paddingBottom: 10,
                                            marginLeft: -11,
                                        }}>
                                            <tbody>
                                                <tr>
                                                    <td>Date:</td>
                                                    <td>{unwrapOr(run.date, "").split("-").join("/")}</td>
                                                </tr>
                                                {map(
                                                    region,
                                                    (r) =>
                                                        <tr>
                                                            <td>Region:</td>
                                                            <td>{r}</td>
                                                        </tr>,
                                                )}
                                                {map(
                                                    platform,
                                                    (p) =>
                                                        <tr>
                                                            <td>Platform:</td>
                                                            <td>{p}{run.system.emulated ? " Emulator" : null}</td>
                                                        </tr>,
                                                )}
                                                {renderedVariables}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>;
                        }

                        visibleRowCount += 1;
                        if (isUnique) {
                            uniqueCount += 1;
                            if (run.times.primary !== lastTime) {
                                rank = uniqueCount;
                                lastTime = run.times.primary;
                            }
                        }

                        return [
                            <tr
                                key={run.id}
                                title={unwrapOr(run.comment, "")}
                                className={`leaderboard-row ${evenOdd}`}
                                onClick={(_) => this.toggleExpandLeaderboardRow(rowIndex)}
                                style={{
                                    cursor: "pointer",
                                }}
                            >
                                <td className="number">{isUnique ? rank : "—"}</td>
                                <td>
                                    {
                                        run.players.data.map((p, i) => {
                                            if (p.rel === "user") {
                                                const style = p["name-style"];
                                                let color;
                                                if (style.style === "gradient") {
                                                    color = style["color-from"].dark;
                                                } else {
                                                    color = style.color.dark;
                                                }
                                                const flag = map(
                                                    p.location,
                                                    (l) => replaceFlag(`[${l.country.code}]`),
                                                );
                                                return [
                                                    i !== 0 ? ", " : null,
                                                    <a
                                                        target="_blank"
                                                        href={p.weblink}
                                                        style={{ color }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {flag}{p.names.international}
                                                    </a>,
                                                ];
                                            } else {
                                                const withFlags = replaceFlag(p.name);
                                                return [i !== 0 ? ", " : null, withFlags];
                                            }
                                        })
                                    }
                                </td>
                                <td style={{ width: 120 }} className="number">
                                    <a
                                        href={run.weblink}
                                        target="_blank"
                                        style={{ color: "white" }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {formatLeaderboardTime(run.times.primary_t, hideMilliseconds)}
                                    </a>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    {
                                        map(run.splits, (s) => <i
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                this.downloadSplits(run, s.uri);
                                            }}
                                            className="fa fa-download"
                                            style={{ cursor: "pointer" }}
                                            aria-hidden="true"
                                        />)
                                    }
                                </td>
                            </tr>,
                            expandedRow,
                        ];
                    })}
                </tbody>
            </table>
        );
    }

    private renderRulesTab(category: Option<Category>): JSX.Element {
        let rules = null;
        if (category != null && category.rules != null) {
            rules = renderMarkdown(category.rules);
        }
        const gameInfo = getGameInfo(this.state.editor.game);
        let gameRules = null;
        const subcategoryRules = [];
        if (gameInfo != null) {
            const additionalRules = [];
            const ruleset = gameInfo.ruleset;
            if (ruleset["default-time"] !== "realtime") {
                additionalRules.push(
                    ruleset["default-time"] === "realtime_noloads"
                        ? "are timed without the loading times"
                        : "are timed with Game Time",
                );
            }
            if (ruleset["require-video"]) {
                additionalRules.push("require video proof");
            }
            if (additionalRules.length !== 0) {
                gameRules =
                    <p style={{ fontStyle: "italic" }}>
                        Runs of this game {additionalRules.join(" and ")}.
                    </p>;
            }
            const variables = expect(gameInfo.variables, "We need the variables to be embedded");
            for (const variable of variables.data) {
                if (
                    (variable.category == null || (variable.category === map(category, (c) => c.id)))
                    && (variable.scope.type === "full-game" || variable.scope.type === "global")
                    && variable["is-subcategory"]
                ) {
                    const currentValue = this.state.editor.metadata.speedrun_com_variables[variable.name];
                    const foundValue = Object.values(variable.values.values).find((v) => v.label === currentValue);
                    if (foundValue != null && foundValue.rules != null) {
                        subcategoryRules.push(renderMarkdown(`## ${foundValue.label} Rules\n${foundValue.rules}`));
                    }
                }
            }
        }

        return (
            <div className="run-editor-additional-info">
                <div className="run-editor-rules markdown">{gameRules}{rules}{subcategoryRules}</div>
            </div>
        );
    }

    private renderSegmentsTable(): JSX.Element {
        const segmentIconSize = 19;

        return (
            <table className="table run-editor-tab run-editor-table">
                <thead className="table-header">
                    <tr>
                        <th style={{
                            paddingLeft: 4,
                            paddingRight: 0,
                            width: "inherit",
                        }}>Icon</th>
                        <th>Segment Name</th>
                        <th>Split Time</th>
                        <th>Segment Time</th>
                        <th>Best Segment</th>
                        {
                            this.state.editor.comparison_names.map((comparison, comparisonIndex) => {
                                let contextTrigger: any = null;
                                const toggleMenu = (e: any) => {
                                    if (contextTrigger) {
                                        contextTrigger.handleContextClick(e);
                                    }
                                };
                                const id = `comparison-${comparisonIndex}-context-menu`;
                                return (
                                    <th
                                        style={{
                                            cursor: "pointer",
                                        }}
                                        onClick={(e) => toggleMenu(e)}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData("text/plain", "");
                                            this.dragIndex = comparisonIndex;
                                        }}
                                        onDragOver={(e) => {
                                            if (e.preventDefault) {
                                                e.preventDefault();
                                            }
                                            e.dataTransfer.dropEffect = "move";
                                        }}
                                        onDragEnd={(_) => this.update()}
                                        onDrop={(e) => {
                                            if (e.stopPropagation) {
                                                e.stopPropagation();
                                            }
                                            this.props.editor.moveComparison(this.dragIndex, comparisonIndex);
                                            return false;
                                        }}
                                    >
                                        <ContextMenuTrigger
                                            id={id}
                                            ref={(c) => contextTrigger = c}
                                        >
                                            {comparison}
                                        </ContextMenuTrigger>
                                        <ContextMenu id={id}>
                                            <MenuItem onClick={(_) =>
                                                this.renameComparison(comparison)
                                            }>
                                                Rename
                                            </MenuItem>
                                            <MenuItem onClick={(_) =>
                                                this.removeComparison(comparison)
                                            }>
                                                Remove
                                            </MenuItem>
                                        </ContextMenu>
                                    </th>
                                );
                            })
                        }
                    </tr>
                </thead>
                <tbody className="table-body">
                    {
                        this.state.editor.segments.map((s, segmentIndex) => {
                            const segmentIcon = this.getSegmentIconUrl(segmentIndex);
                            const segmentIconContextMenuId = `segment-icon-${segmentIndex}-context-menu`;
                            let segmentIconContextTrigger: any = null;
                            const segmentIconToggleMenu = (e: any) => {
                                if (segmentIconContextTrigger) {
                                    segmentIconContextTrigger.handleContextClick(e);
                                    this.props.editor.selectOnly(segmentIndex);
                                    this.update();
                                }
                            };
                            return (
                                <tr
                                    key={segmentIndex.toString()}
                                    className={
                                        (s.selected === "Selected" || s.selected === "Active") ?
                                            "selected" :
                                            ""
                                    }
                                    onClick={(e) => this.changeSegmentSelection(e, segmentIndex)}
                                >
                                    <td
                                        style={{
                                            cursor: "pointer",
                                            height: segmentIconSize,
                                            paddingBottom: 0,
                                            paddingLeft: 16,
                                            paddingRight: 0,
                                            paddingTop: 2,
                                            width: segmentIconSize,
                                        }}
                                        onClick={(e) => {
                                            if (segmentIcon !== "") {
                                                segmentIconToggleMenu(e);
                                            } else {
                                                this.changeSegmentIcon(segmentIndex);
                                            }
                                        }}
                                    >
                                        <ContextMenuTrigger
                                            id={segmentIconContextMenuId}
                                            ref={(c) => segmentIconContextTrigger = c}
                                        >
                                            {
                                                segmentIcon !== "" &&
                                                <img
                                                    src={segmentIcon}
                                                    style={{
                                                        height: segmentIconSize,
                                                        objectFit: "contain",
                                                        width: segmentIconSize,
                                                    }}
                                                />
                                            }
                                        </ContextMenuTrigger>
                                        <ContextMenu id={segmentIconContextMenuId}>
                                            <MenuItem onClick={(_) => this.changeSegmentIcon(segmentIndex)}>
                                                Set Icon
                                            </MenuItem>
                                            <MenuItem onClick={(_) => this.removeSegmentIcon(segmentIndex)}>
                                                Remove Icon
                                            </MenuItem>
                                        </ContextMenu>
                                    </td>
                                    <td>
                                        <input
                                            className="name"
                                            type="text"
                                            value={s.name}
                                            onFocus={(_) => this.focusSegment(segmentIndex)}
                                            onChange={(e) => this.handleSegmentNameChange(e)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            className={
                                                this.state.rowState.index !== segmentIndex ||
                                                    this.state.rowState.splitTimeIsValid ?
                                                    "number" :
                                                    "number invalid"
                                            }
                                            type="text"
                                            value={s.split_time}
                                            onFocus={(_) => this.focusSegment(segmentIndex)}
                                            onChange={(e) => this.handleSplitTimeChange(e)}
                                            onBlur={(_) => this.handleSplitTimeBlur()}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            className={
                                                this.state.rowState.index !== segmentIndex
                                                    || this.state.rowState.segmentTimeIsValid
                                                    ? (s.segment_time === s.best_segment_time
                                                        ? "number best-segment-time"
                                                        : "number"
                                                    )
                                                    : "number invalid"
                                            }
                                            type="text"
                                            value={s.segment_time}
                                            onFocus={(_) => this.focusSegment(segmentIndex)}
                                            onChange={(e) => this.handleSegmentTimeChange(e)}
                                            onBlur={(_) => this.handleSegmentTimeBlur()}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            className={
                                                this.state.rowState.index !== segmentIndex ||
                                                    this.state.rowState.bestSegmentTimeIsValid ?
                                                    "number" :
                                                    "number invalid"
                                            }
                                            type="text"
                                            value={s.best_segment_time}
                                            onFocus={(_) => this.focusSegment(segmentIndex)}
                                            onChange={(e) => this.handleBestSegmentTimeChange(e)}
                                            onBlur={(_) => this.handleBestSegmentTimeBlur()}
                                        />
                                    </td>
                                    {
                                        this
                                            .state
                                            .editor
                                            .segments[segmentIndex]
                                            .comparison_times
                                            .map((comparisonTime, comparisonIndex) => (
                                                <td>
                                                    <input
                                                        className={
                                                            this.state.rowState.index !== segmentIndex ||
                                                                this.isComparisonValid(comparisonIndex) ?
                                                                "number" :
                                                                "number invalid"
                                                        }
                                                        type="text"
                                                        value={comparisonTime}
                                                        onFocus={(_) => this.focusSegment(segmentIndex)}
                                                        onChange={(e) =>
                                                            this.handleComparisonTimeChange(e, comparisonIndex)
                                                        }
                                                        onBlur={(_) =>
                                                            this.handleComparisonTimeBlur(comparisonIndex)
                                                        }
                                                    />
                                                </td>
                                            ))
                                    }
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        );
    }

    private generateGoalComparison() {
        const goalTime = prompt("Goal Time:");
        if (goalTime) {
            if (this.props.editor.parseAndGenerateGoalComparison(goalTime)) {
                this.update();
            } else {
                toast.error("Failed generating the goal comparison.");
            }
        }
    }

    private cleanSumOfBest() {
        this.props.editor.cleanSumOfBest().with((cleaner) => {
            while (true) {
                const potentialCleanUp = cleaner.nextPotentialCleanUp();
                if (!potentialCleanUp) {
                    break;
                }
                potentialCleanUp.with((potentialCleanUp) => {
                    const message = potentialCleanUp.message();
                    if (confirm(message)) {
                        cleaner.apply(potentialCleanUp);
                    }
                });
            }
        });
        this.update();
    }

    private clearHistory() {
        this.props.editor.clearHistory();
        this.update();
    }

    private clearTimes() {
        this.props.editor.clearTimes();
        this.update();
    }

    private async importComparison() {
        const [data, file] = await openFileAsArrayBuffer();
        const result = LiveSplit.Run.parseArray(new Int8Array(data), "", false);
        if (!result.parsedSuccessfully()) {
            toast.error("Couldn't parse the splits.");
            return;
        }
        result.unwrap().with((run) => {
            const comparisonName = prompt("Comparison Name:", file.name.replace(/\.[^/.]+$/, ""));
            if (!comparisonName) {
                return;
            }
            const valid = this.props.editor.importComparison(run, comparisonName);
            if (!valid) {
                toast.error("The comparison could not be added. It may be a duplicate or a reserved name.");
            } else {
                this.update();
            }
        });
    }

    private addComparison() {
        const comparisonName = prompt("Comparison Name:");
        if (comparisonName) {
            const valid = this.props.editor.addComparison(comparisonName);
            if (valid) {
                this.update();
            } else {
                toast.error("The comparison could not be added. It may be a duplicate or a reserved name.");
            }
        }
    }

    private renameComparison(comparison: string) {
        const newName = prompt("Comparison Name:", comparison);
        if (newName) {
            const valid = this.props.editor.renameComparison(comparison, newName);
            if (valid) {
                this.update();
            } else {
                toast.error("The comparison could not be renamed. It may be a duplicate or a reserved name.");
            }
        }
    }

    private removeComparison(comparison: string) {
        this.props.editor.removeComparison(comparison);
        this.update();
    }

    private isComparisonValid(index: number): boolean {
        while (index >= this.state.rowState.comparisonIsValid.length) {
            this.state.rowState.comparisonIsValid.push(true);
        }
        return this.state.rowState.comparisonIsValid[index];
    }

    private async changeSegmentIcon(index: number) {
        this.props.editor.selectOnly(index);
        const [file] = await openFileAsArrayBuffer();
        this.props.editor.activeSetIconFromArray(new Int8Array(file));
        this.update();
    }

    private removeSegmentIcon(index: number) {
        this.props.editor.selectOnly(index);
        this.props.editor.activeRemoveIcon();
    }

    private processIconChanges(state: LiveSplit.RunEditorStateJson) {
        let index = 0;
        for (const segment of state.segments) {
            while (index >= this.segmentIconUrls.length) {
                this.segmentIconUrls.push("");
            }
            const iconChange = segment.icon_change;
            if (iconChange != null) {
                this.segmentIconUrls[index] = iconChange;
            }
            index += 1;
        }
        if (state.icon_change != null) {
            this.gameIcon = state.icon_change;
        }
    }

    private getSegmentIconUrl(index: number): string {
        return this.segmentIconUrls[index];
    }

    private async changeGameIcon() {
        const [file] = await openFileAsArrayBuffer();
        this.props.editor.setGameIconFromArray(new Int8Array(file));
        this.update();
    }

    private removeGameIcon() {
        this.props.editor.removeGameIcon();
        this.update();
    }

    private getGameIcon(): string {
        return this.gameIcon;
    }

    private update(switchTab?: Tab) {
        const state = this.props.editor.stateAsJson();
        this.processIconChanges(state);
        this.setState({
            ...this.state,
            editor: state,
            tab: switchTab === undefined
                ? this.state.tab
                : switchTab,
        });
    }

    private handleGameChange(event: any) {
        this.props.editor.clearMetadata();
        this.props.editor.setGameName(event.target.value);
        this.refreshGameInfo(event.target.value);
        this.refreshCategoryList(event.target.value);
        this.refreshLeaderboard(event.target.value, this.state.editor.category);
        this.resetTotalLeaderboardState();
        this.update();
    }

    private handleCategoryChange(event: any) {
        this.clearCategorySpecificVariables();
        this.props.editor.setCategoryName(event.target.value);
        this.refreshLeaderboard(this.state.editor.game, event.target.value);
        this.resetTotalLeaderboardState();
        this.update();
    }

    private handleOffsetChange(event: any) {
        const valid = this.props.editor.parseAndSetOffset(event.target.value);
        this.setState({
            ...this.state,
            editor: {
                ...this.state.editor,
                offset: event.target.value,
            },
            offsetIsValid: valid,
        });
    }

    private handleOffsetBlur() {
        this.setState({
            ...this.state,
            editor: this.props.editor.stateAsJson(),
            offsetIsValid: true,
        });
    }

    private handleAttemptsChange(event: any) {
        const valid = this.props.editor.parseAndSetAttemptCount(event.target.value);
        this.setState({
            ...this.state,
            attemptCountIsValid: valid,
            editor: {
                ...this.state.editor,
                attempts: event.target.value,
            },
        });
    }

    private handleAttemptsBlur() {
        this.setState({
            ...this.state,
            attemptCountIsValid: true,
            editor: this.props.editor.stateAsJson(),
        });
    }

    private focusSegment(i: number) {
        this.props.editor.selectOnly(i);
        this.setState({
            ...this.state,
            editor: this.props.editor.stateAsJson(),
            rowState: {
                ...this.state.rowState,
                index: i,
            },
        });
    }

    private handleSegmentNameChange(event: any) {
        this.props.editor.activeSetName(event.target.value);
        this.update();
    }

    private handleSplitTimeChange(event: any) {
        const valid = this.props.editor.activeParseAndSetSplitTime(event.target.value);
        const editor = {
            ...this.state.editor,
        };
        editor.segments[this.state.rowState.index].split_time = event.target.value;
        this.setState({
            ...this.state,
            editor,
            rowState: {
                ...this.state.rowState,
                splitTimeIsValid: valid,
            },
        });
    }

    private handleSegmentTimeChange(event: any) {
        const valid = this.props.editor.activeParseAndSetSegmentTime(event.target.value);
        const editor = {
            ...this.state.editor,
        };
        editor.segments[this.state.rowState.index].segment_time = event.target.value;
        this.setState({
            ...this.state,
            editor,
            rowState: {
                ...this.state.rowState,
                segmentTimeIsValid: valid,
            },
        });
    }

    private handleBestSegmentTimeChange(event: any) {
        const valid = this.props.editor.activeParseAndSetBestSegmentTime(event.target.value);
        const editor = {
            ...this.state.editor,
        };
        editor.segments[this.state.rowState.index].best_segment_time = event.target.value;
        this.setState({
            ...this.state,
            editor,
            rowState: {
                ...this.state.rowState,
                bestSegmentTimeIsValid: valid,
            },
        });
    }

    private handleComparisonTimeChange(event: any, comparisonIndex: number) {
        const comparisonName = this.state.editor.comparison_names[comparisonIndex];
        const valid = this.props.editor.activeParseAndSetComparisonTime(comparisonName, event.target.value);
        const editor = {
            ...this.state.editor,
        };
        editor.segments[this.state.rowState.index].comparison_times[comparisonIndex] = event.target.value;
        const comparisonIsValid = { ...this.state.rowState.comparisonIsValid };
        comparisonIsValid[comparisonIndex] = valid;
        this.setState({
            ...this.state,
            editor,
            rowState: {
                ...this.state.rowState,
                comparisonIsValid,
            },
        });
    }

    private handleSplitTimeBlur() {
        this.setState({
            ...this.state,
            editor: this.props.editor.stateAsJson(),
            rowState: {
                ...this.state.rowState,
                splitTimeIsValid: true,
            },
        });
    }

    private handleSegmentTimeBlur() {
        this.setState({
            ...this.state,
            editor: this.props.editor.stateAsJson(),
            rowState: {
                ...this.state.rowState,
                segmentTimeIsValid: true,
            },
        });
    }

    private handleBestSegmentTimeBlur() {
        this.setState({
            ...this.state,
            editor: this.props.editor.stateAsJson(),
            rowState: {
                ...this.state.rowState,
                bestSegmentTimeIsValid: true,
            },
        });
    }

    private handleComparisonTimeBlur(comparisonIndex: number) {
        const comparisonIsValid = { ...this.state.rowState.comparisonIsValid };
        comparisonIsValid[comparisonIndex] = true;

        this.setState({
            ...this.state,
            editor: this.props.editor.stateAsJson(),
            rowState: {
                ...this.state.rowState,
                comparisonIsValid,
            },
        });
    }

    private insertSegmentAbove() {
        this.props.editor.insertSegmentAbove();
        this.update();
    }

    private insertSegmentBelow() {
        this.props.editor.insertSegmentBelow();
        this.update();
    }

    private removeSegments() {
        this.props.editor.removeSegments();
        this.update();
    }

    private moveSegmentsUp() {
        this.props.editor.moveSegmentsUp();
        this.update();
    }

    private moveSegmentsDown() {
        this.props.editor.moveSegmentsDown();
        this.update();
    }

    private changeSegmentSelection(event: any, i: number) {
        if (!event.currentTarget.classList.contains("selected")) {
            this.props.editor.selectAdditionally(i);
        } else {
            this.props.editor.unselect(i);
        }
        this.update();
    }

    private switchTab(tab: Tab) {
        switch (tab) {
            case Tab.RealTime: {
                this.props.editor.selectTimingMethod(LiveSplit.TimingMethod.RealTime);
                break;
            }
            case Tab.GameTime: {
                this.props.editor.selectTimingMethod(LiveSplit.TimingMethod.GameTime);
                break;
            }
        }
        this.resetTotalLeaderboardState();
        this.update(tab);
    }

    private resetTotalLeaderboardState() {
        this.resetIndividualLeaderboardState();
        this.filters = { variables: new Map(), showObsolete: false };
    }

    private resetIndividualLeaderboardState() {
        this.expandedLeaderboardRows = new Map();
    }

    private async downloadBoxArt() {
        const gameName = this.state.editor.game;
        await downloadGameInfo(gameName);
        const game = getGameInfo(gameName);
        if (game != null) {
            const uri = game.assets["cover-medium"].uri;
            if (uri.startsWith("https://")) {
                const response = await fetch(uri);
                const buffer = await response.arrayBuffer();
                // TODO Racy situation with Run Editor closing
                this.props.editor.setGameIconFromArray(new Int8Array(buffer));
                this.update();
            }
        }
    }

    private async downloadIcon() {
        const gameName = this.state.editor.game;
        await downloadGameInfo(gameName);
        const game = getGameInfo(gameName);
        if (game != null) {
            const uri = game.assets.icon.uri;
            if (uri.startsWith("https://")) {
                const response = await fetch(uri);
                const buffer = await response.arrayBuffer();
                // TODO Racy situation with Run Editor closing
                this.props.editor.setGameIconFromArray(new Int8Array(buffer));
                this.update();
            }
        }
    }

    private async refreshGameList() {
        await downloadGameList();
        this.update();
    }

    private async refreshPlatformList() {
        await downloadPlatformList();
        this.update();
    }

    private async refreshRegionList() {
        await downloadRegionList();
        this.update();
    }

    private async refreshGameInfo(gameName: string) {
        await downloadGameInfo(gameName);
        this.update();
    }

    private async refreshCategoryList(gameName: string) {
        await downloadCategories(gameName);
        this.update();
    }

    private async refreshLeaderboard(gameName: string, categoryName: string) {
        await downloadLeaderboard(gameName, categoryName);
        this.update();
    }

    private getTab(): Tab {
        return this.state.tab;
    }

    private async downloadSplits<T>(apiRun: Run<T>, apiUri: string) {
        const baseUri = "https://splits.io/api/v3/runs/";
        assert(apiUri.startsWith(baseUri), "Unexpected splits i/o URL");
        const splitsId = apiUri.slice(baseUri.length);
        try {
            const gameName = this.state.editor.game;
            const categoryName = this.state.editor.category;
            const runDownload = downloadById(splitsId);
            const platformListDownload = downloadPlatformList();
            const regionListDownload = downloadRegionList();
            const gameInfoDownload = downloadGameInfo(gameName);
            await gameInfoDownload;
            await platformListDownload;
            await regionListDownload;
            const run = await runDownload;
            // TODO Race Condition with the Run Editor closing (and probably others)
            run.with((run) => {
                const newEditor = LiveSplit.RunEditor.new(run);
                if (newEditor != null) {
                    associateRun(
                        newEditor,
                        gameName,
                        categoryName,
                        apiRun,
                    );

                    // TODO Oh no, not internal pointer stuff
                    this.props.editor.dispose();
                    this.props.editor.ptr = newEditor.ptr;

                    this.update();
                } else {
                    toast.error("The downloaded splits are not suitable for being edited.");
                }
            });
        } catch (_) {
            toast.error("Failed to download the splits.");
        }
    }

    private toggleExpandLeaderboardRow(rowIndex: number) {
        if (this.expandedLeaderboardRows.get(rowIndex) === true) {
            this.expandedLeaderboardRows.set(rowIndex, false);
        } else {
            this.expandedLeaderboardRows.set(rowIndex, true);
        }
        this.update();
    }

    private clearCategorySpecificVariables() {
        const categoryList = getCategories(this.state.editor.game);
        if (categoryList != null) {
            for (const category of categoryList) {
                if (category.name !== this.state.editor.category) {
                    continue;
                }
                const gameInfo = getGameInfo(this.state.editor.game);
                if (gameInfo == null) {
                    continue;
                }
                const variables = expect(gameInfo.variables, "We need the variables to be embedded");
                for (const variable of variables.data) {
                    if (
                        variable.category === map(category, (c) => c.id)
                        && (variable.scope.type === "full-game" || variable.scope.type === "global")
                    ) {
                        this.props.editor.removeSpeedrunComVariable(variable.name);
                    }
                }
                break;
            }
        }
    }

    private async interactiveAssociateRunOrOpenPage() {
        const currentRunId = this.state.editor.metadata.run_id;
        if (currentRunId !== "") {
            window.open(`https://www.speedrun.com/run/${currentRunId}`, "_blank");
            return;
        }

        const idOrUrl = prompt("Specify the speedrun.com ID or URL of the run:");
        if (idOrUrl == null) {
            return;
        }
        const pattern = /^(?:(?:https?:\/\/)?(?:www\.)?speedrun\.com\/(?:\w+\/)?run\/)?(\w+)$/;
        const matches = pattern.exec(idOrUrl);
        if (matches == null) {
            toast.error("Invalid speedrun.com ID or URL.");
            return;
        }
        const runId = matches[1];
        const run = await getRun(runId);
        const gameInfo = await downloadGameInfoByGameId(run.game);
        const categories = await downloadCategoriesByGameId(run.game);
        const category = expect(
            categories.find((c) => c.id === run.category),
            "The category doesn't belong to the game.",
        );

        const gameName = gameInfo.names.international;
        const categoryName = category.name;

        associateRun(
            this.props.editor,
            gameName,
            categoryName,
            run,
        );

        this.refreshLeaderboard(gameName, categoryName);
        this.resetTotalLeaderboardState();
        this.update();
    }
}

function associateRun<T>(
    editor: LiveSplit.RunEditorRefMut,
    gameName: string,
    categoryName: string,
    apiRun: Run<T>,
) {
    editor.setGameName(gameName);
    editor.setCategoryName(categoryName);
    const platform = getPlatforms().get(apiRun.system.platform);
    if (platform != null) {
        editor.setPlatformName(platform);
    }
    const region = map(apiRun.system.region, (r) => getRegions().get(r));
    if (region != null) {
        editor.setRegionName(region);
    }
    if (apiRun.comment != null) {
        editor.setCustomVariable("Comment", apiRun.comment);
    }
    editor.setEmulatorUsage(apiRun.system.emulated);
    const variables = map(getGameInfo(gameName), (g) => g.variables);
    if (variables != null) {
        for (const [keyId, valueId] of Object.entries(apiRun.values)) {
            const variable = variables.data.find((v) => v.id === keyId);
            if (variable != null) {
                const value = Object.entries(variable.values.values).find(
                    ([listValueId]) => listValueId === valueId,
                );
                if (value != null) {
                    const valueName = value[1].label;
                    editor.setSpeedrunComVariable(variable.name, valueName);
                }
            }
        }
    }
    // Needs to be set last in order for it not to dissociate again
    editor.setRunId(apiRun.id);
}
