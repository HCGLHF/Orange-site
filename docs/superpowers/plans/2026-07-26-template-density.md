# Orange Template Density Implementation Plan

1. Add a failing density test for the current production HTML.
2. Implement the shared HTML density inspector and package command.
3. Replace repeated navigation/footer utility strings with short component
   classes while preserving all markup and accessibility contracts.
4. Replace repeated finished-fabric template utility strings with short
   component classes.
5. Build and run the density inspector; iterate only on shared markup until the
   protected cohort reaches 0.10 or the measured approach stops producing
   material gains.
6. Run unit tests, lint, typecheck, production build, production SEO audit,
   browser checks and sensitive-information scan.
7. Record the measured before/after result, commit and push the fixed Orange
   optimization branch for review.
