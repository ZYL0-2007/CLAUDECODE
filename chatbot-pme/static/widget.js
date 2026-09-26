/*
 * Widget de chat à coller sur n'importe quel site (WordPress, Wix, HTML...) :
 *   <script src="https://VOTRE-SERVEUR/static/widget.js" defer></script>
 */
(function () {
  const script = document.currentScript;
  const SERVEUR = new URL(script.src).origin;
  const COULEUR = script.dataset.couleur || "#2563eb";
  const historique = [];

  const style = document.createElement("style");
  style.textContent = `
    #cb-bulle{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;
      background:${COULEUR};color:#fff;border:none;font-size:28px;cursor:pointer;
      box-shadow:0 4px 14px rgba(0,0,0,.25);z-index:99999}
    #cb-fenetre{position:fixed;bottom:90px;right:20px;width:min(360px,calc(100vw - 32px));
      height:min(520px,calc(100vh - 120px));background:#fff;border-radius:14px;display:none;
      flex-direction:column;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.25);z-index:99999;
      font:15px/1.4 system-ui,sans-serif;color:#111}
    #cb-fenetre.ouvert{display:flex}
    #cb-titre{background:${COULEUR};color:#fff;padding:14px 16px;font-weight:600}
    #cb-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#f6f7f9}
    .cb-msg{max-width:85%;padding:9px 12px;border-radius:12px;white-space:pre-wrap;word-wrap:break-word}
    .cb-user{align-self:flex-end;background:${COULEUR};color:#fff}
    .cb-bot{align-self:flex-start;background:#fff;border:1px solid #e3e5e8}
    #cb-form{display:flex;border-top:1px solid #e3e5e8}
    #cb-input{flex:1;border:none;padding:12px;font:inherit;outline:none}
    #cb-envoyer{border:none;background:none;color:${COULEUR};font-weight:600;padding:0 14px;cursor:pointer}
  `;
  document.head.appendChild(style);

  const bulle = document.createElement("button");
  bulle.id = "cb-bulle";
  bulle.setAttribute("aria-label", "Ouvrir le chat");
  bulle.textContent = "💬";

  const fenetre = document.createElement("div");
  fenetre.id = "cb-fenetre";
  fenetre.innerHTML = `
    <div id="cb-titre">Une question ?</div>
    <div id="cb-messages"></div>
    <form id="cb-form"><input id="cb-input" placeholder="Écrivez votre message..." autocomplete="off" maxlength="2000">
    <button id="cb-envoyer" type="submit">Envoyer</button></form>`;
  document.body.append(bulle, fenetre);

  const zone = fenetre.querySelector("#cb-messages");
  const form = fenetre.querySelector("#cb-form");
  const input = fenetre.querySelector("#cb-input");

  function ajouter(texte, classe) {
    const div = document.createElement("div");
    div.className = "cb-msg " + classe;
    div.textContent = texte;
    zone.appendChild(div);
    zone.scrollTop = zone.scrollHeight;
    return div;
  }

  fetch(SERVEUR + "/api/entreprise").then(r => r.json()).then(e => {
    fenetre.querySelector("#cb-titre").textContent = e.nom;
  }).catch(() => {});

  ajouter("Bonjour 👋 Comment puis-je vous aider ?", "cb-bot");

  bulle.onclick = () => {
    fenetre.classList.toggle("ouvert");
    if (fenetre.classList.contains("ouvert")) input.focus();
  };

  form.onsubmit = async (ev) => {
    ev.preventDefault();
    const texte = input.value.trim();
    if (!texte) return;
    input.value = "";
    ajouter(texte, "cb-user");
    historique.push({ role: "user", content: texte });
    const attente = ajouter("…", "cb-bot");
    try {
      const r = await fetch(SERVEUR + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historique }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Erreur");
      attente.textContent = data.reponse;
      historique.push({ role: "assistant", content: data.reponse });
    } catch (e) {
      attente.textContent = "Désolé, un problème technique est survenu. Réessayez dans un instant.";
      historique.pop();
    }
  };
})();
