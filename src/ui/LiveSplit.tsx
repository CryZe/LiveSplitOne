import * as React from "react";
import Sidebar from "react-sidebar";
import {
    Layout,
    LayoutEditor,
    Run,
    RunEditor,
    Segment,
    Timer,
    HotkeyConfig,
    LayoutState,
    LayoutStateJson,
    TimingMethod,
    TimerPhase,
    Event,
    LayoutRefMut,
    Language,
} from "../livesplit-core";
import { Layout as ShowLayout } from "./components/Layout";
import {
    FILE_EXT_LAYOUTS,
    convertFileToArrayBuffer,
    convertFileToString,
    exportFile,
    openFileAsString,
} from "../util/FileUtil";
import {
    Option,
    assertNull,
    expect,
    maybeDisposeAndThen,
    panic,
} from "../util/OptionUtil";
import { LayoutEditor as LayoutEditorComponent } from "./views/LayoutEditor";
import { RunEditor as RunEditorComponent } from "./views/RunEditor";
import {
    GeneralSettings,
    MainSettings as SettingsEditorComponent,
} from "./views/MainSettings";
import { TimerView } from "./views/TimerView";
import { About } from "./views/About";
import { SplitsSelection, EditingInfo } from "./views/SplitsSelection";
import { LayoutView } from "./views/LayoutView";
import { ToastContainer, toast } from "react-toastify";
import * as Storage from "../storage";
import { UrlCache } from "../util/UrlCache";
import {
    HotkeySystem_add_window,
    ServerProtocol,
    WebRenderer,
} from "../livesplit-core/livesplit_core";
import { LiveSplitServer } from "../api/LiveSplitServer";
import { LSOCommandSink } from "../util/LSOCommandSink";
import { DialogContainer } from "./components/Dialog";
import { createHotkeys, HotkeyImplementation } from "../platform/Hotkeys";
import { Menu } from "lucide-react";
import { createRoot } from "react-dom/client";

import * as variables from "../css/variables.icss.scss";

import LiveSplitIcon from "../assets/icon.svg";
import timerFont from "../css/timer.woff";
import firaFont from "../css/FiraSans-Regular.woff";

import "react-toastify/dist/ReactToastify.css";
import * as classes from "../css/LiveSplit.module.scss";
import * as sidebarClasses from "../css/Sidebar.module.scss";
import * as toastClasses from "../css/Toast.module.scss";
import { Label, orAutoLang, resolve, setHtmlLang } from "../localization";

const buttonHeight = parseFloat(variables.buttonHeight);
const largeMargin = parseFloat(variables.largeMargin);
const manualGameTimeHeight = parseFloat(variables.manualGameTimeHeight);

export enum MenuKind {
    Timer,
    Splits,
    RunEditor,
    Layout,
    LayoutEditor,
    MainSettings,
    About,
}

function isMenuLocked(menuKind: MenuKind) {
    switch (menuKind) {
        case MenuKind.Timer:
        case MenuKind.Layout:
            return false;
        default:
            return true;
    }
}

type Menu =
    | { kind: MenuKind.Timer }
    | { kind: MenuKind.Splits }
    | { kind: MenuKind.RunEditor; editor: RunEditor; splitsKey?: number }
    | { kind: MenuKind.Layout }
    | { kind: MenuKind.LayoutEditor; editor: LayoutEditor }
    | { kind: MenuKind.MainSettings; config: HotkeyConfig }
    | { kind: MenuKind.About };

export interface Props {
    splits?: Uint8Array;
    localSplitsFileHandle?: FileSystemFileHandle;
    localSplitsFileName?: string;
    layout?: Storage.LayoutSettings;
    comparison?: string;
    timingMethod: TimingMethod;
    hotkeys?: Storage.HotkeyConfigSettings;
    layoutWidth: number;
    layoutHeight: number;
    generalSettings: GeneralSettings;
    splitsKey?: number;
}

export interface State {
    hotkeySystem: HotkeyImplementation;
    isDesktop: boolean;
    layout: Layout;
    layoutState: LayoutState;
    layoutUrlCache: UrlCache;
    runEditorUrlCache: UrlCache;
    layoutEditorUrlCache: UrlCache;
    layoutWidth: number;
    layoutHeight: number;
    menu: Menu;
    openedSplitsKey?: number;
    sidebarOpen: boolean;
    sidebarTransitionsEnabled: boolean;
    storedLayoutWidth: number;
    storedLayoutHeight: number;
    commandSink: LSOCommandSink;
    renderer: WebRenderer;
    generalSettings: GeneralSettings;
    serverConnection: Option<LiveSplitServer>;
    currentComparison: string;
    currentTimingMethod: TimingMethod;
    currentPhase: TimerPhase;
    currentSplitIndex: number;
    allComparisons: string[];
    allVariables: Set<string>;
    splitsModified: boolean;
    layoutModified: boolean;
    localSplitsFileHandle?: FileSystemFileHandle;
    localSplitsFileName?: string;
}

export let hotkeySystem: Option<HotkeyImplementation> = null;

