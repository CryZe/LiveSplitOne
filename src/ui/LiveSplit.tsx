import * as React from "react";
import Sidebar from "react-sidebar";
import AutoRefreshLayout from "../layout/AutoRefreshLayout";
import {
    HotkeySystem, Layout, LayoutEditor, Run, RunEditor,
    Segment, SharedTimer, Timer, TimerPhase, TimingMethod,
    TimeSpan,
} from "../livesplit";
import { exportFile, openFileAsArrayBuffer, openFileAsString } from "../util/FileUtil";
import { Option, assertNull, expect, maybeDispose, maybeDisposeAndThen } from "../util/OptionUtil";
import * as SplitsIO from "../util/SplitsIO";
import { LayoutEditor as LayoutEditorComponent } from "./LayoutEditor";
import { RunEditor as RunEditorComponent } from "./RunEditor";
import { Route, SideBarContent } from "./SideBarContent";

export interface State {
    hotkeySystem: Option<HotkeySystem>,
    timer: SharedTimer,
    layout: Layout,
    sidebarOpen: boolean,
    runEditor: Option<RunEditor>,
    layoutEditor: Option<LayoutEditor>,
}

export class LiveSplit extends React.Component<{}, State> {
    private scrollEvent: Option<EventListenerObject>;
    private rightClickEvent: Option<EventListenerObject>;

    constructor(props: {}) {
        super(props);

        const run = Run.new();
        run.setGameName("Game");
        run.setCategoryName("Category");
        run.pushSegment(Segment.new("Time"));

        const timer = expect(
            Timer.new(run),
            "The Default Run should be a valid Run",
        ).intoShared();

        const hotkeySystem = HotkeySystem.new(timer.share());

        this.setupWebSocket();

        if (window.location.hash.indexOf("#/splits-io/") === 0) {
            const loadingRun = Run.new();
            loadingRun.setGameName("Loading...");
            loadingRun.setCategoryName("Loading...");
            loadingRun.pushSegment(Segment.new("Time"));
            assertNull(
                timer.writeWith((t) => t.setRun(loadingRun)),
                "The Default Loading Run should be a valid Run",
            );
            this.loadFromSplitsIO(window.location.hash.substr("#/splits-io/".length));
        } else {
            const lss = localStorage.getItem("splits");
            if (lss != null) {
                const result = Run.parseString(lss, "", false);
                if (result.parsedSuccessfully()) {
                    maybeDispose(result.unwrap().with(
                        (r) => timer.writeWith((t) => t.setRun(r)),
                    ));
                }
            }
        }

        let layout: Option<Layout> = null;
        try {
            const data = localStorage.getItem("layout");
            if (data) {
                layout = Layout.parseJson(JSON.parse(data));
            }
        } catch (_) { /* Looks like local storage has no valid data */ }
        if (layout == null) {
            layout = Layout.defaultLayout();
        }

        this.state = {
            layout,
            layoutEditor: null,
            runEditor: null,
            sidebarOpen: false,
            timer,
            hotkeySystem,
        };
    }

    public componentWillMount() {
        this.scrollEvent = { handleEvent: (e: MouseWheelEvent) => this.onScroll(e) };
        window.addEventListener("wheel", this.scrollEvent);
        this.rightClickEvent = { handleEvent: (e: any) => this.onRightClick(e) };
        window.addEventListener("contextmenu", this.rightClickEvent, false);
    }

    public componentWillUnmount() {
        window.removeEventListener(
            "wheel",
            expect(this.scrollEvent, "A Scroll Event should exist"),
        );
        window.removeEventListener(
            "contextmenu",
            expect(this.rightClickEvent, "A Right Click Event should exist"),
        );
        this.state.timer.dispose();
        this.state.layout.dispose();
        maybeDispose(this.state.hotkeySystem);
    }

