// Cockpit : tout l'état est gardé dans le navigateur (localStorage), rien n'est envoyé ailleurs
// sauf la météo (Open-Meteo) et le briefing (ton serveur → API Claude).

const $ = (id) => document.getElementById(id);
const CLE = "cockpit-v1";
const PERIMETRE = 2 * Math.PI * 52;

// ── État ─────────────────────────────────────────────────
const defaut = () => ({
  prenom: "",
  ville: null, // { nom, lat, lon }
  taches: [],
  habitudes: [
    { id: id(), nom: "🏃 Sport", log: {} },
    { id: id(), nom: "📚 Lecture 20 min", log: {} },
    { id: id(), nom: "💧 2L d'eau", log: {} },
  ],
  budget: { mensuel: 400, depenses: [] },
  focus: { duree: 25, sessions: {} },
});

let etat = charger();

function id() {
  return Math.random().toString(36).slice(2, 10);
}

function charger() {
  try {
    const brut = localStorage.getItem(CLE);
    if (brut) return { ...defaut(), ...JSON.parse(brut) };
  } catch (e) {}
  return defaut();
}

function sauver() {
  try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) {}
}

function jourISO(d = new Date()) {
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function moisISO(d = new Date()) {
  return jourISO(d).slice(0, 7);
}

const euros = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " €";

function remplirAnneau(el, ratio, couleur) {
  const r = Math.max(0, Math.min(1, ratio));
  el.style.strokeDashoffset = PERIMETRE * (1 - r);
  if (couleur) el.style.stroke = couleur;
}

// Au changement de jour, on retire les objectifs terminés des jours précédents.
function nettoyerTaches() {
  const auj = jourISO();
  etat.taches = etat.taches.filter((t) => !t.fait || t.faitLe === auj);
}

// ── Horloge ──────────────────────────────────────────────
function horloge() {
  const d = new Date();
  const z = (n) => String(n).padStart(2, "0");
  $("horloge").firstChild.nodeValue = `${z(d.getHours())}:${z(d.getMinutes())}`;
  $("secondes").textContent = z(d.getSeconds());
  $("date").textContent = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const h = d.getHours();
  const moment = h < 5 ? "Bonne nuit" : h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  $("salut").textContent = etat.prenom ? `${moment}, ${etat.prenom}` : moment;
}

// ── Météo (Open-Meteo, gratuit et sans clé) ──────────────
const CODES = {
  0: ["☀️", "Grand soleil"], 1: ["🌤️", "Plutôt ensoleillé"], 2: ["⛅", "Partiellement nuageux"], 3: ["☁️", "Couvert"],
  45: ["🌫️", "Brouillard"], 48: ["🌫️", "Brouillard givrant"],
  51: ["🌦️", "Bruine légère"], 53: ["🌦️", "Bruine"], 55: ["🌧️", "Bruine forte"],
  61: ["🌧️", "Pluie faible"], 63: ["🌧️", "Pluie"], 65: ["🌧️", "Forte pluie"],
  66: ["🌧️", "Pluie verglaçante"], 67: ["🌧️", "Pluie verglaçante"],
  71: ["🌨️", "Neige faible"], 73: ["🌨️", "Neige"], 75: ["❄️", "Forte neige"], 77: ["🌨️", "Grains de neige"],
  80: ["🌦️", "Averses"], 81: ["🌧️", "Averses"], 82: ["⛈️", "Averses violentes"],
  85: ["🌨️", "Averses de neige"], 86: ["❄️", "Averses de neige"],
  95: ["⛈️", "Orage"], 96: ["⛈️", "Orage et grêle"], 99: ["⛈️", "Orage et grêle"],
};
const code = (c) => CODES[c] || ["🌡️", "—"];
let resumeMeteo = "inconnue";

async function meteo() {
  if (!etat.ville) {
    $("meteo-desc").textContent = "Choisis ta ville dans ⚙";
    return;
  }
  const { lat, lon, nom } = etat.ville;
  $("ville").textContent = nom;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
      "&timezone=auto&forecast_days=5";
    const m = await (await fetch(url)).json();
    const [emoji, desc] = code(m.current.weather_code);
    const t = Math.round(m.current.temperature_2m);
    $("meteo-icone").textContent = emoji;
    $("meteo-temp").textContent = `${t}°`;
    $("meteo-desc").textContent = `${desc} · ressenti ${Math.round(m.current.apparent_temperature)}° · vent ${Math.round(m.current.wind_speed_10m)} km/h`;

    $("meteo-jours").innerHTML = "";
    m.daily.time.forEach((jour, i) => {
      const nomJour = i === 0 ? "auj." : new Date(jour + "T12:00").toLocaleDateString("fr-FR", { weekday: "short" });
      const div = document.createElement("div");
      div.className = "jour";
      div.innerHTML = `<div class="j">${nomJour}</div><div class="e">${code(m.daily.weather_code[i])[0]}</div>` +
        `<div>${Math.round(m.daily.temperature_2m_max[i])}° <span class="muet">${Math.round(m.daily.temperature_2m_min[i])}°</span></div>` +
        `<div class="pluie">💧${m.daily.precipitation_probability_max[i] ?? 0}%</div>`;
      $("meteo-jours").appendChild(div);
    });

    resumeMeteo = `${nom} : ${desc.toLowerCase()}, ${t} degrés (ressenti ${Math.round(m.current.apparent_temperature)}), ` +
      `max ${Math.round(m.daily.temperature_2m_max[0])}, min ${Math.round(m.daily.temperature_2m_min[0])}, ` +
      `risque de pluie ${m.daily.precipitation_probability_max[0] ?? 0} %, vent ${Math.round(m.current.wind_speed_10m)} km/h`;
  } catch (e) {
    $("meteo-desc").textContent = "Météo indisponible";
  }
}