export class LiveSplit extends React.Component<Props, State> {
    public static async loadStoredData() {
        // FIXME: We should probably request all of these concurrently.
        let splitsKey = await Storage.loadSplitsKey();
        const localSplitsFileHandle = await Storage.loadLocalSplitsFileHandle();
        let localSplitsFileName = await Storage.loadLocalSplitsFileName();
        let splits: Uint8Array<ArrayBuffer> | undefined;

        if (localSplitsFileHandle !== undefined) {
            if (localSplitsFileName === undefined) {
                localSplitsFileName = localSplitsFileHandle.name;
            }
            const canRead =
                !localSplitsFileHandle.queryPermission ||
                (await localSplitsFileHandle.queryPermission({
                    mode: "read",
                })) === "granted";

            if (canRead) {
                try {
                    const file = await localSplitsFileHandle.getFile();
                    splits = new Uint8Array(await file.arrayBuffer());
                    splitsKey = undefined;
                } catch (_) {
                    splits = undefined;
                }
            }
        }

        if (splits === undefined && splitsKey !== undefined) {
            splits = await Storage.loadSplits(splitsKey);
        }
        const layout = await Storage.loadLayout();
        const comparison = await Storage.loadComparison();
        const timingMethod = await Storage.loadTimingMethod();
        const hotkeys = await Storage.loadHotkeys();
        const [layoutWidth, layoutHeight] = await Storage.loadLayoutDims();
        const generalSettings = await Storage.loadGeneralSettings();

        return {
            splits,
            splitsKey,
            localSplitsFileHandle,
            localSplitsFileName,
            layout,
            comparison,
            timingMethod,
            hotkeys,
            layoutWidth,
            layoutHeight,
            generalSettings,
        };
    }

    private isDesktopQuery = window.matchMedia("(min-width: 600px)");
    private scrollEvent: Option<EventListenerObject>;
    private rightClickEvent: Option<EventListenerObject>;
    private resizeEvent: Option<EventListenerObject>;

    constructor(props: Props) {
        super(props);

        const run = this.getDefaultRun();
        const timer = expect(
            Timer.new(run),
            "The Default Run should be a valid Run",
            props.generalSettings.lang,
        );

        const commandSink = new LSOCommandSink(timer, this);

        hotkeySystem = createHotkeys(
            commandSink.getCommandSink(),
            props.hotkeys,
            props.generalSettings.lang,
        );

        if (props.splits !== undefined) {
            using result = Run.parseArray(props.splits, "");
            if (result.parsedSuccessfully()) {
                using r = result.unwrap();
                commandSink.setRun(r)?.[Symbol.dispose]();
            }
        }

        if (props.comparison !== undefined) {
            timer.setCurrentComparison(props.comparison);
        }
        timer.setCurrentTimingMethod(props.timingMethod);

        let layout: Option<Layout> = null;
        try {
            const data = props.layout;
            if (data !== undefined) {
                layout = Layout.parseJson(data);
            }
        } catch (_) {
            /* Looks like the storage has no valid data */
        }
        if (layout === null) {
            layout = Layout.defaultLayout(
                orAutoLang(props.generalSettings.lang),
            );
        }

        const isDesktop = this.isDesktopQuery.matches;

        const renderer = new WebRenderer();
        renderer
            .element()
            .setAttribute("style", "width: inherit; height: inherit;");

        this.state = {
            isDesktop,
            layout,
            layoutState: LayoutState.new(),
            layoutUrlCache: new UrlCache(),
            runEditorUrlCache: new UrlCache(),
            layoutEditorUrlCache: new UrlCache(),
            layoutWidth: props.layoutWidth,
            layoutHeight: props.layoutHeight,
            menu: { kind: MenuKind.Timer },
            sidebarOpen: false,
            sidebarTransitionsEnabled: false,
            storedLayoutWidth: props.layoutWidth,
            storedLayoutHeight: props.layoutHeight,
            commandSink,
            hotkeySystem,
            openedSplitsKey: props.splitsKey,
            renderer,
            generalSettings: props.generalSettings,
            serverConnection: null,
            currentComparison: commandSink.currentComparison(),
            currentTimingMethod: commandSink.currentTimingMethod(),
            currentPhase: commandSink.currentPhase(),
            currentSplitIndex: commandSink.currentSplitIndex(),
            allComparisons: commandSink.getAllComparisons(),
            allVariables: commandSink.getAllCustomVariables(),
            splitsModified: commandSink.hasBeenModified(),
            layoutModified: false,
            localSplitsFileHandle: props.localSplitsFileHandle,
            localSplitsFileName: props.localSplitsFileName,
        };

        window.__TAURI__?.event.listen("command", (event) => {
            const payloadString = JSON.stringify(event.payload);
            ServerProtocol.handleCommand(
                payloadString,
                commandSink.getCommandSink().ptr,
            );
        });

        this.updateTauriSettings(props.generalSettings);

        this.updateBadge();

        this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
    }

    public getLang(): Language | undefined {
        return this.state.generalSettings.lang;
    }

