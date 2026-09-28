const progressBar = document.querySelector(".reading-progress");
const heroVisual = document.querySelector(".hero-visual");
const heroImage = document.querySelector(".hero-image");
const orbits = document.querySelectorAll(".orbit");
const canParallax = window.matchMedia("(hover: hover) and (pointer: fine)").matches
	&& !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
	heroVisual.addEventListener("pointermove", (event) => {
		const bounds = heroVisual.getBoundingClientRect();
		const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
		const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
		heroImage.style.translate = `${offsetX * 8}px ${offsetY * 8}px`;
		orbits.forEach((orbit, index) => {
			const distance = index === 0 ? 12 : -8;
			orbit.style.translate = `${offsetX * distance}px ${offsetY * distance}px`;
		});
	});

	heroVisual.addEventListener("pointerleave", () => {
		heroImage.style.translate = "0 0";
		orbits.forEach((orbit) => { orbit.style.translate = "0 0"; });
	});
}
