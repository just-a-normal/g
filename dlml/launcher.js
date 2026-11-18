"use strict";

const launcher = document.querySelector("#launcher");
const catalog = document.querySelector("#catalog");
const bundled = document.querySelector("#bundled");
const localMods = document.querySelector("#local-mods");
const launch = document.querySelector("#launch");
const player = document.querySelector("#player");
const gameDisplay = document.querySelector("#game-display");
const canvas = document.querySelector("#canvas");
const fullscreen = document.querySelector("#fullscreen");
const statusMessage = document.querySelector("#status");
const errors = document.querySelector("#errors");

const modsURL = new URL("./mods/", document.baseURI);
const preferenceKey = "dlml-v1:" + modsURL.pathname;
const maxMods = 24;
const maxBytes = 512 * 1024;
const choices = [];

function setStatus(message) {
    if (statusMessage.textContent !== message) statusMessage.textContent = message;
}

function addError(message) {
    const item = document.createElement("li");
    item.textContent = message;
    errors.append(item);
    errors.hidden = false;
}

function readPreferences() {
    try {
        const stored = JSON.parse(localStorage.getItem(preferenceKey));
        return stored && typeof stored === "object" ? stored : {};
    } catch {
        return {};
    }
}

function savePreferences() {
    try {
        localStorage.setItem(preferenceKey, JSON.stringify(
            Object.fromEntries(choices.map(({ entry, box }) => [entry.id, box.checked]))
        ));
    } catch {
        // The selection still applies to this launch.
    }
}

async function fetchFile(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Could not load " + url.pathname + " (" + response.status + ").");
    return response;
}

async function loadCatalog() {
    const entries = await (await fetchFile(new URL("catalog.json", modsURL))).json();
    if (!Array.isArray(entries)) throw new Error("The site mod list must be an array.");
    const ids = new Set();
    for (const entry of entries) {
        if (!entry || typeof entry.id !== "string" || !/^[a-z0-9-]+$/.test(entry.id) || ids.has(entry.id) ||
            typeof entry.file !== "string" || !/^[a-zA-Z0-9_-]+\.lua$/.test(entry.file) ||
            typeof entry.title !== "string" || typeof entry.description !== "string") {
            throw new Error("The site mod list contains an invalid or duplicate entry.");
        }
        ids.add(entry.id);
    }

    const preferences = readPreferences();
    for (const entry of entries) {
        const row = document.createElement("label");
        row.className = "mod";
        const box = document.createElement("input");
        box.type = "checkbox";
        box.checked = typeof preferences[entry.id] === "boolean" ? preferences[entry.id] : entry.enabledByDefault === true;
        const details = document.createElement("span");
        const title = document.createElement("strong");
        title.textContent = entry.title;
        const description = document.createElement("small");
        description.textContent = entry.description;
        details.append(title, description);
        row.append(box, details);
        catalog.append(row);
        choices.push({ entry, box });
    }
    bundled.disabled = false;
}

async function prepareRuntime() {
    if (window.crossOriginIsolated) return true;
    if (!window.isSecureContext || !navigator.serviceWorker) {
        throw new Error("Open the game over HTTPS or localhost in a browser that supports service workers.");
    }

    setStatus("Preparing the browser runtime…");
    const workers = navigator.serviceWorker;
    const workerURL = new URL("./coi-serviceworker.min.js", document.baseURI).href;
    const controlsPage = () => workers.controller?.scriptURL === workerURL;
    if (controlsPage()) {
        throw new Error("The browser could not isolate the game. Open it in its own tab and reload.");
    }
    await workers.register(workerURL);
    function reloadWhenControlled() {
        if (!controlsPage()) return;
        workers.removeEventListener("controllerchange", reloadWhenControlled);
        window.location.reload();
    }
    workers.addEventListener("controllerchange", reloadWhenControlled);
    reloadWhenControlled();
    return false;
}

function loadScript(path) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = path;
        script.onload = resolve;
        script.onerror = () => reject(new Error("Could not load " + path + "."));
        document.head.append(script);
    });
}