    private notifyAboutUpdate() {
        const { serviceWorker } = navigator;
        if (serviceWorker && serviceWorker.controller) {
            // Don't prompt for update when service worker gets removed
            toast.warn(
                resolve(Label.UpdateAvailable, this.state.generalSettings.lang),
                {
                    closeOnClick: true,
                    onClick: () => window.location.reload(),
                },
            );
        }
    }

    public componentDidMount() {
        this.scrollEvent = { handleEvent: (e: WheelEvent) => this.onScroll(e) };
        window.addEventListener("wheel", this.scrollEvent);
        this.rightClickEvent = {
            handleEvent: (e: any) => this.onRightClick(e),
        };
        window.addEventListener("contextmenu", this.rightClickEvent, false);
        this.resizeEvent = { handleEvent: () => this.handleAutomaticResize() };
        window.addEventListener("resize", this.resizeEvent, false);

        window.onbeforeunload = () => {
            if (this.state.splitsModified || this.state.layoutModified) {
                return resolve(
                    Label.UnsavedChangesBeforeUnload,
                    this.state.generalSettings.lang,
                );
            } else {
                return;
            }
        };

        // This is bound in the constructor
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this.isDesktopQuery.addEventListener("change", this.mediaQueryChanged);

        this.handleAutomaticResize();

        const { serviceWorker } = navigator;
        if (serviceWorker && serviceWorker.controller) {
            // Don't prompt for update when there was no service worker previously installed
            serviceWorker.addEventListener("controllerchange", () =>
                this.notifyAboutUpdate(),
            );
        }
    }

    public componentDidUpdate() {
        this.handleAutomaticResize();
    }

    public componentWillUnmount() {
        window.removeEventListener(
            "wheel",
            expect(
                this.scrollEvent,
                "A Scroll Event should exist",
                this.state.generalSettings.lang,
            ),
        );
        window.removeEventListener(
            "contextmenu",
            expect(
                this.rightClickEvent,
                "A Right Click Event should exist",
                this.state.generalSettings.lang,
            ),
        );
        window.removeEventListener(
            "resize",
            expect(
                this.resizeEvent,
                "A Resize Event should exist",
                this.state.generalSettings.lang,
            ),
        );
        this.state.commandSink[Symbol.dispose]();
        this.state.layout[Symbol.dispose]();
        this.state.layoutState[Symbol.dispose]();

        this.isDesktopQuery.removeEventListener(
            "change",
            // This is bound in the constructor
            // eslint-disable-next-line @typescript-eslint/unbound-method
            this.mediaQueryChanged,
        );

        const { serviceWorker } = navigator;
        if (serviceWorker) {
            serviceWorker.removeEventListener("controllerchange", () =>
                this.notifyAboutUpdate(),
            );
        }
    }