async function chercherVille(nom) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nom)}&count=1&language=fr`;
  const r = await (await fetch(url)).json();
  if (!r.results?.length) return null;
  const v = r.results[0];
  return { nom: v.name, lat: v.latitude, lon: v.longitude };
}

// ── Objectifs ────────────────────────────────────────────
function afficherTaches() {
  const ul = $("liste-taches");
  ul.innerHTML = "";
  for (const t of etat.taches) {
    const li = document.createElement("li");
    if (t.fait) li.className = "fait";
    li.innerHTML = `<button class="case" aria-label="Cocher">${t.fait ? "✓" : ""}</button><span class="txt"></span><button class="suppr" aria-label="Supprimer">✕</button>`;
    li.querySelector(".txt").textContent = t.texte;
    li.querySelector(".case").onclick = () => {
      t.fait = !t.fait;
      t.faitLe = t.fait ? jourISO() : null;
      sauver(); afficherTaches();
    };
    li.querySelector(".suppr").onclick = () => {
      etat.taches = etat.taches.filter((x) => x.id !== t.id);
      sauver(); afficherTaches();
    };
    ul.appendChild(li);
  }
  const faites = etat.taches.filter((t) => t.fait).length;
  const total = etat.taches.length;
  const ratio = total ? faites / total : 0;
  $("taches-pct").textContent = Math.round(ratio * 100) + "%";
  $("taches-compte").textContent = `${faites} / ${total} terminés`;
  remplirAnneau($("anneau-taches"), ratio, ratio === 1 && total ? "var(--vert)" : "var(--cyan)");
}

$("form-tache").onsubmit = (e) => {
  e.preventDefault();
  const texte = $("input-tache").value.trim();
  if (!texte) return;
  etat.taches.push({ id: id(), texte, fait: false });
  $("input-tache").value = "";
  sauver(); afficherTaches();
};

// ── Habitudes ────────────────────────────────────────────
function serie(h) {
  // Série en cours : jours consécutifs cochés jusqu'à aujourd'hui (ou hier si pas encore fait aujourd'hui).
  const d = new Date();
  if (!h.log[jourISO(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (h.log[jourISO(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

function afficherHabitudes() {
  const zone = $("liste-habitudes");
  zone.innerHTML = "";
  const jours = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
  for (const h of etat.habitudes) {
    const div = document.createElement("div");
    div.className = "habitude";
    div.innerHTML = `<span class="nom"></span><div class="jours7"></div><span class="serie"></span><button class="suppr" aria-label="Supprimer">✕</button>`;
    div.querySelector(".nom").textContent = h.nom;
    const s = serie(h);
    div.querySelector(".serie").textContent = s ? `🔥${s}` : "";
    for (const d of jours) {
      const cle = jourISO(d);
      const b = document.createElement("button");
      b.textContent = d.toLocaleDateString("fr-FR", { weekday: "narrow" });
      b.title = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" });
      if (h.log[cle]) b.classList.add("oui");
      if (cle === jourISO()) b.classList.add("aujourdhui");
      b.onclick = () => {
        if (h.log[cle]) delete h.log[cle]; else h.log[cle] = true;
        sauver(); afficherHabitudes();
      };
      div.querySelector(".jours7").appendChild(b);
    }
    div.querySelector(".suppr").onclick = () => {
      if (!confirm(`Supprimer « ${h.nom} » et son historique ?`)) return;
      etat.habitudes = etat.habitudes.filter((x) => x.id !== h.id);
      sauver(); afficherHabitudes();
    };
    zone.appendChild(div);
  }
}

$("form-habitude").onsubmit = (e) => {
  e.preventDefault();
  const nom = $("input-habitude").value.trim();
  if (!nom) return;
  etat.habitudes.push({ id: id(), nom, log: {} });
  $("input-habitude").value = "";
  sauver(); afficherHabitudes();
};

// ── Budget ───────────────────────────────────────────────
function depensesDuMois() {
  const m = moisISO();
  return etat.budget.depenses.filter((d) => d.date.startsWith(m));
}

function afficherBudget() {
  const liste = depensesDuMois();
  const total = liste.reduce((s, d) => s + d.montant, 0);
  const mensuel = etat.budget.mensuel || 0;
  const reste = mensuel - total;
  const maintenant = new Date();
  const joursMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0).getDate();
  const joursRestants = joursMois - maintenant.getDate() + 1;

  $("mois").textContent = maintenant.toLocaleDateString("fr-FR", { month: "long" });
  $("budget-reste").textContent = euros(Math.round(reste * 100) / 100);
  $("budget-depense").textContent = `${euros(Math.round(total * 100) / 100)} dépensés sur ${euros(mensuel)}`;
  $("budget-jour").textContent = reste > 0 ? `≈ ${euros(Math.floor(reste / joursRestants))}/jour` : "à sec 💀";

  const ratio = mensuel ? reste / mensuel : 0;
  const couleur = ratio > 0.4 ? "var(--vert)" : ratio > 0.15 ? "var(--orange)" : "var(--rouge)";
  remplirAnneau($("anneau-budget"), ratio, couleur);

  const ul = $("liste-depenses");
  ul.innerHTML = "";
  for (const d of liste.slice(-6).reverse()) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="txt"></span><span class="prix">-${euros(d.montant)}</span><button class="suppr" aria-label="Supprimer">✕</button>`;
    li.querySelector(".txt").textContent = d.libelle;
    li.querySelector(".suppr").onclick = () => {
      etat.budget.depenses = etat.budget.depenses.filter((x) => x.id !== d.id);
      sauver(); afficherBudget();
    };
    ul.appendChild(li);
  }
}

