// tslint:disable
const LiveSplitCore = require('./livesplit_core');
const emscriptenModule = LiveSplitCore({});
const liveSplitCoreNative: any = {};

/** The state object for one of the components available. */
export type ComponentStateJson =
    { BlankSpace: BlankSpaceComponentStateJson } |
    { CurrentComparison: CurrentComparisonComponentStateJson } |
    { CurrentPace: CurrentPaceComponentStateJson } |
    { Delta: DeltaComponentStateJson } |
    { DetailedTimer: DetailedTimerComponentStateJson } |
    { Graph: GraphComponentStateJson } |
    { PossibleTimeSave: PossibleTimeSaveComponentStateJson } |
    { PreviousSegment: PreviousSegmentComponentStateJson } |
    { Separator: null } |
    { Splits: SplitsComponentStateJson } |
    { SumOfBest: SumOfBestComponentStateJson } |
    { Text: TextComponentStateJson } |
    { Timer: TimerComponentStateJson } |
    { Title: TitleComponentStateJson } |
    { TotalPlaytime: TotalPlaytimeComponentStateJson };

/**
 * Colors can be used to describe what color to use for visualizing backgrounds,
 * texts, lines and various other elements that are being shown. They are stored
 * as RGBA colors with float point numbers ranging from 0.0 to 1.0 per channel.
 */
export type Color = number[];

/**
 * Describes a Gradient for coloring a region with more than just a single
 * color.
 */
export type Gradient =
    "Transparent" |
    { Plain: Color } |
    { Vertical: Color[] } |
    { Horizontal: Color[] };

/** Describes the Alignment of the Title in the Title Component. */
export type Alignment = "Auto" | "Left" | "Center";

/** The state object describes the information to visualize for the layout. */
export interface LayoutStateJson {
    /** The state objects for all of the components in the layout. */
    components: ComponentStateJson[],
    /** The background to show behind the layout. */
    background: Gradient,
    /** The color of thin separators. */
    thin_separators_color: Color,
    /** The color of normal separators. */
    separators_color: Color,
    /** The text color to use for text that doesn't specify its own color. */
    text_color: Color,
}

/**
 * A Timing Method describes which form of timing is used. This can either be
 * Real Time or Game Time.
 */
export enum TimingMethod {
    /**
     * Real Time is the unmodified timing that is as close to an atomic clock as
     * possible.
     */
    RealTime = 0,
    /**
     * Game Time describes the timing that is provided by the game that is being
     * run. This is entirely optional and may either be Real Time with loading
     * times removed or some time provided by the game.
     */
    GameTime = 1,
}

/**
 * Describes which phase the timer is currently in. This tells you if there's an
 * active speedrun attempt and whether it is paused or it ended.
 */
export enum TimerPhase {
    /** There's currently no active attempt. */
    NotRunning = 0,
    /** There's an active attempt that didn't end yet and isn't paused. */
    Running = 1,
    /** There's an attempt that already ended, but didn't get reset yet. */
    Ended = 2,
    /** There's an active attempt that is currently paused. */
    Paused = 3,
}

/** The state object describes the information to visualize for this component. */
export interface BlankSpaceComponentStateJson {
    /** The background shown behind the component. */
    background: Gradient,
    /** The height of the component. */
    height: number,
}

/** The state object describes the information to visualize for this component. */
export interface TimerComponentStateJson {
    /** The background shown behind the component. */
    background: Gradient,
    /** The time shown by the component without the fractional part. */
    time: string,
    /** The fractional part of the time shown (including the dot). */
    fraction: string,
    /** The semantic coloring information the time carries. */
    semantic_color: SemanticColor,
    /** The top color of the timer's gradient. */
    top_color: Color,
    /** The bottom color of the timer's gradient. */
    bottom_color: Color,
    /** The height of the timer. */
    height: number,
}

/** The state object describes the information to visualize for this component. */
export interface TitleComponentStateJson {
    /** The background shown behind the component. */
    background: Gradient,
    /**
     * The color of the text. If `null` is specified, the color is taken from
     * the layout.
     */
    text_color: Color | null,
    /**
     * The game's icon encoded as a Data URL. This value is only specified
     * whenever the icon changes. If you explicitly want to query this value,
     * remount the component. The String itself may be empty. This indicates
     * that there is no icon.
     */
    icon_change: string | null,
    /**
     * The first title line to show. This is either the game's name, or a
     * combination of the game's name and the category.
     */
    line1: string,
    /**
     * By default the category name is shown on the second line. Based on the
     * settings, it can however instead be shown in a single line together with
     * the game name.
     */
    line2: string | null,
    /**
     * Specifies whether the title should centered or aligned to the left
     * instead.
     */
    is_centered: boolean,
    /**
     * The amount of successfully finished attempts. If `null` is specified, the
     * amount of successfully finished attempts isn't supposed to be shown.
     */
    finished_runs: number | null,
    /**
     * The amount of total attempts. If `null` is specified, the amount of total
     * attempts isn't supposed to be shown.
     */
    attempts: number | null,
}

/** The state object describes the information to visualize for this component. */
export interface SplitsComponentStateJson {
    /** The list of all the segments to visualize. */
    splits: SplitStateJson[],
    /**
     * This list describes all the icon changes that happened. Each time a
     * segment is first shown or its icon changes, the new icon is provided in
     * this list. If necessary, you may remount this component to reset the
     * component into a state where these icons are provided again.
     */
    icon_changes: SplitsComponentIconChangeJson[],
    /**
     * Describes whether a more pronounced separator should be shown in front of
     * the last segment provided.
     */
    show_final_separator: boolean,
    /**
     * The gradient to show behind the current segment as an indicator of it
     * being the current segment.
     */
    current_split_gradient: Gradient,
}

/**
 * Describes the icon to be shown for a certain segment. This is provided
 * whenever a segment is first shown or whenever its icon changes. If necessary,
 * you may remount this component to reset the component into a state where
 * these icons are provided again.
 */
export interface SplitsComponentIconChangeJson {
    /**
     * The index of the segment of which the icon changed. This is based on the
     * index in the run, not on the index of the `SplitStateJson` in the
     * `SplitsComponentStateJson` object. The corresponding index is the `index`
     * field of the `SplitStateJson` object.
     */
    segment_index: number,
    /**
     * The segment's icon encoded as a Data URL. The String itself may be empty.
     * This indicates that there is no icon.
     */
    icon: string,
}

/** The state object that describes a single segment's information to visualize. */
export interface SplitStateJson {
    /** The name of the segment. */
    name: string,
    /** The delta to show for this segment. */
    delta: string,
    /** The split time to show for this segment. */
    time: string,
    /** The semantic coloring information the delta time carries. */
    semantic_color: SemanticColor,
    /** The visual color of the delta time. */
    visual_color: Color,
    /**
     * Describes if this segment is the segment the active attempt is currently
     * on.
     */
    is_current_split: boolean,
    /**
     * The index of the segment based on all the segments of the run. This may
     * differ from the index of this `SplitStateJson` in the
     * `SplitsComponentStateJson` object, as there can be a scrolling window,
     * showing only a subset of segments.
     */
    index: number,
}

/** The state object describes the information to visualize for this component. */
export interface PreviousSegmentComponentStateJson {
    /** The background shown behind the component. */
    background: Gradient,
    /**
     * The color of the label. If `null` is specified, the color is taken from
     * the layout.
     */
    label_color: Color | null,
    /** The label's text. */
    text: string,
    /** The delta (and possibly the possible time save). */
    time: string,
    /** The semantic coloring information the delta time carries. */
    semantic_color: SemanticColor,
    /** The visual color of the delta time. */
    visual_color: Color,
}

/** The state object describes the information to visualize for this component. */
export interface SumOfBestComponentStateJson {
    /** The background shown behind the component. */
    background: Gradient,
    /**
     * The color of the label. If `null` is specified, the color is taken from
     * the layout.
     */
    label_color: Color | null,
    /**
     * The color of the value. If `null` is specified, the color is taken from
     * the layout.
     */
    value_color: Color | null,
    /** The label's text. */
    text: string,
    /** The sum of best segments. */
    time: string,
}

/** The state object describes the information to visualize for this component. */
export interface PossibleTimeSaveComponentStateJson {
    /** The background shown behind the component. */
    background: Gradient,
    /**
     * The color of the label. If `null` is specified, the color is taken from
     * the layout.
     */
    label_color: Color | null,
    /**
     * The color of the value. If `null` is specified, the color is taken from
     * the layout.
     */
    value_color: Color | null,
    /** The label's text. */
    text: string,
    /** The current possible time save. */
    time: string,
}

/**
 * The state object describes the information to visualize for this component.
 * All the coordinates are in the range 0..1.
 */
export interface GraphComponentStateJson {
    /**
     * All of the graph's points. Connect all of them to visualize the graph. If
     * the live delta is active, the last point is to be interpreted as a
     * preview of the next split that is about to happen. Use the partial fill
     * color to visualize the region beneath that graph segment.
     */
    points: GraphComponentStatePointJson[],
    /** Contains the y coordinates of all the horizontal grid lines. */
    horizontal_grid_lines: number[],
    /** Contains the x coordinates of all the vertical grid lines. */
    vertical_grid_lines: number[],
    /**
     * The y coordinate that separates the region that shows the times that are
     * ahead of the comparison and those that are behind.
     */
    middle: number,
    /**
     * If the live delta is active, the last point is to be interpreted as a
     * preview of the next split that is about to happen. Use the partial fill
     * color to visualize the region beneath that graph segment.
     */
    is_live_delta_active: boolean,
    /**
     * Describes whether the graph is flipped vertically. For visualizing the
     * graph, this usually doesn't need to be interpreted, as this information
     * is entirely encoded into the other variables.
     */
    is_flipped: boolean,
    /**
     * The background color to use for the top region of the graph. The top
     * region ends at the y coordinate of the middle.
     */
    top_background_color: Color,
    /**
     * The background color to use for the bottom region of the graph. The top
     * region begins at the y coordinate of the middle.
     */
    bottom_background_color: Color,
    /** The color of the grid lines on the graph. */
    grid_lines_color: Color,
    /** The color of the lines connecting all the graph's points. */
    graph_lines_color: Color,
    /**
     * The color of the polygon connecting all the graph's points. The partial
     * fill color is only used for live changes.
     */
    partial_fill_color: Color,
    /** The color of the polygon connecting all the graph's points. */
    complete_fill_color: Color,
    /**
     * The best segment color to use for coloring graph segments that achieved a
     * new best segment time.
     */
    best_segment_color: Color,
    /** The height of the graph. */
    height: number,
}

/** Describes a point on the graph to visualize. */
export interface GraphComponentStatePointJson {
    /** The x coordinate of the point. */
    x: number,
    /** The y coordinate of the point. */
    y: number,
    /**
     * Describes whether the segment this point is visualizing achieved a new
     * best segment time. Use the best segment color for it, in that case.
     */
    is_best_segment: boolean,
}

/** The state object describes the information to visualize for this component. */
export interface TextComponentStateJson {
    /** The background shown behind the component. */
    background: Gradient,
    /** The text to show for the component. */
    text: TextComponentStateText,
}

/** The text that is supposed to be shown. */
export type TextComponentStateText =
    { Center: string } |
    { Split: string[] };

/** The state object describes the information to visualize for this component. */
export interface TotalPlaytimeComponentStateJson {
    /** The background shown behind the component. */
    background: Gradient,
    /**
     * The color of the label. If `null` is specified, the color is taken from
     * the layout.
     */
    label_color: Color | null,
    /**
     * The color of the value. If `null` is specified, the color is taken from
     * the layout.
     */
    value_color: Color | null,
    /** The label's text. */
    text: string,
    /** The total playtime. */
    time: string,
}

/** The state object describes the information to visualize for this component. */
export interface CurrentPaceComponentStateJson {
    /** The background shown behind the component. */
    background: Gradient,
    /**
     * The color of the label. If `null` is specified, the color is taken from
     * the layout.
     */
    label_color: Color | null,
    /**
     * The color of the value. If `null` is specified, the color is taken from
     * the layout.
     */
    value_color: Color | null,
    /** The label's text. */
    text: string,
    /** The current pace. */
    time: string,
}

/** The state object describes the information to visualize for this component. */
export interface DeltaComponentStateJson {
    /** The background shown behind the component. */
    background: Gradient,
    /**
     * The color of the label. If `null` is specified, the color is taken from
     * the layout.
     */
    label_color: Color | null,
    /** The label's text. */
    text: string,
    /** The delta. */
    time: string,
    /** The semantic coloring information the delta time carries. */
    semantic_color: SemanticColor,
    /** The visual color of the delta time. */
    visual_color: Color,
}

/** The state object describes the information to visualize for this component. */
export interface CurrentComparisonComponentStateJson {
    /** The background shown behind the component. */
    background: Gradient,
    /**
     * The color of the label. If `null` is specified, the color is taken from
     * the layout.
     */
    label_color: Color | null,
    /**
     * The color of the value. If `null` is specified, the color is taken from
     * the layout.
     */
    value_color: Color | null,
    /** The label's text. */
    text: string,
    /**
     * The name of the comparison that is currently selected to be compared
     * against.
     */
    comparison: string,
}

/** The state object describes the information to visualize for this component. */
export interface DetailedTimerComponentStateJson {
    /** The background shown behind the component. */
    background: Gradient,
    /** The state of the attempt timer. */
    timer: TimerComponentStateJson,
    /** The state of the segment timer. */
    segment_timer: TimerComponentStateJson,
    /** The first comparison to visualize. */
    comparison1: DetailedTimerComponentComparisonStateJson | null,
    /** The second comparison to visualize. */
    comparison2: DetailedTimerComponentComparisonStateJson | null,
    /**
     * The name of the segment. This may be `null` if it's not supposed to be
     * visualized.
     */
    segment_name: string | null,
    /**
     * The segment's icon encoded as a Data URL. This value is only specified
     * whenever the icon changes. If you explicitly want to query this value,
     * remount the component. The String itself may be empty. This indicates
     * that there is no icon.
     */
    icon_change: string | null,
}

/** The state object describing a comparison to visualize. */
export interface DetailedTimerComponentComparisonStateJson {
    /** The name of the comparison. */
    name: string,
    /** The time to show for the comparison. */
    time: string,
}

/**
 * Represents the current state of the Layout Editor in order to visualize it
 * properly.
 */
export interface LayoutEditorStateJson {
    /** The name of all the components in the layout. */
    components: string[],
    /** Describes which actions are currently available. */
    buttons: LayoutEditorButtonsJson,
    /** The index of the currently selected component. */
    selected_component: number,
    /**
     * A generic description of the settings available for the selected
     * component and their current values.
     */
    component_settings: SettingsDescriptionJson,
    /**
     * A generic description of the general settings available for the layout
     * and their current values.
     */
    general_settings: SettingsDescriptionJson,
}

/**
 * Describes which actions are currently available. Depending on how many
 * components exist and which one is selected, only some actions can be executed
 * successfully.
 */
export interface LayoutEditorButtonsJson {
    /**
     * Describes whether the currently selected component can be removed. If
     * there's only one component in the layout, it can't be removed.
     */
    can_remove: boolean,
    /**
     * Describes whether the currently selected component can be moved up. If
     * the first component is selected, it can't be moved.
     */
    can_move_up: boolean,
    /**
     * Describes whether the currently selected component can be moved down. If
     * the last component is selected, it can't be moved.
     */
    can_move_down: boolean,
}

/** A generic description of the settings available and their current values. */
export interface SettingsDescriptionJson {
    /**
     * All of the different settings that are available and their current
     * values.
     */
    fields: SettingsDescriptionFieldJson[],
}

/** A Field describes a single setting by its name and its current value. */
export interface SettingsDescriptionFieldJson {
    /** The name of the setting. */
    text: string,
    /** The current value of the setting. */
    value: SettingsDescriptionValueJson,
}

/**
 * Describes a setting's value. Such a value can be of a variety of different
 * types.
 */
export type SettingsDescriptionValueJson =
    { Bool: boolean } |
    { UInt: number } |
    { Int: number } |
    { String: string } |
    { OptionalString: string | null } |
    { Float: number } |
    { Accuracy: AccuracyJson } |
    { DigitsFormat: DigitsFormatJson } |
    { OptionalTimingMethod: TimingMethodJson | null } |
    { Color: Color } |
    { OptionalColor: Color | null } |
    { Gradient: Gradient } |
    { Alignment: Alignment };

/**
 * The Accuracy describes how many digits to show for the fractional part of a
 * time.
 */
export type AccuracyJson = "Seconds" | "Tenths" | "Hundredths";

/**
 * A Timing Method describes which form of timing is used. This can either be
 * Real Time or Game Time.
 */
export type TimingMethodJson = "RealTime" | "GameTime";

/**
 * A Digits Format describes how many digits of a time to always shown. The
 * times are prefixed by zeros to fill up the remaining digits.
 */
export type DigitsFormatJson =
    "SingleDigitSeconds" |
    "DoubleDigitSeconds" |
    "SingleDigitMinutes" |
    "DoubleDigitMinutes" |
    "SingleDigitHours" |
    "DoubleDigitHours";

/**
 * Represents the current state of the Run Editor in order to visualize it
 * properly.
 */
export interface RunEditorStateJson {
    /**
     * The game's icon encoded as a Data URL. This value is only specified
     * whenever the icon changes. The String itself may be empty. This
     * indicates that there is no icon.
     */
    icon_change: string | null,
    /** The name of the game the Run is for. */
    game: string,
    /** The name of the category the Run is for. */
    category: string,
    /**
     * The timer offset specifies the time that the timer starts at when starting a
     * new attempt.
     */
    offset: string,
    /**
     * The number of times this Run has been attempted by the runner. This
     * is mostly just a visual number and has no effect on any history.
     */
    attempts: number,
    /**
     * The timing method that is currently selected to be visualized and
     * edited.
     */
    timing_method: TimingMethodJson,
    /** The state of all the segments. */
    segments: RunEditorRowJson[],
    /** The names of all the custom comparisons that exist for this Run. */
    comparison_names: string[],
    /** Describes which actions are currently available. */
    buttons: RunEditorButtonsJson,
}

/**
 * Describes which actions are currently available. Depending on how many
 * segments exist and which ones are selected, only some actions can be
 * executed successfully.
 */
export interface RunEditorButtonsJson {
    /**
     * Describes whether the currently selected segments can be removed. If all
     * segments are selected, they can't be removed.
     */
    can_remove: boolean,
    /**
     * Describes whether the currently selected segments can be moved up. If
     * any one of the selected segments is the first segment, then they can't
     * be moved.
     */
    can_move_up: boolean,
    /**
     * Describes whether the currently selected segments can be moved down. If
     * any one of the selected segments is the last segment, then they can't be
     * moved.
     */
    can_move_down: boolean,
}

/** Describes the current state of a segment. */
export interface RunEditorRowJson {
    /**
     * The segment's icon encoded as a Data URL. This value is only specified
     * whenever the icon changes. The String itself may be empty. This
     * indicates that there is no icon.
     */
    icon_change: string | null,
    /** The name of the segment. */
    name: string,
    /** The segment's split time for the active timing method. */
    split_time: string,
    /** The segment time for the active timing method. */
    segment_time: string,
    /** The best segment time for the active timing method. */
    best_segment_time: string,
    /**
     * All of the times of the custom comparison for the active timing method.
     * The order of these matches up with the order of the custom comparisons
     * provided by the Run Editor's State object.
     */
    comparison_times: string[],
    /** Describes the segment's selection state. */
    selected: "NotSelected" | "Selected" | "Active",
}

/**
 * A Semantic Color describes a color by some meaningful event that is
 * happening. This information can be visualized as a color, but can also be
 * interpreted in other ways by the consumer of this API.
 */
export type SemanticColor = "Default" |
    "AheadGainingTime" |
    "AheadLosingTime" |
    "BehindLosingTime" |
    "BehindGainingTime" |
    "BestSegment" |
    "NotRunning" |
    "Paused" |
    "PersonalBest";

