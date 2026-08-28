---
status: Living
updated_at: "2026-08-05"
---

# Domain Context — custom-forms

## Glossary

- Admin — роль custom-forms з повним доступом до Designer і Runtime, плюс адміністрування користувачів (керування акаунтами/ролями).
- Creator — роль custom-forms з повним доступом до Designer та Runtime, без прав адміністрування користувачами.
- Designer — no-code додаток custom-forms MVP, де технічний спеціаліст збирає форму/сторінку з curated бібліотеки компонентів, зберігаючи результат як config. NOT візуальний/graphic UI designer (роль), і NOT architecture design (SAD).
- forms data — конкретний екземпляр значень, введених певним User-ом в опубліковану forms schema (напр. Alice подала Name/Email/Phone через Contact Form); зберігається окремо від forms schema, так щоб User бачив саме свої дані при наступному вході. NOT forms schema (див. нижче).
- forms schema — визначення форми/сторінки на основі JSON Schema (поля та їхнє розташування), яке Creator збирає в Designer (напр. Contact Form: Name/Email/Phone на канвасі). NOT forms data — forms data це фактичні значення, які User вводить у опубліковану сторінку; forms schema — це порожня форма/визначення, куди ці значення потрапляють.
- Runtime — частина системи custom-forms, яка рендерить екран/форму з config, збереженого в Designer, динамічно інстанціюючи Angular-компоненти. NOT загальний технічний термін "runtime" (напр. Node runtime, browser runtime).
- template — іменована, придатна для повторного використання копія forms schema, яку Creator або Admin явно зберігає; створення нового екрану з template попередньо заповнює поля/layout як відправну точку, без зв'язку з оригінальним екраном. NOT forms schema — forms schema належить одному конкретному екрану; template — окрема, повторно використовувана сутність, з якої можна створити багато екранів.
- User — роль custom-forms, обмежена тільки Runtime, без доступу до Designer чи адміністрування. NOT загальний термін "користувач" як будь-яка людина, що взаємодіє з системою.