    public render() {
        let view: React.JSX.Element | undefined;

        if (this.state.menu.kind === MenuKind.RunEditor) {
            view = (
                <RunEditorComponent
                    editor={this.state.menu.editor}
                    callbacks={this}
                    runEditorUrlCache={this.state.runEditorUrlCache}
                    allComparisons={this.state.allComparisons}
                    allVariables={this.state.allVariables}
                    generalSettings={this.state.generalSettings}
                />
            );
        } else if (this.state.menu.kind === MenuKind.LayoutEditor) {
            view = (
                <LayoutEditorComponent
                    editor={this.state.menu.editor}
                    layoutState={this.state.layoutState}
                    layoutEditorUrlCache={this.state.layoutEditorUrlCache}
                    layoutUrlCache={this.state.layoutUrlCache}
                    layoutWidth={this.state.layoutWidth}
                    layoutHeight={this.state.layoutHeight}
                    generalSettings={this.state.generalSettings}
                    allComparisons={this.state.allComparisons}
                    allVariables={this.state.allVariables}
                    isDesktop={this.state.isDesktop}
                    commandSink={this.state.commandSink}
                    renderer={this.state.renderer}
                    callbacks={this}
                />
            );
        } else if (this.state.menu.kind === MenuKind.MainSettings) {
            view = (
                <SettingsEditorComponent
                    generalSettings={this.state.generalSettings}
                    hotkeyConfig={this.state.menu.config}
                    urlCache={this.state.layoutUrlCache}
                    callbacks={this}
                    commandSink={this.state.commandSink}
                    serverConnection={this.state.serverConnection}
                    allComparisons={this.state.allComparisons}
                    allVariables={this.state.allVariables}
                />
            );
        } else if (this.state.menu.kind === MenuKind.About) {
            view = (
                <About
                    callbacks={this}
                    generalSettings={this.state.generalSettings}
                />
            );
        } else if (this.state.menu.kind === MenuKind.Splits) {
            view = (
                <SplitsSelection
                    generalSettings={this.state.generalSettings}
                    commandSink={this.state.commandSink}
                    openedSplitsKey={this.state.openedSplitsKey}
                    openedLocalSplitsFileHandle={
                        this.state.localSplitsFileHandle
                    }
                    openedLocalSplitsFileName={this.state.localSplitsFileName}
                    callbacks={this}
                    splitsModified={this.state.splitsModified}
                />
            );
        } else if (this.state.menu.kind === MenuKind.Timer) {
            view = (
                <TimerView
                    layout={this.state.layout}
                    layoutState={this.state.layoutState}
                    layoutUrlCache={this.state.layoutUrlCache}
                    layoutWidth={this.state.layoutWidth}
                    layoutHeight={this.state.layoutHeight}
                    generalSettings={this.state.generalSettings}
                    isDesktop={this.state.isDesktop}
                    renderWithSidebar={true}
                    sidebarOpen={this.state.sidebarOpen}
                    commandSink={this.state.commandSink}
                    renderer={this.state.renderer}
                    serverConnection={this.state.serverConnection}
                    callbacks={this}
                    currentComparison={this.state.currentComparison}
                    currentTimingMethod={this.state.currentTimingMethod}
                    currentPhase={this.state.currentPhase}
                    currentSplitIndex={this.state.currentSplitIndex}
                    allComparisons={this.state.allComparisons}
                    splitsModified={this.state.splitsModified}
                    layoutModified={this.state.layoutModified}
                />
            );
        } else if (this.state.menu.kind === MenuKind.Layout) {
            view = (
                <LayoutView
                    layout={this.state.layout}
                    layoutState={this.state.layoutState}
                    layoutUrlCache={this.state.layoutUrlCache}
                    layoutWidth={this.state.layoutWidth}
                    layoutHeight={this.state.layoutHeight}
                    generalSettings={this.state.generalSettings}
                    isDesktop={this.state.isDesktop}
                    renderWithSidebar={true}
                    sidebarOpen={this.state.sidebarOpen}
                    commandSink={this.state.commandSink}
                    renderer={this.state.renderer}
                    serverConnection={this.state.serverConnection}
                    callbacks={this}
                    currentComparison={this.state.currentComparison}
                    currentTimingMethod={this.state.currentTimingMethod}
                    currentPhase={this.state.currentPhase}
                    currentSplitIndex={this.state.currentSplitIndex}
                    allComparisons={this.state.allComparisons}
                    splitsModified={this.state.splitsModified}
                    layoutModified={this.state.layoutModified}
                />
            );
        }

        return (
            <>
                {view}
                <DialogContainer
                    onShow={() => this.lockTimerInteraction()}
                    onClose={() => this.unlockTimerInteraction()}
                />
                <ToastContainer
                    position="bottom-right"
                    toastClassName={toastClasses.toastClass}
                    className={toastClasses.toastBody}
                    theme="dark"
                />
            </>
        );
    }

    public renderViewWithSidebar(
        renderedView: React.JSX.Element,
        sidebarContent: React.JSX.Element,
    ) {
        return (
            <div className={this.state.isDesktop ? "" : "is-mobile"}>
                <Sidebar
                    sidebar={sidebarContent}
                    docked={this.state.isDesktop}
                    open={this.state.sidebarOpen}
                    transitions={this.state.sidebarTransitionsEnabled}
                    onSetOpen={(e) => this.onSetSidebarOpen(e)}
                    sidebarClassName={sidebarClasses.sidebar}
                    overlayClassName={sidebarClasses.sidebarOverlay}
                >
                    {!this.state.isDesktop && !this.state.sidebarOpen && (
                        <button
                            aria-label={resolve(
                                Label.OpenSidebarAriaLabel,
                                this.state.generalSettings.lang,
                            )}
                            className={classes.openSidebarButton}
                            onClick={() => this.onSetSidebarOpen(true)}
                        >
                            <Menu size={30} strokeWidth={2.5} />
                        </button>
                    )}
                    <div className={classes.viewContainer}>{renderedView}</div>
                </Sidebar>
            </div>
        );
    }

    private changeMenu(menu: Menu, closeSidebar: boolean = true) {
        const wasLocked = isMenuLocked(this.state.menu.kind);
        const isLocked = isMenuLocked(menu.kind);

        this.setState({ menu });
        if (closeSidebar) {
            this.setState({ sidebarOpen: false });
        }

        if (!wasLocked && isLocked) {
            this.lockTimerInteraction();
        } else if (wasLocked && !isLocked) {
            this.unlockTimerInteraction();
        }
    }

    public openTimerView() {
        this.changeMenu({ kind: MenuKind.Timer });
    }

    public openSplitsView() {
        this.changeMenu({ kind: MenuKind.Splits });
    }

    public openLayoutView() {
        this.changeMenu({ kind: MenuKind.Layout }, false);
    }

    public openAboutView() {
        this.changeMenu({ kind: MenuKind.About });
    }

    private lockTimerInteraction() {
        if (!this.state.commandSink.isLocked()) {
            // We need to schedule this to happen in the next micro task,
            // because the hotkey system itself may be what triggered this
            // function, so the hotkey system might still be in use, which would
            // result in a deadlock acquiring the internal state of the hotkey
            // system.
            setTimeout(() => this.state.hotkeySystem.deactivate());
        }
        this.state.commandSink.lockInteraction();
    }

