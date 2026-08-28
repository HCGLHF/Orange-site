import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.dirname(
  fileURLToPath(new URL("../package.json", import.meta.url))
);

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(absolute);
      return /\.(?:js|mjs|ts|tsx)$/.test(entry.name) ? [absolute] : [];
    })
  );
  return nested.flat();
}

function selfClosingTags(source, tagName) {
  return [...source.matchAll(new RegExp(`<${tagName}\\b[^>]*?\\/>`, "g"))].map(
    (match) => match[0]
  );
}

function hasEnabledPriorityProp(tag) {
  return /(?:^|\s)priority\b(?:\s*=\s*\{\s*true\s*\}(?=\s|\/>)|(?!\s*=)(?=\s|\/>))/.test(
    tag
  );
}

function parseTsx(source) {
  return ts.createSourceFile(
    "contract.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
}

function unwrappedExpression(expression) {
  let current = expression;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isNonNullExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function importModulePath(statement) {
  return ts.isImportDeclaration(statement) &&
    ts.isStringLiteralLike(statement.moduleSpecifier)
    ? statement.moduleSpecifier.text
    : undefined;
}

function isValueImport(statement) {
  const clause = statement.importClause;
  if (!clause) return true;
  if (clause.isTypeOnly) return false;
  if (clause.name) return true;
  if (!clause.namedBindings) return false;
  if (ts.isNamespaceImport(clause.namedBindings)) return true;
  return clause.namedBindings.elements.some((specifier) => !specifier.isTypeOnly);
}

function assertNoStaticValueImport(sourceFile, modulePath) {
  const staticValueImport = sourceFile.statements.find(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      importModulePath(statement) === modulePath &&
      isValueImport(statement)
  );
  assert.ok(!staticValueImport, `static value import remains for ${modulePath}`);
}

function defaultImportBinding(sourceFile, modulePath) {
  const declaration = sourceFile.statements.find(
    (statement) =>
      ts.isImportDeclaration(statement) &&
      importModulePath(statement) === modulePath &&
      statement.importClause?.name &&
      !statement.importClause.isTypeOnly
  );
  return declaration?.importClause?.name.text;
}

function topLevelConstDeclaration(sourceFile, binding) {
  for (const statement of sourceFile.statements) {
    if (
      !ts.isVariableStatement(statement) ||
      (statement.declarationList.flags & ts.NodeFlags.Const) === 0
    ) {
      continue;
    }
    const declaration = statement.declarationList.declarations.find(
      (candidate) =>
        ts.isIdentifier(candidate.name) && candidate.name.text === binding
    );
    if (declaration) return declaration;
  }
  return undefined;
}

function isExactDynamicImport(expression, modulePath) {
  const candidate = unwrappedExpression(expression);
  return (
    ts.isCallExpression(candidate) &&
    candidate.expression.kind === ts.SyntaxKind.ImportKeyword &&
    candidate.arguments.length === 1 &&
    ts.isStringLiteralLike(candidate.arguments[0]) &&
    candidate.arguments[0].text === modulePath
  );
}

function callbackSelectsExport(callback, exportName) {
  const candidate = unwrappedExpression(callback);
  if (!ts.isArrowFunction(candidate) && !ts.isFunctionExpression(candidate)) {
    return false;
  }
  const parameterNames = new Set(
    candidate.parameters
      .filter((parameter) => ts.isIdentifier(parameter.name))
      .map((parameter) => parameter.name.text)
  );
  const isSelection = (expression) => {
    const value = unwrappedExpression(expression);
    return (
      ts.isPropertyAccessExpression(value) &&
      value.name.text === exportName &&
      ts.isIdentifier(unwrappedExpression(value.expression)) &&
      parameterNames.has(unwrappedExpression(value.expression).text)
    );
  };

  if (!ts.isBlock(candidate.body)) return isSelection(candidate.body);

  let found = false;
  const visit = (node) => {
    if (ts.isReturnStatement(node) && node.expression && isSelection(node.expression)) {
      found = true;
      return;
    }
    if (node !== candidate.body && (ts.isArrowFunction(node) || ts.isFunctionExpression(node))) {
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(candidate.body);
  return found;
}

function loaderReturnExpression(loader) {
  const candidate = unwrappedExpression(loader);
  if (!ts.isArrowFunction(candidate) && !ts.isFunctionExpression(candidate)) {
    return undefined;
  }
  if (!ts.isBlock(candidate.body)) return unwrappedExpression(candidate.body);
  if (candidate.body.statements.length !== 1) return undefined;
  const [statement] = candidate.body.statements;
  return ts.isReturnStatement(statement) && statement.expression
    ? unwrappedExpression(statement.expression)
    : undefined;
}

function isExactModalImportChain(expression, modulePath, exportName) {
  const candidate = unwrappedExpression(expression);
  return (
    ts.isCallExpression(candidate) &&
    ts.isPropertyAccessExpression(candidate.expression) &&
    candidate.expression.name.text === "then" &&
    isExactDynamicImport(candidate.expression.expression, modulePath) &&
    candidate.arguments.length === 1 &&
    callbackSelectsExport(candidate.arguments[0], exportName)
  );
}

function assertLazyDynamicComponent(
  sourceFile,
  binding,
  modulePath,
  exportName,
  loadingComponent
) {
  const dynamicBinding = defaultImportBinding(sourceFile, "next/dynamic");
  assert.ok(dynamicBinding, "a default dynamic import from next/dynamic is required");

  const declaration = topLevelConstDeclaration(sourceFile, binding);
  assert.ok(declaration, `a top-level const ${binding} = dynamic(...) is required`);

  const initializer = declaration.initializer && unwrappedExpression(declaration.initializer);
  assert.ok(
    initializer &&
      ts.isCallExpression(initializer) &&
      ts.isIdentifier(initializer.expression) &&
      initializer.expression.text === dynamicBinding,
    `${binding} must call the imported dynamic binding`
  );
  const loader = initializer.arguments[0];
  assert.ok(loader, `${binding} needs a dynamic loader`);
  const returnedExpression = loaderReturnExpression(loader);
  assert.ok(returnedExpression, `${binding} loader must return one expression`);
  assert.ok(
    exportName
      ? isExactModalImportChain(returnedExpression, modulePath, exportName)
      : isExactDynamicImport(returnedExpression, modulePath),
    exportName
      ? `${binding} loader must return ${modulePath}.then(...${exportName}...)`
      : `${binding} loader must return import(${modulePath})`
  );

  const config = initializer.arguments[1] && unwrappedExpression(initializer.arguments[1]);
  assert.ok(
    config && ts.isObjectLiteralExpression(config),
    `${binding} needs an options object as dynamic()'s second argument`
  );
  const ssr = config.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) &&
      ((ts.isIdentifier(property.name) && property.name.text === "ssr") ||
        (ts.isStringLiteralLike(property.name) && property.name.text === "ssr"))
  );
  assert.ok(
    ssr && ssr.initializer.kind === ts.SyntaxKind.FalseKeyword,
    `${binding} dynamic options must set ssr: false`
  );

  if (loadingComponent) {
    const loading = config.properties.find(
      (property) =>
        ts.isPropertyAssignment(property) &&
        ((ts.isIdentifier(property.name) && property.name.text === "loading") ||
          (ts.isStringLiteralLike(property.name) && property.name.text === "loading"))
    );
    assert.ok(
      loading &&
        ts.isIdentifier(unwrappedExpression(loading.initializer)) &&
        unwrappedExpression(loading.initializer).text === loadingComponent,
      `${binding} dynamic options must set loading: ${loadingComponent}`
    );
  }
}

function assertRetryableModalFactory(sourceFile) {
  const dynamicBinding = defaultImportBinding(sourceFile, "next/dynamic");
  const factory = sourceFile.statements.find(
    (statement) =>
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === "createRetryableInquiryModal"
  );
  assert.ok(factory?.body, "a module-level retryable InquiryModal factory is required");
  assert.equal(factory.body.statements.length, 1, "retryable modal factory must have one return");
  const [statement] = factory.body.statements;
  assert.ok(
    ts.isReturnStatement(statement) && statement.expression,
    "retryable modal factory must return dynamic(...)"
  );
  const initializer = unwrappedExpression(statement.expression);
  assert.ok(
    ts.isCallExpression(initializer) &&
      ts.isIdentifier(initializer.expression) &&
      initializer.expression.text === dynamicBinding,
    "retryable modal factory must call the imported dynamic binding"
  );
  const returnedExpression = loaderReturnExpression(initializer.arguments[0]);
  assert.ok(
    returnedExpression &&
      isExactModalImportChain(
        returnedExpression,
        "@/components/ui/InquiryModal",
        "InquiryModal"
      ),
    "retryable modal factory must use the exact InquiryModal dynamic loader"
  );
  const config = unwrappedExpression(initializer.arguments[1]);
  assert.ok(config && ts.isObjectLiteralExpression(config));
  const propertyByName = (name) =>
    config.properties.find(
      (property) =>
        ts.isPropertyAssignment(property) &&
        ((ts.isIdentifier(property.name) && property.name.text === name) ||
          (ts.isStringLiteralLike(property.name) && property.name.text === name))
    );
  const ssr = propertyByName("ssr");
  const loading = propertyByName("loading");
  assert.ok(ssr?.initializer.kind === ts.SyntaxKind.FalseKeyword);
  assert.ok(
    loading &&
      ts.isIdentifier(unwrappedExpression(loading.initializer)) &&
      unwrappedExpression(loading.initializer).text === "InquiryModalLoading",
    "retryable modal factory must set loading: InquiryModalLoading"
  );
}

function assertActiveModalStartsWithLazyBinding(sourceFile) {
  let found = false;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isArrayBindingPattern(node.name)) {
      const [activeBinding] = node.name.elements;
      const initializer = node.initializer && unwrappedExpression(node.initializer);
      if (
        activeBinding &&
        ts.isBindingElement(activeBinding) &&
        ts.isIdentifier(activeBinding.name) &&
        activeBinding.name.text === "ActiveInquiryModal" &&
        initializer &&
        ts.isCallExpression(initializer) &&
        initializer.arguments.length === 1
      ) {
        const initialComponent = loaderReturnExpression(initializer.arguments[0]);
        found = Boolean(
          initialComponent &&
            ts.isIdentifier(initialComponent) &&
            initialComponent.text === "InquiryModal"
        );
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  assert.ok(found, "ActiveInquiryModal must start from the lazy InquiryModal binding");
}

function assertRetryableInquiryBarFactory(sourceFile) {
  const dynamicBinding = defaultImportBinding(sourceFile, "next/dynamic");
  const factory = sourceFile.statements.find(
    (statement) =>
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === "createRetryableInquiryBar"
  );
  assert.ok(factory?.body, "a module-level retryable InquiryBar factory is required");
  assert.equal(factory.body.statements.length, 1, "retryable InquiryBar factory must have one return");
  const [statement] = factory.body.statements;
  assert.ok(
    ts.isReturnStatement(statement) && statement.expression,
    "retryable InquiryBar factory must return dynamic(...)"
  );
  const initializer = unwrappedExpression(statement.expression);
  assert.ok(
    ts.isCallExpression(initializer) &&
      ts.isIdentifier(initializer.expression) &&
      initializer.expression.text === dynamicBinding,
    "retryable InquiryBar factory must call the imported dynamic binding"
  );
  const returnedExpression = loaderReturnExpression(initializer.arguments[0]);
  assert.ok(
    returnedExpression &&
      isExactModalImportChain(
        returnedExpression,
        "@/components/InquiryBar",
        "InquiryBar"
      ),
    "retryable InquiryBar factory must use the exact InquiryBar dynamic loader"
  );
  const config = unwrappedExpression(initializer.arguments[1]);
  assert.ok(config && ts.isObjectLiteralExpression(config));
  const propertyByName = (name) =>
    config.properties.find(
      (property) =>
        ts.isPropertyAssignment(property) &&
        ((ts.isIdentifier(property.name) && property.name.text === name) ||
          (ts.isStringLiteralLike(property.name) && property.name.text === name))
    );
  const ssr = propertyByName("ssr");
  const loading = propertyByName("loading");
  assert.ok(ssr?.initializer.kind === ts.SyntaxKind.FalseKeyword);
  assert.ok(
    loading &&
      ts.isIdentifier(unwrappedExpression(loading.initializer)) &&
      unwrappedExpression(loading.initializer).text === "InquiryBarLoading",
    "retryable InquiryBar factory must set loading: InquiryBarLoading"
  );
}

function assertActiveInquiryBarStartsWithLazyBinding(sourceFile) {
  let found = false;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isArrayBindingPattern(node.name)) {
      const [activeBinding] = node.name.elements;
      const initializer = node.initializer && unwrappedExpression(node.initializer);
      if (
        activeBinding &&
        ts.isBindingElement(activeBinding) &&
        ts.isIdentifier(activeBinding.name) &&
        activeBinding.name.text === "ActiveInquiryBar" &&
        initializer &&
        ts.isCallExpression(initializer) &&
        initializer.arguments.length === 1
      ) {
        const initialComponent = loaderReturnExpression(initializer.arguments[0]);
        found = Boolean(
          initialComponent &&
            ts.isIdentifier(initialComponent) &&
            initialComponent.text === "InquiryBar"
        );
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  assert.ok(found, "ActiveInquiryBar must start from the lazy InquiryBar binding");
}

function hasDirectivePrologue(sourceFile, directive) {
  for (const statement of sourceFile.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isStringLiteral(statement.expression)) {
      return false;
    }
    if (statement.expression.text === directive) return true;
  }
  return false;
}

function jsxReferences(sourceFile, binding) {
  const references = [];
  const visit = (node, conditionalBranches) => {
    if (ts.isConditionalExpression(node)) {
      visit(node.condition, conditionalBranches);
      visit(node.whenTrue, [
        ...conditionalBranches,
        { conditional: node, branch: "true" },
      ]);
      visit(node.whenFalse, [
        ...conditionalBranches,
        { conditional: node, branch: "false" },
      ]);
      return;
    }

    const tagName = ts.isJsxSelfClosingElement(node)
      ? node.tagName
      : ts.isJsxOpeningElement(node)
        ? node.tagName
        : undefined;
    if (tagName && ts.isIdentifier(tagName) && tagName.text === binding) {
      references.push({ conditionalBranches });
    }
    ts.forEachChild(node, (child) => visit(child, conditionalBranches));
  };
  visit(sourceFile, []);
  return references;
}

function isNullExpression(expression) {
  return unwrappedExpression(expression).kind === ts.SyntaxKind.NullKeyword;
}

function isOpenTrueNullGate(context) {
  const condition = unwrappedExpression(context.conditional.condition);
  return (
    context.branch === "true" &&
    ts.isIdentifier(condition) &&
    condition.text === "open" &&
    isNullExpression(context.conditional.whenFalse)
  );
}

function isStickyTrueNullGate(context) {
  const condition = unwrappedExpression(context.conditional.condition);
  return (
    context.branch === "true" &&
    ts.isBinaryExpression(condition) &&
    condition.operatorToken.kind === ts.SyntaxKind.GreaterThanToken &&
    ts.isIdentifier(unwrappedExpression(condition.left)) &&
    unwrappedExpression(condition.left).text === "totalCount" &&
    ts.isNumericLiteral(unwrappedExpression(condition.right)) &&
    unwrappedExpression(condition.right).text === "0" &&
    isNullExpression(context.conditional.whenFalse)
  );
}

function isShouldLoadTrueNullGate(context) {
  const condition = unwrappedExpression(context.conditional.condition);
  return (
    context.branch === "true" &&
    ts.isIdentifier(condition) &&
    condition.text === "shouldLoad" &&
    isNullExpression(context.conditional.whenFalse)
  );
}

function assertUniqueConditionalRender(sourceFile, binding, isRequiredGate) {
  const references = jsxReferences(sourceFile, binding);
  assert.equal(references.length, 1, `${binding} must have exactly one JSX render`);
  assert.ok(
    references[0].conditionalBranches.some(isRequiredGate),
    `${binding} must render in the required true branch with a null fallback`
  );
}

function assertContactCardStaysServerRendered(contactCard) {
  const sourceFile = parseTsx(contactCard);
  assert.equal(
    hasDirectivePrologue(sourceFile, "use client"),
    false,
    "ContactCard must not be a client component"
  );
  assert.doesNotMatch(contactCard, /framer-motion|motion\.|useReducedMotion/);
}

function assertInquiryModalStaysLazy(inquiryProvider) {
  const sourceFile = parseTsx(inquiryProvider);
  assertNoStaticValueImport(sourceFile, "@/components/ui/InquiryModal");
  assertLazyDynamicComponent(
    sourceFile,
    "InquiryModal",
    "@/components/ui/InquiryModal",
    "InquiryModal",
    "InquiryModalLoading"
  );
  assertRetryableModalFactory(sourceFile);
  assertActiveModalStartsWithLazyBinding(sourceFile);
  assertUniqueConditionalRender(sourceFile, "ActiveInquiryModal", isOpenTrueNullGate);
}

function assertStickyInquiryBarStaysLazy(stickyGate) {
  const sourceFile = parseTsx(stickyGate);
  assertNoStaticValueImport(sourceFile, "@/components/StickyInquiryBar");
  assertLazyDynamicComponent(
    sourceFile,
    "StickyInquiryBar",
    "@/components/StickyInquiryBar"
  );
  assertUniqueConditionalRender(
    sourceFile,
    "StickyInquiryBar",
    isStickyTrueNullGate
  );
}

function assertBatchInquiryBarStaysLazy(inquiryProvider, deferredHost) {
  const providerSource = parseTsx(inquiryProvider);
  const hostSource = parseTsx(deferredHost);
  assertNoStaticValueImport(providerSource, "@/components/InquiryBar");
  assertNoStaticValueImport(hostSource, "@/components/InquiryBar");
  assertLazyDynamicComponent(
    hostSource,
    "InquiryBar",
    "@/components/InquiryBar",
    "InquiryBar",
    "InquiryBarLoading"
  );
  assertRetryableInquiryBarFactory(hostSource);
  assertActiveInquiryBarStartsWithLazyBinding(hostSource);
  assertUniqueConditionalRender(
    hostSource,
    "ActiveInquiryBar",
    isShouldLoadTrueNullGate
  );
}

test("critical Hero images use one media-qualified mobile AVIF without losing the desktop fallback", async () => {
  const responsiveHeroPath = path.join(
    root,
    "components/media/ResponsivePriorityHeroImage.tsx"
  );
  assert.ok(
    existsSync(responsiveHeroPath),
    "ResponsivePriorityHeroImage must exist before mobile renditions are wired"
  );

  const assets = [
    "public/images/finished-fabrics/finished-double-knit-factory-mobile.avif",
    "public/images/company/about-circular-knitting-floor-mobile.avif",
    "public/images/finished-fabrics/double-knit-interlock-comparison-mobile.avif",
  ];
  for (const asset of assets) {
    const absolute = path.join(root, asset);
    assert.ok(existsSync(absolute), `${asset} must exist`);
    const info = await stat(absolute);
    assert.ok(info.size <= 25_600, `${asset} exceeds 25,600 bytes`);
    const header = await readFile(absolute);
    assert.equal(
      header.subarray(4, 12).toString("ascii"),
      "ftypavif",
      `${asset} must be an AVIF file`
    );
  }

  const [config, responsiveHero, landingHero, aboutPage, landingContent] =
    await Promise.all([
      source("next.config.mjs"),
      readFile(responsiveHeroPath, "utf8"),
      source("components/landing/LandingHero.tsx"),
      source("components/company/AboutPage.tsx"),
      source("content/landing-pages.ts"),
    ]);

  assert.doesNotMatch(config, /unoptimized\s*:\s*true/);
  assert.match(responsiveHero, /getImageProps/);
  assert.match(responsiveHero, /<picture>/);
  assert.match(responsiveHero, /media=["']\(max-width: 767px\)["']/);
  assert.match(responsiveHero, /media=["']\(min-width: 768px\)["']/);
  assert.match(responsiveHero, /type=["']image\/avif["']/);
  assert.match(responsiveHero, /imageSrcSet=/);
  assert.match(responsiveHero, /imageSizes=/);
  assert.match(responsiveHero, /fetchPriority=["']high["']/);
  assert.match(responsiveHero, /<img\s+\{\.\.\.props\}\s+alt=\{alt\}\s*\/>/);
  assert.match(landingHero, /ResponsivePriorityHeroImage/);
  assert.match(aboutPage, /ResponsivePriorityHeroImage/);
  assert.match(aboutPage, /about-circular-knitting-floor-mobile\.avif/);
  assert.match(
    landingContent,
    /home:\s*\{[\s\S]*?finished-double-knit-factory-mobile\.avif[\s\S]*?decoding:\s*["']async["']/
  );
  assert.match(
    landingContent,
    /readyStock:\s*\{[\s\S]*?double-knit-interlock-comparison-mobile\.avif[\s\S]*?decoding:\s*["']sync["']/
  );
});

test("initial-shell and above-the-fold secondary links do not auto-prefetch", async () => {
  const files = [
    "components/landing/LandingHero.tsx",
    "components/finished-fabric/FinishedFabricPage.tsx",
    "components/ui/Navbar.tsx",
    "components/ui/DesktopNavigation.tsx",
    "components/ui/MobileNavigationDrawer.tsx",
    "components/ui/BottomNav.tsx",
    "components/ui/SiteFooter.tsx",
    "components/analytics/AnalyticsConsentBanner.tsx",
  ];

  for (const file of files) {
    const text = await source(file);
    const linkCount = (text.match(/<Link\b/g) ?? []).length;
    const noPrefetchCount = (text.match(/\bprefetch=\{false\}/g) ?? []).length;
    assert.ok(linkCount > 0, `${file} must contain at least one Next Link`);
    assert.equal(
      noPrefetchCount,
      linkCount,
      `${file} contains an auto-prefetching Link`
    );
  }
});

test("the current application ships no video code or video URL", async () => {
  const files = (
    await Promise.all(
      ["app", "components", "lib"].map((directory) =>
        sourceFiles(path.join(root, directory))
      )
    )
  ).flat();
  const prohibited =
    /<video\b|HTMLVideoElement|HTMLMediaElement|requestVideoFrameCallback|\.(?:mp4|webm|m3u8)(?:[?"'`]|$)/i;

  for (const file of files) {
    assert.doesNotMatch(
      await readFile(file, "utf8"),
      prohibited,
      path.relative(root, file)
    );
  }
});

test("below-the-fold contact content stays out of initial client JS", async () => {
  const contactCard = await source("components/ContactCard.tsx");

  assertContactCardStaysServerRendered(contactCard);
});

test("inquiry modal loads from a lazy client-only chunk", async () => {
  const inquiryProvider = await source("components/InquiryProvider.tsx");

  assertInquiryModalStaysLazy(inquiryProvider);
});

test("deferred sticky inquiry bar loads from a lazy client-only chunk", async () => {
  const stickyGate = await source(
    "components/DeferredStickyInquiryBar.tsx"
  );

  assertStickyInquiryBarStaysLazy(stickyGate);
});

test("global batch inquiry overlay loads from a deferred lazy client-only chunk", async () => {
  const [inquiryProvider, deferredHost] = await Promise.all([
    source("components/InquiryProvider.tsx"),
    source("components/DeferredInquiryBarHost.tsx"),
  ]);

  assertBatchInquiryBarStaysLazy(inquiryProvider, deferredHost);
});

test("below-the-fold contact and inquiry overlays stay out of initial client JS", async () => {
  const [contactCard, inquiryProvider, deferredHost, stickyGate] = await Promise.all([
    source("components/ContactCard.tsx"),
    source("components/InquiryProvider.tsx"),
    source("components/DeferredInquiryBarHost.tsx"),
    source("components/DeferredStickyInquiryBar.tsx"),
  ]);

  assertContactCardStaysServerRendered(contactCard);
  assertInquiryModalStaysLazy(inquiryProvider);
  assertBatchInquiryBarStaysLazy(inquiryProvider, deferredHost);
  assertStickyInquiryBarStaysLazy(stickyGate);
});
