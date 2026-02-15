import { Lang, Language } from "../livesplit-core";
import { resolveChineseSimplified } from "./chinese-simplified";
import { resolveChineseTraditional } from "./chinese-traditional";
import { resolveDutch } from "./dutch";
import { resolveEnglish } from "./english";
import { resolveFrench } from "./french";
import { resolveGerman } from "./german";
import { resolveItalian } from "./italian";
import { resolveJapanese } from "./japanese";
import { resolveKorean } from "./korean";
import { resolvePolish } from "./polish";
import { resolvePortuguese } from "./portuguese";
import { resolveBrazilianPortuguese } from "./portuguese-brazil";
import { resolveRussian } from "./russian";
import { resolveSpanish } from "./spanish";

export enum Label {
    Ok,
    Cancel,
    Settings,
    Language,
    LanguageDescription,
    LanguageAuto,
    HotkeysHeading,
    GeneralHeading,
    NetworkHeading,
    FrameRate,
    FrameRateDescription,
    FrameRateBatteryAware,
    FrameRateMatchScreen,
    SaveOnReset,
    SaveOnResetDescription,
    ShowControlButtons,
    ShowControlButtonsDescription,
    ShowManualGameTimeInput,
    ShowManualGameTimeInputDescription,
    ManualGameTimeMode,
    ManualGameTimeModeDescription,
    ManualGameTimeModeSegmentTimes,
    ManualGameTimeModeSplitTimes,
    AlwaysOnTop,
    AlwaysOnTopDescription,
    SpeedrunComIntegration,
    SpeedrunComIntegrationDescription,
    ServerConnection,
    ServerConnectionDescription,
    ServerConnectionExperimental,
    HotkeyAlreadyInUse,
    Start,
    Resume,
    Pause,
    UndoSplit,
    Reset,
    SkipSplit,
    ManualGameTimePlaceholder,
    LiveSplitLogoAlt,
    LiveSplitOne,
    Splits,
    Layout,
    CompareAgainst,
    RealTime,
    GameTime,
    PopOut,
    About,
    Back,
    AboutVersionPrefix,
    AboutDescription,
    AboutViewSource,
    AboutRecentChanges,
    AboutContributors,
    Loading,
    Add,
    Import,
    OpenFolder,
    LocalFolder,
    OpenSplits,
    EditSplits,
    ExportSplits,
    CopySplits,
    RemoveSplits,
    Untitled,
    NoCategory,
    DiscardChangesTitle,
    DiscardChangesDescription,
    DeleteSplitsTitle,
    DeleteSplitsDescription,
    SaveBestTimesTitle,
    SaveBestTimesDescription,
    Yes,
    No,
    DontReset,
    FailedToExportSplits,
    CantImportEmptySplits,
    FailedToReadFile,
    FailedToImportSplits,
    CouldNotParseSplits,
    LoadedSplitsInvalid,
    NewSegmentName,
    EditWhileRunningError,
    Edit,
    Save,
    Export,
    FailedToParseTimeSpan,
    Default,
    Game,
    Category,
    StartTimerAt,
    Attempts,
    SplitsEditor,
    Variables,
    Rules,
    Leaderboard,
    InsertAbove,
    InsertBelow,
    RemoveSegment,
    MoveUp,
    MoveDown,
    AddVariable,
    OpenPbPage,
    AssociateRun,
    Icon,
    SegmentName,
    SplitTime,
    SegmentTime,
    BestSegment,
    SpeedrunComVariableTooltip,
    Region,
    RegionDescription,
    Platform,
    PlatformDescription,
    UsesEmulator,
    UsesEmulatorDescription,
    CustomVariableTooltip,
    NoVariables,
    NoVariablesWithSpeedrunCom,
    TimedWithoutLoads,
    TimedWithGameTime,
    RequireVideoProof,
    RunsOfThisGamePrefix,
    RunsOfThisGameSuffix,
    And,
    SetIcon,
    SetIconDescription,
    DownloadBoxArt,
    DownloadBoxArtDescription,
    DownloadIcon,
    DownloadIconDescription,
    RemoveIcon,
    RemoveIconDescription,
    CleaningMenu,
    ClearOnlyHistory,
    ClearOnlyHistoryDescription,
    ClearAllTimes,
    ClearAllTimesDescription,
    CleanSumOfBest,
    CleanSumOfBestDescription,
    ComparisonsMenu,
    AddComparison,
    AddComparisonDescription,
    ImportComparison,
    ImportComparisonDescription,
    GenerateGoalComparison,
    GenerateGoalComparisonDescription,
    CopyComparison,
    CopyComparisonDescription,
    SetSegmentIcon,
    SetSegmentIconDescription,
    RemoveSegmentIcon,
    RemoveSegmentIconDescription,
    Rename,
    RenameDescription,
    CopyAction,
    CopyDescription,
    ACopy,
    Remove,
    RemoveDescription,
    AnyPercent,
    LowPercent,
    HundredPercent,
    AddComparisonPrompt,
    ComparisonAddError,
    ImportComparisonPrompt,
    GenerateGoalComparisonPrompt,
    Generate,
    GenerateGoalComparisonError,
    CopyComparisonPrompt,
    CopyComparisonError,
    NothingToCleanUp,
    CleanPrompt,
    AssociateRunPrompt,
    Associate,
    InvalidSpeedrunUrl,
    AssociateRunError,
    AddVariablePrompt,
    RenameComparison,
    RenameComparisonPrompt,
    ComparisonRenameError,
    GameNotFound,
    NoBoxArt,
    DownloadBoxArtError,
    NoGameIcon,
    DownloadIconError,
    Rank,
    Player,
    Time,
    Date,
    Emulator,
    EmulatorTag,
    ObsoleteRuns,
    Shown,
    Hidden,
    OpenLeaderboard,
    Filters,
    LayoutEditor,
    Component,
    AddComponent,
    RemoveComponent,
    DuplicateComponent,
    MoveComponentUp,
    MoveComponentDown,
    ComponentTitle,
    ComponentTitleDescription,
    ComponentGraph,
    ComponentGraphDescription,
    ComponentSplitsDescription,
    ComponentDetailedTimer,
    ComponentDetailedTimerDescription,
    ComponentTimer,
    ComponentTimerDescription,
    ComponentCurrentComparison,
    ComponentCurrentComparisonDescription,
    ComponentCurrentPace,
    ComponentCurrentPaceDescription,
    ComponentDelta,
    ComponentDeltaDescription,
    ComponentPbChance,
    ComponentPbChanceDescription,
    ComponentPossibleTimeSave,
    ComponentPossibleTimeSaveDescription,
    ComponentPreviousSegment,
    ComponentPreviousSegmentDescription,
    ComponentSegmentTime,
    ComponentSegmentTimeDescription,
    ComponentSumOfBest,
    ComponentSumOfBestDescription,
    ComponentText,
    ComponentTextDescription,
    ComponentTotalPlaytime,
    ComponentTotalPlaytimeDescription,
    ComponentVariableDescription,
    ComponentBlankSpace,
    ComponentBlankSpaceDescription,
    ComponentSeparator,
    ComponentSeparatorDescription,
    AccuracySeconds,
    AccuracyTenths,
    AccuracyHundredths,
    AccuracyMilliseconds,
    FontStyle,
    FontWeight,
    FontStretch,
    FontStyleNormal,
    FontStyleItalic,
    AlignmentAutomatic,
    AlignmentLeft,
    AlignmentCenter,
    GradientTransparent,
    GradientPlain,
    GradientVertical,
    GradientHorizontal,
    GradientAlternating,
    GradientPlainDelta,
    GradientVerticalDelta,
    GradientHorizontalDelta,
    LayoutBackgroundImage,
    LayoutBackgroundBrightness,
    LayoutBackgroundOpacity,
    LayoutBackgroundBlur,
    LayoutDirectionVertical,
    LayoutDirectionHorizontal,
    ColumnKindTime,
    ColumnKindVariable,
    ColumnStartWithEmpty,
    ColumnStartWithComparisonTime,
    ColumnStartWithComparisonSegmentTime,
    ColumnStartWithPossibleTimeSave,
    ColumnUpdateWithDontUpdate,
    ColumnUpdateWithSplitTime,
    ColumnUpdateWithDelta,
    ColumnUpdateWithDeltaWithFallback,
    ColumnUpdateWithSegmentTime,
    ColumnUpdateWithSegmentDelta,
    ColumnUpdateWithSegmentDeltaWithFallback,
    ColumnUpdateTriggerOnStartingSegment,
    ColumnUpdateTriggerContextual,
    ColumnUpdateTriggerOnEndingSegment,
    ComparisonCurrentComparison,
    CustomVariableNoneAvailable,
    CustomVariableNoneAvailableTooltip,
    HotkeyButtonTooltip,
    ServerConnect,
    ServerDisconnect,
    ServerConnecting,
    ServerDisconnecting,
    ConnectToServerTitle,
    ConnectToServerDescription,
    Connect,
    UpdateAvailable,
    UnsavedChangesBeforeUnload,
    OpenSidebarAriaLabel,
    FailedToSaveLayout,
    FailedToSaveHotkeys,
    FailedToSaveGeneralSettings,
    FailedToSaveSplits,
    LayoutCouldNotBeLoaded,
    EmptySplitsNotSupported,
    BugEncountered,
    PleaseReportIssueStart,
    ReportHere,
    PleaseReportIssueEnd,
    BugReportInstructions,
    LoadFailedPrivateBrowsing,
    LoadFailedOutdatedBrowser,
}