async function collectMods() {
    const local = Array.from(localMods.files);
    const selected = choices.filter(({ box }) => box.checked);
    if (local.length + selected.length > maxMods) throw new Error("Choose at most " + maxMods + " mods per launch.");
    const localFiles = local.map((file) => {
        if (!/\.lua$/i.test(file.name) || file.size === 0 || file.size > maxBytes) {
            throw new Error(file.name + " must be a nonempty Lua file up to 512 KB.");
        }
        return { title: file.name, read: () => file.arrayBuffer() };
    });
    const siteFiles = selected.map(({ entry }) => ({
        title: entry.title,
        read: async () => (await fetchFile(new URL(entry.file, modsURL))).arrayBuffer()
    }));
    const candidates = [...localFiles, ...siteFiles];
    const results = await Promise.allSettled(candidates.map(async ({ title, read }) => {
        const bytes = new Uint8Array(await read());
        if (bytes.length === 0 || bytes.length > maxBytes) throw new Error("The file must be 1 byte to 512 KB.");
        return { title, bytes };
    }));
    return results.flatMap((result, index) => {
        if (result.status === "fulfilled") return [result.value];
        addError(candidates[index].title + ": " + result.reason.message);
        return [];
    });
}

function boot(mods) {
    const encoder = new TextEncoder();
    const fail = (message) => setStatus("Game stopped. Return to the mod list to try again. " + message);
    const report = (line) => {
        console.log(line);
        const match = line.match(/^\[DLML error (\d+)\] (.*)$/);
        if (match) {
            const name = mods[Number(match[1]) - 1]?.title ?? "Mod";
            addError(name + ": " + match[2]);
        }
    };

    window.Module = {
        arguments: ["./game.love"],
        INITIAL_MEMORY: 67482072,
        canvas,
        print: (...args) => report(args.join(" ")),
        printErr: console.error.bind(console),
        preRun: [() => {
            const write = (name, bytes) => {
                window.Module.FS_createDataFile("/", name, bytes, true, false, true);
            };
            write("dlml-selection", encoder.encode(String(mods.length)));
            mods.forEach(({ bytes }, index) => write("dlml-mod-" + (index + 1) + ".lua", bytes));
        }],
        setStatus: (message) => {
            if (message && !canvas.hidden) return;
            setStatus(message);
        },
        onRuntimeInitialized: () => {
            setStatus("");
            canvas.hidden = false;
            fullscreen.disabled = !document.fullscreenEnabled;
            canvas.focus({ preventScroll: true });
        },
        onAbort: fail
    };

    window.addEventListener("error", (event) => {
        if (event.message && (canvas.hidden || event.message.includes("Aborted"))) fail(event.message);
    });
    canvas.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        fail("The browser lost its graphics context.");
    });
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    window.addEventListener("keydown", (event) => {
        if (document.activeElement === canvas && [" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
        }
    });
}

launcher.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (launch.disabled) return;
    launch.disabled = true;
    bundled.disabled = true;
    localMods.disabled = true;
    errors.replaceChildren();
    errors.hidden = true;
    try {
        if (!window.crossOriginIsolated) {
            throw new Error("The browser is preparing the threaded game runtime. Open the site over HTTPS and reload if this message persists.");
        }
        const mods = await collectMods();
        savePreferences();
        launcher.hidden = true;
        player.hidden = false;
        document.body.classList.add("playing");
        setStatus("Loading DEAD-LINE II…");
        boot(mods);
        await loadScript("./game.js");
        await loadScript("./love.js");
        await window.Love(window.Module);
    } catch (error) {
        setStatus(error.message || String(error));
    } finally {
        if (!launcher.hidden) {
            launch.disabled = false;
            bundled.disabled = false;
            localMods.disabled = false;
        }
    }
});

fullscreen.addEventListener("click", async () => {
    try {
        await gameDisplay.requestFullscreen();
        canvas.focus({ preventScroll: true });
    } catch {
        setStatus("The browser could not enter fullscreen.");
    }
});

Promise.all([
    loadCatalog().catch((error) => addError(error.message + " You can still launch with local mods.")),
    prepareRuntime()
]).then(([, ready]) => {
    launch.disabled = !ready;
}).catch((error) => setStatus(error.message));