    public render() {
        const [route, content] = ((): [Route, JSX.Element] => {
            if (this.state.runEditor) {
                return [
                    "run-editor",
                    <RunEditorComponent editor={this.state.runEditor} />,
                ];
            } else if (this.state.layoutEditor) {
                return [
                    "layout-editor",
                    <LayoutEditorComponent
                        editor={this.state.layoutEditor}
                        timer={this.state.timer}
                    />,
                ];
            } else {
                return [
                    "main",
                    <div
                        style={{
                            margin: "10px",
                            marginBottom: "5px",
                        }}
                    >
                        <div
                            onClick={(_) => this.onSplit()}
                            style={{
                                display: "inline-block",
                                cursor: "pointer",
                            }}
                        >
                            <AutoRefreshLayout
                                getState={() => this.state.timer.readWith(
                                    (t) => this.state.layout.stateAsJson(t),
                                )}
                            />
                        </div>
                        <div className="buttons">
                            <div className="small">
                                <button onClick={(_) => this.onUndo()}>
                                    <i className="fa fa-arrow-up" aria-hidden="true" /></button>
                                <button onClick={(_) => this.onPause()}>
                                    <i className="fa fa-pause" aria-hidden="true" />
                                </button>
                            </div>
                            <div className="small">
                                <button onClick={(_) => this.onSkip()}>
                                    <i className="fa fa-arrow-down" aria-hidden="true" />
                                </button>
                                <button onClick={(_) => this.onReset()}>
                                    <i className="fa fa-times" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>,
                ];
            }
        })();

        const sidebarContent = (
            <SideBarContent
                route={route}
                callbacks={this}
                timer={this.state.timer}
                sidebarOpen={this.state.sidebarOpen}
            />
        );

        return (
            <Sidebar
                sidebar={sidebarContent}
                open={this.state.sidebarOpen}
                onSetOpen={((e: boolean) => this.onSetSidebarOpen(e)) as any}
                sidebarClassName="sidebar"
                contentClassName="livesplit-container"
            >
                {content}
            </Sidebar>
        );
    }

    public importSplits() {
        openFileAsArrayBuffer((file) => {
            const timer = this.state.timer;
            const result = Run.parseArray(new Int8Array(file), "", false);
            if (result.parsedSuccessfully()) {
                const run = result.unwrap();
                maybeDisposeAndThen(
                    timer.writeWith((t) => t.setRun(run)),
                    () => alert("Empty Splits are not supported."),
                );
            } else {
                alert("Couldn't parse the splits.");
            }
        });
    }

    public setCurrentTimingMethod(timingMethod: TimingMethod) {
        this.state.timer.writeWith((t) => t.setCurrentTimingMethod(timingMethod));
    }

    public switchToPreviousComparison() {
        this.state.timer.writeWith((t) => t.switchToPreviousComparison());
    }

    public switchToNextComparison() {
        this.state.timer.writeWith((t) => t.switchToNextComparison());
    }

    public openFromSplitsIO() {
        let id = prompt("Specify the splits i/o URL or ID:");
        if (!id) {
            return;
        }
        if (id.indexOf("https://splits.io/") === 0) {
            id = id.substr("https://splits.io/".length);
        }
        this.loadFromSplitsIO(id);
    }

    public uploadToSplitsIO(): Promise<Option<Window>> {
        const lss = this.state.timer.readWith((t) => t.getRun().saveAsLss());

        return SplitsIO
            .uploadLss(lss)
            .then((claimUri) => window.open(claimUri))
            .catch((_) => { alert("Failed to upload the splits."); return null; });
    }

    public exportSplits() {
        const [lss, name] = this.state.timer.readWith((t) => {
            const run = t.getRun();
            return [
                run.saveAsLss(),
                run.extendedFileName(true),
            ];
        });
        exportFile(name + ".lss", lss);
    }

    public saveSplits() {
        const lss = this.state.timer.readWith((t) => t.saveAsLss());
        localStorage.setItem("splits", lss);
    }

    public saveLayout() {
        const layout = this.state.layout.settingsAsJson();
        localStorage.setItem("layout", JSON.stringify(layout));
    }

    public importLayout() {
        openFileAsString((file) => {
            try {
                const layout = Layout.parseJson(JSON.parse(file));
                if (layout != null) {
                    this.state.layout.dispose();
                    this.setState({
                        ...this.state,
                        layout,
                    });
                    layout.remount();
                    return;
                }
            } catch (_) { /* Failed to load the layout */ }
            alert("Error loading Layout. This may not be a LiveSplit One Layout.");
        });
    }

    public exportLayout() {
        const layout = this.state.layout.settingsAsJson();
        exportFile("layout.ls1l", JSON.stringify(layout, null, 4));
    }

    public openRunEditor() {
        const run = this.state.timer.readWith((t) => {
            if (t.currentPhase() === TimerPhase.NotRunning) {
                return t.getRun().clone();
            } else {
                return null;
            }
        });

        if (run != null) {
            if (this.state.hotkeySystem != null) {
                this.state.hotkeySystem.deactivate();
            }
            const editor = RunEditor.new(run);
            this.setState({
                ...this.state,
                runEditor: editor,
                sidebarOpen: false,
            });
        } else {
            alert("You can't edit your run while the timer is running.");
        }
    }