liveSplitCoreNative.AtomicDateTime_drop = emscriptenModule.cwrap('AtomicDateTime_drop', null, ["number"]);
liveSplitCoreNative.AtomicDateTime_is_synchronized = emscriptenModule.cwrap('AtomicDateTime_is_synchronized', "number", ["number"]);
liveSplitCoreNative.AtomicDateTime_to_rfc2822 = emscriptenModule.cwrap('AtomicDateTime_to_rfc2822', "string", ["number"]);
liveSplitCoreNative.AtomicDateTime_to_rfc3339 = emscriptenModule.cwrap('AtomicDateTime_to_rfc3339', "string", ["number"]);
liveSplitCoreNative.Attempt_index = emscriptenModule.cwrap('Attempt_index', "number", ["number"]);
liveSplitCoreNative.Attempt_time = emscriptenModule.cwrap('Attempt_time', "number", ["number"]);
liveSplitCoreNative.Attempt_pause_time = emscriptenModule.cwrap('Attempt_pause_time', "number", ["number"]);
liveSplitCoreNative.Attempt_started = emscriptenModule.cwrap('Attempt_started', "number", ["number"]);
liveSplitCoreNative.Attempt_ended = emscriptenModule.cwrap('Attempt_ended', "number", ["number"]);
liveSplitCoreNative.BlankSpaceComponent_new = emscriptenModule.cwrap('BlankSpaceComponent_new', "number", []);
liveSplitCoreNative.BlankSpaceComponent_drop = emscriptenModule.cwrap('BlankSpaceComponent_drop', null, ["number"]);
liveSplitCoreNative.BlankSpaceComponent_into_generic = emscriptenModule.cwrap('BlankSpaceComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.BlankSpaceComponent_state_as_json = emscriptenModule.cwrap('BlankSpaceComponent_state_as_json', "string", ["number", "number"]);
liveSplitCoreNative.BlankSpaceComponent_state = emscriptenModule.cwrap('BlankSpaceComponent_state', "number", ["number", "number"]);
liveSplitCoreNative.BlankSpaceComponentState_drop = emscriptenModule.cwrap('BlankSpaceComponentState_drop', null, ["number"]);
liveSplitCoreNative.BlankSpaceComponentState_height = emscriptenModule.cwrap('BlankSpaceComponentState_height', "number", ["number"]);
liveSplitCoreNative.Component_drop = emscriptenModule.cwrap('Component_drop', null, ["number"]);
liveSplitCoreNative.CurrentComparisonComponent_new = emscriptenModule.cwrap('CurrentComparisonComponent_new', "number", []);
liveSplitCoreNative.CurrentComparisonComponent_drop = emscriptenModule.cwrap('CurrentComparisonComponent_drop', null, ["number"]);
liveSplitCoreNative.CurrentComparisonComponent_into_generic = emscriptenModule.cwrap('CurrentComparisonComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.CurrentComparisonComponent_state_as_json = emscriptenModule.cwrap('CurrentComparisonComponent_state_as_json', "string", ["number", "number"]);
liveSplitCoreNative.CurrentComparisonComponent_state = emscriptenModule.cwrap('CurrentComparisonComponent_state', "number", ["number", "number"]);
liveSplitCoreNative.CurrentComparisonComponentState_drop = emscriptenModule.cwrap('CurrentComparisonComponentState_drop', null, ["number"]);
liveSplitCoreNative.CurrentComparisonComponentState_text = emscriptenModule.cwrap('CurrentComparisonComponentState_text', "string", ["number"]);
liveSplitCoreNative.CurrentComparisonComponentState_comparison = emscriptenModule.cwrap('CurrentComparisonComponentState_comparison', "string", ["number"]);
liveSplitCoreNative.CurrentPaceComponent_new = emscriptenModule.cwrap('CurrentPaceComponent_new', "number", []);
liveSplitCoreNative.CurrentPaceComponent_drop = emscriptenModule.cwrap('CurrentPaceComponent_drop', null, ["number"]);
liveSplitCoreNative.CurrentPaceComponent_into_generic = emscriptenModule.cwrap('CurrentPaceComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.CurrentPaceComponent_state_as_json = emscriptenModule.cwrap('CurrentPaceComponent_state_as_json', "string", ["number", "number"]);
liveSplitCoreNative.CurrentPaceComponent_state = emscriptenModule.cwrap('CurrentPaceComponent_state', "number", ["number", "number"]);
liveSplitCoreNative.CurrentPaceComponentState_drop = emscriptenModule.cwrap('CurrentPaceComponentState_drop', null, ["number"]);
liveSplitCoreNative.CurrentPaceComponentState_text = emscriptenModule.cwrap('CurrentPaceComponentState_text', "string", ["number"]);
liveSplitCoreNative.CurrentPaceComponentState_time = emscriptenModule.cwrap('CurrentPaceComponentState_time', "string", ["number"]);
liveSplitCoreNative.DeltaComponent_new = emscriptenModule.cwrap('DeltaComponent_new', "number", []);
liveSplitCoreNative.DeltaComponent_drop = emscriptenModule.cwrap('DeltaComponent_drop', null, ["number"]);
liveSplitCoreNative.DeltaComponent_into_generic = emscriptenModule.cwrap('DeltaComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.DeltaComponent_state_as_json = emscriptenModule.cwrap('DeltaComponent_state_as_json', "string", ["number", "number", "number"]);
liveSplitCoreNative.DeltaComponent_state = emscriptenModule.cwrap('DeltaComponent_state', "number", ["number", "number", "number"]);
liveSplitCoreNative.DeltaComponentState_drop = emscriptenModule.cwrap('DeltaComponentState_drop', null, ["number"]);
liveSplitCoreNative.DeltaComponentState_text = emscriptenModule.cwrap('DeltaComponentState_text', "string", ["number"]);
liveSplitCoreNative.DeltaComponentState_time = emscriptenModule.cwrap('DeltaComponentState_time', "string", ["number"]);
liveSplitCoreNative.DeltaComponentState_semantic_color = emscriptenModule.cwrap('DeltaComponentState_semantic_color', "string", ["number"]);
liveSplitCoreNative.DetailedTimerComponent_new = emscriptenModule.cwrap('DetailedTimerComponent_new', "number", []);
liveSplitCoreNative.DetailedTimerComponent_drop = emscriptenModule.cwrap('DetailedTimerComponent_drop', null, ["number"]);
liveSplitCoreNative.DetailedTimerComponent_into_generic = emscriptenModule.cwrap('DetailedTimerComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.DetailedTimerComponent_state_as_json = emscriptenModule.cwrap('DetailedTimerComponent_state_as_json', "string", ["number", "number", "number"]);
liveSplitCoreNative.DetailedTimerComponent_state = emscriptenModule.cwrap('DetailedTimerComponent_state', "number", ["number", "number", "number"]);
liveSplitCoreNative.DetailedTimerComponentState_drop = emscriptenModule.cwrap('DetailedTimerComponentState_drop', null, ["number"]);
liveSplitCoreNative.DetailedTimerComponentState_timer_time = emscriptenModule.cwrap('DetailedTimerComponentState_timer_time', "string", ["number"]);
liveSplitCoreNative.DetailedTimerComponentState_timer_fraction = emscriptenModule.cwrap('DetailedTimerComponentState_timer_fraction', "string", ["number"]);
liveSplitCoreNative.DetailedTimerComponentState_timer_semantic_color = emscriptenModule.cwrap('DetailedTimerComponentState_timer_semantic_color', "string", ["number"]);
liveSplitCoreNative.DetailedTimerComponentState_segment_timer_time = emscriptenModule.cwrap('DetailedTimerComponentState_segment_timer_time', "string", ["number"]);
liveSplitCoreNative.DetailedTimerComponentState_segment_timer_fraction = emscriptenModule.cwrap('DetailedTimerComponentState_segment_timer_fraction', "string", ["number"]);
liveSplitCoreNative.DetailedTimerComponentState_comparison1_visible = emscriptenModule.cwrap('DetailedTimerComponentState_comparison1_visible', "number", ["number"]);
liveSplitCoreNative.DetailedTimerComponentState_comparison1_name = emscriptenModule.cwrap('DetailedTimerComponentState_comparison1_name', "string", ["number"]);
liveSplitCoreNative.DetailedTimerComponentState_comparison1_time = emscriptenModule.cwrap('DetailedTimerComponentState_comparison1_time', "string", ["number"]);
liveSplitCoreNative.DetailedTimerComponentState_comparison2_visible = emscriptenModule.cwrap('DetailedTimerComponentState_comparison2_visible', "number", ["number"]);
liveSplitCoreNative.DetailedTimerComponentState_comparison2_name = emscriptenModule.cwrap('DetailedTimerComponentState_comparison2_name', "string", ["number"]);
liveSplitCoreNative.DetailedTimerComponentState_comparison2_time = emscriptenModule.cwrap('DetailedTimerComponentState_comparison2_time', "string", ["number"]);
liveSplitCoreNative.DetailedTimerComponentState_icon_change = emscriptenModule.cwrap('DetailedTimerComponentState_icon_change', "string", ["number"]);
liveSplitCoreNative.DetailedTimerComponentState_segment_name = emscriptenModule.cwrap('DetailedTimerComponentState_segment_name', "string", ["number"]);
liveSplitCoreNative.GeneralLayoutSettings_default = emscriptenModule.cwrap('GeneralLayoutSettings_default', "number", []);
liveSplitCoreNative.GeneralLayoutSettings_drop = emscriptenModule.cwrap('GeneralLayoutSettings_drop', null, ["number"]);
liveSplitCoreNative.GraphComponent_new = emscriptenModule.cwrap('GraphComponent_new', "number", []);
liveSplitCoreNative.GraphComponent_drop = emscriptenModule.cwrap('GraphComponent_drop', null, ["number"]);
liveSplitCoreNative.GraphComponent_into_generic = emscriptenModule.cwrap('GraphComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.GraphComponent_state_as_json = emscriptenModule.cwrap('GraphComponent_state_as_json', "string", ["number", "number", "number"]);
liveSplitCoreNative.GraphComponent_state = emscriptenModule.cwrap('GraphComponent_state', "number", ["number", "number", "number"]);
liveSplitCoreNative.GraphComponentState_drop = emscriptenModule.cwrap('GraphComponentState_drop', null, ["number"]);
liveSplitCoreNative.GraphComponentState_points_len = emscriptenModule.cwrap('GraphComponentState_points_len', "number", ["number"]);
liveSplitCoreNative.GraphComponentState_point_x = emscriptenModule.cwrap('GraphComponentState_point_x', "number", ["number", "number"]);
liveSplitCoreNative.GraphComponentState_point_y = emscriptenModule.cwrap('GraphComponentState_point_y', "number", ["number", "number"]);
liveSplitCoreNative.GraphComponentState_point_is_best_segment = emscriptenModule.cwrap('GraphComponentState_point_is_best_segment', "number", ["number", "number"]);
liveSplitCoreNative.GraphComponentState_horizontal_grid_lines_len = emscriptenModule.cwrap('GraphComponentState_horizontal_grid_lines_len', "number", ["number"]);
liveSplitCoreNative.GraphComponentState_horizontal_grid_line = emscriptenModule.cwrap('GraphComponentState_horizontal_grid_line', "number", ["number", "number"]);
liveSplitCoreNative.GraphComponentState_vertical_grid_lines_len = emscriptenModule.cwrap('GraphComponentState_vertical_grid_lines_len', "number", ["number"]);
liveSplitCoreNative.GraphComponentState_vertical_grid_line = emscriptenModule.cwrap('GraphComponentState_vertical_grid_line', "number", ["number", "number"]);
liveSplitCoreNative.GraphComponentState_middle = emscriptenModule.cwrap('GraphComponentState_middle', "number", ["number"]);
liveSplitCoreNative.GraphComponentState_is_live_delta_active = emscriptenModule.cwrap('GraphComponentState_is_live_delta_active', "number", ["number"]);
liveSplitCoreNative.GraphComponentState_is_flipped = emscriptenModule.cwrap('GraphComponentState_is_flipped', "number", ["number"]);
liveSplitCoreNative.HotkeySystem_new = emscriptenModule.cwrap('HotkeySystem_new', "number", ["number"]);
liveSplitCoreNative.HotkeySystem_drop = emscriptenModule.cwrap('HotkeySystem_drop', null, ["number"]);
liveSplitCoreNative.HotkeySystem_deactivate = emscriptenModule.cwrap('HotkeySystem_deactivate', null, ["number"]);
liveSplitCoreNative.HotkeySystem_activate = emscriptenModule.cwrap('HotkeySystem_activate', null, ["number"]);
liveSplitCoreNative.Layout_new = emscriptenModule.cwrap('Layout_new', "number", []);
liveSplitCoreNative.Layout_default_layout = emscriptenModule.cwrap('Layout_default_layout', "number", []);
liveSplitCoreNative.Layout_parse_json = emscriptenModule.cwrap('Layout_parse_json', "number", ["string"]);
liveSplitCoreNative.Layout_drop = emscriptenModule.cwrap('Layout_drop', null, ["number"]);
liveSplitCoreNative.Layout_clone = emscriptenModule.cwrap('Layout_clone', "number", ["number"]);
liveSplitCoreNative.Layout_settings_as_json = emscriptenModule.cwrap('Layout_settings_as_json', "string", ["number"]);
liveSplitCoreNative.Layout_state_as_json = emscriptenModule.cwrap('Layout_state_as_json', "string", ["number", "number"]);
liveSplitCoreNative.Layout_push = emscriptenModule.cwrap('Layout_push', null, ["number", "number"]);
liveSplitCoreNative.Layout_scroll_up = emscriptenModule.cwrap('Layout_scroll_up', null, ["number"]);
liveSplitCoreNative.Layout_scroll_down = emscriptenModule.cwrap('Layout_scroll_down', null, ["number"]);
liveSplitCoreNative.Layout_remount = emscriptenModule.cwrap('Layout_remount', null, ["number"]);
liveSplitCoreNative.LayoutEditor_new = emscriptenModule.cwrap('LayoutEditor_new', "number", ["number"]);
liveSplitCoreNative.LayoutEditor_close = emscriptenModule.cwrap('LayoutEditor_close', "number", ["number"]);
liveSplitCoreNative.LayoutEditor_state_as_json = emscriptenModule.cwrap('LayoutEditor_state_as_json', "string", ["number"]);
liveSplitCoreNative.LayoutEditor_layout_state_as_json = emscriptenModule.cwrap('LayoutEditor_layout_state_as_json', "string", ["number", "number"]);
liveSplitCoreNative.LayoutEditor_select = emscriptenModule.cwrap('LayoutEditor_select', null, ["number", "number"]);
liveSplitCoreNative.LayoutEditor_add_component = emscriptenModule.cwrap('LayoutEditor_add_component', null, ["number", "number"]);
liveSplitCoreNative.LayoutEditor_remove_component = emscriptenModule.cwrap('LayoutEditor_remove_component', null, ["number"]);
liveSplitCoreNative.LayoutEditor_move_component_up = emscriptenModule.cwrap('LayoutEditor_move_component_up', null, ["number"]);
liveSplitCoreNative.LayoutEditor_move_component_down = emscriptenModule.cwrap('LayoutEditor_move_component_down', null, ["number"]);
liveSplitCoreNative.LayoutEditor_move_component = emscriptenModule.cwrap('LayoutEditor_move_component', null, ["number", "number"]);
liveSplitCoreNative.LayoutEditor_duplicate_component = emscriptenModule.cwrap('LayoutEditor_duplicate_component', null, ["number"]);
liveSplitCoreNative.LayoutEditor_set_component_settings_value = emscriptenModule.cwrap('LayoutEditor_set_component_settings_value', null, ["number", "number", "number"]);
liveSplitCoreNative.LayoutEditor_set_general_settings_value = emscriptenModule.cwrap('LayoutEditor_set_general_settings_value', null, ["number", "number", "number"]);
liveSplitCoreNative.ParseRunResult_drop = emscriptenModule.cwrap('ParseRunResult_drop', null, ["number"]);
liveSplitCoreNative.ParseRunResult_unwrap = emscriptenModule.cwrap('ParseRunResult_unwrap', "number", ["number"]);
liveSplitCoreNative.ParseRunResult_parsed_successfully = emscriptenModule.cwrap('ParseRunResult_parsed_successfully', "number", ["number"]);
liveSplitCoreNative.ParseRunResult_timer_kind = emscriptenModule.cwrap('ParseRunResult_timer_kind', "string", ["number"]);
liveSplitCoreNative.PossibleTimeSaveComponent_new = emscriptenModule.cwrap('PossibleTimeSaveComponent_new', "number", []);
liveSplitCoreNative.PossibleTimeSaveComponent_drop = emscriptenModule.cwrap('PossibleTimeSaveComponent_drop', null, ["number"]);
liveSplitCoreNative.PossibleTimeSaveComponent_into_generic = emscriptenModule.cwrap('PossibleTimeSaveComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.PossibleTimeSaveComponent_state_as_json = emscriptenModule.cwrap('PossibleTimeSaveComponent_state_as_json', "string", ["number", "number"]);
liveSplitCoreNative.PossibleTimeSaveComponent_state = emscriptenModule.cwrap('PossibleTimeSaveComponent_state', "number", ["number", "number"]);
liveSplitCoreNative.PossibleTimeSaveComponentState_drop = emscriptenModule.cwrap('PossibleTimeSaveComponentState_drop', null, ["number"]);
liveSplitCoreNative.PossibleTimeSaveComponentState_text = emscriptenModule.cwrap('PossibleTimeSaveComponentState_text', "string", ["number"]);
liveSplitCoreNative.PossibleTimeSaveComponentState_time = emscriptenModule.cwrap('PossibleTimeSaveComponentState_time', "string", ["number"]);
liveSplitCoreNative.PotentialCleanUp_drop = emscriptenModule.cwrap('PotentialCleanUp_drop', null, ["number"]);
liveSplitCoreNative.PotentialCleanUp_message = emscriptenModule.cwrap('PotentialCleanUp_message', "string", ["number"]);
liveSplitCoreNative.PreviousSegmentComponent_new = emscriptenModule.cwrap('PreviousSegmentComponent_new', "number", []);
liveSplitCoreNative.PreviousSegmentComponent_drop = emscriptenModule.cwrap('PreviousSegmentComponent_drop', null, ["number"]);
liveSplitCoreNative.PreviousSegmentComponent_into_generic = emscriptenModule.cwrap('PreviousSegmentComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.PreviousSegmentComponent_state_as_json = emscriptenModule.cwrap('PreviousSegmentComponent_state_as_json', "string", ["number", "number", "number"]);
liveSplitCoreNative.PreviousSegmentComponent_state = emscriptenModule.cwrap('PreviousSegmentComponent_state', "number", ["number", "number", "number"]);
liveSplitCoreNative.PreviousSegmentComponentState_drop = emscriptenModule.cwrap('PreviousSegmentComponentState_drop', null, ["number"]);
liveSplitCoreNative.PreviousSegmentComponentState_text = emscriptenModule.cwrap('PreviousSegmentComponentState_text', "string", ["number"]);
liveSplitCoreNative.PreviousSegmentComponentState_time = emscriptenModule.cwrap('PreviousSegmentComponentState_time', "string", ["number"]);
liveSplitCoreNative.PreviousSegmentComponentState_semantic_color = emscriptenModule.cwrap('PreviousSegmentComponentState_semantic_color', "string", ["number"]);
liveSplitCoreNative.Run_new = emscriptenModule.cwrap('Run_new', "number", []);
liveSplitCoreNative.Run_parse = emscriptenModule.cwrap('Run_parse', "number", ["number", "number", "string", "number"]);
liveSplitCoreNative.Run_parse_file_handle = emscriptenModule.cwrap('Run_parse_file_handle', "number", ["number", "string", "number"]);
liveSplitCoreNative.Run_drop = emscriptenModule.cwrap('Run_drop', null, ["number"]);
liveSplitCoreNative.Run_clone = emscriptenModule.cwrap('Run_clone', "number", ["number"]);
liveSplitCoreNative.Run_game_name = emscriptenModule.cwrap('Run_game_name', "string", ["number"]);
liveSplitCoreNative.Run_game_icon = emscriptenModule.cwrap('Run_game_icon', "string", ["number"]);
liveSplitCoreNative.Run_category_name = emscriptenModule.cwrap('Run_category_name', "string", ["number"]);
liveSplitCoreNative.Run_extended_file_name = emscriptenModule.cwrap('Run_extended_file_name', "string", ["number", "number"]);
liveSplitCoreNative.Run_extended_name = emscriptenModule.cwrap('Run_extended_name', "string", ["number", "number"]);
liveSplitCoreNative.Run_extended_category_name = emscriptenModule.cwrap('Run_extended_category_name', "string", ["number", "number", "number", "number"]);
liveSplitCoreNative.Run_attempt_count = emscriptenModule.cwrap('Run_attempt_count', "number", ["number"]);
liveSplitCoreNative.Run_metadata = emscriptenModule.cwrap('Run_metadata', "number", ["number"]);
liveSplitCoreNative.Run_offset = emscriptenModule.cwrap('Run_offset', "number", ["number"]);
liveSplitCoreNative.Run_len = emscriptenModule.cwrap('Run_len', "number", ["number"]);
liveSplitCoreNative.Run_segment = emscriptenModule.cwrap('Run_segment', "number", ["number", "number"]);
liveSplitCoreNative.Run_attempt_history_len = emscriptenModule.cwrap('Run_attempt_history_len', "number", ["number"]);
liveSplitCoreNative.Run_attempt_history_index = emscriptenModule.cwrap('Run_attempt_history_index', "number", ["number", "number"]);
liveSplitCoreNative.Run_save_as_lss = emscriptenModule.cwrap('Run_save_as_lss', "string", ["number"]);
liveSplitCoreNative.Run_custom_comparisons_len = emscriptenModule.cwrap('Run_custom_comparisons_len', "number", ["number"]);
liveSplitCoreNative.Run_custom_comparison = emscriptenModule.cwrap('Run_custom_comparison', "string", ["number", "number"]);
liveSplitCoreNative.Run_auto_splitter_settings = emscriptenModule.cwrap('Run_auto_splitter_settings', "string", ["number"]);
liveSplitCoreNative.Run_push_segment = emscriptenModule.cwrap('Run_push_segment', null, ["number", "number"]);
liveSplitCoreNative.Run_set_game_name = emscriptenModule.cwrap('Run_set_game_name', null, ["number", "string"]);
liveSplitCoreNative.Run_set_category_name = emscriptenModule.cwrap('Run_set_category_name', null, ["number", "string"]);
liveSplitCoreNative.RunEditor_new = emscriptenModule.cwrap('RunEditor_new', "number", ["number"]);
liveSplitCoreNative.RunEditor_close = emscriptenModule.cwrap('RunEditor_close', "number", ["number"]);
liveSplitCoreNative.RunEditor_state_as_json = emscriptenModule.cwrap('RunEditor_state_as_json', "string", ["number"]);
liveSplitCoreNative.RunEditor_select_timing_method = emscriptenModule.cwrap('RunEditor_select_timing_method', null, ["number", "number"]);
liveSplitCoreNative.RunEditor_unselect = emscriptenModule.cwrap('RunEditor_unselect', null, ["number", "number"]);
liveSplitCoreNative.RunEditor_select_additionally = emscriptenModule.cwrap('RunEditor_select_additionally', null, ["number", "number"]);
liveSplitCoreNative.RunEditor_select_only = emscriptenModule.cwrap('RunEditor_select_only', null, ["number", "number"]);
liveSplitCoreNative.RunEditor_set_game_name = emscriptenModule.cwrap('RunEditor_set_game_name', null, ["number", "string"]);
liveSplitCoreNative.RunEditor_set_category_name = emscriptenModule.cwrap('RunEditor_set_category_name', null, ["number", "string"]);
liveSplitCoreNative.RunEditor_parse_and_set_offset = emscriptenModule.cwrap('RunEditor_parse_and_set_offset', "number", ["number", "string"]);
liveSplitCoreNative.RunEditor_parse_and_set_attempt_count = emscriptenModule.cwrap('RunEditor_parse_and_set_attempt_count', "number", ["number", "string"]);
liveSplitCoreNative.RunEditor_set_game_icon = emscriptenModule.cwrap('RunEditor_set_game_icon', null, ["number", "number", "number"]);
liveSplitCoreNative.RunEditor_remove_game_icon = emscriptenModule.cwrap('RunEditor_remove_game_icon', null, ["number"]);
liveSplitCoreNative.RunEditor_insert_segment_above = emscriptenModule.cwrap('RunEditor_insert_segment_above', null, ["number"]);
liveSplitCoreNative.RunEditor_insert_segment_below = emscriptenModule.cwrap('RunEditor_insert_segment_below', null, ["number"]);
liveSplitCoreNative.RunEditor_remove_segments = emscriptenModule.cwrap('RunEditor_remove_segments', null, ["number"]);
liveSplitCoreNative.RunEditor_move_segments_up = emscriptenModule.cwrap('RunEditor_move_segments_up', null, ["number"]);
liveSplitCoreNative.RunEditor_move_segments_down = emscriptenModule.cwrap('RunEditor_move_segments_down', null, ["number"]);
liveSplitCoreNative.RunEditor_active_set_icon = emscriptenModule.cwrap('RunEditor_active_set_icon', null, ["number", "number", "number"]);
liveSplitCoreNative.RunEditor_active_remove_icon = emscriptenModule.cwrap('RunEditor_active_remove_icon', null, ["number"]);
liveSplitCoreNative.RunEditor_active_set_name = emscriptenModule.cwrap('RunEditor_active_set_name', null, ["number", "string"]);
liveSplitCoreNative.RunEditor_active_parse_and_set_split_time = emscriptenModule.cwrap('RunEditor_active_parse_and_set_split_time', "number", ["number", "string"]);
liveSplitCoreNative.RunEditor_active_parse_and_set_segment_time = emscriptenModule.cwrap('RunEditor_active_parse_and_set_segment_time', "number", ["number", "string"]);
liveSplitCoreNative.RunEditor_active_parse_and_set_best_segment_time = emscriptenModule.cwrap('RunEditor_active_parse_and_set_best_segment_time', "number", ["number", "string"]);
liveSplitCoreNative.RunEditor_active_parse_and_set_comparison_time = emscriptenModule.cwrap('RunEditor_active_parse_and_set_comparison_time', "number", ["number", "string", "string"]);
liveSplitCoreNative.RunEditor_add_comparison = emscriptenModule.cwrap('RunEditor_add_comparison', "number", ["number", "string"]);
liveSplitCoreNative.RunEditor_import_comparison = emscriptenModule.cwrap('RunEditor_import_comparison', "number", ["number", "number", "string"]);
liveSplitCoreNative.RunEditor_remove_comparison = emscriptenModule.cwrap('RunEditor_remove_comparison', null, ["number", "string"]);
liveSplitCoreNative.RunEditor_rename_comparison = emscriptenModule.cwrap('RunEditor_rename_comparison', "number", ["number", "string", "string"]);
liveSplitCoreNative.RunEditor_clear_history = emscriptenModule.cwrap('RunEditor_clear_history', null, ["number"]);
liveSplitCoreNative.RunEditor_clear_times = emscriptenModule.cwrap('RunEditor_clear_times', null, ["number"]);
liveSplitCoreNative.RunEditor_clean_sum_of_best = emscriptenModule.cwrap('RunEditor_clean_sum_of_best', "number", ["number"]);
liveSplitCoreNative.RunMetadata_run_id = emscriptenModule.cwrap('RunMetadata_run_id', "string", ["number"]);
liveSplitCoreNative.RunMetadata_platform_name = emscriptenModule.cwrap('RunMetadata_platform_name', "string", ["number"]);
liveSplitCoreNative.RunMetadata_uses_emulator = emscriptenModule.cwrap('RunMetadata_uses_emulator', "number", ["number"]);
liveSplitCoreNative.RunMetadata_region_name = emscriptenModule.cwrap('RunMetadata_region_name', "string", ["number"]);
liveSplitCoreNative.RunMetadata_variables = emscriptenModule.cwrap('RunMetadata_variables', "number", ["number"]);
liveSplitCoreNative.RunMetadataVariable_drop = emscriptenModule.cwrap('RunMetadataVariable_drop', null, ["number"]);
liveSplitCoreNative.RunMetadataVariable_name = emscriptenModule.cwrap('RunMetadataVariable_name', "string", ["number"]);
liveSplitCoreNative.RunMetadataVariable_value = emscriptenModule.cwrap('RunMetadataVariable_value', "string", ["number"]);
liveSplitCoreNative.RunMetadataVariablesIter_drop = emscriptenModule.cwrap('RunMetadataVariablesIter_drop', null, ["number"]);
liveSplitCoreNative.RunMetadataVariablesIter_next = emscriptenModule.cwrap('RunMetadataVariablesIter_next', "number", ["number"]);
liveSplitCoreNative.Segment_new = emscriptenModule.cwrap('Segment_new', "number", ["string"]);
liveSplitCoreNative.Segment_drop = emscriptenModule.cwrap('Segment_drop', null, ["number"]);
liveSplitCoreNative.Segment_name = emscriptenModule.cwrap('Segment_name', "string", ["number"]);
liveSplitCoreNative.Segment_icon = emscriptenModule.cwrap('Segment_icon', "string", ["number"]);
liveSplitCoreNative.Segment_comparison = emscriptenModule.cwrap('Segment_comparison', "number", ["number", "string"]);
liveSplitCoreNative.Segment_personal_best_split_time = emscriptenModule.cwrap('Segment_personal_best_split_time', "number", ["number"]);
liveSplitCoreNative.Segment_best_segment_time = emscriptenModule.cwrap('Segment_best_segment_time', "number", ["number"]);
liveSplitCoreNative.Segment_segment_history = emscriptenModule.cwrap('Segment_segment_history', "number", ["number"]);
liveSplitCoreNative.SegmentHistory_iter = emscriptenModule.cwrap('SegmentHistory_iter', "number", ["number"]);
liveSplitCoreNative.SegmentHistoryElement_index = emscriptenModule.cwrap('SegmentHistoryElement_index', "number", ["number"]);
liveSplitCoreNative.SegmentHistoryElement_time = emscriptenModule.cwrap('SegmentHistoryElement_time', "number", ["number"]);
liveSplitCoreNative.SegmentHistoryIter_drop = emscriptenModule.cwrap('SegmentHistoryIter_drop', null, ["number"]);
liveSplitCoreNative.SegmentHistoryIter_next = emscriptenModule.cwrap('SegmentHistoryIter_next', "number", ["number"]);
liveSplitCoreNative.SeparatorComponent_new = emscriptenModule.cwrap('SeparatorComponent_new', "number", []);
liveSplitCoreNative.SeparatorComponent_drop = emscriptenModule.cwrap('SeparatorComponent_drop', null, ["number"]);
liveSplitCoreNative.SeparatorComponent_into_generic = emscriptenModule.cwrap('SeparatorComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.SettingValue_from_bool = emscriptenModule.cwrap('SettingValue_from_bool', "number", ["number"]);
liveSplitCoreNative.SettingValue_from_uint = emscriptenModule.cwrap('SettingValue_from_uint', "number", ["number"]);
liveSplitCoreNative.SettingValue_from_int = emscriptenModule.cwrap('SettingValue_from_int', "number", ["number"]);
liveSplitCoreNative.SettingValue_from_string = emscriptenModule.cwrap('SettingValue_from_string', "number", ["string"]);
liveSplitCoreNative.SettingValue_from_optional_string = emscriptenModule.cwrap('SettingValue_from_optional_string', "number", ["string"]);
liveSplitCoreNative.SettingValue_from_optional_empty_string = emscriptenModule.cwrap('SettingValue_from_optional_empty_string', "number", []);
liveSplitCoreNative.SettingValue_from_float = emscriptenModule.cwrap('SettingValue_from_float', "number", ["number"]);
liveSplitCoreNative.SettingValue_from_accuracy = emscriptenModule.cwrap('SettingValue_from_accuracy', "number", ["string"]);
liveSplitCoreNative.SettingValue_from_digits_format = emscriptenModule.cwrap('SettingValue_from_digits_format', "number", ["string"]);
liveSplitCoreNative.SettingValue_from_optional_timing_method = emscriptenModule.cwrap('SettingValue_from_optional_timing_method', "number", ["string"]);
liveSplitCoreNative.SettingValue_from_optional_empty_timing_method = emscriptenModule.cwrap('SettingValue_from_optional_empty_timing_method', "number", []);
liveSplitCoreNative.SettingValue_from_color = emscriptenModule.cwrap('SettingValue_from_color', "number", ["number", "number", "number", "number"]);
liveSplitCoreNative.SettingValue_from_optional_color = emscriptenModule.cwrap('SettingValue_from_optional_color', "number", ["number", "number", "number", "number"]);
liveSplitCoreNative.SettingValue_from_optional_empty_color = emscriptenModule.cwrap('SettingValue_from_optional_empty_color', "number", []);
liveSplitCoreNative.SettingValue_from_transparent_gradient = emscriptenModule.cwrap('SettingValue_from_transparent_gradient', "number", []);
liveSplitCoreNative.SettingValue_from_vertical_gradient = emscriptenModule.cwrap('SettingValue_from_vertical_gradient', "number", ["number", "number", "number", "number", "number", "number", "number", "number"]);
liveSplitCoreNative.SettingValue_from_horizontal_gradient = emscriptenModule.cwrap('SettingValue_from_horizontal_gradient', "number", ["number", "number", "number", "number", "number", "number", "number", "number"]);
liveSplitCoreNative.SettingValue_from_alignment = emscriptenModule.cwrap('SettingValue_from_alignment', "number", ["string"]);
liveSplitCoreNative.SettingValue_drop = emscriptenModule.cwrap('SettingValue_drop', null, ["number"]);
liveSplitCoreNative.SharedTimer_drop = emscriptenModule.cwrap('SharedTimer_drop', null, ["number"]);
liveSplitCoreNative.SharedTimer_share = emscriptenModule.cwrap('SharedTimer_share', "number", ["number"]);
liveSplitCoreNative.SharedTimer_read = emscriptenModule.cwrap('SharedTimer_read', "number", ["number"]);
liveSplitCoreNative.SharedTimer_write = emscriptenModule.cwrap('SharedTimer_write', "number", ["number"]);
liveSplitCoreNative.SharedTimer_replace_inner = emscriptenModule.cwrap('SharedTimer_replace_inner', null, ["number", "number"]);
liveSplitCoreNative.SplitsComponent_new = emscriptenModule.cwrap('SplitsComponent_new', "number", []);
liveSplitCoreNative.SplitsComponent_drop = emscriptenModule.cwrap('SplitsComponent_drop', null, ["number"]);
liveSplitCoreNative.SplitsComponent_into_generic = emscriptenModule.cwrap('SplitsComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.SplitsComponent_state_as_json = emscriptenModule.cwrap('SplitsComponent_state_as_json', "string", ["number", "number", "number"]);
liveSplitCoreNative.SplitsComponent_state = emscriptenModule.cwrap('SplitsComponent_state', "number", ["number", "number", "number"]);
liveSplitCoreNative.SplitsComponent_scroll_up = emscriptenModule.cwrap('SplitsComponent_scroll_up', null, ["number"]);
liveSplitCoreNative.SplitsComponent_scroll_down = emscriptenModule.cwrap('SplitsComponent_scroll_down', null, ["number"]);
liveSplitCoreNative.SplitsComponent_set_visual_split_count = emscriptenModule.cwrap('SplitsComponent_set_visual_split_count', null, ["number", "number"]);
liveSplitCoreNative.SplitsComponent_set_split_preview_count = emscriptenModule.cwrap('SplitsComponent_set_split_preview_count', null, ["number", "number"]);
liveSplitCoreNative.SplitsComponent_set_always_show_last_split = emscriptenModule.cwrap('SplitsComponent_set_always_show_last_split', null, ["number", "number"]);
liveSplitCoreNative.SplitsComponent_set_separator_last_split = emscriptenModule.cwrap('SplitsComponent_set_separator_last_split', null, ["number", "number"]);
liveSplitCoreNative.SplitsComponentState_drop = emscriptenModule.cwrap('SplitsComponentState_drop', null, ["number"]);
liveSplitCoreNative.SplitsComponentState_final_separator_shown = emscriptenModule.cwrap('SplitsComponentState_final_separator_shown', "number", ["number"]);
liveSplitCoreNative.SplitsComponentState_len = emscriptenModule.cwrap('SplitsComponentState_len', "number", ["number"]);
liveSplitCoreNative.SplitsComponentState_icon_change_count = emscriptenModule.cwrap('SplitsComponentState_icon_change_count', "number", ["number"]);
liveSplitCoreNative.SplitsComponentState_icon_change_segment_index = emscriptenModule.cwrap('SplitsComponentState_icon_change_segment_index', "number", ["number", "number"]);
liveSplitCoreNative.SplitsComponentState_icon_change_icon = emscriptenModule.cwrap('SplitsComponentState_icon_change_icon', "string", ["number", "number"]);
liveSplitCoreNative.SplitsComponentState_name = emscriptenModule.cwrap('SplitsComponentState_name', "string", ["number", "number"]);
liveSplitCoreNative.SplitsComponentState_delta = emscriptenModule.cwrap('SplitsComponentState_delta', "string", ["number", "number"]);
liveSplitCoreNative.SplitsComponentState_time = emscriptenModule.cwrap('SplitsComponentState_time', "string", ["number", "number"]);
liveSplitCoreNative.SplitsComponentState_semantic_color = emscriptenModule.cwrap('SplitsComponentState_semantic_color', "string", ["number", "number"]);
liveSplitCoreNative.SplitsComponentState_is_current_split = emscriptenModule.cwrap('SplitsComponentState_is_current_split', "number", ["number", "number"]);
liveSplitCoreNative.SumOfBestCleaner_drop = emscriptenModule.cwrap('SumOfBestCleaner_drop', null, ["number"]);
liveSplitCoreNative.SumOfBestCleaner_next_potential_clean_up = emscriptenModule.cwrap('SumOfBestCleaner_next_potential_clean_up', "number", ["number"]);
liveSplitCoreNative.SumOfBestCleaner_apply = emscriptenModule.cwrap('SumOfBestCleaner_apply', null, ["number", "number"]);
liveSplitCoreNative.SumOfBestComponent_new = emscriptenModule.cwrap('SumOfBestComponent_new', "number", []);
liveSplitCoreNative.SumOfBestComponent_drop = emscriptenModule.cwrap('SumOfBestComponent_drop', null, ["number"]);
liveSplitCoreNative.SumOfBestComponent_into_generic = emscriptenModule.cwrap('SumOfBestComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.SumOfBestComponent_state_as_json = emscriptenModule.cwrap('SumOfBestComponent_state_as_json', "string", ["number", "number"]);
liveSplitCoreNative.SumOfBestComponent_state = emscriptenModule.cwrap('SumOfBestComponent_state', "number", ["number", "number"]);
liveSplitCoreNative.SumOfBestComponentState_drop = emscriptenModule.cwrap('SumOfBestComponentState_drop', null, ["number"]);
liveSplitCoreNative.SumOfBestComponentState_text = emscriptenModule.cwrap('SumOfBestComponentState_text', "string", ["number"]);
liveSplitCoreNative.SumOfBestComponentState_time = emscriptenModule.cwrap('SumOfBestComponentState_time', "string", ["number"]);
liveSplitCoreNative.TextComponent_new = emscriptenModule.cwrap('TextComponent_new', "number", []);
liveSplitCoreNative.TextComponent_drop = emscriptenModule.cwrap('TextComponent_drop', null, ["number"]);
liveSplitCoreNative.TextComponent_into_generic = emscriptenModule.cwrap('TextComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.TextComponent_state_as_json = emscriptenModule.cwrap('TextComponent_state_as_json', "string", ["number"]);
liveSplitCoreNative.TextComponent_state = emscriptenModule.cwrap('TextComponent_state', "number", ["number"]);
liveSplitCoreNative.TextComponent_set_center = emscriptenModule.cwrap('TextComponent_set_center', null, ["number", "string"]);
liveSplitCoreNative.TextComponent_set_left = emscriptenModule.cwrap('TextComponent_set_left', null, ["number", "string"]);
liveSplitCoreNative.TextComponent_set_right = emscriptenModule.cwrap('TextComponent_set_right', null, ["number", "string"]);
liveSplitCoreNative.TextComponentState_drop = emscriptenModule.cwrap('TextComponentState_drop', null, ["number"]);
liveSplitCoreNative.TextComponentState_left = emscriptenModule.cwrap('TextComponentState_left', "string", ["number"]);
liveSplitCoreNative.TextComponentState_right = emscriptenModule.cwrap('TextComponentState_right', "string", ["number"]);
liveSplitCoreNative.TextComponentState_center = emscriptenModule.cwrap('TextComponentState_center', "string", ["number"]);
liveSplitCoreNative.TextComponentState_is_split = emscriptenModule.cwrap('TextComponentState_is_split', "number", ["number"]);
liveSplitCoreNative.Time_drop = emscriptenModule.cwrap('Time_drop', null, ["number"]);
liveSplitCoreNative.Time_clone = emscriptenModule.cwrap('Time_clone', "number", ["number"]);
liveSplitCoreNative.Time_real_time = emscriptenModule.cwrap('Time_real_time', "number", ["number"]);
liveSplitCoreNative.Time_game_time = emscriptenModule.cwrap('Time_game_time', "number", ["number"]);
liveSplitCoreNative.Time_index = emscriptenModule.cwrap('Time_index', "number", ["number", "number"]);
liveSplitCoreNative.TimeSpan_from_seconds = emscriptenModule.cwrap('TimeSpan_from_seconds', "number", ["number"]);
liveSplitCoreNative.TimeSpan_drop = emscriptenModule.cwrap('TimeSpan_drop', null, ["number"]);
liveSplitCoreNative.TimeSpan_clone = emscriptenModule.cwrap('TimeSpan_clone', "number", ["number"]);
liveSplitCoreNative.TimeSpan_total_seconds = emscriptenModule.cwrap('TimeSpan_total_seconds', "number", ["number"]);
liveSplitCoreNative.Timer_new = emscriptenModule.cwrap('Timer_new', "number", ["number"]);
liveSplitCoreNative.Timer_into_shared = emscriptenModule.cwrap('Timer_into_shared', "number", ["number"]);
liveSplitCoreNative.Timer_into_run = emscriptenModule.cwrap('Timer_into_run', "number", ["number", "number"]);
liveSplitCoreNative.Timer_drop = emscriptenModule.cwrap('Timer_drop', null, ["number"]);
liveSplitCoreNative.Timer_current_timing_method = emscriptenModule.cwrap('Timer_current_timing_method', "number", ["number"]);
liveSplitCoreNative.Timer_current_comparison = emscriptenModule.cwrap('Timer_current_comparison', "string", ["number"]);
liveSplitCoreNative.Timer_is_game_time_initialized = emscriptenModule.cwrap('Timer_is_game_time_initialized', "number", ["number"]);
liveSplitCoreNative.Timer_is_game_time_paused = emscriptenModule.cwrap('Timer_is_game_time_paused', "number", ["number"]);
liveSplitCoreNative.Timer_loading_times = emscriptenModule.cwrap('Timer_loading_times', "number", ["number"]);
liveSplitCoreNative.Timer_current_phase = emscriptenModule.cwrap('Timer_current_phase', "number", ["number"]);
liveSplitCoreNative.Timer_get_run = emscriptenModule.cwrap('Timer_get_run', "number", ["number"]);
liveSplitCoreNative.Timer_print_debug = emscriptenModule.cwrap('Timer_print_debug', null, ["number"]);
liveSplitCoreNative.Timer_current_time = emscriptenModule.cwrap('Timer_current_time', "number", ["number"]);
liveSplitCoreNative.Timer_replace_run = emscriptenModule.cwrap('Timer_replace_run', "number", ["number", "number", "number"]);
liveSplitCoreNative.Timer_set_run = emscriptenModule.cwrap('Timer_set_run', "number", ["number", "number"]);
liveSplitCoreNative.Timer_start = emscriptenModule.cwrap('Timer_start', null, ["number"]);
liveSplitCoreNative.Timer_split = emscriptenModule.cwrap('Timer_split', null, ["number"]);
liveSplitCoreNative.Timer_split_or_start = emscriptenModule.cwrap('Timer_split_or_start', null, ["number"]);
liveSplitCoreNative.Timer_skip_split = emscriptenModule.cwrap('Timer_skip_split', null, ["number"]);
liveSplitCoreNative.Timer_undo_split = emscriptenModule.cwrap('Timer_undo_split', null, ["number"]);
liveSplitCoreNative.Timer_reset = emscriptenModule.cwrap('Timer_reset', null, ["number", "number"]);
liveSplitCoreNative.Timer_pause = emscriptenModule.cwrap('Timer_pause', null, ["number"]);
liveSplitCoreNative.Timer_resume = emscriptenModule.cwrap('Timer_resume', null, ["number"]);
liveSplitCoreNative.Timer_toggle_pause = emscriptenModule.cwrap('Timer_toggle_pause', null, ["number"]);
liveSplitCoreNative.Timer_toggle_pause_or_start = emscriptenModule.cwrap('Timer_toggle_pause_or_start', null, ["number"]);
liveSplitCoreNative.Timer_undo_all_pauses = emscriptenModule.cwrap('Timer_undo_all_pauses', null, ["number"]);
liveSplitCoreNative.Timer_set_current_timing_method = emscriptenModule.cwrap('Timer_set_current_timing_method', null, ["number", "number"]);
liveSplitCoreNative.Timer_switch_to_next_comparison = emscriptenModule.cwrap('Timer_switch_to_next_comparison', null, ["number"]);
liveSplitCoreNative.Timer_switch_to_previous_comparison = emscriptenModule.cwrap('Timer_switch_to_previous_comparison', null, ["number"]);
liveSplitCoreNative.Timer_initialize_game_time = emscriptenModule.cwrap('Timer_initialize_game_time', null, ["number"]);
liveSplitCoreNative.Timer_deinitialize_game_time = emscriptenModule.cwrap('Timer_deinitialize_game_time', null, ["number"]);
liveSplitCoreNative.Timer_pause_game_time = emscriptenModule.cwrap('Timer_pause_game_time', null, ["number"]);
liveSplitCoreNative.Timer_resume_game_time = emscriptenModule.cwrap('Timer_resume_game_time', null, ["number"]);
liveSplitCoreNative.Timer_set_game_time = emscriptenModule.cwrap('Timer_set_game_time', null, ["number", "number"]);
liveSplitCoreNative.Timer_set_loading_times = emscriptenModule.cwrap('Timer_set_loading_times', null, ["number", "number"]);
liveSplitCoreNative.TimerComponent_new = emscriptenModule.cwrap('TimerComponent_new', "number", []);
liveSplitCoreNative.TimerComponent_drop = emscriptenModule.cwrap('TimerComponent_drop', null, ["number"]);
liveSplitCoreNative.TimerComponent_into_generic = emscriptenModule.cwrap('TimerComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.TimerComponent_state_as_json = emscriptenModule.cwrap('TimerComponent_state_as_json', "string", ["number", "number", "number"]);
liveSplitCoreNative.TimerComponent_state = emscriptenModule.cwrap('TimerComponent_state', "number", ["number", "number", "number"]);
liveSplitCoreNative.TimerComponentState_drop = emscriptenModule.cwrap('TimerComponentState_drop', null, ["number"]);
liveSplitCoreNative.TimerComponentState_time = emscriptenModule.cwrap('TimerComponentState_time', "string", ["number"]);
liveSplitCoreNative.TimerComponentState_fraction = emscriptenModule.cwrap('TimerComponentState_fraction', "string", ["number"]);
liveSplitCoreNative.TimerComponentState_semantic_color = emscriptenModule.cwrap('TimerComponentState_semantic_color', "string", ["number"]);
liveSplitCoreNative.TimerReadLock_drop = emscriptenModule.cwrap('TimerReadLock_drop', null, ["number"]);
liveSplitCoreNative.TimerReadLock_timer = emscriptenModule.cwrap('TimerReadLock_timer', "number", ["number"]);
liveSplitCoreNative.TimerWriteLock_drop = emscriptenModule.cwrap('TimerWriteLock_drop', null, ["number"]);
liveSplitCoreNative.TimerWriteLock_timer = emscriptenModule.cwrap('TimerWriteLock_timer', "number", ["number"]);
liveSplitCoreNative.TitleComponent_new = emscriptenModule.cwrap('TitleComponent_new', "number", []);
liveSplitCoreNative.TitleComponent_drop = emscriptenModule.cwrap('TitleComponent_drop', null, ["number"]);
liveSplitCoreNative.TitleComponent_into_generic = emscriptenModule.cwrap('TitleComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.TitleComponent_state_as_json = emscriptenModule.cwrap('TitleComponent_state_as_json', "string", ["number", "number"]);
liveSplitCoreNative.TitleComponent_state = emscriptenModule.cwrap('TitleComponent_state', "number", ["number", "number"]);
liveSplitCoreNative.TitleComponentState_drop = emscriptenModule.cwrap('TitleComponentState_drop', null, ["number"]);
liveSplitCoreNative.TitleComponentState_icon_change = emscriptenModule.cwrap('TitleComponentState_icon_change', "string", ["number"]);
liveSplitCoreNative.TitleComponentState_line1 = emscriptenModule.cwrap('TitleComponentState_line1', "string", ["number"]);
liveSplitCoreNative.TitleComponentState_line2 = emscriptenModule.cwrap('TitleComponentState_line2', "string", ["number"]);
liveSplitCoreNative.TitleComponentState_is_centered = emscriptenModule.cwrap('TitleComponentState_is_centered', "number", ["number"]);
liveSplitCoreNative.TitleComponentState_shows_finished_runs = emscriptenModule.cwrap('TitleComponentState_shows_finished_runs', "number", ["number"]);
liveSplitCoreNative.TitleComponentState_finished_runs = emscriptenModule.cwrap('TitleComponentState_finished_runs', "number", ["number"]);
liveSplitCoreNative.TitleComponentState_shows_attempts = emscriptenModule.cwrap('TitleComponentState_shows_attempts', "number", ["number"]);
liveSplitCoreNative.TitleComponentState_attempts = emscriptenModule.cwrap('TitleComponentState_attempts', "number", ["number"]);
liveSplitCoreNative.TotalPlaytimeComponent_new = emscriptenModule.cwrap('TotalPlaytimeComponent_new', "number", []);
liveSplitCoreNative.TotalPlaytimeComponent_drop = emscriptenModule.cwrap('TotalPlaytimeComponent_drop', null, ["number"]);
liveSplitCoreNative.TotalPlaytimeComponent_into_generic = emscriptenModule.cwrap('TotalPlaytimeComponent_into_generic', "number", ["number"]);
liveSplitCoreNative.TotalPlaytimeComponent_state_as_json = emscriptenModule.cwrap('TotalPlaytimeComponent_state_as_json', "string", ["number", "number"]);
liveSplitCoreNative.TotalPlaytimeComponent_state = emscriptenModule.cwrap('TotalPlaytimeComponent_state', "number", ["number", "number"]);
liveSplitCoreNative.TotalPlaytimeComponentState_drop = emscriptenModule.cwrap('TotalPlaytimeComponentState_drop', null, ["number"]);
liveSplitCoreNative.TotalPlaytimeComponentState_text = emscriptenModule.cwrap('TotalPlaytimeComponentState_text', "string", ["number"]);
liveSplitCoreNative.TotalPlaytimeComponentState_time = emscriptenModule.cwrap('TotalPlaytimeComponentState_time', "string", ["number"]);

/**
 * An Atomic Date Time represents a UTC Date Time that tries to be as close to
 * an atomic clock as possible.
 */
export class AtomicDateTimeRef {
    ptr: number;
    /**
     * Represents whether the date time is actually properly derived from an
     * atomic clock. If the synchronization with the atomic clock didn't happen
     * yet or failed, this is set to false.
     */
    isSynchronized(): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.AtomicDateTime_is_synchronized(this.ptr) != 0;
        return result;
    }
    /**
     * Converts this atomic date time into a RFC 2822 formatted date time.
     */
    toRfc2822(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.AtomicDateTime_to_rfc2822(this.ptr);
        return result;
    }
    /**
     * Converts this atomic date time into a RFC 3339 formatted date time.
     */
    toRfc3339(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.AtomicDateTime_to_rfc3339(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * An Atomic Date Time represents a UTC Date Time that tries to be as close to
 * an atomic clock as possible.
 */
export class AtomicDateTimeRefMut extends AtomicDateTimeRef {
}

/**
 * An Atomic Date Time represents a UTC Date Time that tries to be as close to
 * an atomic clock as possible.
 */
export class AtomicDateTime extends AtomicDateTimeRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: AtomicDateTime) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.AtomicDateTime_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * An Attempt describes information about an attempt to run a specific category
 * by a specific runner in the past. Every time a new attempt is started and
 * then reset, an Attempt describing general information about it is created.
 */
export class AttemptRef {
    ptr: number;
    /**
     * Accesses the unique index of the attempt. This index is unique for the
     * Run, not for all of them.
     */
    index(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Attempt_index(this.ptr);
        return result;
    }
    /**
     * Accesses the split time of the last segment. If the attempt got reset
     * early and didn't finish, this may be empty.
     */
    time(): TimeRef {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimeRef(liveSplitCoreNative.Attempt_time(this.ptr));
        return result;
    }
    /**
     * Accesses the amount of time the attempt has been paused for. If it is not
     * known, this returns null. This means that it may not necessarily be
     * possible to differentiate whether a Run has not been paused or it simply
     * wasn't stored.
     */
    pauseTime(): TimeSpanRef | null {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimeSpanRef(liveSplitCoreNative.Attempt_pause_time(this.ptr));
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
    /**
     * Accesses the point in time the attempt was started at. This returns null
     * if this information is not known.
     */
    started(): AtomicDateTime | null {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new AtomicDateTime(liveSplitCoreNative.Attempt_started(this.ptr));
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
    /**
     * Accesses the point in time the attempt was ended at. This returns null if
     * this information is not known.
     */
    ended(): AtomicDateTime | null {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new AtomicDateTime(liveSplitCoreNative.Attempt_ended(this.ptr));
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * An Attempt describes information about an attempt to run a specific category
 * by a specific runner in the past. Every time a new attempt is started and
 * then reset, an Attempt describing general information about it is created.
 */
export class AttemptRefMut extends AttemptRef {
}

/**
 * An Attempt describes information about an attempt to run a specific category
 * by a specific runner in the past. Every time a new attempt is started and
 * then reset, an Attempt describing general information about it is created.
 */
export class Attempt extends AttemptRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: Attempt) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            this.ptr = 0;
        }
    }
}

/**
 * The Blank Space Component is simply an empty component that doesn't show
 * anything other than a background. It mostly serves as padding between other
 * components.
 */
export class BlankSpaceComponentRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Blank Space Component is simply an empty component that doesn't show
 * anything other than a background. It mostly serves as padding between other
 * components.
 */
export class BlankSpaceComponentRefMut extends BlankSpaceComponentRef {
    /**
     * Encodes the component's state information as JSON.
     */
    stateAsJson(timer: TimerRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = liveSplitCoreNative.BlankSpaceComponent_state_as_json(this.ptr, timer.ptr);
        return JSON.parse(result);
    }
    /**
     * Calculates the component's state based on the timer provided.
     */
    state(timer: TimerRef): BlankSpaceComponentState {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = new BlankSpaceComponentState(liveSplitCoreNative.BlankSpaceComponent_state(this.ptr, timer.ptr));
        return result;
    }
}

/**
 * The Blank Space Component is simply an empty component that doesn't show
 * anything other than a background. It mostly serves as padding between other
 * components.
 */
export class BlankSpaceComponent extends BlankSpaceComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: BlankSpaceComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.BlankSpaceComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Blank Space Component.
     */
    static new(): BlankSpaceComponent {
        const result = new BlankSpaceComponent(liveSplitCoreNative.BlankSpaceComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.BlankSpaceComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class BlankSpaceComponentStateRef {
    ptr: number;
    /**
     * The height of the component.
     */
    height(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.BlankSpaceComponentState_height(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class BlankSpaceComponentStateRefMut extends BlankSpaceComponentStateRef {
}

/**
 * The state object describes the information to visualize for this component.
 */
export class BlankSpaceComponentState extends BlankSpaceComponentStateRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: BlankSpaceComponentState) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.BlankSpaceComponentState_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * A Component provides information about a run in a way that is easy to
 * visualize. This type can store any of the components provided by this crate.
 */
export class ComponentRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * A Component provides information about a run in a way that is easy to
 * visualize. This type can store any of the components provided by this crate.
 */
export class ComponentRefMut extends ComponentRef {
}

/**
 * A Component provides information about a run in a way that is easy to
 * visualize. This type can store any of the components provided by this crate.
 */
export class Component extends ComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: Component) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.Component_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * The Current Comparison Component is a component that shows the name of the
 * comparison that is currently selected to be compared against.
 */
export class CurrentComparisonComponentRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Current Comparison Component is a component that shows the name of the
 * comparison that is currently selected to be compared against.
 */
export class CurrentComparisonComponentRefMut extends CurrentComparisonComponentRef {
    /**
     * Encodes the component's state information as JSON.
     */
    stateAsJson(timer: TimerRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = liveSplitCoreNative.CurrentComparisonComponent_state_as_json(this.ptr, timer.ptr);
        return JSON.parse(result);
    }
    /**
     * Calculates the component's state based on the timer provided.
     */
    state(timer: TimerRef): CurrentComparisonComponentState {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = new CurrentComparisonComponentState(liveSplitCoreNative.CurrentComparisonComponent_state(this.ptr, timer.ptr));
        return result;
    }
}

/**
 * The Current Comparison Component is a component that shows the name of the
 * comparison that is currently selected to be compared against.
 */
export class CurrentComparisonComponent extends CurrentComparisonComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: CurrentComparisonComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.CurrentComparisonComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Current Comparison Component.
     */
    static new(): CurrentComparisonComponent {
        const result = new CurrentComparisonComponent(liveSplitCoreNative.CurrentComparisonComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.CurrentComparisonComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class CurrentComparisonComponentStateRef {
    ptr: number;
    /**
     * The label's text.
     */
    text(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.CurrentComparisonComponentState_text(this.ptr);
        return result;
    }
    /**
     * The name of the comparison that is currently selected to be compared
     * against.
     */
    comparison(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.CurrentComparisonComponentState_comparison(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class CurrentComparisonComponentStateRefMut extends CurrentComparisonComponentStateRef {
}

/**
 * The state object describes the information to visualize for this component.
 */
export class CurrentComparisonComponentState extends CurrentComparisonComponentStateRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: CurrentComparisonComponentState) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.CurrentComparisonComponentState_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * The Current Pace Component is a component that shows a prediction of the
 * current attempt's final time, if the current attempt's pace matches the
 * chosen comparison for the remainder of the run.
 */
export class CurrentPaceComponentRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Current Pace Component is a component that shows a prediction of the
 * current attempt's final time, if the current attempt's pace matches the
 * chosen comparison for the remainder of the run.
 */
export class CurrentPaceComponentRefMut extends CurrentPaceComponentRef {
    /**
     * Encodes the component's state information as JSON.
     */
    stateAsJson(timer: TimerRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = liveSplitCoreNative.CurrentPaceComponent_state_as_json(this.ptr, timer.ptr);
        return JSON.parse(result);
    }
    /**
     * Calculates the component's state based on the timer provided.
     */
    state(timer: TimerRef): CurrentPaceComponentState {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = new CurrentPaceComponentState(liveSplitCoreNative.CurrentPaceComponent_state(this.ptr, timer.ptr));
        return result;
    }
}

/**
 * The Current Pace Component is a component that shows a prediction of the
 * current attempt's final time, if the current attempt's pace matches the
 * chosen comparison for the remainder of the run.
 */
export class CurrentPaceComponent extends CurrentPaceComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: CurrentPaceComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.CurrentPaceComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Current Pace Component.
     */
    static new(): CurrentPaceComponent {
        const result = new CurrentPaceComponent(liveSplitCoreNative.CurrentPaceComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.CurrentPaceComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class CurrentPaceComponentStateRef {
    ptr: number;
    /**
     * The label's text.
     */
    text(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.CurrentPaceComponentState_text(this.ptr);
        return result;
    }
    /**
     * The current pace.
     */
    time(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.CurrentPaceComponentState_time(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class CurrentPaceComponentStateRefMut extends CurrentPaceComponentStateRef {
}

/**
 * The state object describes the information to visualize for this component.
 */
export class CurrentPaceComponentState extends CurrentPaceComponentStateRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: CurrentPaceComponentState) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.CurrentPaceComponentState_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * The Delta Component is a component that shows the how far ahead or behind
 * the current attempt is compared to the chosen comparison.
 */
export class DeltaComponentRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Delta Component is a component that shows the how far ahead or behind
 * the current attempt is compared to the chosen comparison.
 */
export class DeltaComponentRefMut extends DeltaComponentRef {
    /**
     * Encodes the component's state information as JSON.
     */
    stateAsJson(timer: TimerRef, layoutSettings: GeneralLayoutSettingsRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        if (layoutSettings.ptr == 0) {
            throw "layoutSettings is disposed";
        }
        const result = liveSplitCoreNative.DeltaComponent_state_as_json(this.ptr, timer.ptr, layoutSettings.ptr);
        return JSON.parse(result);
    }
    /**
     * Calculates the component's state based on the timer and the layout
     * settings provided.
     */
    state(timer: TimerRef, layoutSettings: GeneralLayoutSettingsRef): DeltaComponentState {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        if (layoutSettings.ptr == 0) {
            throw "layoutSettings is disposed";
        }
        const result = new DeltaComponentState(liveSplitCoreNative.DeltaComponent_state(this.ptr, timer.ptr, layoutSettings.ptr));
        return result;
    }
}

/**
 * The Delta Component is a component that shows the how far ahead or behind
 * the current attempt is compared to the chosen comparison.
 */
export class DeltaComponent extends DeltaComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: DeltaComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.DeltaComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Delta Component.
     */
    static new(): DeltaComponent {
        const result = new DeltaComponent(liveSplitCoreNative.DeltaComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.DeltaComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class DeltaComponentStateRef {
    ptr: number;
    /**
     * The label's text.
     */
    text(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DeltaComponentState_text(this.ptr);
        return result;
    }
    /**
     * The delta.
     */
    time(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DeltaComponentState_time(this.ptr);
        return result;
    }
    /**
     * The semantic coloring information the delta time carries.
     */
    semanticColor(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DeltaComponentState_semantic_color(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class DeltaComponentStateRefMut extends DeltaComponentStateRef {
}

/**
 * The state object describes the information to visualize for this component.
 */
export class DeltaComponentState extends DeltaComponentStateRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: DeltaComponentState) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.DeltaComponentState_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * The Detailed Timer Component is a component that shows two timers, one for
 * the total time of the current attempt and one showing the time of just the
 * current segment. Other information, like segment times of up to two
 * comparisons, the segment icon, and the segment's name, can also be shown.
 */
export class DetailedTimerComponentRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Detailed Timer Component is a component that shows two timers, one for
 * the total time of the current attempt and one showing the time of just the
 * current segment. Other information, like segment times of up to two
 * comparisons, the segment icon, and the segment's name, can also be shown.
 */
export class DetailedTimerComponentRefMut extends DetailedTimerComponentRef {
    /**
     * Encodes the component's state information as JSON.
     */
    stateAsJson(timer: TimerRef, layoutSettings: GeneralLayoutSettingsRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        if (layoutSettings.ptr == 0) {
            throw "layoutSettings is disposed";
        }
        const result = liveSplitCoreNative.DetailedTimerComponent_state_as_json(this.ptr, timer.ptr, layoutSettings.ptr);
        return JSON.parse(result);
    }
    /**
     * Calculates the component's state based on the timer and layout settings
     * provided.
     */
    state(timer: TimerRef, layoutSettings: GeneralLayoutSettingsRef): DetailedTimerComponentState {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        if (layoutSettings.ptr == 0) {
            throw "layoutSettings is disposed";
        }
        const result = new DetailedTimerComponentState(liveSplitCoreNative.DetailedTimerComponent_state(this.ptr, timer.ptr, layoutSettings.ptr));
        return result;
    }
}

/**
 * The Detailed Timer Component is a component that shows two timers, one for
 * the total time of the current attempt and one showing the time of just the
 * current segment. Other information, like segment times of up to two
 * comparisons, the segment icon, and the segment's name, can also be shown.
 */
export class DetailedTimerComponent extends DetailedTimerComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: DetailedTimerComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.DetailedTimerComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Detailed Timer Component.
     */
    static new(): DetailedTimerComponent {
        const result = new DetailedTimerComponent(liveSplitCoreNative.DetailedTimerComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.DetailedTimerComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class DetailedTimerComponentStateRef {
    ptr: number;
    /**
     * The time shown by the component's main timer without the fractional part.
     */
    timerTime(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DetailedTimerComponentState_timer_time(this.ptr);
        return result;
    }
    /**
     * The fractional part of the time shown by the main timer (including the dot).
     */
    timerFraction(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DetailedTimerComponentState_timer_fraction(this.ptr);
        return result;
    }
    /**
     * The semantic coloring information the main timer's time carries.
     */
    timerSemanticColor(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DetailedTimerComponentState_timer_semantic_color(this.ptr);
        return result;
    }
    /**
     * The time shown by the component's segment timer without the fractional part.
     */
    segmentTimerTime(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DetailedTimerComponentState_segment_timer_time(this.ptr);
        return result;
    }
    /**
     * The fractional part of the time shown by the segment timer (including the
     * dot).
     */
    segmentTimerFraction(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DetailedTimerComponentState_segment_timer_fraction(this.ptr);
        return result;
    }
    /**
     * Returns whether the first comparison is visible.
     */
    comparison1Visible(): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DetailedTimerComponentState_comparison1_visible(this.ptr) != 0;
        return result;
    }
    /**
     * Returns the name of the first comparison. You may not call this if the first
     * comparison is not visible.
     */
    comparison1Name(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DetailedTimerComponentState_comparison1_name(this.ptr);
        return result;
    }
    /**
     * Returns the time of the first comparison. You may not call this if the first
     * comparison is not visible.
     */
    comparison1Time(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DetailedTimerComponentState_comparison1_time(this.ptr);
        return result;
    }
    /**
     * Returns whether the second comparison is visible.
     */
    comparison2Visible(): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DetailedTimerComponentState_comparison2_visible(this.ptr) != 0;
        return result;
    }
    /**
     * Returns the name of the second comparison. You may not call this if the
     * second comparison is not visible.
     */
    comparison2Name(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DetailedTimerComponentState_comparison2_name(this.ptr);
        return result;
    }
    /**
     * Returns the time of the second comparison. You may not call this if the
     * second comparison is not visible.
     */
    comparison2Time(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DetailedTimerComponentState_comparison2_time(this.ptr);
        return result;
    }
    /**
     * The segment's icon encoded as a Data URL. This value is only specified
     * whenever the icon changes. If you explicitly want to query this value,
     * remount the component. The String itself may be empty. This indicates
     * that there is no icon.
     */
    iconChange(): string | null {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DetailedTimerComponentState_icon_change(this.ptr);
        return result;
    }
    /**
     * The name of the segment. This may be null if it's not supposed to be
     * visualized.
     */
    segmentName(): string | null {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.DetailedTimerComponentState_segment_name(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class DetailedTimerComponentStateRefMut extends DetailedTimerComponentStateRef {
}

/**
 * The state object describes the information to visualize for this component.
 */
export class DetailedTimerComponentState extends DetailedTimerComponentStateRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: DetailedTimerComponentState) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.DetailedTimerComponentState_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * The general settings of the layout that apply to all components.
 */
export class GeneralLayoutSettingsRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The general settings of the layout that apply to all components.
 */
export class GeneralLayoutSettingsRefMut extends GeneralLayoutSettingsRef {
}

/**
 * The general settings of the layout that apply to all components.
 */
export class GeneralLayoutSettings extends GeneralLayoutSettingsRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: GeneralLayoutSettings) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.GeneralLayoutSettings_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a default general layout settings configuration.
     */
    static default(): GeneralLayoutSettings {
        const result = new GeneralLayoutSettings(liveSplitCoreNative.GeneralLayoutSettings_default());
        return result;
    }
}

/**
 * The Graph Component visualizes how far the current attempt has been ahead or
 * behind the chosen comparison throughout the whole attempt. All the
 * individual deltas are shown as points in a graph.
 */
export class GraphComponentRef {
    ptr: number;
    /**
     * Encodes the component's state information as JSON.
     */
    stateAsJson(timer: TimerRef, layoutSettings: GeneralLayoutSettingsRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        if (layoutSettings.ptr == 0) {
            throw "layoutSettings is disposed";
        }
        const result = liveSplitCoreNative.GraphComponent_state_as_json(this.ptr, timer.ptr, layoutSettings.ptr);
        return JSON.parse(result);
    }
    /**
     * Calculates the component's state based on the timer and layout settings
     * provided.
     */
    state(timer: TimerRef, layoutSettings: GeneralLayoutSettingsRef): GraphComponentState {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        if (layoutSettings.ptr == 0) {
            throw "layoutSettings is disposed";
        }
        const result = new GraphComponentState(liveSplitCoreNative.GraphComponent_state(this.ptr, timer.ptr, layoutSettings.ptr));
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Graph Component visualizes how far the current attempt has been ahead or
 * behind the chosen comparison throughout the whole attempt. All the
 * individual deltas are shown as points in a graph.
 */
export class GraphComponentRefMut extends GraphComponentRef {
}

/**
 * The Graph Component visualizes how far the current attempt has been ahead or
 * behind the chosen comparison throughout the whole attempt. All the
 * individual deltas are shown as points in a graph.
 */
export class GraphComponent extends GraphComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: GraphComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.GraphComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Graph Component.
     */
    static new(): GraphComponent {
        const result = new GraphComponent(liveSplitCoreNative.GraphComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.GraphComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The state object describes the information to visualize for this component.
 * All the coordinates are in the range 0..1.
 */
export class GraphComponentStateRef {
    ptr: number;
    /**
     * Returns the amount of points to visualize. Connect all of them to visualize
     * the graph. If the live delta is active, the last point is to be interpreted
     * as a preview of the next split that is about to happen. Use the partial fill
     * color to visualize the region beneath that graph segment.
     */
    pointsLen(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.GraphComponentState_points_len(this.ptr);
        return result;
    }
    /**
     * Returns the x coordinate of the point specified. You may not provide an out
     * of bounds index.
     */
    pointX(index: number): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.GraphComponentState_point_x(this.ptr, index);
        return result;
    }
    /**
     * Returns the y coordinate of the point specified. You may not provide an out
     * of bounds index.
     */
    pointY(index: number): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.GraphComponentState_point_y(this.ptr, index);
        return result;
    }
    /**
     * Describes whether the segment the point specified is visualizing achieved a
     * new best segment time. Use the best segment color for it, in that case. You
     * may not provide an out of bounds index.
     */
    pointIsBestSegment(index: number): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.GraphComponentState_point_is_best_segment(this.ptr, index) != 0;
        return result;
    }
    /**
     * Describes how many horizontal grid lines to visualize.
     */
    horizontalGridLinesLen(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.GraphComponentState_horizontal_grid_lines_len(this.ptr);
        return result;
    }
    /**
     * Accesses the y coordinate of the horizontal grid line specified. You may not
     * provide an out of bounds index.
     */
    horizontalGridLine(index: number): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.GraphComponentState_horizontal_grid_line(this.ptr, index);
        return result;
    }
    /**
     * Describes how many vertical grid lines to visualize.
     */
    verticalGridLinesLen(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.GraphComponentState_vertical_grid_lines_len(this.ptr);
        return result;
    }
    /**
     * Accesses the x coordinate of the vertical grid line specified. You may not
     * provide an out of bounds index.
     */
    verticalGridLine(index: number): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.GraphComponentState_vertical_grid_line(this.ptr, index);
        return result;
    }
    /**
     * The y coordinate that separates the region that shows the times that are
     * ahead of the comparison and those that are behind.
     */
    middle(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.GraphComponentState_middle(this.ptr);
        return result;
    }
    /**
     * If the live delta is active, the last point is to be interpreted as a
     * preview of the next split that is about to happen. Use the partial fill
     * color to visualize the region beneath that graph segment.
     */
    isLiveDeltaActive(): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.GraphComponentState_is_live_delta_active(this.ptr) != 0;
        return result;
    }
    /**
     * Describes whether the graph is flipped vertically. For visualizing the
     * graph, this usually doesn't need to be interpreted, as this information is
     * entirely encoded into the other variables.
     */
    isFlipped(): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.GraphComponentState_is_flipped(this.ptr) != 0;
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The state object describes the information to visualize for this component.
 * All the coordinates are in the range 0..1.
 */
export class GraphComponentStateRefMut extends GraphComponentStateRef {
}

/**
 * The state object describes the information to visualize for this component.
 * All the coordinates are in the range 0..1.
 */
export class GraphComponentState extends GraphComponentStateRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: GraphComponentState) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.GraphComponentState_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * With a Hotkey System the runner can use hotkeys on their keyboard to control
 * the Timer. The hotkeys are global, so the application doesn't need to be in
 * focus. The behavior of the hotkeys depends on the platform and is stubbed
 * out on platforms that don't support hotkeys. You can turn off a Hotkey
 * System temporarily. By default the Hotkey System is activated.
 */
export class HotkeySystemRef {
    ptr: number;
    /**
     * Deactivates the Hotkey System. No hotkeys will go through until it gets
     * activated again. If it's already deactivated, nothing happens.
     */
    deactivate() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.HotkeySystem_deactivate(this.ptr);
    }
    /**
     * Activates a previously deactivated Hotkey System. If it's already
     * active, nothing happens.
     */
    activate() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.HotkeySystem_activate(this.ptr);
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * With a Hotkey System the runner can use hotkeys on their keyboard to control
 * the Timer. The hotkeys are global, so the application doesn't need to be in
 * focus. The behavior of the hotkeys depends on the platform and is stubbed
 * out on platforms that don't support hotkeys. You can turn off a Hotkey
 * System temporarily. By default the Hotkey System is activated.
 */
export class HotkeySystemRefMut extends HotkeySystemRef {
}

/**
 * With a Hotkey System the runner can use hotkeys on their keyboard to control
 * the Timer. The hotkeys are global, so the application doesn't need to be in
 * focus. The behavior of the hotkeys depends on the platform and is stubbed
 * out on platforms that don't support hotkeys. You can turn off a Hotkey
 * System temporarily. By default the Hotkey System is activated.
 */
export class HotkeySystem extends HotkeySystemRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: HotkeySystem) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.HotkeySystem_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Hotkey System for a Timer with the default hotkeys.
     */
    static new(sharedTimer: SharedTimer): HotkeySystem | null {
        if (sharedTimer.ptr == 0) {
            throw "sharedTimer is disposed";
        }
        const result = new HotkeySystem(liveSplitCoreNative.HotkeySystem_new(sharedTimer.ptr));
        sharedTimer.ptr = 0;
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
}

/**
 * A Layout allows you to combine multiple components together to visualize a
 * variety of information the runner is interested in.
 */
export class LayoutRef {
    ptr: number;
    /**
     * Clones the layout.
     */
    clone(): Layout {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Layout(liveSplitCoreNative.Layout_clone(this.ptr));
        return result;
    }
    /**
     * Encodes the settings of the layout as JSON.
     */
    settingsAsJson(): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Layout_settings_as_json(this.ptr);
        return JSON.parse(result);
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * A Layout allows you to combine multiple components together to visualize a
 * variety of information the runner is interested in.
 */
export class LayoutRefMut extends LayoutRef {
    /**
     * Calculates the layout's state based on the timer provided and encodes it as
     * JSON. You can use this to visualize all of the components of a layout.
     */
    stateAsJson(timer: TimerRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = liveSplitCoreNative.Layout_state_as_json(this.ptr, timer.ptr);
        return JSON.parse(result);
    }
    /**
     * Adds a new component to the end of the layout.
     */
    push(component: Component) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (component.ptr == 0) {
            throw "component is disposed";
        }
        liveSplitCoreNative.Layout_push(this.ptr, component.ptr);
        component.ptr = 0;
    }
    /**
     * Scrolls up all the components in the layout that can be scrolled up.
     */
    scrollUp() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Layout_scroll_up(this.ptr);
    }
    /**
     * Scrolls down all the components in the layout that can be scrolled down.
     */
    scrollDown() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Layout_scroll_down(this.ptr);
    }
    /**
     * Remounts all the components as if they were freshly initialized. Some
     * components may only provide some information whenever it changes or when
     * their state is first queried. Remounting returns this information again,
     * whenever the layout's state is queried the next time.
     */
    remount() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Layout_remount(this.ptr);
    }
}

/**
 * A Layout allows you to combine multiple components together to visualize a
 * variety of information the runner is interested in.
 */
export class Layout extends LayoutRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: Layout) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.Layout_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new empty layout with no components.
     */
    static new(): Layout {
        const result = new Layout(liveSplitCoreNative.Layout_new());
        return result;
    }
    /**
     * Creates a new default layout that contains a default set of components
     * in order to provide a good default layout for runners. Which components
     * are provided by this and how they are configured may change in the
     * future.
     */
    static defaultLayout(): Layout {
        const result = new Layout(liveSplitCoreNative.Layout_default_layout());
        return result;
    }
    /**
     * Parses a layout from the given JSON description of its settings. null is
     * returned if it couldn't be parsed.
     */
    static parseJson(settings: any): Layout | null {
        const result = new Layout(liveSplitCoreNative.Layout_parse_json(JSON.stringify(settings)));
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
}

/**
 * The Layout Editor allows modifying Layouts while ensuring all the different
 * invariants of the Layout objects are upheld no matter what kind of
 * operations are being applied. It provides the current state of the editor as
 * state objects that can be visualized by any kind of User Interface.
 */
export class LayoutEditorRef {
    ptr: number;
    /**
     * Encodes the Layout Editor's state as JSON in order to visualize it.
     */
    stateAsJson(): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.LayoutEditor_state_as_json(this.ptr);
        return JSON.parse(result);
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Layout Editor allows modifying Layouts while ensuring all the different
 * invariants of the Layout objects are upheld no matter what kind of
 * operations are being applied. It provides the current state of the editor as
 * state objects that can be visualized by any kind of User Interface.
 */
export class LayoutEditorRefMut extends LayoutEditorRef {
    /**
     * Encodes the layout's state as JSON based on the timer provided. You can use
     * this to visualize all of the components of a layout, while it is still being
     * edited by the Layout Editor.
     */
    layoutStateAsJson(timer: TimerRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = liveSplitCoreNative.LayoutEditor_layout_state_as_json(this.ptr, timer.ptr);
        return JSON.parse(result);
    }
    /**
     * Selects the component with the given index in order to modify its
     * settings. Only a single component is selected at any given time. You may
     * not provide an invalid index.
     */
    select(index: number) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.LayoutEditor_select(this.ptr, index);
    }
    /**
     * Adds the component provided to the end of the layout. The newly added
     * component becomes the selected component.
     */
    addComponent(component: Component) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (component.ptr == 0) {
            throw "component is disposed";
        }
        liveSplitCoreNative.LayoutEditor_add_component(this.ptr, component.ptr);
        component.ptr = 0;
    }
    /**
     * Removes the currently selected component, unless there's only one
     * component in the layout. The next component becomes the selected
     * component. If there's none, the previous component becomes the selected
     * component instead.
     */
    removeComponent() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.LayoutEditor_remove_component(this.ptr);
    }
    /**
     * Moves the selected component up, unless the first component is selected.
     */
    moveComponentUp() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.LayoutEditor_move_component_up(this.ptr);
    }
    /**
     * Moves the selected component down, unless the last component is
     * selected.
     */
    moveComponentDown() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.LayoutEditor_move_component_down(this.ptr);
    }
    /**
     * Moves the selected component to the index provided. You may not provide
     * an invalid index.
     */
    moveComponent(dstIndex: number) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.LayoutEditor_move_component(this.ptr, dstIndex);
    }
    /**
     * Duplicates the currently selected component. The copy gets placed right
     * after the selected component and becomes the newly selected component.
     */
    duplicateComponent() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.LayoutEditor_duplicate_component(this.ptr);
    }
    /**
     * Sets a setting's value of the selected component by its setting index
     * to the given value.
     * 
     * This panics if the type of the value to be set is not compatible with
     * the type of the setting's value. A panic can also occur if the index of
     * the setting provided is out of bounds.
     */
    setComponentSettingsValue(index: number, value: SettingValue) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (value.ptr == 0) {
            throw "value is disposed";
        }
        liveSplitCoreNative.LayoutEditor_set_component_settings_value(this.ptr, index, value.ptr);
        value.ptr = 0;
    }
    /**
     * Sets a setting's value of the general settings by its setting index to
     * the given value.
     * 
     * This panics if the type of the value to be set is not compatible with
     * the type of the setting's value. A panic can also occur if the index of
     * the setting provided is out of bounds.
     */
    setGeneralSettingsValue(index: number, value: SettingValue) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (value.ptr == 0) {
            throw "value is disposed";
        }
        liveSplitCoreNative.LayoutEditor_set_general_settings_value(this.ptr, index, value.ptr);
        value.ptr = 0;
    }
}

/**
 * The Layout Editor allows modifying Layouts while ensuring all the different
 * invariants of the Layout objects are upheld no matter what kind of
 * operations are being applied. It provides the current state of the editor as
 * state objects that can be visualized by any kind of User Interface.
 */
export class LayoutEditor extends LayoutEditorRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: LayoutEditor) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Layout Editor that modifies the Layout provided. Creation of
     * the Layout Editor fails when a Layout with no components is provided. In
     * that case null is returned instead.
     */
    static new(layout: Layout): LayoutEditor | null {
        if (layout.ptr == 0) {
            throw "layout is disposed";
        }
        const result = new LayoutEditor(liveSplitCoreNative.LayoutEditor_new(layout.ptr));
        layout.ptr = 0;
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
    /**
     * Closes the Layout Editor and gives back access to the modified Layout. In
     * case you want to implement a Cancel Button, just dispose the Layout object
     * you get here.
     */
    close(): Layout {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Layout(liveSplitCoreNative.LayoutEditor_close(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * A run parsed by the Composite Parser. This contains the Run itself and
 * information about which parser parsed it.
 */
export class ParseRunResultRef {
    ptr: number;
    /**
     * Returns true if the Run got parsed successfully. false is returned otherwise.
     */
    parsedSuccessfully(): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.ParseRunResult_parsed_successfully(this.ptr) != 0;
        return result;
    }
    /**
     * Accesses the name of the Parser that parsed the Run.
     */
    timerKind(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.ParseRunResult_timer_kind(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * A run parsed by the Composite Parser. This contains the Run itself and
 * information about which parser parsed it.
 */
export class ParseRunResultRefMut extends ParseRunResultRef {
}

/**
 * A run parsed by the Composite Parser. This contains the Run itself and
 * information about which parser parsed it.
 */
export class ParseRunResult extends ParseRunResultRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: ParseRunResult) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.ParseRunResult_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Moves the actual Run object out of the Result. You may not call this if the
     * Run wasn't parsed successfully.
     */
    unwrap(): Run {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Run(liveSplitCoreNative.ParseRunResult_unwrap(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The Possible Time Save Component is a component that shows how much time the
 * chosen comparison could've saved for the current segment, based on the Best
 * Segments. This component also allows showing the Total Possible Time Save
 * for the remainder of the current attempt.
 */
export class PossibleTimeSaveComponentRef {
    ptr: number;
    /**
     * Encodes the component's state information as JSON.
     */
    stateAsJson(timer: TimerRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = liveSplitCoreNative.PossibleTimeSaveComponent_state_as_json(this.ptr, timer.ptr);
        return JSON.parse(result);
    }
    /**
     * Calculates the component's state based on the timer provided.
     */
    state(timer: TimerRef): PossibleTimeSaveComponentState {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = new PossibleTimeSaveComponentState(liveSplitCoreNative.PossibleTimeSaveComponent_state(this.ptr, timer.ptr));
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Possible Time Save Component is a component that shows how much time the
 * chosen comparison could've saved for the current segment, based on the Best
 * Segments. This component also allows showing the Total Possible Time Save
 * for the remainder of the current attempt.
 */
export class PossibleTimeSaveComponentRefMut extends PossibleTimeSaveComponentRef {
}

/**
 * The Possible Time Save Component is a component that shows how much time the
 * chosen comparison could've saved for the current segment, based on the Best
 * Segments. This component also allows showing the Total Possible Time Save
 * for the remainder of the current attempt.
 */
export class PossibleTimeSaveComponent extends PossibleTimeSaveComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: PossibleTimeSaveComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.PossibleTimeSaveComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Possible Time Save Component.
     */
    static new(): PossibleTimeSaveComponent {
        const result = new PossibleTimeSaveComponent(liveSplitCoreNative.PossibleTimeSaveComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.PossibleTimeSaveComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class PossibleTimeSaveComponentStateRef {
    ptr: number;
    /**
     * The label's text.
     */
    text(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.PossibleTimeSaveComponentState_text(this.ptr);
        return result;
    }
    /**
     * The current possible time save.
     */
    time(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.PossibleTimeSaveComponentState_time(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class PossibleTimeSaveComponentStateRefMut extends PossibleTimeSaveComponentStateRef {
}

/**
 * The state object describes the information to visualize for this component.
 */
export class PossibleTimeSaveComponentState extends PossibleTimeSaveComponentStateRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: PossibleTimeSaveComponentState) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.PossibleTimeSaveComponentState_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * Describes a potential clean up that could be applied. You can query a
 * message describing the details of this potential clean up. A potential clean
 * up can then be turned into an actual clean up in order to apply it to the
 * Run.
 */
export class PotentialCleanUpRef {
    ptr: number;
    /**
     * Accesses the message describing the potential clean up that can be applied
     * to a Run.
     */
    message(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.PotentialCleanUp_message(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * Describes a potential clean up that could be applied. You can query a
 * message describing the details of this potential clean up. A potential clean
 * up can then be turned into an actual clean up in order to apply it to the
 * Run.
 */
export class PotentialCleanUpRefMut extends PotentialCleanUpRef {
}

/**
 * Describes a potential clean up that could be applied. You can query a
 * message describing the details of this potential clean up. A potential clean
 * up can then be turned into an actual clean up in order to apply it to the
 * Run.
 */
export class PotentialCleanUp extends PotentialCleanUpRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: PotentialCleanUp) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.PotentialCleanUp_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * The Previous Segment Component is a component that shows how much time was
 * saved or lost during the previous segment based on the chosen comparison.
 * Additionally, the potential time save for the previous segment can be
 * displayed. This component switches to a `Live Segment` view that shows
 * active time loss whenever the runner is losing time on the current segment.
 */
export class PreviousSegmentComponentRef {
    ptr: number;
    /**
     * Encodes the component's state information as JSON.
     */
    stateAsJson(timer: TimerRef, layoutSettings: GeneralLayoutSettingsRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        if (layoutSettings.ptr == 0) {
            throw "layoutSettings is disposed";
        }
        const result = liveSplitCoreNative.PreviousSegmentComponent_state_as_json(this.ptr, timer.ptr, layoutSettings.ptr);
        return JSON.parse(result);
    }
    /**
     * Calculates the component's state based on the timer and the layout
     * settings provided.
     */
    state(timer: TimerRef, layoutSettings: GeneralLayoutSettingsRef): PreviousSegmentComponentState {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        if (layoutSettings.ptr == 0) {
            throw "layoutSettings is disposed";
        }
        const result = new PreviousSegmentComponentState(liveSplitCoreNative.PreviousSegmentComponent_state(this.ptr, timer.ptr, layoutSettings.ptr));
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Previous Segment Component is a component that shows how much time was
 * saved or lost during the previous segment based on the chosen comparison.
 * Additionally, the potential time save for the previous segment can be
 * displayed. This component switches to a `Live Segment` view that shows
 * active time loss whenever the runner is losing time on the current segment.
 */
export class PreviousSegmentComponentRefMut extends PreviousSegmentComponentRef {
}

/**
 * The Previous Segment Component is a component that shows how much time was
 * saved or lost during the previous segment based on the chosen comparison.
 * Additionally, the potential time save for the previous segment can be
 * displayed. This component switches to a `Live Segment` view that shows
 * active time loss whenever the runner is losing time on the current segment.
 */
export class PreviousSegmentComponent extends PreviousSegmentComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: PreviousSegmentComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.PreviousSegmentComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Previous Segment Component.
     */
    static new(): PreviousSegmentComponent {
        const result = new PreviousSegmentComponent(liveSplitCoreNative.PreviousSegmentComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.PreviousSegmentComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class PreviousSegmentComponentStateRef {
    ptr: number;
    /**
     * The label's text.
     */
    text(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.PreviousSegmentComponentState_text(this.ptr);
        return result;
    }
    /**
     * The delta (and possibly the possible time save).
     */
    time(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.PreviousSegmentComponentState_time(this.ptr);
        return result;
    }
    /**
     * The semantic coloring information the delta time carries.
     */
    semanticColor(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.PreviousSegmentComponentState_semantic_color(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class PreviousSegmentComponentStateRefMut extends PreviousSegmentComponentStateRef {
}

/**
 * The state object describes the information to visualize for this component.
 */
export class PreviousSegmentComponentState extends PreviousSegmentComponentStateRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: PreviousSegmentComponentState) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.PreviousSegmentComponentState_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * A Run stores the split times for a specific game and category of a runner.
 */
export class RunRef {
    ptr: number;
    /**
     * Clones the Run object.
     */
    clone(): Run {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Run(liveSplitCoreNative.Run_clone(this.ptr));
        return result;
    }
    /**
     * Accesses the name of the game this Run is for.
     */
    gameName(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Run_game_name(this.ptr);
        return result;
    }
    /**
     * Accesses the Data URL storing the game icon's data. If there is no game
     * icon, this returns an empty string instead of a URL.
     */
    gameIcon(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Run_game_icon(this.ptr);
        return result;
    }
    /**
     * Accesses the name of the category this Run is for.
     */
    categoryName(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Run_category_name(this.ptr);
        return result;
    }
    /**
     * Returns a file name (without the extension) suitable for this Run that
     * is built the following way:
     * 
     * Game Name - Category Name
     * 
     * If either is empty, the dash is omitted. Special characters that cause
     * problems in file names are also omitted. If an extended category name is
     * used, the variables of the category are appended in a parenthesis.
     */
    extendedFileName(useExtendedCategoryName: boolean): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Run_extended_file_name(this.ptr, useExtendedCategoryName ? 1 : 0);
        return result;
    }
    /**
     * Returns a name suitable for this Run that is built the following way:
     * 
     * Game Name - Category Name
     * 
     * If either is empty, the dash is omitted. If an extended category name is
     * used, the variables of the category are appended in a parenthesis.
     */
    extendedName(useExtendedCategoryName: boolean): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Run_extended_name(this.ptr, useExtendedCategoryName ? 1 : 0);
        return result;
    }
    /**
     * Returns an extended category name that possibly includes the region,
     * platform and variables, depending on the arguments provided. An extended
     * category name may look like this:
     * 
     * Any% (No Tuner, JPN, Wii Emulator)
     */
    extendedCategoryName(showRegion: boolean, showPlatform: boolean, showVariables: boolean): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Run_extended_category_name(this.ptr, showRegion ? 1 : 0, showPlatform ? 1 : 0, showVariables ? 1 : 0);
        return result;
    }
    /**
     * Returns the amount of runs that have been attempted with these splits.
     */
    attemptCount(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Run_attempt_count(this.ptr);
        return result;
    }
    /**
     * Accesses additional metadata of this Run, like the platform and region
     * of the game.
     */
    metadata(): RunMetadataRef {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new RunMetadataRef(liveSplitCoreNative.Run_metadata(this.ptr));
        return result;
    }
    /**
     * Accesses the time an attempt of this Run should start at.
     */
    offset(): TimeSpanRef {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimeSpanRef(liveSplitCoreNative.Run_offset(this.ptr));
        return result;
    }
    /**
     * Returns the amount of segments stored in this Run.
     */
    len(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Run_len(this.ptr);
        return result;
    }
    /**
     * Accesses a certain segment of this Run. You may not provide an out of bounds
     * index.
     */
    segment(index: number): SegmentRef {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new SegmentRef(liveSplitCoreNative.Run_segment(this.ptr, index));
        return result;
    }
    /**
     * Returns the amount attempt history elements are stored in this Run.
     */
    attemptHistoryLen(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Run_attempt_history_len(this.ptr);
        return result;
    }
    /**
     * Accesses the an attempt history element by its index. This does not store
     * the actual segment times, just the overall attempt information. Information
     * about the individual segments is stored within each segment. You may not
     * provide an out of bounds index.
     */
    attemptHistoryIndex(index: number): AttemptRef {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new AttemptRef(liveSplitCoreNative.Run_attempt_history_index(this.ptr, index));
        return result;
    }
    /**
     * Saves the Run as a LiveSplit splits file (*.lss).
     */
    saveAsLss(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Run_save_as_lss(this.ptr);
        return result;
    }
    /**
     * Returns the amount of custom comparisons stored in this Run.
     */
    customComparisonsLen(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Run_custom_comparisons_len(this.ptr);
        return result;
    }
    /**
     * Accesses a custom comparison stored in this Run by its index. This includes
     * `Personal Best` but excludes all the other Comparison Generators. You may
     * not provide an out of bounds index.
     */
    customComparison(index: number): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Run_custom_comparison(this.ptr, index);
        return result;
    }
    /**
     * Accesses the Auto Splitter Settings that are encoded as XML.
     */
    autoSplitterSettings(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Run_auto_splitter_settings(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * A Run stores the split times for a specific game and category of a runner.
 */
export class RunRefMut extends RunRef {
    /**
     * Pushes the segment provided to the end of the list of segments of this Run.
     */
    pushSegment(segment: Segment) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (segment.ptr == 0) {
            throw "segment is disposed";
        }
        liveSplitCoreNative.Run_push_segment(this.ptr, segment.ptr);
        segment.ptr = 0;
    }
    /**
     * Sets the name of the game this Run is for.
     */
    setGameName(game: string) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Run_set_game_name(this.ptr, game);
    }
    /**
     * Sets the name of the category this Run is for.
     */
    setCategoryName(category: string) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Run_set_category_name(this.ptr, category);
    }
}

/**
 * A Run stores the split times for a specific game and category of a runner.
 */
export class Run extends RunRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: Run) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.Run_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Run object with no segments.
     */
    static new(): Run {
        const result = new Run(liveSplitCoreNative.Run_new());
        return result;
    }
    /**
     * Attempts to parse a splits file from an array by invoking the corresponding
     * parser for the file format detected. A path to the splits file can be
     * provided, which helps saving the splits file again later. Additionally you
     * need to specify if additional files, like external images are allowed to be
     * loaded. If you are using livesplit-core in a server-like environment, set
     * this to false. Only client-side applications should set this to true.
     */
    static parse(data: number, length: number, path: string, loadFiles: boolean): ParseRunResult {
        const result = new ParseRunResult(liveSplitCoreNative.Run_parse(data, length, path, loadFiles ? 1 : 0));
        return result;
    }
    /**
     * Attempts to parse a splits file from a file by invoking the corresponding
     * parser for the file format detected. A path to the splits file can be
     * provided, which helps saving the splits file again later. Additionally you
     * need to specify if additional files, like external images are allowed to be
     * loaded. If you are using livesplit-core in a server-like environment, set
     * this to false. Only client-side applications should set this to true. On
     * Unix you pass a file descriptor to this function. On Windows you pass a file
     * handle to this function. The file descriptor / handle does not get closed.
     */
    static parseFileHandle(handle: number, path: string, loadFiles: boolean): ParseRunResult {
        const result = new ParseRunResult(liveSplitCoreNative.Run_parse_file_handle(handle, path, loadFiles ? 1 : 0));
        return result;
    }
    static parseArray(data: Int8Array, path: string, loadFiles: boolean): ParseRunResult {
        const buf = emscriptenModule._malloc(data.length);
        try {
            emscriptenModule.writeArrayToMemory(data, buf);
            const ptr = liveSplitCoreNative.Run_parse(buf, data.length, path, loadFiles ? 1 : 0);
            return new ParseRunResult(ptr);
        } finally {
            emscriptenModule._free(buf);
        }
    }
    static parseString(text: string, path: string, loadFiles: boolean): ParseRunResult {
        const len = (text.length << 2) + 1;
        const buf = emscriptenModule._malloc(len);
        try {
            const actualLen = emscriptenModule.stringToUTF8(text, buf, len);
            const ptr = liveSplitCoreNative.Run_parse(buf, actualLen, path, loadFiles ? 1 : 0);
            return new ParseRunResult(ptr);
        } finally {
            emscriptenModule._free(buf);
        }
    }
}

/**
 * The Run Editor allows modifying Runs while ensuring that all the different
 * invariants of the Run objects are upheld no matter what kind of operations
 * are being applied to the Run. It provides the current state of the editor as
 * state objects that can be visualized by any kind of User Interface.
 */
export class RunEditorRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Run Editor allows modifying Runs while ensuring that all the different
 * invariants of the Run objects are upheld no matter what kind of operations
 * are being applied to the Run. It provides the current state of the editor as
 * state objects that can be visualized by any kind of User Interface.
 */
export class RunEditorRefMut extends RunEditorRef {
    /**
     * Calculates the Run Editor's state and encodes it as
     * JSON in order to visualize it.
     */
    stateAsJson(): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunEditor_state_as_json(this.ptr);
        return JSON.parse(result);
    }
    /**
     * Selects a different timing method for being modified.
     */
    selectTimingMethod(method: number) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_select_timing_method(this.ptr, method);
    }
    /**
     * Unselects the segment with the given index. If it's not selected or the
     * index is out of bounds, nothing happens. The segment is not unselected,
     * when it is the only segment that is selected. If the active segment is
     * unselected, the most recently selected segment remaining becomes the
     * active segment.
     */
    unselect(index: number) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_unselect(this.ptr, index);
    }
    /**
     * In addition to the segments that are already selected, the segment with
     * the given index is being selected. The segment chosen also becomes the
     * active segment.
     * 
     * This panics if the index of the segment provided is out of bounds.
     */
    selectAdditionally(index: number) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_select_additionally(this.ptr, index);
    }
    /**
     * Selects the segment with the given index. All other segments are
     * unselected. The segment chosen also becomes the active segment.
     * 
     * This panics if the index of the segment provided is out of bounds.
     */
    selectOnly(index: number) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_select_only(this.ptr, index);
    }
    /**
     * Sets the name of the game.
     */
    setGameName(game: string) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_set_game_name(this.ptr, game);
    }
    /**
     * Sets the name of the category.
     */
    setCategoryName(category: string) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_set_category_name(this.ptr, category);
    }
    /**
     * Parses and sets the timer offset from the string provided. The timer
     * offset specifies the time, the timer starts at when starting a new
     * attempt.
     */
    parseAndSetOffset(offset: string): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunEditor_parse_and_set_offset(this.ptr, offset) != 0;
        return result;
    }
    /**
     * Parses and sets the attempt count from the string provided. Changing
     * this has no affect on the attempt history or the segment history. This
     * number is mostly just a visual number for the runner.
     */
    parseAndSetAttemptCount(attempts: string): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunEditor_parse_and_set_attempt_count(this.ptr, attempts) != 0;
        return result;
    }
    /**
     * Sets the game's icon.
     */
    setGameIcon(data: number, length: number) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_set_game_icon(this.ptr, data, length);
    }
    /**
     * Removes the game's icon.
     */
    removeGameIcon() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_remove_game_icon(this.ptr);
    }
    /**
     * Inserts a new empty segment above the active segment and adjusts the
     * Run's history information accordingly. The newly created segment is then
     * the only selected segment and also the active segment.
     */
    insertSegmentAbove() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_insert_segment_above(this.ptr);
    }
    /**
     * Inserts a new empty segment below the active segment and adjusts the
     * Run's history information accordingly. The newly created segment is then
     * the only selected segment and also the active segment.
     */
    insertSegmentBelow() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_insert_segment_below(this.ptr);
    }
    /**
     * Removes all the selected segments, unless all of them are selected. The
     * run's information is automatically adjusted properly. The next
     * not-to-be-removed segment after the active segment becomes the new
     * active segment. If there's none, then the next not-to-be-removed segment
     * before the active segment, becomes the new active segment.
     */
    removeSegments() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_remove_segments(this.ptr);
    }
    /**
     * Moves all the selected segments up, unless the first segment is
     * selected. The run's information is automatically adjusted properly. The
     * active segment stays the active segment.
     */
    moveSegmentsUp() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_move_segments_up(this.ptr);
    }
    /**
     * Moves all the selected segments down, unless the last segment is
     * selected. The run's information is automatically adjusted properly. The
     * active segment stays the active segment.
     */
    moveSegmentsDown() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_move_segments_down(this.ptr);
    }
    /**
     * Sets the icon of the active segment.
     */
    activeSetIcon(data: number, length: number) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_active_set_icon(this.ptr, data, length);
    }
    /**
     * Removes the icon of the active segment.
     */
    activeRemoveIcon() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_active_remove_icon(this.ptr);
    }
    /**
     * Sets the name of the active segment.
     */
    activeSetName(name: string) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_active_set_name(this.ptr, name);
    }
    /**
     * Parses a split time from a string and sets it for the active segment with
     * the chosen timing method.
     */
    activeParseAndSetSplitTime(time: string): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunEditor_active_parse_and_set_split_time(this.ptr, time) != 0;
        return result;
    }
    /**
     * Parses a segment time from a string and sets it for the active segment with
     * the chosen timing method.
     */
    activeParseAndSetSegmentTime(time: string): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunEditor_active_parse_and_set_segment_time(this.ptr, time) != 0;
        return result;
    }
    /**
     * Parses a best segment time from a string and sets it for the active segment
     * with the chosen timing method.
     */
    activeParseAndSetBestSegmentTime(time: string): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunEditor_active_parse_and_set_best_segment_time(this.ptr, time) != 0;
        return result;
    }
    /**
     * Parses a comparison time for the provided comparison and sets it for the
     * active active segment with the chosen timing method.
     */
    activeParseAndSetComparisonTime(comparison: string, time: string): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunEditor_active_parse_and_set_comparison_time(this.ptr, comparison, time) != 0;
        return result;
    }
    /**
     * Adds a new custom comparison. It can't be added if it starts with
     * `[Race]` or already exists.
     */
    addComparison(comparison: string): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunEditor_add_comparison(this.ptr, comparison) != 0;
        return result;
    }
    /**
     * Imports the Personal Best from the provided run as a comparison. The
     * comparison can't be added if its name starts with `[Race]` or it already
     * exists.
     */
    importComparison(run: RunRef, comparison: string): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (run.ptr == 0) {
            throw "run is disposed";
        }
        const result = liveSplitCoreNative.RunEditor_import_comparison(this.ptr, run.ptr, comparison) != 0;
        return result;
    }
    /**
     * Removes the chosen custom comparison. You can't remove a Comparison
     * Generator's Comparison or the Personal Best.
     */
    removeComparison(comparison: string) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_remove_comparison(this.ptr, comparison);
    }
    /**
     * Renames a comparison. The comparison can't be renamed if the new name of
     * the comparison starts with `[Race]` or it already exists.
     */
    renameComparison(oldName: string, newName: string): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunEditor_rename_comparison(this.ptr, oldName, newName) != 0;
        return result;
    }
    /**
     * Clears out the Attempt History and the Segment Histories of all the
     * segments.
     */
    clearHistory() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_clear_history(this.ptr);
    }
    /**
     * Clears out the Attempt History, the Segment Histories, all the times,
     * sets the Attempt Count to 0 and clears the speedrun.com run id
     * association. All Custom Comparisons other than `Personal Best` are
     * deleted as well.
     */
    clearTimes() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.RunEditor_clear_times(this.ptr);
    }
    /**
     * Creates a Sum of Best Cleaner which allows you to interactively remove
     * potential issues in the segment history that lead to an inaccurate Sum
     * of Best. If you skip a split, whenever you will do the next split, the
     * combined segment time might be faster than the sum of the individual
     * best segments. The Sum of Best Cleaner will point out all of these and
     * allows you to delete them individually if any of them seem wrong.
     */
    cleanSumOfBest(): SumOfBestCleaner {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new SumOfBestCleaner(liveSplitCoreNative.RunEditor_clean_sum_of_best(this.ptr));
        return result;
    }
    setGameIconFromArray(data: Int8Array) {
        const buf = emscriptenModule._malloc(data.length);
        try {
            emscriptenModule.writeArrayToMemory(data, buf);
            this.setGameIcon(buf, data.length);
        } finally {
            emscriptenModule._free(buf);
        }
    }
    activeSetIconFromArray(data: Int8Array) {
        const buf = emscriptenModule._malloc(data.length);
        try {
            emscriptenModule.writeArrayToMemory(data, buf);
            this.activeSetIcon(buf, data.length);
        } finally {
            emscriptenModule._free(buf);
        }
    }
}

/**
 * The Run Editor allows modifying Runs while ensuring that all the different
 * invariants of the Run objects are upheld no matter what kind of operations
 * are being applied to the Run. It provides the current state of the editor as
 * state objects that can be visualized by any kind of User Interface.
 */
export class RunEditor extends RunEditorRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: RunEditor) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Run Editor that modifies the Run provided. Creation of the Run
     * Editor fails when a Run with no segments is provided. If a Run object with
     * no segments is provided, the Run Editor creation fails and null is
     * returned.
     */
    static new(run: Run): RunEditor | null {
        if (run.ptr == 0) {
            throw "run is disposed";
        }
        const result = new RunEditor(liveSplitCoreNative.RunEditor_new(run.ptr));
        run.ptr = 0;
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
    /**
     * Closes the Run Editor and gives back access to the modified Run object. In
     * case you want to implement a Cancel Button, just dispose the Run object you
     * get here.
     */
    close(): Run {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Run(liveSplitCoreNative.RunEditor_close(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The Run Metadata stores additional information about a run, like the
 * platform and region of the game. All of this information is optional.
 */
export class RunMetadataRef {
    ptr: number;
    /**
     * Accesses the speedrun.com Run ID of the run. This Run ID specify which
     * Record on speedrun.com this run is associated with. This should be
     * changed once the Personal Best doesn't match up with that record
     * anymore. This may be empty if there's no association.
     */
    runId(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunMetadata_run_id(this.ptr);
        return result;
    }
    /**
     * Accesses the name of the platform this game is run on. This may be empty
     * if it's not specified.
     */
    platformName(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunMetadata_platform_name(this.ptr);
        return result;
    }
    /**
     * Returns true if this speedrun is done on an emulator. However false
     * may also indicate that this information is simply not known.
     */
    usesEmulator(): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunMetadata_uses_emulator(this.ptr) != 0;
        return result;
    }
    /**
     * Accesses the name of the region this game is from. This may be empty if
     * it's not specified.
     */
    regionName(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunMetadata_region_name(this.ptr);
        return result;
    }
    /**
     * Returns an iterator iterating over all the variables and their values
     * that have been specified.
     */
    variables(): RunMetadataVariablesIter {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new RunMetadataVariablesIter(liveSplitCoreNative.RunMetadata_variables(this.ptr));
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Run Metadata stores additional information about a run, like the
 * platform and region of the game. All of this information is optional.
 */
export class RunMetadataRefMut extends RunMetadataRef {
}

/**
 * The Run Metadata stores additional information about a run, like the
 * platform and region of the game. All of this information is optional.
 */
export class RunMetadata extends RunMetadataRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: RunMetadata) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            this.ptr = 0;
        }
    }
}

/**
 * A Run Metadata variable is an arbitrary key value pair storing additional
 * information about the category. An example of this may be whether Amiibos
 * are used in the category.
 */
export class RunMetadataVariableRef {
    ptr: number;
    /**
     * Accesses the name of this Run Metadata variable.
     */
    name(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunMetadataVariable_name(this.ptr);
        return result;
    }
    /**
     * Accesses the value of this Run Metadata variable.
     */
    value(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.RunMetadataVariable_value(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * A Run Metadata variable is an arbitrary key value pair storing additional
 * information about the category. An example of this may be whether Amiibos
 * are used in the category.
 */
export class RunMetadataVariableRefMut extends RunMetadataVariableRef {
}

/**
 * A Run Metadata variable is an arbitrary key value pair storing additional
 * information about the category. An example of this may be whether Amiibos
 * are used in the category.
 */
export class RunMetadataVariable extends RunMetadataVariableRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: RunMetadataVariable) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.RunMetadataVariable_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * An iterator iterating over all the Run Metadata variables and their values
 * that have been specified.
 */
export class RunMetadataVariablesIterRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * An iterator iterating over all the Run Metadata variables and their values
 * that have been specified.
 */
export class RunMetadataVariablesIterRefMut extends RunMetadataVariablesIterRef {
    /**
     * Accesses the next Run Metadata variable. Returns null if there are no more
     * variables.
     */
    next(): RunMetadataVariableRef | null {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new RunMetadataVariableRef(liveSplitCoreNative.RunMetadataVariablesIter_next(this.ptr));
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
}

/**
 * An iterator iterating over all the Run Metadata variables and their values
 * that have been specified.
 */
export class RunMetadataVariablesIter extends RunMetadataVariablesIterRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: RunMetadataVariablesIter) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.RunMetadataVariablesIter_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * A Segment describes a point in a speedrun that is suitable for storing a
 * split time. This stores the name of that segment, an icon, the split times
 * of different comparisons, and a history of segment times.
 */
export class SegmentRef {
    ptr: number;
    /**
     * Accesses the name of the segment.
     */
    name(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Segment_name(this.ptr);
        return result;
    }
    /**
     * Accesses the icon of the segment encoded as a Data URL storing the image's
     * data. If the image's data is empty, this returns an empty string instead of
     * a URL.
     */
    icon(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Segment_icon(this.ptr);
        return result;
    }
    /**
     * Accesses the specified comparison's time. If there's none for this
     * comparison, an empty time is being returned (but not stored in the
     * segment).
     */
    comparison(comparison: string): TimeRef {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimeRef(liveSplitCoreNative.Segment_comparison(this.ptr, comparison));
        return result;
    }
    /**
     * Accesses the split time of the Personal Best for this segment. If it
     * doesn't exist, an empty time is returned.
     */
    personalBestSplitTime(): TimeRef {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimeRef(liveSplitCoreNative.Segment_personal_best_split_time(this.ptr));
        return result;
    }
    /**
     * Accesses the Best Segment Time.
     */
    bestSegmentTime(): TimeRef {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimeRef(liveSplitCoreNative.Segment_best_segment_time(this.ptr));
        return result;
    }
    /**
     * Accesses the Segment History of this segment.
     */
    segmentHistory(): SegmentHistoryRef {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new SegmentHistoryRef(liveSplitCoreNative.Segment_segment_history(this.ptr));
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * A Segment describes a point in a speedrun that is suitable for storing a
 * split time. This stores the name of that segment, an icon, the split times
 * of different comparisons, and a history of segment times.
 */
export class SegmentRefMut extends SegmentRef {
}

/**
 * A Segment describes a point in a speedrun that is suitable for storing a
 * split time. This stores the name of that segment, an icon, the split times
 * of different comparisons, and a history of segment times.
 */
export class Segment extends SegmentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: Segment) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.Segment_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Segment with the name given.
     */
    static new(name: string): Segment {
        const result = new Segment(liveSplitCoreNative.Segment_new(name));
        return result;
    }
}

/**
 * Stores the segment times achieved for a certain segment. Each segment is
 * tagged with an index. Only segment times with an index larger than 0 are
 * considered times actually achieved by the runner, while the others are
 * artifacts of route changes and similar algorithmic changes.
 */
export class SegmentHistoryRef {
    ptr: number;
    /**
     * Iterates over all the segment times and their indices.
     */
    iter(): SegmentHistoryIter {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new SegmentHistoryIter(liveSplitCoreNative.SegmentHistory_iter(this.ptr));
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * Stores the segment times achieved for a certain segment. Each segment is
 * tagged with an index. Only segment times with an index larger than 0 are
 * considered times actually achieved by the runner, while the others are
 * artifacts of route changes and similar algorithmic changes.
 */
export class SegmentHistoryRefMut extends SegmentHistoryRef {
}

/**
 * Stores the segment times achieved for a certain segment. Each segment is
 * tagged with an index. Only segment times with an index larger than 0 are
 * considered times actually achieved by the runner, while the others are
 * artifacts of route changes and similar algorithmic changes.
 */
export class SegmentHistory extends SegmentHistoryRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: SegmentHistory) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            this.ptr = 0;
        }
    }
}

/**
 * A segment time achieved for a segment. It is tagged with an index. Only
 * segment times with an index larger than 0 are considered times actually
 * achieved by the runner, while the others are artifacts of route changes and
 * similar algorithmic changes.
 */
export class SegmentHistoryElementRef {
    ptr: number;
    /**
     * Accesses the index of the segment history element.
     */
    index(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.SegmentHistoryElement_index(this.ptr);
        return result;
    }
    /**
     * Accesses the segment time of the segment history element.
     */
    time(): TimeRef {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimeRef(liveSplitCoreNative.SegmentHistoryElement_time(this.ptr));
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * A segment time achieved for a segment. It is tagged with an index. Only
 * segment times with an index larger than 0 are considered times actually
 * achieved by the runner, while the others are artifacts of route changes and
 * similar algorithmic changes.
 */
export class SegmentHistoryElementRefMut extends SegmentHistoryElementRef {
}

/**
 * A segment time achieved for a segment. It is tagged with an index. Only
 * segment times with an index larger than 0 are considered times actually
 * achieved by the runner, while the others are artifacts of route changes and
 * similar algorithmic changes.
 */
export class SegmentHistoryElement extends SegmentHistoryElementRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: SegmentHistoryElement) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            this.ptr = 0;
        }
    }
}

