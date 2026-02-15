import { openDB, IDBPDatabase } from "idb";
import { Option, assert } from "../util/OptionUtil";
import { RunRef, Run, TimingMethod, Language } from "../livesplit-core";
import {
    GeneralSettings,
    MANUAL_GAME_TIME_SETTINGS_DEFAULT,
} from "../ui/views/MainSettings";
import { FRAME_RATE_AUTOMATIC } from "../util/FrameRate";
import { fromLocaleOpt, getLocaleOpt, setHtmlLang } from "../localization";

export type HotkeyConfigSettings = unknown;
export type LayoutSettings = unknown;

const DEFAULT_LAYOUT_WIDTH = 300;
const DEFAULT_LAYOUT_HEIGHT = 500;

let db: Option<Promise<IDBPDatabase<unknown>>> = null;

export interface SplitsInfo {
    game: string;
    category: string;
    realTime?: number;
    gameTime?: number;
}

function getSplitsInfo(run: RunRef): SplitsInfo {
    let realTime: number | undefined;
    let gameTime: number | undefined;
    if (run.len() > 0) {
        const time = run.segment(run.len() - 1).personalBestSplitTime();
        realTime = time.realTime()?.totalSeconds();
        gameTime = time.gameTime()?.totalSeconds();
    }
    return {
        game: run.gameName(),
        category: run.extendedCategoryName(true, true, true),
        realTime,
        gameTime,
    };
}

function parseSplitsAndGetInfo(splits: Uint8Array): Option<SplitsInfo> {
    using parseRunResult = Run.parseArray(splits, "");
    if (!parseRunResult.parsedSuccessfully()) {
        return undefined;
    }
    using run = parseRunResult.unwrap();
    return getSplitsInfo(run);
}

function getDb(): Promise<IDBPDatabase<unknown>> {
    if (db == null) {
        db = openDB("LiveSplit", 2, {
            async upgrade(db, oldVersion, _newVersion, tx) {
                const splitsDataStore = db.createObjectStore("splitsData", {
                    autoIncrement: true,
                });
                const splitsInfoStore = db.createObjectStore("splitsInfo", {
                    autoIncrement: true,
                });

                if (oldVersion === 1) {
                    const settingsStore = tx.objectStore("settings");
                    const splits = await settingsStore.get("splits");
                    if (splits != null) {
                        settingsStore.delete("splits");
                        const splitsInfo = parseSplitsAndGetInfo(splits);
                        if (splitsInfo != null) {
                            splitsInfoStore.put(splitsInfo);
                            splitsDataStore.put(splits);
                            settingsStore.put(1, "splitsKey");
                        }
                    }
                } else {
                    const settingsStore = db.createObjectStore("settings", {
                        autoIncrement: true,
                    });

                    const splitsString = localStorage.getItem("splits");
                    if (splitsString) {
                        const splits = new TextEncoder().encode(splitsString);
                        const splitsInfo = parseSplitsAndGetInfo(splits);
                        if (splitsInfo != null) {
                            splitsInfoStore.put(splitsInfo);
                            splitsDataStore.put(splits);
                            settingsStore.put(1, "splitsKey");
                        }
                    }

                    const layout = localStorage.getItem("layout");
                    if (layout) {
                        settingsStore.put(JSON.parse(layout), "layout");
                    }

                    const hotkeys = localStorage.getItem("settings");
                    if (hotkeys) {
                        settingsStore.put(
                            JSON.parse(hotkeys).hotkeys,
                            "hotkeys",
                        );
                    }

                    const layoutWidth = localStorage.getItem("layoutWidth");
                    if (layoutWidth) {
                        settingsStore.put(+layoutWidth, "layoutWidth");
                    }
                    localStorage.clear();
                }
            },
        });
    }
    return db;
}

export async function storeRunWithoutDisposing(
    run: RunRef,
    key: number | undefined,
    lang: Language | undefined,
) {
    await storeSplits((callback) => {
        callback(run, run.saveAsLssBytes());
    }, key, lang);
}

export async function storeRunAndDispose(run: Run, key: number | undefined, lang: Language | undefined) {
    try {
        await storeRunWithoutDisposing(run, key, lang);
    } finally {
        run[Symbol.dispose]();
    }
}

export async function storeSplits(
    callback: (callback: (run: RunRef, lssBytes: Uint8Array) => void) => void,
    key: number | undefined,
    lang: Language | undefined,
): Promise<number> {
    const db = await getDb();

    const tx = db.transaction(["splitsData", "splitsInfo"], "readwrite");

    let promise: Promise<unknown> | null = null;
    callback((run, lssBytes) => {
        // We need to consume the bytes first as they are usually very
        // short-living, because they directly point into the WebAssembly memory.
        promise = tx.objectStore("splitsData").put(lssBytes, key);
        tx.objectStore("splitsInfo").put(getSplitsInfo(run), key);
    });

    await tx.done;

    assert(promise !== null, "Callback needs to actually run", lang);
    return promise;
}

export async function getSplitsInfos(): Promise<Array<[number, SplitsInfo]>> {
    const db = await getDb();

    const tx = db.transaction("splitsInfo", "readonly");

    const arr: Array<[number, SplitsInfo]> = [];
    let cursor = await tx.store.openCursor();
    while (cursor) {
        arr.push([+cursor.key, cursor.value]);
        cursor = await cursor.continue();
    }

    return arr;
}

