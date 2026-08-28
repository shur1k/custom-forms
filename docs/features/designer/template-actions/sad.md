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

# Software Architecture Document — designer/template-actions

> **Split note (2026-08-28):** extracted from the original `custom-forms` sad.md. See [designer overview](../sad.md) for the parent Designer context, constraints, and ADRs.

## 1. Introduction and goals

Creator/Admin save a schema as a template, start a new form from a template, and edit/delete schemas or templates.

## 4. Solution strategy

**Strategic seed:** Dedicated `templates` table (→ `docs/adr/0001-dedicated-forms-data-and-templates-tables.md`) — templates (AC-24: independent copy, no ongoing link to source) are a new entity absent from the brownfield's `schemas`/`schemas_versions` tables; a dedicated table keeps the independent-copy invariant native rather than overloading `schemas`.

## 5. Building block view

**Backend:** `server/api/src/app/templates/` — NEW (ADR-0001), named independent schema copies (AC-21/AC-24).

**Frontend:** `client/apps/designer/src/app/template-actions/` — NEW, save-as-template / create-from-template.

## 6. Runtime view

**Flow: Save a schema as a template (US-08)**

```mermaid
sequenceDiagram
    actor Creator as Creator or Admin
    participant Web
    participant API
    participant DB
    Creator->>Web: chooses save-as-template, provides a name
    Web->>API: create template from schema with name
    API->>DB: check existing template name, case-insensitive
    DB-->>API: name available or already used
    alt name available
        API->>DB: persists new template row, independent copy
        DB-->>API: ok
        API-->>Web: template saved
        Web-->>Creator: confirmation
    else name already used
        API-->>Web: duplicate-name error
        Web-->>Creator: asks for a different name
    end
```

**Flow: Create a new form from a template (US-09)**

```mermaid
sequenceDiagram
    actor Creator as Creator or Admin
    participant Web
    participant API
    participant DB
    Creator->>Web: chooses a template to start a new form
    Web->>API: create form from template id
    API->>DB: read template fields and layout
    DB-->>API: template definition
    API->>DB: persists new schema row as an independent copy, draft state
    DB-->>API: ok
    Note over API,DB: new form has no ongoing link to the source template (AC-24)
    API-->>Web: new form pre-filled
    Web-->>Creator: shown, editable
```

**Flow: Edit a schema or template (US-10)**

```mermaid
sequenceDiagram
    actor Creator as Creator or Admin
    participant Web
    participant API
    participant DB
    Creator->>Web: edits an existing schema or template, submits changes
    Web->>API: update schema or template
    alt edit removes a field from a published form
        API->>DB: check forms_data for values under the removed field's key
        DB-->>API: data exists under that field
        API-->>Web: blocked, field removal denied
        Web-->>Creator: explanation shown
    else edit only adds fields, or removed field has no recorded data
        API->>DB: persists updated schema or template row
        DB-->>API: ok
        API-->>Web: changes saved
        Web-->>Creator: confirmation
    end
```

**Flow: Delete a schema or template (US-10)**

```mermaid
sequenceDiagram
    actor Creator as Creator or Admin
    participant Web
    participant API
    participant DB
    Creator->>Web: chooses to delete a schema or template
    Web->>API: delete schema or template by id
    alt target is a template
        API->>DB: removes template row
        DB-->>API: ok
        API-->>Web: deleted
        Web-->>Creator: confirmation
    else target is a form schema with forms data recorded
        API->>DB: check forms_data for this schema
        DB-->>API: data exists
        API-->>Web: blocked, form's data must be removed first
        Web-->>Creator: explanation shown
    else target is a form schema with no forms data recorded
        API->>DB: removes schema row
        DB-->>API: ok
        API-->>Web: deleted
        Web-->>Creator: confirmation
    end
```

## 9. Architecture decisions

| #                                                                   | Title                                                  | Status   |
| ------------------------------------------------------------------- | ------------------------------------------------------ | -------- |
| [0001](../../adr/0001-dedicated-forms-data-and-templates-tables.md) | Store forms data and templates as two dedicated tables | Accepted |

## 12. Glossary

| Term     | Meaning                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------- |
| template | A named, reusable copy of a forms schema that a Creator or Admin explicitly saves. NOT forms schema. |

## Related

- [designer overview](../sad.md)
- [runtime sad.md](../../runtime/sad.md) — `forms_data` cross-module read used by the delete-blocked-by-data checks above