/**
 * Iterates over all the segment times of a segment and their indices.
 */
export class SegmentHistoryIterRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * Iterates over all the segment times of a segment and their indices.
 */
export class SegmentHistoryIterRefMut extends SegmentHistoryIterRef {
    /**
     * Accesses the next Segment History element. Returns null if there are no
     * more elements.
     */
    next(): SegmentHistoryElementRef | null {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new SegmentHistoryElementRef(liveSplitCoreNative.SegmentHistoryIter_next(this.ptr));
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
}

/**
 * Iterates over all the segment times of a segment and their indices.
 */
export class SegmentHistoryIter extends SegmentHistoryIterRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: SegmentHistoryIter) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.SegmentHistoryIter_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * The Separator Component is a simple component that only serves to render
 * separators between components.
 */
export class SeparatorComponentRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Separator Component is a simple component that only serves to render
 * separators between components.
 */
export class SeparatorComponentRefMut extends SeparatorComponentRef {
}

/**
 * The Separator Component is a simple component that only serves to render
 * separators between components.
 */
export class SeparatorComponent extends SeparatorComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: SeparatorComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.SeparatorComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Separator Component.
     */
    static new(): SeparatorComponent {
        const result = new SeparatorComponent(liveSplitCoreNative.SeparatorComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.SeparatorComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * Describes a setting's value. Such a value can be of a variety of different
 * types.
 */
export class SettingValueRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * Describes a setting's value. Such a value can be of a variety of different
 * types.
 */
export class SettingValueRefMut extends SettingValueRef {
}

/**
 * Describes a setting's value. Such a value can be of a variety of different
 * types.
 */
export class SettingValue extends SettingValueRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: SettingValue) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.SettingValue_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new setting value from a boolean value.
     */
    static fromBool(value: boolean): SettingValue {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_bool(value ? 1 : 0));
        return result;
    }
    /**
     * Creates a new setting value from an unsigned integer.
     */
    static fromUint(value: number): SettingValue {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_uint(value));
        return result;
    }
    /**
     * Creates a new setting value from a signed integer.
     */
    static fromInt(value: number): SettingValue {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_int(value));
        return result;
    }
    /**
     * Creates a new setting value from a string.
     */
    static fromString(value: string): SettingValue {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_string(value));
        return result;
    }
    /**
     * Creates a new setting value from a string that has the type `optional string`.
     */
    static fromOptionalString(value: string): SettingValue {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_optional_string(value));
        return result;
    }
    /**
     * Creates a new empty setting value that has the type `optional string`.
     */
    static fromOptionalEmptyString(): SettingValue {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_optional_empty_string());
        return result;
    }
    /**
     * Creates a new setting value from a floating point number.
     */
    static fromFloat(value: number): SettingValue {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_float(value));
        return result;
    }
    /**
     * Creates a new setting value from an accuracy name. If it doesn't match a
     * known accuracy, null is returned.
     */
    static fromAccuracy(value: string): SettingValue | null {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_accuracy(value));
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
    /**
     * Creates a new setting value from a digits format name. If it doesn't match a
     * known digits format, null is returned.
     */
    static fromDigitsFormat(value: string): SettingValue | null {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_digits_format(value));
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
    /**
     * Creates a new setting value from a timing method name with the type
     * `optional timing method`. If it doesn't match a known timing method, null
     * is returned.
     */
    static fromOptionalTimingMethod(value: string): SettingValue | null {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_optional_timing_method(value));
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
    /**
     * Creates a new empty setting value with the type `optional timing method`.
     */
    static fromOptionalEmptyTimingMethod(): SettingValue {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_optional_empty_timing_method());
        return result;
    }
    /**
     * Creates a new setting value from the color provided as RGBA.
     */
    static fromColor(r: number, g: number, b: number, a: number): SettingValue {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_color(r, g, b, a));
        return result;
    }
    /**
     * Creates a new setting value from the color provided as RGBA with the type
     * `optional color`.
     */
    static fromOptionalColor(r: number, g: number, b: number, a: number): SettingValue {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_optional_color(r, g, b, a));
        return result;
    }
    /**
     * Creates a new empty setting value with the type `optional color`.
     */
    static fromOptionalEmptyColor(): SettingValue {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_optional_empty_color());
        return result;
    }
    /**
     * Creates a new setting value that is a transparent gradient.
     */
    static fromTransparentGradient(): SettingValue {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_transparent_gradient());
        return result;
    }
    /**
     * Creates a new setting value from the vertical gradient provided as two RGBA colors.
     */
    static fromVerticalGradient(r1: number, g1: number, b1: number, a1: number, r2: number, g2: number, b2: number, a2: number): SettingValue {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_vertical_gradient(r1, g1, b1, a1, r2, g2, b2, a2));
        return result;
    }
    /**
     * Creates a new setting value from the horizontal gradient provided as two RGBA colors.
     */
    static fromHorizontalGradient(r1: number, g1: number, b1: number, a1: number, r2: number, g2: number, b2: number, a2: number): SettingValue {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_horizontal_gradient(r1, g1, b1, a1, r2, g2, b2, a2));
        return result;
    }
    /**
     * Creates a new setting value from the alignment name provided. If it doesn't
     * match a known alignment, null is returned.
     */
    static fromAlignment(value: string): SettingValue | null {
        const result = new SettingValue(liveSplitCoreNative.SettingValue_from_alignment(value));
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
}

