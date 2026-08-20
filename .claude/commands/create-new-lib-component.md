---
description: Scaffold a new UI component in client/libs/ui following the button/input/select convention
---

Scaffold a new component in `client/libs/ui/src/lib/` named `$1`. If `$1` is empty, ask the user for a component name before doing anything else.

Derive names from `$1`:

- `kebab-name` — kebab-case (e.g. `text-area`)
- `PascalName` — PascalCase, no `Component` suffix (e.g. `TextArea`)
- `Title Name` — Title Case with spaces, for the Storybook title (e.g. `Text Area`)

Before creating anything, read `client/libs/ui/src/lib/button/button.ts`, `button.html`, `button.scss`, `button.spec.ts`, and `button.stories.ts` as the reference pattern for this library (also check `input/` and `select/` for variation). Match their conventions exactly:

- Standalone Angular component, class named `PascalName` (no `Component` suffix)
- Selector `lib-kebab-name`
- `changeDetection: ChangeDetectionStrategy.OnPush`
- Signal-based `input()` / `output()` APIs, not `@Input()`/`@Output()` decorators
- Separate `.html` template and `.scss` styles files (no inline template/styles)
- `.scss` uses the existing design tokens (`var(--cf-*)`) — check `client/libs/ui/src/styles/_tokens.scss` for available tokens, don't invent new ones
- `.spec.ts` uses `TestBed` + Vitest (`vi.fn()`), following the button/input/select spec structure
- `.stories.ts` uses `@storybook/angular` `Meta`/`StoryObj`, title `UI/Title Name`, `argsToTemplate`
- add barrel `index.ts` with component class export: `export * from 'kebab-name.ts'`

Create these 6 files under `client/libs/ui/src/lib/kebab-name/`:

- `kebab-name.ts`
- `kebab-name.html`
- `kebab-name.scss`
- `kebab-name.spec.ts`
- `kebab-name.stories.ts`
- `index.ts`

Keep the component minimal — a small number of sensible inputs/outputs for a component of this kind, not a fully-featured implementation. Ask the user if the required inputs/outputs aren't obvious from the name.

Add `export * from './lib/kebab-name/kebab-name';` to `client/libs/ui/src/index.ts`, in the same alphabetical/existing order as the other exports.

**Register the new component in the Designer's component kit.** The designer's palette does not import components from `client/libs/ui` — it renders native HTML stubs from its own type list, so a new lib component is invisible to creators until it's added by hand in three places:

- `client/apps/designer/src/app/form-schema.types.ts` — add `'kebab-name'` to the `ComponentType` union; check whether `XUi.component` and the `componentsToSchema` branching (it special-cases types like `select`'s `enum: []`) need a case for this component's own config quirks.
- `client/apps/designer/src/app/form-editor/component-palette/component-palette.ts` — add a `PaletteItem` entry (`type`, `label`, `icon`) to `paletteItems`, matching the existing entries' style.
- `client/apps/designer/src/app/form-editor/canvas/canvas.html` — add a `@case ('kebab-name')` to the `@switch (comp.type)` block with a stub preview consistent with the other cases.

Ask the user before registering if it's not obvious the new component belongs in the form-building palette (e.g. a purely presentational component with no form-field semantics).

After scaffolding and registering, run `nx test ui` and `nx run ui:eslint:lint` to confirm the new component passes, and `nx run designer:eslint:lint` if the designer files were touched.