$("form-depense").onsubmit = (e) => {
  e.preventDefault();
  const montant = parseFloat($("input-montant").value);
  if (!(montant > 0)) return;
  etat.budget.depenses.push({ id: id(), montant, libelle: $("input-libelle").value.trim() || "Dépense", date: jourISO() });
  $("input-montant").value = "";
  $("input-libelle").value = "";
  sauver(); afficherBudget();
};

// ── Focus (pomodoro) ─────────────────────────────────────
let focusFin = null;      // timestamp de fin quand ça tourne
let focusRestant = null;  // ms restantes quand en pause
let focusTimer = null;

function dureeMs() { return etat.focus.duree * 60 * 1000; }

function afficherFocus() {
  const restant = focusFin ? Math.max(0, focusFin - Date.now()) : focusRestant ?? dureeMs();
  const s = Math.ceil(restant / 1000);
  $("focus-temps").textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  remplirAnneau($("anneau-focus"), 1 - restant / dureeMs(), "var(--violet)");
  const n = etat.focus.sessions[jourISO()] || 0;
  $("focus-sessions").textContent = `${n} session${n > 1 ? "s" : ""} aujourd'hui`;
  if (focusFin && restant === 0) terminerFocus();
}

function terminerFocus() {
  clearInterval(focusTimer);
  focusFin = null;
  focusRestant = null;
  const j = jourISO();
  etat.focus.sessions[j] = (etat.focus.sessions[j] || 0) + 1;
  sauver();
  $("focus-etat").textContent = "terminé 🎉";
  $("btn-focus").textContent = "▶ Démarrer";
  parler("Session de focus terminée. Prends cinq minutes de pause.");
  afficherFocus();
}