/**
 * A Shared Timer that can be used to share a single timer object with multiple
 * owners.
 */
export class SharedTimerRef {
    ptr: number;
    /**
     * Creates a new shared timer handle that shares the same timer. The inner
     * timer object only gets disposed when the final handle gets disposed.
     */
    share(): SharedTimer {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new SharedTimer(liveSplitCoreNative.SharedTimer_share(this.ptr));
        return result;
    }
    /**
     * Requests read access to the timer that is being shared. This blocks the
     * thread as long as there is an active write lock. Dispose the read lock when
     * you are done using the timer.
     */
    read(): TimerReadLock {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimerReadLock(liveSplitCoreNative.SharedTimer_read(this.ptr));
        return result;
    }
    /**
     * Requests write access to the timer that is being shared. This blocks the
     * thread as long as there are active write or read locks. Dispose the write
     * lock when you are done using the timer.
     */
    write(): TimerWriteLock {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimerWriteLock(liveSplitCoreNative.SharedTimer_write(this.ptr));
        return result;
    }
    /**
     * Replaces the timer that is being shared by the timer provided. This blocks
     * the thread as long as there are active write or read locks. Everyone who is
     * sharing the old timer will share the provided timer after successful
     * completion.
     */
    replaceInner(timer: Timer) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        liveSplitCoreNative.SharedTimer_replace_inner(this.ptr, timer.ptr);
        timer.ptr = 0;
    }
    readWith<T>(action: (timer: TimerRef) => T): T {
        return this.read().with(function (lock) {
            return action(lock.timer());
        });
    }
    writeWith<T>(action: (timer: TimerRefMut) => T): T {
        return this.write().with(function (lock) {
            return action(lock.timer());
        });
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * A Shared Timer that can be used to share a single timer object with multiple
 * owners.
 */
export class SharedTimerRefMut extends SharedTimerRef {
}

/**
 * A Shared Timer that can be used to share a single timer object with multiple
 * owners.
 */
export class SharedTimer extends SharedTimerRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: SharedTimer) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.SharedTimer_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * The Splits Component is the main component for visualizing all the split
 * times. Each segment is shown in a tabular fashion showing the segment icon,
 * segment name, the delta compared to the chosen comparison, and the split
 * time. The list provides scrolling functionality, so not every segment needs
 * to be shown all the time.
 */