    private unlockTimerInteraction() {
        this.state.commandSink.unlockInteraction();
        if (!this.state.commandSink.isLocked()) {
            // We need to schedule this to happen in the next micro task,
            // because the hotkey system itself may be what triggered this
            // function, so the hotkey system might still be in use, which would
            // result in a deadlock acquiring the internal state of the hotkey
            // system.
            setTimeout(() => this.state.hotkeySystem.activate());
        }
    }

    public async importSplitsFromFile(file: File) {
        const splits = await convertFileToArrayBuffer(file);
        if (splits instanceof Error) {
            toast.error(
                `${resolve(Label.FailedToReadFile, this.state.generalSettings.lang)} ${splits.message}`,
            );
            return;
        }
        this.importSplitsFromArrayBuffer(splits);
    }

    public async saveLayout() {
        try {
            const layout = this.state.layout.settingsAsJson();
            await Storage.storeLayout(
                layout,
                this.state.storedLayoutWidth,
                this.state.storedLayoutHeight,
            );
            this.setState({ layoutModified: false }, () => this.updateBadge());
        } catch (_) {
            toast.error(
                resolve(
                    Label.FailedToSaveLayout,
                    this.state.generalSettings.lang,
                ),
            );
        }
    }

    public async importLayout() {
        const maybeFile = await openFileAsString(FILE_EXT_LAYOUTS);
        if (maybeFile === undefined) {
            return;
        }
        if (maybeFile instanceof Error) {
            toast.error(
                `${resolve(Label.FailedToReadFile, this.state.generalSettings.lang)} ${maybeFile.message}`,
            );
            return;
        }
        const [file] = maybeFile;
        try {
            this.importLayoutFromString(file);
        } catch (err) {
            toast.error((err as Error).message);
        }
    }

    public async importLayoutFromFile(file: File) {
        const maybeFile = await convertFileToString(file);
        if (maybeFile instanceof Error) {
            toast.error(
                `${resolve(Label.FailedToReadFile, this.state.generalSettings.lang)} ${maybeFile.message}`,
            );
            return;
        }
        const [fileString] = maybeFile;
        this.importLayoutFromString(fileString);
    }

    public exportLayout() {
        const layout = this.state.layout.settingsAsJson();
        exportFile("layout.ls1l", JSON.stringify(layout, null, 4));
    }

    public loadDefaultLayout() {
        const layout = Layout.defaultLayout(
            orAutoLang(this.state.generalSettings.lang),
        );
        this.setLayout(layout);
    }

    public openRunEditor({ splitsKey, run }: EditingInfo) {
        const editor = expect(
            RunEditor.new(run),
            "The Run Editor should always be able to be opened.",
            this.state.generalSettings.lang,
        );
        this.changeMenu({ kind: MenuKind.RunEditor, editor, splitsKey });
    }

    public closeRunEditor(save: boolean) {
        if (this.state.menu.kind !== MenuKind.RunEditor) {
            panic("No Run Editor to close", this.state.generalSettings.lang);
        }
        const { editor, splitsKey } = this.state.menu;
        const run = editor.close();
        if (save) {
            if (splitsKey == null) {
                assertNull(
                    this.state.commandSink.setRun(run),
                    "The Run Editor should always return a valid Run.",
                    this.state.generalSettings.lang,
                );
            } else {
                Storage.storeRunAndDispose(
                    run,
                    splitsKey,
                    this.state.generalSettings.lang,
                );
            }
        } else {
            run[Symbol.dispose]();
        }
        this.openSplitsView();
    }

    public setSplitsKey(openedSplitsKey?: number) {
        this.setState({
            openedSplitsKey,
        });
        if (openedSplitsKey !== undefined) {
            Storage.storeSplitsKey(openedSplitsKey);
        }
    }

    public openLayoutEditor() {
        const layout = this.state.layout.clone();
        const editor = expect(
            LayoutEditor.new(layout),
            "The Layout Editor should always be able to be opened.",
            this.state.generalSettings.lang,
        );
        this.changeMenu({ kind: MenuKind.LayoutEditor, editor });
    }

    public closeLayoutEditor(save: boolean) {
        if (this.state.menu.kind !== MenuKind.LayoutEditor) {
            panic(
                "No Layout Editor to close.",
                this.state.generalSettings.lang,
            );
        }
        const layoutEditor = this.state.menu.editor;
        const layout = layoutEditor.close();
        if (save) {
            this.setLayout(layout);
        } else {
            layout[Symbol.dispose]();
        }
        this.openTimerView();
    }

    public async openMainSettings() {
        this.changeMenu({
            kind: MenuKind.MainSettings,
            config: await this.state.hotkeySystem.config(
                this.state.generalSettings.lang,
            ),
        });
    }