export function resolve(text: Label, lang: Language | undefined): string {
    switch (orAutoLang(lang)) {
        case Language.ChineseSimplified: return resolveChineseSimplified(text);
        case Language.ChineseTraditional: return resolveChineseTraditional(text);
        case Language.Dutch: return resolveDutch(text);
        case Language.French: return resolveFrench(text);
        case Language.German: return resolveGerman(text);
        case Language.Italian: return resolveItalian(text);
        case Language.Japanese: return resolveJapanese(text);
        case Language.Korean: return resolveKorean(text);
        case Language.Polish: return resolvePolish(text);
        case Language.Portuguese: return resolvePortuguese(text);
        case Language.BrazilianPortuguese: return resolveBrazilianPortuguese(text);
        case Language.Russian: return resolveRussian(text);
        case Language.Spanish: return resolveSpanish(text);
        case Language.English: return resolveEnglish(text);
    }
}

export function getLocale(lang: Language | undefined): string {
    return getLocaleOpt(lang) ?? navigator.language;
}

export function getLocaleOpt(lang: Language | undefined): string | undefined {
    if (lang == null) {
        return undefined;
    }
    switch (lang) {
        case Language.ChineseSimplified: return "zh-Hans";
        case Language.ChineseTraditional: return "zh-Hant";
        case Language.Dutch: return "nl";
        case Language.French: return "fr";
        case Language.German: return "de";
        case Language.Italian: return "it";
        case Language.Japanese: return "ja";
        case Language.Korean: return "ko";
        case Language.Polish: return "pl";
        case Language.Portuguese: return "pt";
        case Language.BrazilianPortuguese: return "pt-BR";
        case Language.Russian: return "ru";
        case Language.Spanish: return "es";
        case Language.English: return "en";
    }
}

export function fromLocaleOpt(value: unknown): Language | undefined {
    if (typeof value === "string") {
        return Lang.parseLocale(value);
    } else {
        return undefined;
    }
}

export function formatDate(date: string, lang: Language | undefined): string {
    // FIXME: Use Temporal.PlainDate when it's available in Safari.
    const locale = getLocale(lang);
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(locale, {
        timeZone: "UTC",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

let autoLang: Language | undefined = undefined;
export function orAutoLang(lang: Language | undefined): Language {
    if (lang != null) {
        return lang;
    }
    if (autoLang != null) {
        return autoLang;
    }
    autoLang = Lang.parseLocale(navigator.language);
    return autoLang;
}

export function setHtmlLang(lang: Language | undefined): void {
    document.documentElement.lang = getLocale(lang);
}