$("btn-focus").onclick = () => {
  if (focusFin) { // pause
    focusRestant = focusFin - Date.now();
    focusFin = null;
    clearInterval(focusTimer);
    $("focus-etat").textContent = "en pause";
    $("btn-focus").textContent = "▶ Reprendre";
  } else {
    focusFin = Date.now() + (focusRestant ?? dureeMs());
    focusRestant = null;
    focusTimer = setInterval(afficherFocus, 250);
    $("focus-etat").textContent = "concentration";
    $("btn-focus").textContent = "❚❚ Pause";
  }
  afficherFocus();
};

$("btn-focus-reset").onclick = () => {
  clearInterval(focusTimer);
  focusFin = null;
  focusRestant = null;
  $("focus-etat").textContent = "prêt";
  $("btn-focus").textContent = "▶ Démarrer";
  afficherFocus();
};

$("focus-duree").onchange = (e) => {
  etat.focus.duree = +e.target.value;
  sauver();
  $("btn-focus-reset").onclick();
};

// ── Briefing ─────────────────────────────────────────────
function donneesBriefing() {
  const auj = jourISO();
  const liste = depensesDuMois();
  const total = liste.reduce((s, d) => s + d.montant, 0);
  const mensuel = etat.budget.mensuel || 0;
  return {
    prenom: etat.prenom,
    maintenant: new Date().toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }),
    meteo: resumeMeteo,
    taches: etat.taches.filter((t) => !t.fait).map((t) => t.texte),
    taches_faites: etat.taches.filter((t) => t.fait).length,
    habitudes: etat.habitudes.map((h) => `${h.nom} : série de ${serie(h)} jours, ${h.log[auj] ? "faite" : "pas encore faite"} aujourd'hui`),
    budget: mensuel ? `${Math.round(total)} euros dépensés sur ${mensuel}, reste ${Math.round(mensuel - total)} euros` : "non renseigné",
    focus: `${etat.focus.sessions[auj] || 0} sessions de focus aujourd'hui`,
  };
}

function briefingLocal(d) {
  const h = new Date().getHours();
  const salut = (h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir") + (d.prenom ? ` ${d.prenom}` : "");
  const taches = d.taches.length
    ? `Tu as ${d.taches.length} objectif${d.taches.length > 1 ? "s" : ""} en cours, à commencer par : ${d.taches[0]}.`
    : "Aucun objectif en attente, profites-en pour en fixer un.";
  const meilleure = [...etat.habitudes].sort((a, b) => serie(b) - serie(a))[0];
  const hab = meilleure && serie(meilleure) > 1 ? `Belle série de ${serie(meilleure)} jours sur ${meilleure.nom.replace(/^\p{Extended_Pictographic}\s*/u, "")}.` : "";
  return `${salut}. Météo : ${d.meteo}. ${taches} ${hab} Budget : ${d.budget}. Allez, on y va.`;
}

let voixFr = null;
function chargerVoix() {
  const voix = speechSynthesis.getVoices().filter((v) => v.lang.startsWith("fr"));
  voixFr = voix.find((v) => /google|natural|premium|enhanced|amelie|thomas/i.test(v.name)) || voix[0] || null;
}
if ("speechSynthesis" in window) {
  chargerVoix();
  speechSynthesis.onvoiceschanged = chargerVoix;
}

function parler(texte) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texte);
  u.lang = "fr-FR";
  if (voixFr) u.voice = voixFr;
  u.rate = 1.03;
  u.onstart = () => $("onde").classList.add("active");
  u.onend = u.onerror = () => $("onde").classList.remove("active");
  speechSynthesis.speak(u);
}