export class SplitsComponentRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Splits Component is the main component for visualizing all the split
 * times. Each segment is shown in a tabular fashion showing the segment icon,
 * segment name, the delta compared to the chosen comparison, and the split
 * time. The list provides scrolling functionality, so not every segment needs
 * to be shown all the time.
 */
export class SplitsComponentRefMut extends SplitsComponentRef {
    /**
     * Encodes the component's state information as JSON.
     */
    stateAsJson(timer: TimerRef, layoutSettings: GeneralLayoutSettingsRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        if (layoutSettings.ptr == 0) {
            throw "layoutSettings is disposed";
        }
        const result = liveSplitCoreNative.SplitsComponent_state_as_json(this.ptr, timer.ptr, layoutSettings.ptr);
        return JSON.parse(result);
    }
    /**
     * Calculates the component's state based on the timer and layout settings
     * provided.
     */
    state(timer: TimerRef, layoutSettings: GeneralLayoutSettingsRef): SplitsComponentState {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        if (layoutSettings.ptr == 0) {
            throw "layoutSettings is disposed";
        }
        const result = new SplitsComponentState(liveSplitCoreNative.SplitsComponent_state(this.ptr, timer.ptr, layoutSettings.ptr));
        return result;
    }
    /**
     * Scrolls up the window of the segments that are shown. Doesn't move the
     * scroll window if it reaches the top of the segments.
     */
    scrollUp() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.SplitsComponent_scroll_up(this.ptr);
    }
    /**
     * Scrolls down the window of the segments that are shown. Doesn't move the
     * scroll window if it reaches the bottom of the segments.
     */
    scrollDown() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.SplitsComponent_scroll_down(this.ptr);
    }
    /**
     * The amount of segments to show in the list at any given time. If this is
     * set to 0, all the segments are shown. If this is set to a number lower
     * than the total amount of segments, only a certain window of all the
     * segments is shown. This window can scroll up or down.
     */
    setVisualSplitCount(count: number) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.SplitsComponent_set_visual_split_count(this.ptr, count);
    }
    /**
     * If there's more segments than segments that are shown, the window
     * showing the segments automatically scrolls up and down when the current
     * segment changes. This count determines the minimum number of future
     * segments to be shown in this scrolling window when it automatically
     * scrolls.
     */
    setSplitPreviewCount(count: number) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.SplitsComponent_set_split_preview_count(this.ptr, count);
    }
    /**
     * If not every segment is shown in the scrolling window of segments, then
     * this determines whether the final segment is always to be shown, as it
     * contains valuable information about the total duration of the chosen
     * comparison, which is often the runner's Personal Best.
     */
    setAlwaysShowLastSplit(alwaysShowLastSplit: boolean) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.SplitsComponent_set_always_show_last_split(this.ptr, alwaysShowLastSplit ? 1 : 0);
    }
    /**
     * If the last segment is to always be shown, this determines whether to
     * show a more pronounced separator in front of the last segment, if it is
     * not directly adjacent to the segment shown right before it in the
     * scrolling window.
     */
    setSeparatorLastSplit(separatorLastSplit: boolean) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.SplitsComponent_set_separator_last_split(this.ptr, separatorLastSplit ? 1 : 0);
    }
}

