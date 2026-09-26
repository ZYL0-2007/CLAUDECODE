# 🚀 Cockpit : ton dashboard de vie

Un écran façon cockpit de vaisseau à laisser ouvert sur un 2e écran ou une tablette.

- 🕒 Grande horloge et salutation personnalisée
- 🎙️ **Briefing IA vocal** (touche `B`) : l'IA analyse ta journée (météo, objectifs, habitudes, budget) et te la résume à voix haute, façon JARVIS
- 🌦️ Météo en direct et sur 5 jours (Open-Meteo, gratuit et sans clé)
- ✅ Objectifs du jour avec anneau de progression
- 🔥 Habitudes sur 7 jours avec séries (streaks)
- 💸 Budget du mois : reste à dépenser, moyenne par jour, dernières dépenses
- 🎯 Timer focus (pomodoro) : `Espace` pour démarrer ou mettre en pause
- ⛶ Plein écran (touche `F`) et fond étoilé animé

Tes données restent dans ton navigateur (localStorage).

## Lancer
```bash
cd cockpit
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...   # optionnel : sans clé, le briefing est généré localement
uvicorn server:app --reload
```
Ouvre http://localhost:8000. Au premier lancement, entre ton prénom, ta ville et ton budget.

**Sur ta tablette ou ton téléphone** (même Wi-Fi) : lance `uvicorn server:app --host 0.0.0.0`, puis ouvre `http://IP-DE-TON-PC:8000`.

## Idées pour la suite
- Brancher Google Agenda et Gmail (événements du jour, mails importants dans le briefing)
- Briefing automatique à l'heure du réveil
- Commande vocale (« Cockpit, ajoute un objectif… »)
- Graphiques de tes habitudes et dépenses sur le mois