export async function loadSplits(key: number): Promise<Uint8Array<ArrayBuffer> | undefined> {
    const db = await getDb();

    return await db.get("splitsData", key);
}

export async function deleteSplits(key: number) {
    const db = await getDb();

    const tx = db.transaction(["splitsData", "splitsInfo"], "readwrite");
    tx.objectStore("splitsData").delete(key);
    tx.objectStore("splitsInfo").delete(key);
    await tx.done;
}

export async function copySplits(key: number) {
    const db = await getDb();

    const tx = db.transaction(["splitsData", "splitsInfo"], "readwrite");
    const splitsData = tx.objectStore("splitsData");
    splitsData.put(await splitsData.get(key));
    const splitsInfo = tx.objectStore("splitsInfo");
    splitsInfo.put(await splitsInfo.get(key));
    await tx.done;
}

export async function storeLayout(
    layout: LayoutSettings,
    layoutWidth: number,
    layoutHeight: number,
) {
    const db = await getDb();

    await db.put("settings", layout, "layout");
    await db.put("settings", layoutWidth, "layoutWidth");
    await db.put("settings", layoutHeight, "layoutHeight");
}

export async function loadLayout(): Promise<LayoutSettings> {
    const db = await getDb();

    return await db.get("settings", "layout");
}

export async function storeHotkeys(hotkeys: HotkeyConfigSettings) {
    const db = await getDb();

    await db.put("settings", hotkeys, "hotkeys");
}

export async function loadHotkeys(): Promise<HotkeyConfigSettings> {
    const db = await getDb();

    return await db.get("settings", "hotkeys");
}

export async function loadLayoutDims(): Promise<[number, number]> {
    const db = await getDb();

    return [
        (await db.get("settings", "layoutWidth")) ?? DEFAULT_LAYOUT_WIDTH,
        (await db.get("settings", "layoutHeight")) ?? DEFAULT_LAYOUT_HEIGHT,
    ];
}

export async function storeSplitsKey(splitsKey?: number) {
    const db = await getDb();

    await db.put("settings", splitsKey, "splitsKey");
}

export async function loadSplitsKey(): Promise<number | undefined> {
    const db = await getDb();

    return await db.get("settings", "splitsKey");
}

export async function storeSplitsFolderHandle(
    handle?: FileSystemDirectoryHandle,
) {
    const db = await getDb();

    await db.put("settings", handle, "splitsFolderHandle");
}

export async function loadSplitsFolderHandle(): Promise<
    FileSystemDirectoryHandle | undefined
> {
    const db = await getDb();

    return await db.get("settings", "splitsFolderHandle");
}

export async function storeLocalSplitsFileHandle(
    handle?: FileSystemFileHandle,
) {
    const db = await getDb();

    await db.put("settings", handle, "localSplitsFileHandle");
}

export async function loadLocalSplitsFileHandle(): Promise<
    FileSystemFileHandle | undefined
> {
    const db = await getDb();

    return await db.get("settings", "localSplitsFileHandle");
}

export async function storeLocalSplitsFileName(name?: string) {
    const db = await getDb();

    await db.put("settings", name, "localSplitsFileName");
}

export async function loadLocalSplitsFileName(): Promise<string | undefined> {
    const db = await getDb();

    return await db.get("settings", "localSplitsFileName");
}

export async function storeGeneralSettings(generalSettings: GeneralSettings) {
    const db = await getDb();

    const storedSettings = {
        ...generalSettings,
        lang: getLocaleOpt(generalSettings.lang),
    };

    await db.put("settings", storedSettings, "generalSettings");
}

export async function loadGeneralSettings(): Promise<GeneralSettings> {
    const db = await getDb();

    const generalSettings = (await db.get("settings", "generalSettings")) ?? {};

    const isTauri = window.__TAURI__ != null;

    if (generalSettings.showManualGameTime === true) {
        generalSettings.showManualGameTime = MANUAL_GAME_TIME_SETTINGS_DEFAULT;
    }

    const lang = fromLocaleOpt(generalSettings.lang);

    setHtmlLang(lang);

    return {
        frameRate: generalSettings.frameRate ?? FRAME_RATE_AUTOMATIC,
        showControlButtons: generalSettings.showControlButtons ?? !isTauri,
        showManualGameTime: generalSettings.showManualGameTime ?? false,
        saveOnReset: generalSettings.saveOnReset ?? false,
        speedrunComIntegration: generalSettings.speedrunComIntegration ?? true,
        serverUrl: generalSettings.serverUrl,
        alwaysOnTop:
            generalSettings.alwaysOnTop ?? (isTauri ? true : undefined),
        lang,
    };
}

export async function storeTimingMethod(timingMethod: TimingMethod) {
    const db = await getDb();

    await db.put("settings", timingMethod, "timingMethod");
}

export async function loadTimingMethod(): Promise<TimingMethod> {
    const db = await getDb();

    return (await db.get("settings", "timingMethod")) ?? TimingMethod.RealTime;
}

export async function storeComparison(comparison: string) {
    const db = await getDb();

    await db.put("settings", comparison, "comparison");
}

export async function loadComparison(): Promise<string | undefined> {
    const db = await getDb();

    return await db.get("settings", "comparison");
}