/**
 * The Splits Component is the main component for visualizing all the split
 * times. Each segment is shown in a tabular fashion showing the segment icon,
 * segment name, the delta compared to the chosen comparison, and the split
 * time. The list provides scrolling functionality, so not every segment needs
 * to be shown all the time.
 */
export class SplitsComponent extends SplitsComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: SplitsComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.SplitsComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Splits Component.
     */
    static new(): SplitsComponent {
        const result = new SplitsComponent(liveSplitCoreNative.SplitsComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.SplitsComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The state object that describes a single segment's information to visualize.
 */
export class SplitsComponentStateRef {
    ptr: number;
    /**
     * Describes whether a more pronounced separator should be shown in front of
     * the last segment provided.
     */
    finalSeparatorShown(): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.SplitsComponentState_final_separator_shown(this.ptr) != 0;
        return result;
    }
    /**
     * Returns the amount of segments to visualize.
     */
    len(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.SplitsComponentState_len(this.ptr);
        return result;
    }
    /**
     * Returns the amount of icon changes that happened in this state object.
     */
    iconChangeCount(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.SplitsComponentState_icon_change_count(this.ptr);
        return result;
    }
    /**
     * Accesses the index of the segment of the icon change with the specified
     * index. This is based on the index in the run, not on the index of the
     * SplitState in the State object. The corresponding index is the index field
     * of the SplitState object. You may not provide an out of bounds index.
     */
    iconChangeSegmentIndex(iconChangeIndex: number): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.SplitsComponentState_icon_change_segment_index(this.ptr, iconChangeIndex);
        return result;
    }
    /**
     * The segment's icon encoded as a Data URL of the icon change with the
     * specified index. The String itself may be empty. This indicates that there
     * is no icon. You may not provide an out of bounds index.
     */
    iconChangeIcon(iconChangeIndex: number): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.SplitsComponentState_icon_change_icon(this.ptr, iconChangeIndex);
        return result;
    }
    /**
     * The name of the segment with the specified index. You may not provide an out
     * of bounds index.
     */
    name(index: number): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.SplitsComponentState_name(this.ptr, index);
        return result;
    }
    /**
     * The delta to show for the segment with the specified index. You may not
     * provide an out of bounds index.
     */
    delta(index: number): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.SplitsComponentState_delta(this.ptr, index);
        return result;
    }
    /**
     * The split time to show for the segment with the specified index. You may not
     * provide an out of bounds index.
     */
    time(index: number): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.SplitsComponentState_time(this.ptr, index);
        return result;
    }
    /**
     * The semantic coloring information the delta time carries of the segment with
     * the specified index. You may not provide an out of bounds index.
     */
    semanticColor(index: number): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.SplitsComponentState_semantic_color(this.ptr, index);
        return result;
    }
    /**
     * Describes if the segment with the specified index is the segment the active
     * attempt is currently on.
     */
    isCurrentSplit(index: number): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.SplitsComponentState_is_current_split(this.ptr, index) != 0;
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The state object that describes a single segment's information to visualize.
 */
