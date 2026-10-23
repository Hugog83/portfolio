"use strict";

const root = document.documentElement;
const themeButton = document.querySelector("#theme-toggle");
const menuButton = document.querySelector("#menu-toggle");
const nav = document.querySelector("#navigation");
const copyButton = document.querySelector("#copy-email");
const copyStatus = document.querySelector("#copy-status");

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("hugo-portfolio-theme");
} catch (_) {
  // Le site reste utilisable si le navigateur bloque le stockage.
}
const preferredTheme = window.matchMedia("(prefers-color-scheme: light)")
  .matches
  ? "light"
  : "dark";
setTheme(
  savedTheme === "light" || savedTheme === "dark" ? savedTheme : preferredTheme,
);

function setTheme(theme) {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  const label =
    theme === "dark" ? "Activer le thème clair" : "Activer le thème sombre";
  themeButton.setAttribute("aria-label", label);
  themeButton.title = label;
  document
    .querySelector('meta[name="theme-color"]')
    .setAttribute("content", theme === "dark" ? "#0b1220" : "#f7f8fc");
}

themeButton.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(next);
  try {
    localStorage.setItem("hugo-portfolio-theme", next);
  } catch (_) {}
});

function setMenuOpen(isOpen) {
  const label = isOpen ? "Fermer le menu" : "Ouvrir le menu";
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", label);
  menuButton.title = label;
  nav.classList.toggle("is-open", isOpen);
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") !== "true";
  setMenuOpen(isOpen);
  if (isOpen) nav.querySelector("a").focus();
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    setMenuOpen(false);
    document
      .querySelector(link.getAttribute("href"))
      .focus({ preventScroll: true });
  });
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    setMenuOpen(false);
    menuButton.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!nav.contains(event.target) && !menuButton.contains(event.target))
    setMenuOpen(false);
});

document.addEventListener("focusin", (event) => {
  if (!nav.contains(event.target) && !menuButton.contains(event.target))
    setMenuOpen(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 780) setMenuOpen(false);
  scheduleNavigationUpdate();
});

// Le lien actif est calculé depuis toutes les sections, y compris lors du retour en haut.
const links = [...nav.querySelectorAll('a[href^="#"]')];
const sections = links.map((link) =>
  document.querySelector(link.getAttribute("href")),
);
let navigationFrame = null;

function updateNavigation() {
  navigationFrame = null;
  let current = null;
  const readingLine = Math.max(100, window.innerHeight * 0.3);
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= readingLine)
      current = section.id;
  });
  if (
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 2
  ) {
    current = sections[sections.length - 1].id;
  }
  links.forEach((link) => {
    const active = link.getAttribute("href") === `#${current}`;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

function scheduleNavigationUpdate() {
  if (navigationFrame === null)
    navigationFrame = window.requestAnimationFrame(updateNavigation);
}
window.addEventListener("scroll", scheduleNavigationUpdate, { passive: true });
updateNavigation();

let copyResetTimer;
copyButton.addEventListener("click", async () => {
  window.clearTimeout(copyResetTimer);
  copyStatus.textContent = "";
  copyButton.textContent = "Copier l'adresse email";
  try {
    if (!navigator.clipboard || !window.isSecureContext)
      throw new Error("Clipboard non disponible");
    copyButton.disabled = true;
    await navigator.clipboard.writeText(copyButton.dataset.email);
    copyStatus.textContent = "Adresse email copiée !";
    copyButton.textContent = "Adresse copiée ✓";
    copyResetTimer = window.setTimeout(() => {
      copyButton.textContent = "Copier l'adresse email";
      copyStatus.textContent = "";
    }, 4000);
  } catch (_) {
    copyStatus.textContent =
      "Copie indisponible : sélectionnez l'adresse email affichée ci-dessus.";
  } finally {
    copyButton.disabled = false;
  }
});

document.querySelector("#year").textContent = new Date().getFullYear();
root.classList.add("js");
