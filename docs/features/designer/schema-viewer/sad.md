---
status: Draft
owner: 'Oleksandr Vorovchenko'
reviewers: ['Tech Lead', 'Security Lead']
updated_at: '2026-08-28'
feature_size: '<TBD by sdlc:classify-size>'
stage: '04-05'
ticket: '<TBD>'
target_surfaces: [backend-service, web-frontend]
---

# Software Architecture Document — designer/schema-viewer

> **Split note (2026-08-28):** extracted from the original `custom-forms` sad.md. See [designer overview](../sad.md) for the parent Designer context, constraints, and ADRs.

## 1. Introduction and goals

Creator/Admin browse and view existing forms schemas and templates via a fixed, built-in list + detail view.

## 5. Building block view

**Frontend:** `client/apps/designer/src/app/form-list/` — existing, extended to also list templates (AC-11).

## 6. Runtime view

**Flow: Browse schemas and templates list (US-05)**

```mermaid
sequenceDiagram
    actor Creator as Creator or Admin
    participant Web
    participant API
    participant DB
    Creator->>Web: opens schemas/templates browser
    Web->>API: list schemas and templates
    API->>DB: read schema and template design metadata only
    DB-->>API: schema and template rows, entries marked as template or not
    Note over API,DB: list never includes forms_data rows (AC-12)
    API-->>Web: combined list
    Web-->>Creator: list shown
```

**Flow: View a single schema or template (US-06)**

```mermaid
sequenceDiagram
    actor Creator as Creator or Admin
    participant Web
    participant API
    participant DB
    Creator->>Web: opens one schema or template from the list
    Web->>API: get schema or template by id
    API->>DB: read schema or template row
    DB-->>API: full field and layout definition
    API-->>Web: definition
    Web-->>Creator: shown
```

## 9. Architecture decisions

See [designer overview](../sad.md) §9 (ADR-0001, ADR-0002).

## Related

- [designer overview](../sad.md)