    public async closeMainSettings(
        save: boolean,
        generalSettings: GeneralSettings,
    ) {
        const menu = this.state.menu;

        if (menu.kind !== MenuKind.MainSettings) {
            panic(
                "No Settings Editor to close.",
                this.state.generalSettings.lang,
            );
        }

        if (save) {
            try {
                const config = menu.config.asJson();
                await Storage.storeHotkeys(config);
            } catch {
                toast.error(
                    resolve(
                        Label.FailedToSaveHotkeys,
                        this.state.generalSettings.lang,
                    ),
                );
            }

            try {
                await Storage.storeGeneralSettings(generalSettings);
            } catch {
                toast.error(
                    resolve(
                        Label.FailedToSaveGeneralSettings,
                        this.state.generalSettings.lang,
                    ),
                );
            }

            this.state.hotkeySystem.setConfig(menu.config);
            this.setState({ generalSettings });
            this.updateTauriSettings(generalSettings);
        } else {
            setHtmlLang(this.state.generalSettings.lang);
            menu.config[Symbol.dispose]();
        }

        this.openTimerView();
    }

    private updateTauriSettings(generalSettings: GeneralSettings) {
        window.__TAURI__?.core.invoke("settings_changed", {
            alwaysOnTop: generalSettings.alwaysOnTop,
        });
    }

    public onResize(width: number, height: number) {
        this.setState(
            {
                layoutWidth: width,
                layoutHeight: height,
                storedLayoutWidth: width,
                storedLayoutHeight: height,
                layoutModified: true,
            },
            () => this.updateBadge(),
        );
    }

    private getDefaultRun() {
        const run = Run.new();
        run.pushSegment(
            Segment.new(
                resolve(Label.NewSegmentName, this.props.generalSettings.lang),
            ),
        );
        return run;
    }

    private handleAutomaticResize() {
        if (!this.state.isDesktop) {
            const layoutDirection = (
                this.state.layoutState.asJson() as LayoutStateJson
            ).direction;
            if (layoutDirection !== "Vertical") {
                return;
            }

            const fullWidth = window.innerWidth;
            if (fullWidth !== this.state.layoutWidth) {
                this.setState({
                    layoutWidth: fullWidth,
                });
            }

            const showControlButtons =
                this.state.generalSettings.showControlButtons;
            const showManualGameTime =
                this.state.generalSettings.showManualGameTime;
            let newHeight = window.innerHeight - largeMargin;
            if (showControlButtons && showManualGameTime) {
                newHeight -=
                    2 * buttonHeight + manualGameTimeHeight + 3 * largeMargin;
            } else if (showControlButtons) {
                newHeight -= 2 * buttonHeight + 2 * largeMargin;
            } else if (showManualGameTime) {
                newHeight -= manualGameTimeHeight + largeMargin;
            }

            if (newHeight !== this.state.layoutHeight) {
                this.setState({
                    layoutHeight: newHeight,
                });
            }
        }
    }

    private mediaQueryChanged() {
        const isDesktop = this.isDesktopQuery.matches;
        this.setState({
            isDesktop,
            layoutWidth: isDesktop
                ? this.state.storedLayoutWidth
                : this.state.layoutWidth,
            layoutHeight: isDesktop
                ? this.state.storedLayoutHeight
                : this.state.layoutHeight,
            sidebarTransitionsEnabled: false,
        });
    }

    private importLayoutFromString(file: string) {
        let layout = null;
        try {
            layout = Layout.parseJson(JSON.parse(file));
        } catch (_) {
            /* Failed to load the layout */
        }
        if (layout === null) {
            layout = Layout.parseOriginalLivesplitString(file);
        }
        if (layout !== null) {
            this.setLayout(layout);
            return;
        }
        throw Error(
            resolve(
                Label.LayoutCouldNotBeLoaded,
                this.state.generalSettings.lang,
            ),
        );
    }

    private setLayout(layout: Layout) {
        this.state.layout[Symbol.dispose]();
        this.setState(
            {
                layout,
                layoutModified: true,
            },
            () => this.updateBadge(),
        );
    }

    private setRun(run: Run, callback: () => void) {
        maybeDisposeAndThen(this.state.commandSink.setRun(run), callback);
        this.setSplitsKey(undefined);
        this.setLocalSplitsFileHandle(undefined, undefined);
    }

    private importSplitsFromArrayBuffer(buffer: [ArrayBuffer, File]) {
        const [file] = buffer;
        using result = Run.parseArray(new Uint8Array(file), "");
        if (result.parsedSuccessfully()) {
            const run = result.unwrap();
            this.setRun(run, () => {
                throw Error(
                    resolve(
                        Label.EmptySplitsNotSupported,
                        this.state.generalSettings.lang,
                    ),
                );
            });
        } else {
            throw Error(
                resolve(
                    Label.CouldNotParseSplits,
                    this.state.generalSettings.lang,
                ),
            );
        }
    }

    private onScroll(e: WheelEvent) {
        const delta = Math.sign(-e.deltaY);
        if (delta === 1) {
            this.state.layout.scrollUp();
        } else if (delta === -1) {
            this.state.layout.scrollDown();
        }
    }

