# Security

> **This page has moved.** The canonical vulnerability-reporting policy — supported versions,
> how to report, vulnerability classes, severity, and response timelines — now lives in the
> repository root [`SECURITY.md`](../SECURITY.md).

## SDK trust model

For integrator-facing trust boundaries, Freighter signing assumptions, and what the SDK
does **not** guarantee, see the **[SDK Trust Model](./sdk-trust-model.md)**. This is the
primary security narrative for `@iln/sdk` / `@invoice-liquidity/sdk` and is linked from
root [`SECURITY.md`](../SECURITY.md), the [SCF Technical Narrative](./scf-technical-narrative.md),
and (by design) the frontend and smart-contract repos' `SECURITY.md` files.

For broader security practices (integrator guidance, node-operator hardening, package
provenance verification, audit information, and general incident response), see the
[Security Guide](./security-guide.md).

For operational incident handling procedures across SDK, indexer, oracle, and notifications services, see the
[Incident Response Runbook](./incident-response.md).

For the protocol-level attack surface analysis, see the [Threat Model](./threat-model.md).

For the reporter-facing introduction to disclosure, see the
[Vulnerability Disclosure Policy](./vulnerability-disclosure.md).

This stub is kept so existing links to `docs/security.md` continue to resolve.
