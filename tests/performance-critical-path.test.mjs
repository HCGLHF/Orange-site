import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
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

function variableDeclaration(sourceFile, binding) {
  let declaration;
  const visit = (node) => {
    if (
      !declaration &&
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === binding
    ) {
      declaration = node;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return declaration;
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

function containsExactDynamicImport(node, modulePath) {
  let found = false;
  const visit = (candidate) => {
    if (isExactDynamicImport(candidate, modulePath)) {
      found = true;
      return;
    }
    ts.forEachChild(candidate, visit);
  };
  visit(node);
  return found;
}

function thenSelectsExport(node, modulePath, exportName) {
  let found = false;
  const visit = (candidate) => {
    if (
      ts.isCallExpression(candidate) &&
      ts.isPropertyAccessExpression(candidate.expression) &&
      candidate.expression.name.text === "then" &&
      isExactDynamicImport(candidate.expression.expression, modulePath) &&
      candidate.arguments.length > 0 &&
      callbackSelectsExport(candidate.arguments[0], exportName)
    ) {
      found = true;
      return;
    }
    ts.forEachChild(candidate, visit);
  };
  visit(node);
  return found;
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

function assertLazyDynamicComponent(sourceFile, binding, modulePath, exportName) {
  const dynamicBinding = defaultImportBinding(sourceFile, "next/dynamic");
  assert.ok(dynamicBinding, "a default dynamic import from next/dynamic is required");

  const declaration = variableDeclaration(sourceFile, binding);
  assert.ok(declaration, `const ${binding} = dynamic(...) is required`);
  assert.ok(
    ts.isVariableDeclarationList(declaration.parent) &&
      (declaration.parent.flags & ts.NodeFlags.Const) !== 0,
    `${binding} must use a const declaration`
  );

  const initializer = declaration.initializer && unwrappedExpression(declaration.initializer);
  assert.ok(
    initializer &&
      ts.isCallExpression(initializer) &&
      ts.isIdentifier(initializer.expression) &&
      initializer.expression.text === dynamicBinding,
    `${binding} must call the imported dynamic binding`
  );
  assert.ok(initializer.arguments[0], `${binding} needs a dynamic loader`);
  assert.ok(
    containsExactDynamicImport(initializer.arguments[0], modulePath),
    `${binding} loader must dynamically import ${modulePath}`
  );
  if (exportName) {
    assert.ok(
      thenSelectsExport(initializer.arguments[0], modulePath, exportName),
      `${binding} loader must select ${exportName} through .then(...)`
    );
  }

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

function hasOpenConditionalComponent(sourceFile, componentName) {
  let found = false;
  const visit = (node) => {
    if (
      ts.isConditionalExpression(node) &&
      ts.isIdentifier(unwrappedExpression(node.condition)) &&
      unwrappedExpression(node.condition).text === "open" &&
      containsJsxComponent(node.whenTrue, componentName)
    ) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

function containsJsxComponent(node, componentName) {
  let found = false;
  const visit = (candidate) => {
    const tagName = ts.isJsxSelfClosingElement(candidate)
      ? candidate.tagName
      : ts.isJsxOpeningElement(candidate)
        ? candidate.tagName
        : undefined;
    if (tagName && ts.isIdentifier(tagName) && tagName.text === componentName) {
      found = true;
      return;
    }
    ts.forEachChild(candidate, visit);
  };
  visit(node);
  return found;
}

function hasStickyInquiryConditional(sourceFile) {
  let found = false;
  const visit = (node) => {
    if (
      ts.isConditionalExpression(node) &&
      ts.isBinaryExpression(node.condition) &&
      node.condition.operatorToken.kind === ts.SyntaxKind.GreaterThanToken &&
      ts.isIdentifier(node.condition.left) &&
      node.condition.left.text === "totalCount" &&
      ts.isNumericLiteral(node.condition.right) &&
      node.condition.right.text === "0" &&
      containsJsxComponent(node.whenTrue, "StickyInquiryBar") &&
      unwrappedExpression(node.whenFalse).kind === ts.SyntaxKind.NullKeyword
    ) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
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
    "InquiryModal"
  );
  assert.ok(
    hasOpenConditionalComponent(sourceFile, "InquiryModal"),
    "InquiryModal must render in open's true branch"
  );
}

function assertStickyInquiryBarStaysLazy(stickyGate) {
  const sourceFile = parseTsx(stickyGate);
  assertNoStaticValueImport(sourceFile, "@/components/StickyInquiryBar");
  assertLazyDynamicComponent(
    sourceFile,
    "StickyInquiryBar",
    "@/components/StickyInquiryBar"
  );
  assert.ok(
    hasStickyInquiryConditional(sourceFile),
    "StickyInquiryBar must render only when totalCount > 0"
  );
}

test("critical Hero images use responsive delivery and the approved mobile quality", async () => {
  const [config, landingHero, aboutPage] = await Promise.all([
    source("next.config.mjs"),
    source("components/landing/LandingHero.tsx"),
    source("components/company/AboutPage.tsx"),
  ]);

  assert.doesNotMatch(config, /unoptimized\s*:\s*true/);
  for (const component of [landingHero, aboutPage]) {
    const priorityImage = selfClosingTags(component, "Image").find((tag) =>
      hasEnabledPriorityProp(tag)
    );
    assert.ok(priorityImage, "a priority Image tag is required");
    assert.ok(hasEnabledPriorityProp(priorityImage));
    assert.match(priorityImage, /\bsizes\s*=\s*["']100vw["']/);
    assert.match(priorityImage, /\bquality\s*=\s*\{\s*35\s*\}/);
  }
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
    /<video\b|<source\b|HTMLVideoElement|HTMLMediaElement|requestVideoFrameCallback|\.(?:mp4|webm|m3u8)(?:[?"'`]|$)/i;

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

test("below-the-fold contact and inquiry overlays stay out of initial client JS", async () => {
  const [contactCard, inquiryProvider, stickyGate] = await Promise.all([
    source("components/ContactCard.tsx"),
    source("components/InquiryProvider.tsx"),
    source("components/DeferredStickyInquiryBar.tsx"),
  ]);

  assertContactCardStaysServerRendered(contactCard);
  assertInquiryModalStaysLazy(inquiryProvider);
  assertStickyInquiryBarStaysLazy(stickyGate);
});
