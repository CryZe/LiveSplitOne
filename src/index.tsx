// The polyfill must be imported before anything else, as it may be required by
// other modules.
import "./polyfill";
import { preloadWasm } from "./livesplit-core/preload";
import { Label, resolve } from "./localization";

if (
    process.env.NODE_ENV === "production" &&
    window.__TAURI__ == null &&
    "serviceWorker" in navigator
) {
    navigator.serviceWorker.register("/service-worker.js");
}

preloadWasm();

import "./css/main.scss";

try {
    const { LiveSplit, React, createRoot } = await import("./indexDelayed");

    try {
        const {
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
        } = await LiveSplit.loadStoredData();

        async function requestWakeLock() {
            try {
                await (navigator as any)?.wakeLock?.request();
            } catch {
                // It's fine if it fails.
            }
        }

        requestWakeLock();

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                requestWakeLock();
            }
        });

        // The renderer requires the fonts to be loaded before it gets created
        // as otherwise information may be cached incorrectly.
        try {
            const promises = [];
            for (const fontFace of document.fonts) {
                if (fontFace.family === "timer" || fontFace.family === "fira") {
                    promises.push(fontFace.load());
                }
            }
            await Promise.all(promises);
        } catch {
            // If somehow something goes wrong, that's kind of bad, but we
            // should still have the fallback fonts that we can fall back to.
        }

        const container = document.getElementById("base");
        const root = createRoot(container!);
        root.render(
            <LiveSplit
                splits={splits}
                localSplitsFileHandle={localSplitsFileHandle}
                localSplitsFileName={localSplitsFileName}
                layout={layout}
                comparison={comparison}
                timingMethod={timingMethod}
                hotkeys={hotkeys}
                splitsKey={splitsKey}
                layoutWidth={layoutWidth}
                layoutHeight={layoutHeight}
                generalSettings={generalSettings}
            />,
        );
    } catch (e: any) {
        if (e.name === "InvalidStateError") {
            alert(resolve(Label.LoadFailedPrivateBrowsing, undefined));
        }
    }
} catch (_) {
    alert(resolve(Label.LoadFailedOutdatedBrowser, undefined));
}
