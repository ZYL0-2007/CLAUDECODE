"""Chatbot pour petites entreprises : répond aux clients 24h/24 et récupère les prospects.

Lancer :  uvicorn app:app --reload
Démo   :  http://localhost:8000
"""

import csv
import json
import os
from datetime import datetime
from pathlib import Path

import anthropic
import yaml
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

ICI = Path(__file__).parent
CONFIG = Path(os.environ.get("ENTREPRISE_CONFIG", ICI / "entreprise.yaml"))
FICHIER_PROSPECTS = Path(os.environ.get("FICHIER_PROSPECTS", ICI / "prospects.csv"))
MODELE = os.environ.get("MODELE", "claude-opus-5")

client = anthropic.Anthropic()
entreprise = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))

SYSTEM = f"""Tu es l'assistant du site web de « {entreprise['nom']} ». Tu réponds aux visiteurs \
en français, avec un ton {entreprise.get('ton', 'professionnel et chaleureux')}, en 1 à 4 phrases courtes.

Règles :
- Réponds UNIQUEMENT à partir des informations ci-dessous. Si l'info n'y est pas, dis-le \
honnêtement et propose d'être rappelé ou de contacter l'entreprise. N'invente jamais un prix, \
un horaire ou un service.
- Quand un visiteur veut un rendez-vous, un devis ou être rappelé, demande son prénom et son \
numéro de téléphone (et le motif s'il ne l'a pas donné), puis appelle l'outil \
enregistrer_prospect. Confirme ensuite que l'entreprise le recontactera rapidement.
- Ne parle que de l'entreprise et de ses services ; recentre poliment sinon.

Informations sur l'entreprise :
{yaml.dump(entreprise, allow_unicode=True, sort_keys=False)}"""

OUTILS = [
    {
        "name": "enregistrer_prospect",
        "description": (
            "Enregistre un visiteur qui souhaite un rendez-vous, un devis ou être rappelé. "
            "À appeler seulement quand on a au moins le prénom et le téléphone."
        ),
        "strict": True,
        "input_schema": {
            "type": "object",
            "properties": {
                "prenom": {"type": "string"},
                "telephone": {"type": "string"},
                "motif": {"type": "string", "description": "Ce que veut le visiteur, en une phrase."},
            },
            "required": ["prenom", "telephone", "motif"],
            "additionalProperties": False,
        },
    }
]


def enregistrer_prospect(prenom: str, telephone: str, motif: str) -> str:
    nouveau = not FICHIER_PROSPECTS.exists()
    with FICHIER_PROSPECTS.open("a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        if nouveau:
            w.writerow(["date", "prenom", "telephone", "motif"])
        w.writerow([datetime.now().isoformat(timespec="minutes"), prenom, telephone, motif])
    return "Prospect enregistré."


class Message(BaseModel):
    role: str  # "user" ou "assistant"
    content: str


class Demande(BaseModel):
    messages: list[Message]


app = FastAPI(title=f"Chatbot {entreprise['nom']}")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["POST"], allow_headers=["*"])
app.mount("/static", StaticFiles(directory=ICI / "static"), name="static")


@app.get("/")
def demo():
    return FileResponse(ICI / "static" / "demo.html")


@app.get("/api/entreprise")
def infos():
    return {"nom": entreprise["nom"]}


@app.post("/api/chat")
def chat(demande: Demande):
    # On garde les 20 derniers messages : suffisant pour un chat de site web, et ça limite le coût.
    historique = [m.model_dump() for m in demande.messages[-20:]]
    if not historique or historique[-1]["role"] != "user":
        raise HTTPException(400, "Le dernier message doit venir du visiteur.")
    if len(historique[-1]["content"]) > 2000:
        raise HTTPException(400, "Message trop long.")

    prospect_enregistre = False
    for _ in range(3):  # au plus 3 allers-retours avec l'outil
        try:
            reponse = client.beta.messages.create(
                model=MODELE,
                max_tokens=2000,
                system=[{"type": "text", "text": SYSTEM, "cache_control": {"type": "ephemeral"}}],
                output_config={"effort": "low"},
                tools=OUTILS,
                messages=historique,
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
            )
        except anthropic.RateLimitError:
            raise HTTPException(429, "Trop de demandes, réessayez dans un instant.")
        except anthropic.APIStatusError as e:
            raise HTTPException(502, f"Erreur du service IA ({e.status_code}).")
        except anthropic.APIConnectionError:
            raise HTTPException(502, "Service IA injoignable.")

        if reponse.stop_reason == "refusal":
            return {"reponse": f"Je ne peux pas répondre à cela. Contactez-nous au {entreprise['telephone']}.",
                    "prospect": prospect_enregistre}

        if reponse.stop_reason != "tool_use":
            texte = "".join(b.text for b in reponse.content if b.type == "text").strip()
            return {"reponse": texte, "prospect": prospect_enregistre}

        historique.append({"role": "assistant", "content": reponse.content})
        resultats = []
        for bloc in reponse.content:
            if bloc.type != "tool_use":
                continue
            if bloc.name == "enregistrer_prospect":
                args = bloc.input if isinstance(bloc.input, dict) else json.loads(bloc.input)
                resultats.append({"type": "tool_result", "tool_use_id": bloc.id,
                                  "content": enregistrer_prospect(**args)})
                prospect_enregistre = True
            else:
                resultats.append({"type": "tool_result", "tool_use_id": bloc.id,
                                  "content": "Outil inconnu.", "is_error": True})
        historique.append({"role": "user", "content": resultats})

    return {"reponse": f"Merci ! Pour aller plus vite, appelez-nous au {entreprise['telephone']}.",
            "prospect": prospect_enregistre}