    private onSetSidebarOpen(open: boolean) {
        if (!this.state.isDesktop) {
            this.setState({
                sidebarOpen: open,
                sidebarTransitionsEnabled: true,
            });
        }
    }

    private onRightClick(e: any) {
        this.onSetSidebarOpen(true);
        e.preventDefault();
    }

    async saveSplits() {
        try {
            if (this.state.localSplitsFileHandle !== undefined) {
                await this.saveSplitsToLocalFile(
                    this.state.localSplitsFileHandle,
                );
                return;
            }
            const openedSplitsKey = await Storage.storeSplits(
                (callback) => {
                    callback(
                        this.state.commandSink.getRun(),
                        this.state.commandSink.saveAsLssBytes(),
                    );
                    this.state.commandSink.markAsUnmodified();
                },
                this.state.openedSplitsKey,
                this.state.generalSettings.lang,
            );
            if (this.state.openedSplitsKey !== openedSplitsKey) {
                this.setSplitsKey(openedSplitsKey);
            }
        } catch (_) {
            toast.error(
                resolve(
                    Label.FailedToSaveSplits,
                    this.state.generalSettings.lang,
                ),
            );
        }
    }

    public setLocalSplitsFileHandle(
        handle?: FileSystemFileHandle,
        name?: string,
    ) {
        this.setState({
            localSplitsFileHandle: handle,
            localSplitsFileName: name,
        });
        void Storage.storeLocalSplitsFileHandle(handle);
        void Storage.storeLocalSplitsFileName(name);
    }

    private async saveSplitsToLocalFile(handle: FileSystemFileHandle) {
        const hasPermission = await this.ensureFileWritePermission(handle);
        if (!hasPermission) {
            throw new Error("Permission denied.");
        }

        const writable = await handle.createWritable();
        try {
            await writable.write(this.state.commandSink.saveAsLssBytes());
        } finally {
            await writable.close();
        }

        this.state.commandSink.markAsUnmodified();
    }

    private async ensureFileWritePermission(handle: FileSystemFileHandle) {
        if (!handle.queryPermission || !handle.requestPermission) {
            return true;
        }

        const status = await handle.queryPermission({ mode: "readwrite" });
        if (status === "granted") {
            return true;
        }

        return (
            (await handle.requestPermission({ mode: "readwrite" })) ===
            "granted"
        );
    }

    onServerConnectionOpened(serverConnection: LiveSplitServer): void {
        this.setState({ serverConnection });
    }

    onServerConnectionClosed(): void {
        this.setState({ serverConnection: null });
    }

    handleEvent(event: Event): void {
        switch (event) {
            case Event.Started:
                this.splitsModifiedChanged();
                this.currentSplitChanged();
                this.currentPhaseChanged();
                break;
            case Event.Splitted:
                this.currentSplitChanged();
                break;
            case Event.SplitSkipped:
                this.currentSplitChanged();
                break;
            case Event.SplitUndone:
                this.currentPhaseChanged();
                this.currentSplitChanged();
                break;
            case Event.Resumed:
                this.currentPhaseChanged();
                break;
            case Event.Paused:
                this.currentPhaseChanged();
                break;
            case Event.Finished:
                this.currentPhaseChanged();
                this.currentSplitChanged();
                break;
            case Event.Reset:
                this.currentPhaseChanged();
                this.currentSplitChanged();
                this.onReset();
                break;
            case Event.PausesUndoneAndResumed:
                this.currentPhaseChanged();
                break;
            case Event.ComparisonChanged:
                this.currentComparisonChanged();
                break;
            case Event.TimingMethodChanged:
                this.currentTimingMethodChanged();
                break;
            case Event.PausesUndone:
            case Event.GameTimeInitialized:
            case Event.GameTimeSet:
            case Event.GameTimePaused:
            case Event.GameTimeResumed:
            case Event.LoadingTimesSet:
            case Event.CustomVariableSet:
            default:
                break;
        }

        if (this.state.serverConnection != null) {
            this.state.serverConnection.sendEvent(event);
        }
    }

    runChanged(): void {
        this.currentComparisonChanged();
        this.currentPhaseChanged();
        this.currentSplitChanged();
        this.comparisonListChanged();
        this.splitsModifiedChanged();

        if (this.state != null) {
            this.setState({
                allVariables: this.state.commandSink.getAllCustomVariables(),
            });
        }
    }

    runNotModifiedAnymore(): void {
        this.splitsModifiedChanged();
    }

    encounteredCustomVariable(name: string): void {
        if (this.state.allVariables.has(name)) {
            return;
        }
        this.setState({
            allVariables: new Set([...this.state.allVariables, name]),
        });
    }

    private currentComparisonChanged(): void {
        if (this.state != null) {
            const currentComparison =
                this.state.commandSink.currentComparison();

            (async () => {
                try {
                    await Storage.storeComparison(currentComparison);
                } catch {
                    // It's fine if this fails.
                }
            })();

            this.setState({ currentComparison });
        }
    }

