const SERVER_IP = "play.global.example:28015";
const STEAM_CONNECT = `steam://connect/${SERVER_IP}`;

const wiped = new Date();

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("wiped-date").textContent = wiped.toLocaleDateString();

function copyIp() {
  navigator.clipboard.writeText(SERVER_IP);
}

function connect() {
  window.location.href = STEAM_CONNECT;
}

document.getElementById("copy-ip-top").addEventListener("click", copyIp);
document.getElementById("copy-ip-main").addEventListener("click", copyIp);
document.getElementById("connect-top").addEventListener("click", connect);
document.getElementById("connect-now").addEventListener("click", connect);


// Shrink navbar on scroll
const nav = document.querySelector(".nav");

function onScroll() {
  if (window.scrollY > 40) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", onScroll);
onScroll();


// Next Friday wipe calculation
function nextFridayCET() {

  const tz = "Europe/Berlin";
  const now = new Date();
  const nowCET = new Date(now.toLocaleString("en-US", { timeZone: tz }));

  const diffToCET = nowCET.getTime() - now.getTime();

  const day = nowCET.getDay();
  const add = (5 - day + 7) % 7;

  const targetCET = new Date(nowCET);

  targetCET.setDate(nowCET.getDate() + add);
  targetCET.setHours(18, 0, 0, 0);

  if (add === 0 && nowCET.getHours() >= 18) {
    targetCET.setDate(targetCET.getDate() + 7);
  }

  return new Date(targetCET.getTime() - diffToCET);
}

const target = nextFridayCET();

const wipeSchedule = document.getElementById("wipe-schedule");
wipeSchedule.textContent = "Friday 18:00 CET / 17:00 GMT";

const dayEl = document.getElementById("cd-days");
const hourEl = document.getElementById("cd-hours");
const minEl = document.getElementById("cd-mins");
const secEl = document.getElementById("cd-secs");
const bar = document.getElementById("cd-bar");

const startWindow = new Date(target);
startWindow.setDate(target.getDate() - 7);


function tick() {

  const now = new Date();

  const total = target - startWindow;
  const elapsed = Math.max(0, Math.min(total, now - startWindow));
  const remain = Math.max(0, target - now);

  const s = Math.floor(remain / 1000);

  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  dayEl.textContent = String(days).padStart(2, "0");
  hourEl.textContent = String(hours).padStart(2, "0");
  minEl.textContent = String(mins).padStart(2, "0");
  secEl.textContent = String(secs).padStart(2, "0");

  bar.style.width = `${(elapsed / total) * 100}%`;

  if (remain <= 0) {
    clearInterval(timer);
    bar.style.width = "100%";
  }
}

const timer = setInterval(tick, 1000);
tick();


// Backend endpoints
const BACKEND_BASE = "https://globalrusteu.com";

const ACCOUNT_CONFIG = {
  steamAuth: `${BACKEND_BASE}/auth/steam`,
  discordAuth: `${BACKEND_BASE}/auth/discord`,
  steamProfile: `${BACKEND_BASE}/api/steam/profile`,
  discordProfile: `${BACKEND_BASE}/api/discord/profile`
};


const accountFab = document.getElementById("account-fab");
const accountPanel = document.getElementById("account-panel");
const closeAccount = document.getElementById("close-account");

const linkSteamBtn = document.getElementById("link-steam");
const linkDiscordBtn = document.getElementById("link-discord");


function togglePanel() {
  accountPanel.classList.toggle("open");
}

accountFab.addEventListener("click", togglePanel);
closeAccount.addEventListener("click", togglePanel);


function openAuth(url) {

  const ret = encodeURIComponent(`${location.origin}${location.pathname}?steam=done`);

  const final = url.includes("?")
    ? `${url}&return=${ret}`
    : `${url}?return=${ret}`;

  window.open(final, "_blank", "width=520,height=640");
}

linkSteamBtn.addEventListener("click", () => openAuth(ACCOUNT_CONFIG.steamAuth));
linkDiscordBtn.addEventListener("click", () => openAuth(ACCOUNT_CONFIG.discordAuth));


async function fetchJSON(url) {
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) throw new Error("fail");
  return r.json();
}


function setSteamProfile(p) {

  document.getElementById("acc-name").textContent = p.personaname || "Unknown";
  document.getElementById("acc-avatar").src =
    p.avatarfull || document.getElementById("acc-avatar").src;

  document.getElementById("acc-steamid").textContent =
    "Steam ID: " + (p.steamid || "—");

  document.getElementById("acc-hours").textContent =
    "Hours played: " + (p.hours || "—");

  const titleName = document.getElementById("acc-title-name");

  if (titleName) {
    titleName.textContent = p.personaname ? `– ${p.personaname}` : "";
  }

  const dot = document.getElementById("acc-status-dot");
  const txt = document.getElementById("acc-status-txt");

  if (p.personastate && Number(p.personastate) > 0) {
    dot.classList.remove("off");
    dot.classList.add("on");
    txt.textContent = "Online";
  } else {
    dot.classList.remove("on");
    dot.classList.add("off");
    txt.textContent = "Offline";
  }

  const fab = document.getElementById("account-fab");

  if (p.avatarfull && fab) {
    fab.innerHTML = "";
    const img = document.createElement("img");
    img.src = p.avatarfull;
    img.alt = p.personaname || "Steam Avatar";
    fab.appendChild(img);
  }
}


function setDiscordProfile(p) {
  document.getElementById("acc-discord").textContent =
    "Discord: " +
    (p.username
      ? `${p.username}#${p.discriminator || ""}`.replace(/#$/, "")
      : "Not linked");
}


async function refreshProfiles() {
  try {
    const sp = await fetchJSON(ACCOUNT_CONFIG.steamProfile);
    setSteamProfile(sp);
  } catch (e) {}

  try {
    const dp = await fetchJSON(ACCOUNT_CONFIG.discordProfile);
    setDiscordProfile(dp);
  } catch (e) {}
}

refreshProfiles();


// Steam popup callback
window.addEventListener("message", (e) => {
  try {
    if (!e.data || typeof e.data !== "object") return;

    if (e.data.type === "steamLinked" && e.data.profile) {
      setSteamProfile(e.data.profile);
    }
  } catch (_) {}
});


// refresh if redirected from auth
if (new URLSearchParams(location.search).get("steam") === "done") {
  refreshProfiles();
}