function ecrire(texte) {
  const p = $("briefing-texte");
  p.innerHTML = "";
  texte.split(/(\s+)/).forEach((morceau, i) => {
    const span = document.createElement("span");
    span.className = "mot";
    span.style.animationDelay = `${i * 0.025}s`;
    span.textContent = morceau;
    p.appendChild(span);
  });
}

async function lancerBriefing() {
  const btn = $("btn-briefing");
  btn.disabled = true;
  btn.textContent = "… analyse";
  $("onde").classList.add("active");
  $("briefing-texte").textContent = "Analyse de ta journée…";
  const d = donneesBriefing();
  let texte;
  try {
    const r = await fetch("/api/briefing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    if (!r.ok) throw new Error();
    texte = (await r.json()).texte;
  } catch (e) {
    texte = briefingLocal(d);
  }
  ecrire(texte);
  parler(texte);
  if (!("speechSynthesis" in window)) $("onde").classList.remove("active");
  btn.disabled = false;
  btn.textContent = "▶ Relancer le briefing";
}

$("btn-briefing").onclick = lancerBriefing;
$("btn-stop").onclick = () => { speechSynthesis?.cancel(); $("onde").classList.remove("active"); };

// ── Réglages, plein écran, raccourcis ────────────────────
$("btn-reglages").onclick = () => {
  $("r-prenom").value = etat.prenom;
  $("r-ville").value = etat.ville?.nom || "";
  $("r-budget").value = etat.budget.mensuel || "";
  $("reglages").returnValue = "";
  $("reglages").showModal();
};

$("reglages").addEventListener("close", async () => {
  if ($("reglages").returnValue !== "ok") return;
  etat.prenom = $("r-prenom").value.trim();
  etat.budget.mensuel = parseFloat($("r-budget").value) || 0;
  const nomVille = $("r-ville").value.trim();
  if (nomVille && nomVille !== etat.ville?.nom) {
    try {
      const v = await chercherVille(nomVille);
      if (v) etat.ville = v; else alert(`Ville « ${nomVille} » introuvable.`);
    } catch (e) {}
  }
  sauver();
  horloge(); afficherBudget(); meteo();
});

$("btn-plein").onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.();
};

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, select, textarea") || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === "b" || e.key === "B") lancerBriefing();
  if (e.key === "f" || e.key === "F") $("btn-plein").onclick();
  if (e.key === " ") { e.preventDefault(); $("btn-focus").onclick(); }
});

// ── Fond étoilé ──────────────────────────────────────────
function etoiles() {
  const c = $("etoiles");
  const ctx = c.getContext("2d");
  const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pts = [];
  function taille() {
    c.width = innerWidth * devicePixelRatio;
    c.height = innerHeight * devicePixelRatio;
    pts = [...Array(Math.round((innerWidth * innerHeight) / 9000))].map(() => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.2 * devicePixelRatio + 0.2, v: Math.random() * 0.15 + 0.03, p: Math.random() * Math.PI * 2,
    }));
  }
  function frame(t) {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const s of pts) {
      if (!calme) { s.y -= s.v; if (s.y < 0) s.y = c.height; }
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t / 900 + s.p);
      ctx.fillStyle = "#bfe9ff";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    if (!calme) requestAnimationFrame(frame);
  }
  addEventListener("resize", taille);
  taille();
  requestAnimationFrame(frame);
}

// ── Démarrage ────────────────────────────────────────────
nettoyerTaches();
sauver();
$("focus-duree").value = String(etat.focus.duree);
horloge();
setInterval(horloge, 1000);
afficherTaches();
afficherHabitudes();
afficherBudget();
afficherFocus();
meteo();
setInterval(meteo, 15 * 60 * 1000);
etoiles();
if (!etat.ville && !etat.prenom) setTimeout(() => $("btn-reglages").onclick(), 800);