export class SplitsComponentStateRefMut extends SplitsComponentStateRef {
}

/**
 * The state object that describes a single segment's information to visualize.
 */
export class SplitsComponentState extends SplitsComponentStateRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: SplitsComponentState) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.SplitsComponentState_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * A Sum of Best Cleaner allows you to interactively remove potential issues in
 * the Segment History that lead to an inaccurate Sum of Best. If you skip a
 * split, whenever you get to the next split, the combined segment time might
 * be faster than the sum of the individual best segments. The Sum of Best
 * Cleaner will point out all of occurrences of this and allows you to delete
 * them individually if any of them seem wrong.
 */
export class SumOfBestCleanerRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * A Sum of Best Cleaner allows you to interactively remove potential issues in
 * the Segment History that lead to an inaccurate Sum of Best. If you skip a
 * split, whenever you get to the next split, the combined segment time might
 * be faster than the sum of the individual best segments. The Sum of Best
 * Cleaner will point out all of occurrences of this and allows you to delete
 * them individually if any of them seem wrong.
 */
export class SumOfBestCleanerRefMut extends SumOfBestCleanerRef {
    /**
     * Returns the next potential clean up. If there are no more potential
     * clean ups, null is returned.
     */
    nextPotentialCleanUp(): PotentialCleanUp | null {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new PotentialCleanUp(liveSplitCoreNative.SumOfBestCleaner_next_potential_clean_up(this.ptr));
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
    /**
     * Applies a clean up to the Run.
     */
    apply(cleanUp: PotentialCleanUp) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (cleanUp.ptr == 0) {
            throw "cleanUp is disposed";
        }
        liveSplitCoreNative.SumOfBestCleaner_apply(this.ptr, cleanUp.ptr);
        cleanUp.ptr = 0;
    }
}

/**
 * A Sum of Best Cleaner allows you to interactively remove potential issues in
 * the Segment History that lead to an inaccurate Sum of Best. If you skip a
 * split, whenever you get to the next split, the combined segment time might
 * be faster than the sum of the individual best segments. The Sum of Best
 * Cleaner will point out all of occurrences of this and allows you to delete
 * them individually if any of them seem wrong.
 */
export class SumOfBestCleaner extends SumOfBestCleanerRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: SumOfBestCleaner) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.SumOfBestCleaner_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * The Sum of Best Segments Component shows the fastest possible time to
 * complete a run of this category, based on information collected from all the
 * previous attempts. This often matches up with the sum of the best segment
 * times of all the segments, but that may not always be the case, as skipped
 * segments may introduce combined segments that may be faster than the actual
 * sum of their best segment times. The name is therefore a bit misleading, but
 * sticks around for historical reasons.
 */
