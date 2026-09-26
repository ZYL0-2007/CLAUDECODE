"""Cockpit : dashboard de vie perso avec briefing IA.

Lancer :  uvicorn server:app --reload     puis ouvrir http://localhost:8000
Sans clé API, tout marche sauf que le briefing est généré localement (version simple).
"""

import os
from pathlib import Path

import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

ICI = Path(__file__).parent
MODELE = os.environ.get("MODELE", "claude-opus-5")

SYSTEM = """Tu es l'IA de bord personnelle de l'utilisateur, façon JARVIS : calme, précise, \
un brin d'humour pince-sans-rire, jamais servile. Tu fais son briefing à partir des données \
de son tableau de bord.

Format : 60 à 110 mots, en français, à l'oral (ce texte sera lu par une synthèse vocale) : \
pas de markdown, pas de listes, pas d'emoji, nombres écrits simplement. Commence par une \
salutation adaptée à l'heure. Donne l'essentiel dans cet ordre : météo et conseil concret \
(parapluie, veste...), priorités du jour, une remarque sur les habitudes (félicite une série \
en cours ou pointe celle qui décroche), l'état du budget si c'est notable. Termine par une \
phrase courte et motivante, sans cliché. N'invente aucune donnée absente."""


class Etat(BaseModel):
    prenom: str = ""
    maintenant: str
    meteo: str = "inconnue"
    taches: list[str] = []
    taches_faites: int = 0
    habitudes: list[str] = []
    budget: str = "non renseigné"
    focus: str = ""


app = FastAPI(title="Cockpit")
app.mount("/static", StaticFiles(directory=ICI / "static"), name="static")


@app.get("/")
def page():
    return FileResponse(ICI / "static" / "index.html")


@app.post("/api/briefing")
def briefing(etat: Etat):
    if not (os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN")):
        raise HTTPException(503, "Pas de clé API : briefing local.")

    donnees = f"""Prénom : {etat.prenom or "non renseigné"}
Date et heure : {etat.maintenant}
Météo : {etat.meteo}
Tâches restantes : {"; ".join(etat.taches) or "aucune"} ({etat.taches_faites} déjà faites)
Habitudes (série en jours, faite aujourd'hui ?) : {"; ".join(etat.habitudes) or "aucune"}
Budget du mois : {etat.budget}
Focus : {etat.focus or "aucune session"}"""

    try:
        reponse = anthropic.Anthropic().beta.messages.create(
            model=MODELE,
            max_tokens=2000,
            system=SYSTEM,
            output_config={"effort": "low"},
            messages=[{"role": "user", "content": donnees}],
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
        )
    except anthropic.APIStatusError as e:
        raise HTTPException(502, f"Erreur du service IA ({e.status_code}).")
    except anthropic.APIConnectionError:
        raise HTTPException(502, "Service IA injoignable.")

    if reponse.stop_reason == "refusal":
        raise HTTPException(502, "Briefing refusé.")
    texte = "".join(b.text for b in reponse.content if b.type == "text").strip()
    return {"texte": texte}
