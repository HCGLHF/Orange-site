# Landing Page Content Review Entry

Do not edit the React components to revise the core landing-page message. The manual content entry is:

- `content/landing-pages.ts`

The file contains four records:

| Record | Public route | Buyer decision |
| --- | --- | --- |
| `home` | `/` | Understand the factory and choose a sourcing route |
| `readyStock` | `/ready-stock-knit-fabrics` | Review articles currently marked in stock |
| `finishedDoubleKnit` | `/finished-double-knit-fabrics` | Select a finished double-knit construction direction |
| `customDevelopment` | `/custom-knit-fabric-development` | Prepare a sample and development brief |

## Fields to review

1. `headline`: the one promise the buyer should understand first.
2. `summary`: who the page is for, what O'range Textile can support, and the next decision.
3. `proofPoints`: only publish facts that can be supported by a current document or operating process.
4. `advantages`: explain the commercial difference without slogans or unsupported superlatives.
5. `checklist`: list the information a buyer must provide or confirm.
6. `process`: describe the real sales and sampling workflow.
7. `faq`: answer objections that the sales team receives repeatedly.
8. `editorNotes`: private review guidance. These notes never render publicly.

## Evidence rules

- Do not add customer names, market claims, certificates, testing claims, fixed MOQ, fixed lead time or dispatch promises without publishable evidence.
- Treat machine counts as capacity evidence, not proof of an individual fabric's performance.
- Keep stock quantity, colour availability and dispatch timing conditional on the current quotation.
- After editing, run `npm.cmd test`, `npm.cmd run lint` and `npm.cmd run build` before requesting merge.
