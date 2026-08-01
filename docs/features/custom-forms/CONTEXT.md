---
status: Living
updated_at: "2026-08-01"
---

# Domain Context — custom-forms

## Glossary

- Admin — роль custom-forms з повним доступом до Designer і Runtime, плюс адміністрування користувачів (керування акаунтами/ролями).
- Creator — роль custom-forms з повним доступом до Designer та Runtime, без прав адміністрування користувачами.
- Designer — no-code додаток custom-forms MVP, де технічний спеціаліст збирає форму/сторінку з curated бібліотеки компонентів, зберігаючи результат як config. NOT візуальний/graphic UI designer (роль), і NOT architecture design (SAD).
- Runtime — частина системи custom-forms, яка рендерить екран/форму з config, збереженого в Designer, динамічно інстанціюючи Angular-компоненти. NOT загальний технічний термін "runtime" (напр. Node runtime, browser runtime).
- User — роль custom-forms, обмежена тільки Runtime, без доступу до Designer чи адміністрування. NOT загальний термін "користувач" як будь-яка людина, що взаємодіє з системою.