export class SumOfBestComponentRef {
    ptr: number;
    /**
     * Encodes the component's state information as JSON.
     */
    stateAsJson(timer: TimerRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = liveSplitCoreNative.SumOfBestComponent_state_as_json(this.ptr, timer.ptr);
        return JSON.parse(result);
    }
    /**
     * Calculates the component's state based on the timer provided.
     */
    state(timer: TimerRef): SumOfBestComponentState {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = new SumOfBestComponentState(liveSplitCoreNative.SumOfBestComponent_state(this.ptr, timer.ptr));
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Sum of Best Segments Component shows the fastest possible time to
 * complete a run of this category, based on information collected from all the
 * previous attempts. This often matches up with the sum of the best segment
 * times of all the segments, but that may not always be the case, as skipped
 * segments may introduce combined segments that may be faster than the actual
 * sum of their best segment times. The name is therefore a bit misleading, but
 * sticks around for historical reasons.
 */
export class SumOfBestComponentRefMut extends SumOfBestComponentRef {
}

/**
 * The Sum of Best Segments Component shows the fastest possible time to
 * complete a run of this category, based on information collected from all the
 * previous attempts. This often matches up with the sum of the best segment
 * times of all the segments, but that may not always be the case, as skipped
 * segments may introduce combined segments that may be faster than the actual
 * sum of their best segment times. The name is therefore a bit misleading, but
 * sticks around for historical reasons.
 */
export class SumOfBestComponent extends SumOfBestComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: SumOfBestComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.SumOfBestComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Sum of Best Segments Component.
     */
    static new(): SumOfBestComponent {
        const result = new SumOfBestComponent(liveSplitCoreNative.SumOfBestComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.SumOfBestComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class SumOfBestComponentStateRef {
    ptr: number;
    /**
     * The label's text.
     */
    text(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.SumOfBestComponentState_text(this.ptr);
        return result;
    }
    /**
     * The sum of best segments.
     */
    time(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.SumOfBestComponentState_time(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class SumOfBestComponentStateRefMut extends SumOfBestComponentStateRef {
}

/**
 * The state object describes the information to visualize for this component.
 */
export class SumOfBestComponentState extends SumOfBestComponentStateRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: SumOfBestComponentState) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.SumOfBestComponentState_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * The Text Component simply visualizes any given text. This can either be a
 * single centered text, or split up into a left and right text, which is
 * suitable for a situation where you have a label and a value.
 */
export class TextComponentRef {
    ptr: number;
    /**
     * Encodes the component's state information as JSON.
     */
    stateAsJson(): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TextComponent_state_as_json(this.ptr);
        return JSON.parse(result);
    }
    /**
     * Calculates the component's state.
     */
    state(): TextComponentState {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TextComponentState(liveSplitCoreNative.TextComponent_state(this.ptr));
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Text Component simply visualizes any given text. This can either be a
 * single centered text, or split up into a left and right text, which is
 * suitable for a situation where you have a label and a value.
 */
export class TextComponentRefMut extends TextComponentRef {
    /**
     * Sets the centered text. If the current mode is split, it is switched to
     * centered mode.
     */
    setCenter(text: string) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.TextComponent_set_center(this.ptr, text);
    }
    /**
     * Sets the left text. If the current mode is centered, it is switched to
     * split mode, with the right text being empty.
     */
    setLeft(text: string) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.TextComponent_set_left(this.ptr, text);
    }
    /**
     * Sets the right text. If the current mode is centered, it is switched to
     * split mode, with the left text being empty.
     */
    setRight(text: string) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.TextComponent_set_right(this.ptr, text);
    }
}

/**
 * The Text Component simply visualizes any given text. This can either be a
 * single centered text, or split up into a left and right text, which is
 * suitable for a situation where you have a label and a value.
 */
export class TextComponent extends TextComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: TextComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.TextComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Text Component.
     */
    static new(): TextComponent {
        const result = new TextComponent(liveSplitCoreNative.TextComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.TextComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class TextComponentStateRef {
    ptr: number;
    /**
     * Accesses the left part of the text. If the text isn't split up, an empty
     * string is returned instead.
     */
    left(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TextComponentState_left(this.ptr);
        return result;
    }
    /**
     * Accesses the right part of the text. If the text isn't split up, an empty
     * string is returned instead.
     */
    right(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TextComponentState_right(this.ptr);
        return result;
    }
    /**
     * Accesses the centered text. If the text isn't centered, an empty string is
     * returned instead.
     */
    center(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TextComponentState_center(this.ptr);
        return result;
    }
    /**
     * Returns whether the text is split up into a left and right part.
     */
    isSplit(): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TextComponentState_is_split(this.ptr) != 0;
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class TextComponentStateRefMut extends TextComponentStateRef {
}

/**
 * The state object describes the information to visualize for this component.
 */
export class TextComponentState extends TextComponentStateRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: TextComponentState) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.TextComponentState_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * A time that can store a Real Time and a Game Time. Both of them are
 * optional.
 */
export class TimeRef {
    ptr: number;
    /**
     * Clones the time.
     */
    clone(): Time {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Time(liveSplitCoreNative.Time_clone(this.ptr));
        return result;
    }
    /**
     * The Real Time value. This may be null if this time has no Real Time value.
     */
    realTime(): TimeSpanRef | null {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimeSpanRef(liveSplitCoreNative.Time_real_time(this.ptr));
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
    /**
     * The Game Time value. This may be null if this time has no Game Time value.
     */
    gameTime(): TimeSpanRef | null {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimeSpanRef(liveSplitCoreNative.Time_game_time(this.ptr));
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
    /**
     * Access the time's value for the timing method specified.
     */
    index(timingMethod: number): TimeSpanRef | null {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimeSpanRef(liveSplitCoreNative.Time_index(this.ptr, timingMethod));
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * A time that can store a Real Time and a Game Time. Both of them are
 * optional.
 */
export class TimeRefMut extends TimeRef {
}

/**
 * A time that can store a Real Time and a Game Time. Both of them are
 * optional.
 */
export class Time extends TimeRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: Time) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.Time_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * A Time Span represents a certain span of time.
 */
export class TimeSpanRef {
    ptr: number;
    /**
     * Clones the Time Span.
     */
    clone(): TimeSpan {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimeSpan(liveSplitCoreNative.TimeSpan_clone(this.ptr));
        return result;
    }
    /**
     * Returns the total amount of seconds (including decimals) this Time Span
     * represents.
     */
    totalSeconds(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TimeSpan_total_seconds(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * A Time Span represents a certain span of time.
 */
export class TimeSpanRefMut extends TimeSpanRef {
}

/**
 * A Time Span represents a certain span of time.
 */
export class TimeSpan extends TimeSpanRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: TimeSpan) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.TimeSpan_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Time Span from a given amount of seconds.
     */
    static fromSeconds(seconds: number): TimeSpan {
        const result = new TimeSpan(liveSplitCoreNative.TimeSpan_from_seconds(seconds));
        return result;
    }
}

/**
 * A Timer provides all the capabilities necessary for doing speedrun attempts.
 */
export class TimerRef {
    ptr: number;
    /**
     * Returns the currently selected Timing Method.
     */
    currentTimingMethod(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Timer_current_timing_method(this.ptr);
        return result;
    }
    /**
     * Returns the current comparison that is being compared against. This may
     * be a custom comparison or one of the Comparison Generators.
     */
    currentComparison(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Timer_current_comparison(this.ptr);
        return result;
    }
    /**
     * Returns whether Game Time is currently initialized. Game Time
     * automatically gets uninitialized for each new attempt.
     */
    isGameTimeInitialized(): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Timer_is_game_time_initialized(this.ptr) != 0;
        return result;
    }
    /**
     * Returns whether the Game Timer is currently paused. If the Game Timer is
     * not paused, it automatically increments similar to Real Time.
     */
    isGameTimePaused(): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Timer_is_game_time_paused(this.ptr) != 0;
        return result;
    }
    /**
     * Accesses the loading times. Loading times are defined as Game Time - Real Time.
     */
    loadingTimes(): TimeSpanRef {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimeSpanRef(liveSplitCoreNative.Timer_loading_times(this.ptr));
        return result;
    }
    /**
     * Returns the current Timer Phase.
     */
    currentPhase(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.Timer_current_phase(this.ptr);
        return result;
    }
    /**
     * Accesses the Run in use by the Timer.
     */
    getRun(): RunRef {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new RunRef(liveSplitCoreNative.Timer_get_run(this.ptr));
        return result;
    }
    /**
     * Prints out debug information representing the whole state of the Timer. This
     * is being written to stdout.
     */
    printDebug() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_print_debug(this.ptr);
    }
    /**
     * Returns the current time of the Timer. The Game Time is null if the Game
     * Time has not been initialized.
     */
    currentTime(): TimeRef {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimeRef(liveSplitCoreNative.Timer_current_time(this.ptr));
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * A Timer provides all the capabilities necessary for doing speedrun attempts.
 */
export class TimerRefMut extends TimerRef {
    /**
     * Replaces the Run object used by the Timer with the Run object provided. If
     * the Run provided contains no segments, it can't be used for timing and is
     * not being modified. Otherwise the Run that was in use by the Timer gets
     * stored in the Run object provided. Before the Run is returned, the current
     * attempt is reset and the splits are being updated depending on the
     * `update_splits` parameter. The return value indicates whether the Run got
     * replaced successfully.
     */
    replaceRun(run: RunRefMut, updateSplits: boolean): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (run.ptr == 0) {
            throw "run is disposed";
        }
        const result = liveSplitCoreNative.Timer_replace_run(this.ptr, run.ptr, updateSplits ? 1 : 0) != 0;
        return result;
    }
    /**
     * Sets the Run object used by the Timer with the Run object provided. If the
     * Run provided contains no segments, it can't be used for timing and gets
     * returned again. If the Run object can be set, the original Run object in use
     * by the Timer is disposed by this method and null is returned.
     */
    setRun(run: Run): Run | null {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (run.ptr == 0) {
            throw "run is disposed";
        }
        const result = new Run(liveSplitCoreNative.Timer_set_run(this.ptr, run.ptr));
        run.ptr = 0;
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
    /**
     * Starts the Timer if there is no attempt in progress. If that's not the
     * case, nothing happens.
     */
    start() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_start(this.ptr);
    }
    /**
     * If an attempt is in progress, stores the current time as the time of the
     * current split. The attempt ends if the last split time is stored.
     */
    split() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_split(this.ptr);
    }
    /**
     * Starts a new attempt or stores the current time as the time of the
     * current split. The attempt ends if the last split time is stored.
     */
    splitOrStart() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_split_or_start(this.ptr);
    }
    /**
     * Skips the current split if an attempt is in progress and the
     * current split is not the last split.
     */
    skipSplit() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_skip_split(this.ptr);
    }
    /**
     * Removes the split time from the last split if an attempt is in progress
     * and there is a previous split. The Timer Phase also switches to
     * `Running` if it previously was `Ended`.
     */
    undoSplit() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_undo_split(this.ptr);
    }
    /**
     * Resets the current attempt if there is one in progress. If the splits
     * are to be updated, all the information of the current attempt is stored
     * in the Run's history. Otherwise the current attempt's information is
     * discarded.
     */
    reset(updateSplits: boolean) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_reset(this.ptr, updateSplits ? 1 : 0);
    }
    /**
     * Pauses an active attempt that is not paused.
     */
    pause() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_pause(this.ptr);
    }
    /**
     * Resumes an attempt that is paused.
     */
    resume() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_resume(this.ptr);
    }
    /**
     * Toggles an active attempt between `Paused` and `Running`.
     */
    togglePause() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_toggle_pause(this.ptr);
    }
    /**
     * Toggles an active attempt between `Paused` and `Running` or starts an
     * attempt if there's none in progress.
     */
    togglePauseOrStart() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_toggle_pause_or_start(this.ptr);
    }
    /**
     * Removes all the pause times from the current time. If the current
     * attempt is paused, it also resumes that attempt. Additionally, if the
     * attempt is finished, the final split time is adjusted to not include the
     * pause times as well.
     * 
     * # Warning
     * 
     * This behavior is not entirely optimal, as generally only the final split
     * time is modified, while all other split times are left unmodified, which
     * may not be what actually happened during the run.
     */
    undoAllPauses() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_undo_all_pauses(this.ptr);
    }
    /**
     * Sets the current Timing Method to the Timing Method provided.
     */
    setCurrentTimingMethod(method: number) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_set_current_timing_method(this.ptr, method);
    }
    /**
     * Switches the current comparison to the next comparison in the list.
     */
    switchToNextComparison() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_switch_to_next_comparison(this.ptr);
    }
    /**
     * Switches the current comparison to the previous comparison in the list.
     */
    switchToPreviousComparison() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_switch_to_previous_comparison(this.ptr);
    }
    /**
     * Initializes Game Time for the current attempt. Game Time automatically
     * gets uninitialized for each new attempt.
     */
    initializeGameTime() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_initialize_game_time(this.ptr);
    }
    /**
     * Deinitializes Game Time for the current attempt.
     */
    deinitializeGameTime() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_deinitialize_game_time(this.ptr);
    }
    /**
     * Pauses the Game Timer such that it doesn't automatically increment
     * similar to Real Time.
     */
    pauseGameTime() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_pause_game_time(this.ptr);
    }
    /**
     * Resumes the Game Timer such that it automatically increments similar to
     * Real Time, starting from the Game Time it was paused at.
     */
    resumeGameTime() {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        liveSplitCoreNative.Timer_resume_game_time(this.ptr);
    }
    /**
     * Sets the Game Time to the time specified. This also works if the Game
     * Time is paused, which can be used as away of updating the Game Timer
     * periodically without it automatically moving forward. This ensures that
     * the Game Timer never shows any time that is not coming from the game.
     */
    setGameTime(time: TimeSpanRef) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (time.ptr == 0) {
            throw "time is disposed";
        }
        liveSplitCoreNative.Timer_set_game_time(this.ptr, time.ptr);
    }
    /**
     * Instead of setting the Game Time directly, this method can be used to
     * just specify the amount of time the game has been loading. The Game Time
     * is then automatically determined by Real Time - Loading Times.
     */
    setLoadingTimes(time: TimeSpanRef) {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (time.ptr == 0) {
            throw "time is disposed";
        }
        liveSplitCoreNative.Timer_set_loading_times(this.ptr, time.ptr);
    }
}

/**
 * A Timer provides all the capabilities necessary for doing speedrun attempts.
 */
export class Timer extends TimerRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: Timer) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.Timer_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Timer based on a Run object storing all the information
     * about the splits. The Run object needs to have at least one segment, so
     * that the Timer can store the final time. If a Run object with no
     * segments is provided, the Timer creation fails and null is returned.
     */
    static new(run: Run): Timer | null {
        if (run.ptr == 0) {
            throw "run is disposed";
        }
        const result = new Timer(liveSplitCoreNative.Timer_new(run.ptr));
        run.ptr = 0;
        if (result.ptr == 0) {
            return null;
        }
        return result;
    }
    /**
     * Consumes the Timer and creates a Shared Timer that can be shared across
     * multiple threads with multiple owners.
     */
    intoShared(): SharedTimer {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new SharedTimer(liveSplitCoreNative.Timer_into_shared(this.ptr));
        this.ptr = 0;
        return result;
    }
    /**
     * Takes out the Run from the Timer and resets the current attempt if there
     * is one in progress. If the splits are to be updated, all the information
     * of the current attempt is stored in the Run's history. Otherwise the
     * current attempt's information is discarded.
     */
    intoRun(updateSplits: boolean): Run {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Run(liveSplitCoreNative.Timer_into_run(this.ptr, updateSplits ? 1 : 0));
        this.ptr = 0;
        return result;
    }
}

/**
 * The Timer Component is a component that shows the total time of the current
 * attempt as a digital clock. The color of the time shown is based on a how
 * well the current attempt is doing compared to the chosen comparison.
 */
export class TimerComponentRef {
    ptr: number;
    /**
     * Encodes the component's state information as JSON.
     */
    stateAsJson(timer: TimerRef, layoutSettings: GeneralLayoutSettingsRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        if (layoutSettings.ptr == 0) {
            throw "layoutSettings is disposed";
        }
        const result = liveSplitCoreNative.TimerComponent_state_as_json(this.ptr, timer.ptr, layoutSettings.ptr);
        return JSON.parse(result);
    }
    /**
     * Calculates the component's state based on the timer and the layout
     * settings provided.
     */
    state(timer: TimerRef, layoutSettings: GeneralLayoutSettingsRef): TimerComponentState {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        if (layoutSettings.ptr == 0) {
            throw "layoutSettings is disposed";
        }
        const result = new TimerComponentState(liveSplitCoreNative.TimerComponent_state(this.ptr, timer.ptr, layoutSettings.ptr));
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Timer Component is a component that shows the total time of the current
 * attempt as a digital clock. The color of the time shown is based on a how
 * well the current attempt is doing compared to the chosen comparison.
 */
export class TimerComponentRefMut extends TimerComponentRef {
}

/**
 * The Timer Component is a component that shows the total time of the current
 * attempt as a digital clock. The color of the time shown is based on a how
 * well the current attempt is doing compared to the chosen comparison.
 */
export class TimerComponent extends TimerComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: TimerComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.TimerComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Timer Component.
     */
    static new(): TimerComponent {
        const result = new TimerComponent(liveSplitCoreNative.TimerComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.TimerComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class TimerComponentStateRef {
    ptr: number;
    /**
     * The time shown by the component without the fractional part.
     */
    time(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TimerComponentState_time(this.ptr);
        return result;
    }
    /**
     * The fractional part of the time shown (including the dot).
     */
    fraction(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TimerComponentState_fraction(this.ptr);
        return result;
    }
    /**
     * The semantic coloring information the time carries.
     */
    semanticColor(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TimerComponentState_semantic_color(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class TimerComponentStateRefMut extends TimerComponentStateRef {
}

/**
 * The state object describes the information to visualize for this component.
 */
export class TimerComponentState extends TimerComponentStateRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: TimerComponentState) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.TimerComponentState_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * A Timer Read Lock allows temporary read access to a timer. Dispose this to
 * release the read lock.
 */
export class TimerReadLockRef {
    ptr: number;
    /**
     * Accesses the timer.
     */
    timer(): TimerRef {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimerRef(liveSplitCoreNative.TimerReadLock_timer(this.ptr));
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * A Timer Read Lock allows temporary read access to a timer. Dispose this to
 * release the read lock.
 */
export class TimerReadLockRefMut extends TimerReadLockRef {
}

/**
 * A Timer Read Lock allows temporary read access to a timer. Dispose this to
 * release the read lock.
 */
export class TimerReadLock extends TimerReadLockRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: TimerReadLock) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.TimerReadLock_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * A Timer Write Lock allows temporary write access to a timer. Dispose this to
 * release the write lock.
 */
export class TimerWriteLockRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * A Timer Write Lock allows temporary write access to a timer. Dispose this to
 * release the write lock.
 */
export class TimerWriteLockRefMut extends TimerWriteLockRef {
    /**
     * Accesses the timer.
     */
    timer(): TimerRefMut {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new TimerRefMut(liveSplitCoreNative.TimerWriteLock_timer(this.ptr));
        return result;
    }
}

/**
 * A Timer Write Lock allows temporary write access to a timer. Dispose this to
 * release the write lock.
 */
export class TimerWriteLock extends TimerWriteLockRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: TimerWriteLock) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.TimerWriteLock_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * The Title Component is a component that shows the name of the game and the
 * category that is being run. Additionally, the game icon, the attempt count,
 * and the total number of successfully finished runs can be shown.
 */
export class TitleComponentRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Title Component is a component that shows the name of the game and the
 * category that is being run. Additionally, the game icon, the attempt count,
 * and the total number of successfully finished runs can be shown.
 */
export class TitleComponentRefMut extends TitleComponentRef {
    /**
     * Encodes the component's state information as JSON.
     */
    stateAsJson(timer: TimerRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = liveSplitCoreNative.TitleComponent_state_as_json(this.ptr, timer.ptr);
        return JSON.parse(result);
    }
    /**
     * Calculates the component's state based on the timer provided.
     */
    state(timer: TimerRef): TitleComponentState {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = new TitleComponentState(liveSplitCoreNative.TitleComponent_state(this.ptr, timer.ptr));
        return result;
    }
}

/**
 * The Title Component is a component that shows the name of the game and the
 * category that is being run. Additionally, the game icon, the attempt count,
 * and the total number of successfully finished runs can be shown.
 */
export class TitleComponent extends TitleComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: TitleComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.TitleComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Title Component.
     */
    static new(): TitleComponent {
        const result = new TitleComponent(liveSplitCoreNative.TitleComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.TitleComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class TitleComponentStateRef {
    ptr: number;
    /**
     * The game's icon encoded as a Data URL. This value is only specified whenever
     * the icon changes. If you explicitly want to query this value, remount the
     * component. The String itself may be empty. This indicates that there is no
     * icon. If no change occurred, null is returned instead.
     */
    iconChange(): string | null {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TitleComponentState_icon_change(this.ptr);
        return result;
    }
    /**
     * The first title line to show. This is either the game's name, or a
     * combination of the game's name and the category.
     */
    line1(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TitleComponentState_line1(this.ptr);
        return result;
    }
    /**
     * By default the category name is shown on the second line. Based on the
     * settings, it can however instead be shown in a single line together with
     * the game name. In that case null is returned instead.
     */
    line2(): string | null {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TitleComponentState_line2(this.ptr);
        return result;
    }
    /**
     * Specifies whether the title should centered or aligned to the left
     * instead.
     */
    isCentered(): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TitleComponentState_is_centered(this.ptr) != 0;
        return result;
    }
    /**
     * Returns whether the amount of successfully finished attempts is supposed to
     * be shown.
     */
    showsFinishedRuns(): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TitleComponentState_shows_finished_runs(this.ptr) != 0;
        return result;
    }
    /**
     * Returns the amount of successfully finished attempts.
     */
    finishedRuns(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TitleComponentState_finished_runs(this.ptr);
        return result;
    }
    /**
     * Returns whether the amount of total attempts is supposed to be shown.
     */
    showsAttempts(): boolean {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TitleComponentState_shows_attempts(this.ptr) != 0;
        return result;
    }
    /**
     * Returns the amount of total attempts.
     */
    attempts(): number {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TitleComponentState_attempts(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class TitleComponentStateRefMut extends TitleComponentStateRef {
}

/**
 * The state object describes the information to visualize for this component.
 */
export class TitleComponentState extends TitleComponentStateRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: TitleComponentState) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.TitleComponentState_drop(this.ptr);
            this.ptr = 0;
        }
    }
}

/**
 * The Total Playtime Component is a component that shows the total amount of
 * time that the current category has been played for.
 */
export class TotalPlaytimeComponentRef {
    ptr: number;
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The Total Playtime Component is a component that shows the total amount of
 * time that the current category has been played for.
 */
export class TotalPlaytimeComponentRefMut extends TotalPlaytimeComponentRef {
    /**
     * Encodes the component's state information as JSON.
     */
    stateAsJson(timer: TimerRef): any {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = liveSplitCoreNative.TotalPlaytimeComponent_state_as_json(this.ptr, timer.ptr);
        return JSON.parse(result);
    }
    /**
     * Calculates the component's state based on the timer provided.
     */
    state(timer: TimerRef): TotalPlaytimeComponentState {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        if (timer.ptr == 0) {
            throw "timer is disposed";
        }
        const result = new TotalPlaytimeComponentState(liveSplitCoreNative.TotalPlaytimeComponent_state(this.ptr, timer.ptr));
        return result;
    }
}

/**
 * The Total Playtime Component is a component that shows the total amount of
 * time that the current category has been played for.
 */
export class TotalPlaytimeComponent extends TotalPlaytimeComponentRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: TotalPlaytimeComponent) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.TotalPlaytimeComponent_drop(this.ptr);
            this.ptr = 0;
        }
    }
    /**
     * Creates a new Total Playtime Component.
     */
    static new(): TotalPlaytimeComponent {
        const result = new TotalPlaytimeComponent(liveSplitCoreNative.TotalPlaytimeComponent_new());
        return result;
    }
    /**
     * Converts the component into a generic component suitable for using with a
     * layout.
     */
    intoGeneric(): Component {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = new Component(liveSplitCoreNative.TotalPlaytimeComponent_into_generic(this.ptr));
        this.ptr = 0;
        return result;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class TotalPlaytimeComponentStateRef {
    ptr: number;
    /**
     * The label's text.
     */
    text(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TotalPlaytimeComponentState_text(this.ptr);
        return result;
    }
    /**
     * The total playtime.
     */
    time(): string {
        if (this.ptr == 0) {
            throw "this is disposed";
        }
        const result = liveSplitCoreNative.TotalPlaytimeComponentState_time(this.ptr);
        return result;
    }
    /**
     * This constructor is an implementation detail. Do not use this.
     */
    constructor(ptr: number) {
        this.ptr = ptr;
    }
}

/**
 * The state object describes the information to visualize for this component.
 */
export class TotalPlaytimeComponentStateRefMut extends TotalPlaytimeComponentStateRef {
}

/**
 * The state object describes the information to visualize for this component.
 */
export class TotalPlaytimeComponentState extends TotalPlaytimeComponentStateRefMut {
    /**
     * Allows for scoped usage of the object. The object is guaranteed to get
     * disposed once this function returns. You are free to dispose the object
     * early yourself anywhere within the scope. The scope's return value gets
     * carried to the outside of this function.
     */
    with<T>(closure: (obj: TotalPlaytimeComponentState) => T): T {
        try {
            return closure(this);
        } finally {
            this.dispose();
        }
    }
    /**
     * Disposes the object, allowing it to clean up all of its memory. You need
     * to call this for every object that you don't use anymore and hasn't
     * already been disposed.
     */
    dispose() {
        if (this.ptr != 0) {
            liveSplitCoreNative.TotalPlaytimeComponentState_drop(this.ptr);
            this.ptr = 0;
        }
    }
}