    private currentTimingMethodChanged(): void {
        if (this.state != null) {
            const currentTimingMethod =
                this.state.commandSink.currentTimingMethod();

            (async () => {
                try {
                    await Storage.storeTimingMethod(currentTimingMethod);
                } catch {
                    // It's fine if this fails.
                }
            })();

            this.setState({ currentTimingMethod });
        }
    }

    private currentPhaseChanged(): void {
        if (this.state != null) {
            this.setState({
                currentPhase: this.state.commandSink.currentPhase(),
            });
        }
    }

    private currentSplitChanged(): void {
        if (this.state != null) {
            this.setState({
                currentSplitIndex: this.state.commandSink.currentSplitIndex(),
            });
        }
    }

    private comparisonListChanged(): void {
        if (this.state != null) {
            this.setState({
                allComparisons: this.state.commandSink.getAllComparisons(),
            });
        }
    }

    private onReset(): void {
        if (this.state.generalSettings.saveOnReset) {
            this.saveSplits();
        }
    }

    splitsModifiedChanged(): void {
        if (this.state != null) {
            const splitsModified = this.state.commandSink.hasBeenModified();
            this.setState({ splitsModified }, () => this.updateBadge());
        }
    }

    private updateBadge(): void {
        if (this.state.splitsModified || this.state.layoutModified) {
            try {
                navigator?.setAppBadge();
            } catch {
                // It's fine if this fails.
            }

            // It's important that any change is at the end of the title,
            // because at least Chrome then recognizes that it's an extension of
            // the PWA name. Otherwise it would show:
            // LiveSplit One - Window Title
            // which would repeat LiveSplit One.
            document.title = "LiveSplit One ●";
        } else {
            try {
                navigator?.clearAppBadge();
            } catch {
                // It's fine if this fails.
            }
            document.title = "LiveSplit One";
        }
    }

    popOut(): void {
        const { layoutWidth, layoutHeight, generalSettings } = this.state;
        popOut(
            this.state.commandSink,
            () => this.state.layout,
            generalSettings,
            layoutWidth,
            layoutHeight,
        );
    }
}

async function openPopupWindow(
    width: number,
    height: number,
): Promise<Window | null> {
    try {
        const pipPromise = (
            window as any
        ).documentPictureInPicture?.requestWindow({
            width,
            height,
        });

        if (pipPromise) {
            return (await pipPromise) as Window;
        }
    } catch {
        // It's fine if it fails, as not all browsers support this.
    }

    const childWindow = window.open(
        "",
        "_blank",
        `popup,width=${width},height=${height}`,
    );
    return childWindow;
}

async function popOut(
    commandSink: LSOCommandSink,
    getLayout: () => LayoutRefMut,
    generalSettings: GeneralSettings,
    width: number,
    height: number,
) {
    const childWindow = await openPopupWindow(width, height);
    if (!childWindow) {
        return;
    }

    const childDoc = childWindow.document;

    childDoc.title = "LiveSplit One";

    const link = childDoc.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = LiveSplitIcon;
    childDoc.head.appendChild(link);

    childDoc.body.style.margin = "0";
    childDoc.body.style.background = variables.mainBackgroundColor;

    const timerFontFace = new FontFace("timer", `url(${timerFont})`);
    const firaFontFace = new FontFace("fira", `url(${firaFont})`);
    childDoc.fonts.add(timerFontFace);
    childDoc.fonts.add(firaFontFace);
    await Promise.all([timerFontFace.load(), firaFontFace.load()]);

    const layoutState = LayoutState.new();
    const urlCache = new UrlCache();

    const renderer = new WebRenderer();
    childWindow.addEventListener("unload", async () => {
        async function sleep(ms: number) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }
        while (!childWindow.closed) {
            await sleep(1);
        }
        renderer.free();
        layoutState[Symbol.dispose]();
        urlCache.imageCache[Symbol.dispose]();
    });

    const element = renderer.element();
    element.style.width = "100%";
    element.style.height = "100%";

    if (hotkeySystem?.ptr) {
        HotkeySystem_add_window(hotkeySystem.ptr, childWindow);
    }

    createRoot(childDoc.body).render(
        <ShowLayout
            getState={() => {
                const layout = getLayout();
                if (layout.ptr !== 0) {
                    commandSink.updateLayoutState(
                        layout,
                        layoutState,
                        urlCache.imageCache,
                        generalSettings.lang,
                    );
                    urlCache.collect();
                }
                return layoutState;
            }}
            layoutUrlCache={urlCache}
            allowResize={false}
            width="100vw"
            height="100vh"
            generalSettings={generalSettings}
            renderer={renderer}
            onResize={(width, height) =>
                childWindow.resizeTo(
                    width + childWindow.outerWidth - childWindow.innerWidth,
                    height + childWindow.outerHeight - childWindow.innerHeight,
                )
            }
            onScroll={(e) => {
                const delta = Math.sign(-e.deltaY);
                const layout = getLayout();
                if (delta === 1) {
                    layout.scrollUp();
                } else if (delta === -1) {
                    layout.scrollDown();
                }
            }}
            window={childWindow}
        />,
    );
}
