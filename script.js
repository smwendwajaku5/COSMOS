const progressBar = document.querySelector(".reading-progress");
const cultivatorVisual = document.querySelector(".cultivator-visual");
const cultivatorImage = document.querySelector(".cultivator-image");
const orbits = document.querySelectorAll(".orbit");
const settingsButton = document.querySelector(".settings-trigger");
const settingsPanel = document.querySelector(".settings-panel");
const settingsClose = document.querySelector(".settings-close");
const themeSetting = document.querySelector("#theme-setting");
const motionSetting = document.querySelector("#motion-setting");
const contrastSetting = document.querySelector("#contrast-setting");
const settingsStatus = document.querySelector(".settings-status");
const themeColor = document.querySelector('meta[name="theme-color"]');
const settingsStorageKey = "cosmos-site-settings";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const canParallax = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const defaultSettings = {
	theme: "system",
	reduceMotion: prefersReducedMotion.matches,
	highContrast: false
};

function readSettings() {
	try {
		const storedSettings = JSON.parse(window.localStorage.getItem(settingsStorageKey) || "null");
		if (!storedSettings || typeof storedSettings !== "object" || Array.isArray(storedSettings)) return { ...defaultSettings };
		return {
			theme: ["system", "light", "dark"].includes(storedSettings.theme) ? storedSettings.theme : defaultSettings.theme,
			reduceMotion: typeof storedSettings.reduceMotion === "boolean" ? storedSettings.reduceMotion : defaultSettings.reduceMotion,
			highContrast: typeof storedSettings.highContrast === "boolean" ? storedSettings.highContrast : defaultSettings.highContrast
		};
	} catch (error) {
		console.warn("Could not read saved COSMOS settings.", error);
		return { ...defaultSettings };
	}
}

let settings = readSettings();

function updateThemeColor() {
	const isDark = settings.theme === "dark" || (settings.theme === "system" && prefersDark.matches);
	themeColor.content = isDark ? "#111821" : "#f4f7fb";
}

function resetParallax() {
	cultivatorImage.style.translate = "0 0";
	orbits.forEach((orbit) => { orbit.style.translate = "0 0"; });
}

function applySettings() {
	const root = document.documentElement;
	root.dataset.theme = settings.theme;
	root.dataset.reduceMotion = String(settings.reduceMotion);
	root.dataset.highContrast = String(settings.highContrast);
	themeSetting.value = settings.theme;
	motionSetting.checked = settings.reduceMotion;
	contrastSetting.checked = settings.highContrast;
	updateThemeColor();
	if (settings.reduceMotion) resetParallax();
}

function saveSettings() {
	applySettings();
	try {
		window.localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
		settingsStatus.textContent = "Preferences saved on this device.";
	} catch (error) {
		console.warn("Could not save COSMOS settings.", error);
		settingsStatus.textContent = "Preferences are active but could not be saved on this device.";
	}
}

function setSettingsOpen(isOpen) {
	settingsPanel.hidden = !isOpen;
	settingsButton.setAttribute("aria-expanded", String(isOpen));
	if (isOpen) settingsClose.focus();
	else settingsButton.focus();
}

applySettings();

settingsButton.addEventListener("click", () => setSettingsOpen(settingsPanel.hidden));
settingsClose.addEventListener("click", () => setSettingsOpen(false));
themeSetting.addEventListener("change", () => {
	settings.theme = themeSetting.value;
	saveSettings();
});
motionSetting.addEventListener("change", () => {
	settings.reduceMotion = motionSetting.checked;
	saveSettings();
});
contrastSetting.addEventListener("change", () => {
	settings.highContrast = contrastSetting.checked;
	saveSettings();
});

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && !settingsPanel.hidden) setSettingsOpen(false);
});
document.addEventListener("click", (event) => {
	if (!settingsPanel.hidden && !settingsPanel.contains(event.target) && !settingsButton.contains(event.target)) {
		settingsPanel.hidden = true;
		settingsButton.setAttribute("aria-expanded", "false");
	}
});
prefersDark.addEventListener("change", updateThemeColor);

function updateProgress() {
	const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
	const progress = scrollableHeight > 0 ? Math.round((window.scrollY / scrollableHeight) * 100) : 0;
	progressBar.style.width = `${progress}%`;
	progressBar.setAttribute("aria-valuenow", String(progress));
}

let progressFrame = 0;
window.addEventListener("scroll", () => {
	if (progressFrame) return;
	progressFrame = window.requestAnimationFrame(() => {
		updateProgress();
		progressFrame = 0;
	});
}, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

if (canParallax) {
	cultivatorVisual.addEventListener("pointermove", (event) => {
		if (settings.reduceMotion) return;
		const bounds = cultivatorVisual.getBoundingClientRect();
		const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
		const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
		cultivatorImage.style.translate = `${offsetX * 8}px ${offsetY * 8}px`;
		orbits.forEach((orbit, index) => {
			const distance = index === 0 ? 12 : -8;
			orbit.style.translate = `${offsetX * distance}px ${offsetY * distance}px`;
		});
	});

	cultivatorVisual.addEventListener("pointerleave", () => {
		resetParallax();
	});
}