    public closeRunEditor(save: boolean) {
        const runEditor = expect(
            this.state.runEditor,
            "No Run Editor to close",
        );
        const run = runEditor.close();
        if (save) {
            assertNull(
                this.state.timer.writeWith((t) => t.setRun(run)),
                "The Run Editor should always return a valid Run",
            );
            this.setState({
                ...this.state,
                runEditor: null,
                sidebarOpen: false,
            });
        } else {
            run.dispose();
            this.setState({
                ...this.state,
                runEditor: null,
                sidebarOpen: false,
            });
        }
        this.state.layout.remount();
        if (this.state.hotkeySystem != null) {
            this.state.hotkeySystem.activate();
        }
    }

    public openLayoutEditor() {
        if (this.state.hotkeySystem != null) {
            this.state.hotkeySystem.deactivate();
        }

        const layout = this.state.layout.clone();
        const editor = LayoutEditor.new(layout);
        this.setState({
            ...this.state,
            layoutEditor: editor,
            sidebarOpen: false,
        });
    }

    public closeLayoutEditor(save: boolean) {
        const layoutEditor = expect(
            this.state.layoutEditor,
            "No Layout Editor to close",
        );
        const layout = layoutEditor.close();
        if (save) {
            this.state.layout.dispose();
            this.setState({
                ...this.state,
                layout,
                layoutEditor: null,
                sidebarOpen: false,
            });
            layout.remount();
        } else {
            layout.dispose();
            this.setState({
                ...this.state,
                layoutEditor: null,
                sidebarOpen: false,
            });
            this.state.layout.remount();
        }
        if (this.state.hotkeySystem != null) {
            this.state.hotkeySystem.activate();
        }
    }

    private loadFromSplitsIO(id: string) {
        SplitsIO.downloadById(id).then(
            (run) => {
                maybeDisposeAndThen(
                    this.state.timer.writeWith((t) => t.setRun(run)),
                    () => alert("The downloaded splits are not valid."),
                );
            },
            (_) => alert("Failed to download the splits."),
        );
    }

    private onScroll(e: WheelEvent) {
        const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.deltaY)));
        if (delta === 1) {
            this.state.layout.scrollUp();
        } else if (delta === -1) {
            this.state.layout.scrollDown();
        }
    }

    private onSetSidebarOpen(open: boolean) {
        this.setState({
            ...this.state,
            sidebarOpen: open,
        });
    }

    private onRightClick(e: any) {
        this.onSetSidebarOpen(true);
        e.preventDefault();
    }

    private onSplit() {
        this.state.timer.writeWith((t) => t.splitOrStart());
    }

    private onReset() {
        this.state.timer.writeWith((t) => t.reset(true));
    }

    private onPause() {
        this.state.timer.writeWith((t) => t.togglePauseOrStart());
    }

    private onUndo() {
        this.state.timer.writeWith((t) => t.undoSplit());
    }

    private onSkip() {
        this.state.timer.writeWith((t) => t.skipSplit());
    }

    private onInitializeGameTime() {
        this.state.timer.writeWith((t) => t.initializeGameTime());
    }

    private onSetGameTime(gameTime: string) {
        const time = TimeSpan.parse(gameTime);
        if (time != null) {
            time.with((time) => {
                this.state.timer.writeWith((t) => t.setGameTime(time));
            });
        }
    }

    private onSetLoadingTimes(loadingTimes: string) {
        const time = TimeSpan.parse(loadingTimes);
        if (time != null) {
            time.with((time) => {
                this.state.timer.writeWith((t) => t.setLoadingTimes(time));
            });
        }
    }

    private onPauseGameTime() {
        this.state.timer.writeWith((t) => t.pauseGameTime());
    }

    private onResumeGameTime() {
        this.state.timer.writeWith((t) => t.resumeGameTime());
    }

    // private onSetComparison(comparison: string) {
    //     this.state.timer.writeWith((t) => t.swit)
    // }

    private setupWebSocket() {
        const connection = new WebSocket("ws://localhost:8081/ws/");
        connection.onmessage = (e) => {
            if (typeof e.data === "string") {
                const [command, ...args] = e.data.split(" ");
                switch (command) {
                    case "split": this.onSplit(); break;
                    case "reset": this.onReset(); break;
                    case "togglepause": this.onPause(); break;
                    case "undo": this.onUndo(); break;
                    case "skip": this.onSkip(); break;
                    case "initgametime": this.onInitializeGameTime(); break;
                    case "setgametime": this.onSetGameTime(args[0]); break;
                    case "setloadingtimes": this.onSetLoadingTimes(args[0]); break;
                    case "pausegametime": this.onPauseGameTime(); break;
                    case "resumegametime": this.onResumeGameTime(); break;
                    // case "setcomparison": this.onSetComparison(args[0]); break;
                }
            }
        };
    }
}
