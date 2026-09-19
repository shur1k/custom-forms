# Tracker — runtime

> Status of every task in the epic. `implement` updates `done` as it commits each task.
> States: `todo` · `in_progress` · `blocked` · `review` · `done`.

| #   | Task                                                      | Layer     | Owner         | Estimate | Blocked by        | Status |
| --- | --------------------------------------------------------- | --------- | ------------- | -------- | ----------------- | ------ |
| T1  | `forms_data` table + Drizzle schema                       | migration | Backend Lead  | S        | —                 | done   |
| T2  | `FormsDataService` (prefill / upsert submit / delete own) | app       | Backend Lead  | M        | T1                | done   |
| T3  | `SchemasService.findPublishedById` (AC-14 gate)           | app       | Backend Lead  | S        | —                 | done   |
| T4  | `FormsDataController` + DTOs                              | ports     | Backend Lead  | M        | T2, T3            | done   |
| T5  | Published-forms discovery endpoint (AC-30)                | ports     | Backend Lead  | S        | T3                | done   |
| T6  | `FormsDataModule` wiring                                  | wiring    | Backend Lead  | S        | T1, T2, T4        | done   |
| T7  | Backend `forms-data` tests                                | tests     | Backend Lead  | M        | T4, T5            | done   |
| T8  | Regenerate `api-client`                                   | infra     | Frontend Lead | S        | T4, T5            | done   |
| T9  | Runtime `form-list` screen (AC-30)                        | ui        | Frontend Lead | M        | T8                | done   |
| T10 | Runtime `form-viewer` renderer (AC-15/16)                 | ui        | Frontend Lead | M        | T8                | done   |
| T11 | `form-viewer` validation (AC-18)                          | ui        | Frontend Lead | M        | T10               | done   |
| T12 | `form-viewer` data wiring (AC-17/19/29)                   | ui        | Frontend Lead | M        | T11, T8           | done   |
| T13 | Runtime routing + shell wiring                            | ui        | Frontend Lead | S        | T9, T12           | done   |
| T14 | Frontend `runtime` tests                                  | tests     | Frontend Lead | M        | T9, T10, T11, T12 | done   |
| T15 | Runtime e2e (Playwright)                                  | tests     | Frontend Lead | M        | T13, T14          | done   |
| T16 | Serve published snapshot, not live draft (review finding) | app       | Backend Lead  | S        | —                 | done   |
| T17 | form-viewer render-time error boundary (review finding)   | ui        | Frontend Lead | S        | —                 | todo   |
| T18 | Strip unknown keys from submitted values (review finding) | app       | Backend Lead  | S        | —                 | todo   |
| T19 | Render Creator-configured textColor (review finding)      | ui        | Frontend Lead | S        | T17               | todo   |

**Total:** 15 tasks, ~12 person-days (6 S ≈ 0.5d + 9 M ≈ 1d). Plus 4 review follow-up tasks (T16–T19) from `_review/review-2026-09-20.md`.
