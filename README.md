# Dead River Management

Business repo. Claude Code skills, hooks and references live under `.claude/` and load automatically in every session here.

## graphify

Locally, run `uv tool install graphifyy` once (or `pipx install graphifyy`).
Then `/graphify .` in Claude Code builds the knowledge graph.

## OmniRoute (local AI gateway)

Run `scripts/omniroute-up.sh` once with `ANTHROPIC_API_KEY` exported. It installs `omniroute` if missing, starts the gateway on port 20128, registers the Anthropic provider, and creates a priority combo named `default`.

Then `omniroute launch` starts Claude Code pointed at the gateway. A plain `claude` still uses the normal login.

Model ids must be `provider/model` (for example `anthropic/claude-opus-5`) or a combo name (for example `default`).

- [`tools/typesafe-lead-triage/`](tools/typesafe-lead-triage/) — TypeSafe lead triage lab (lab only, not production wiring).
- [`tools/instantly-reply-classify/`](tools/instantly-reply-classify/) — Instantly reply classify (classify only; no Instantly API mutations).
