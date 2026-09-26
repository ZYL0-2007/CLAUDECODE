# Chatbot PME : un assistant IA à vendre aux commerces

Un chatbot que tu installes sur le site d'un commerce (garage, resto, salle de sport, cabinet...).
Il :
- **répond aux clients 24h/24** (horaires, tarifs, services) sans rien inventer ;
- **récupère les prospects** : quand quelqu'un veut un RDV ou un devis, il demande prénom + téléphone
  et les enregistre dans `prospects.csv` → le commerçant rappelle, il gagne des clients.

## Lancer en local (5 min)
```bash
cd chatbot-pme
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...      # clé sur console.anthropic.com
uvicorn app:app --reload
```
Ouvre http://localhost:8000 et clique sur la bulle 💬.

## Adapter à un nouveau client
1. Copie `entreprise.yaml` et remplis les infos du commerce (horaires, tarifs, FAQ).
2. Lance avec `ENTREPRISE_CONFIG=client2.yaml uvicorn app:app`.
3. Le client colle **une ligne** sur son site :
   ```html
   <script src="https://ton-serveur.com/static/widget.js" data-couleur="#e11d48" defer></script>
   ```

## Mettre en ligne
Render, Railway ou Fly.io (offres gratuites ou quelques €/mois) : commande de démarrage
`uvicorn app:app --host 0.0.0.0 --port $PORT`, et la variable `ANTHROPIC_API_KEY`.

## Le vendre
| | |
|---|---|
| **Prix** | 150–300 € d'installation + 49–99 €/mois |
| **Ton coût** | hébergement ~5 €/mois + API, soit quelques euros/mois pour un petit commerce (réglable avec la variable `MODELE`) |
| **Argument** | « Chaque soir et chaque week-end, des clients vous écrivent et repartent sans réponse. Lui répond à leur place et vous donne leur numéro. » |
| **Cible** | commerces qui ont un site mais répondent mal aux messages : garages, instituts de beauté, salles de sport, auto-écoles, artisans |

**Méthode** : remplis `entreprise.yaml` avec les vraies infos d'un commerce, fais-lui une démo
sur ton téléphone, et offre-lui le premier mois.

## Prochaines améliorations (à coder ensemble)
- Envoyer un email ou un SMS au commerçant à chaque nouveau prospect
- Un tableau de bord des prospects et des questions les plus posées (argument de renouvellement)
- Plusieurs clients sur un seul serveur
