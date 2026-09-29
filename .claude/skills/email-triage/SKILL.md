---
name: email-triage
description: A sorted inbox and drafts for the ones that need you. Use when the operator asks for help with managing my inbox.
---

# Email Triage · starter skill

**Category:** Back Office
**Version:** 0.1 (starter, from your SkillTree plan)
**Built for:** Helping in coaching maybe
**Replaces:** "managing my inbox" done by hand
**Part of:** SkillTree · skilltreeos.ai

## What It Does

Takes the first pass at managing my inbox so the operator approves instead of produces. It reads every new email and your priority rules, then hands back a sorted inbox and drafts for the ones that need you. Nothing goes out without a human.

## Reads before it acts

- `admin/inbox-rules.md` (starter included in this kit, fill the blanks)
- `voice.md` (how the operator writes; three real examples beat any description)
- Gmail, Outlook, Google Drive, Notion, Canva, LinkedIn, Instagram

## How to install

1. Save this file at `.claude/skills/email-triage/SKILL.md`
2. Save the starter context file at `admin/inbox-rules.md` and fill in the blanks
3. In Claude Code, say: "Use the email-triage skill on [the thing]"

## Steps

1. Read the rules file (rate card, categories, priorities or availability) before touching anything.
2. Apply the rules exactly. Where two rules conflict, stop and ask.
3. Produce the output (invoice, coded expenses, sorted inbox, proposed times) ready for one-tap approval.
4. Flag every exception in its own list with the reason.
5. Log the run with counts: handled, flagged, skipped.

## Output

A sorted inbox and drafts for the ones that need you. Delivered as a draft with a two-line summary on top: what this is, what needs a human.

## Guardrails

- Drafts only. Never send, post, invoice or book on the operator's behalf.
- Use only facts from the context files. If it is not written down, ask.
- Match the operator's voice from `voice.md`. When in doubt, shorter.
- Log every run: date, input, output, open questions.

## Upgrade

This is the starter. The library version of Email Triage carries the full playbook, worked examples, the self-logging that lights your SkillTree map, and monthly drops. It ships in the cohort and the library at skilltreeos.ai.
