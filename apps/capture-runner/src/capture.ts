import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {chromium, type Page} from 'playwright';
import {
  validateCaptureManifest,
  type CaptureElement,
  type CaptureManifest,
  type CaptureViewport,
} from '../../../adapters/product-capture/src/index';

type CaptureAction =
  | {type: 'goto'; url: string}
  | {type: 'click'; selector: string}
  | {type: 'fill'; selector: string; value: string}
  | {type: 'press'; selector: string; key: string}
  | {type: 'hover'; selector: string}
  | {type: 'waitFor'; selector: string; state?: 'attached' | 'detached' | 'visible' | 'hidden'}
  | {type: 'wait'; ms: number};

type CaptureTarget = {
  id: string;
  selector: string;
  label?: string;
  role?: string;
  safeToShow?: boolean;
};

type CaptureStateConfig = {
  id: string;
  url?: string;
  actions?: CaptureAction[];
  elements?: CaptureTarget[];
  redactSelectors?: string[];
  hideSelectors?: string[];
  waitAfterMs?: number;
};

type RunnerConfig = {
  source: string;
  outputDir?: string;
  viewport?: CaptureViewport;
  privacyReviewed: boolean;
  initialActions?: CaptureAction[];
  redactSelectors?: string[];
  hideSelectors?: string[];
  states: CaptureStateConfig[];
  notes?: string[];
  browser?: {
    headless?: boolean;
    colorScheme?: 'light' | 'dark' | 'no-preference';
    reducedMotion?: 'reduce' | 'no-preference';
  };
};

const configPath = process.argv[2];
if (!configPath) {
  console.error('Usage: npm run capture -w @imon-motion/capture-runner -- <capture-config.json>');
  process.exit(1);
}

const absoluteConfigPath = path.resolve(process.cwd(), configPath);
const config = JSON.parse(fs.readFileSync(absoluteConfigPath, 'utf8')) as RunnerConfig;

const validateUrl = (raw: string): URL => {
  const parsed = new URL(raw);
  if (!['http:', 'https:', 'file:'].includes(parsed.protocol)) {
    throw new Error(`Unsupported capture URL protocol: ${parsed.protocol}`);
  }
  return parsed;
};

const sanitizedSource = (raw: string): string => {
  const parsed = validateUrl(raw);
  parsed.username = '';
  parsed.password = '';
  parsed.search = '';
  parsed.hash = '';
  return parsed.toString();
};

const requirePrivacyReview = (value: boolean): void => {
  if (value !== true) {
    throw new Error('Capture config must set privacyReviewed=true after reviewing demo data, selectors, credentials and redactions.');
  }
};

const ensureId = (value: string, label: string): string => {
  const id = value.trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)) throw new Error(`${label} must use only letters, numbers, dot, underscore or dash: ${value}`);
  return id;
};

const runAction = async (page: Page, action: CaptureAction): Promise<void> => {
  if (action.type === 'goto') {
    await page.goto(validateUrl(action.url).toString(), {waitUntil: 'domcontentloaded'});
    return;
  }
  if (action.type === 'wait') {
    if (!Number.isFinite(action.ms) || action.ms < 0 || action.ms > 30_000) throw new Error(`Invalid wait duration: ${action.ms}`);
    await page.waitForTimeout(action.ms);
    return;
  }

  const locator = page.locator(action.selector).first();
  if (action.type === 'click') {
    await locator.click();
    return;
  }
  if (action.type === 'fill') {
    await locator.fill(action.value);
    return;
  }
  if (action.type === 'press') {
    await locator.press(action.key);
    return;
  }
  if (action.type === 'hover') {
    await locator.hover();
    return;
  }
  if (action.type === 'waitFor') {
    await locator.waitFor({state: action.state ?? 'visible'});
  }
};

const applyStyleToSelectors = async (
  page: Page,
  selectors: string[],
  mode: 'redact' | 'hide',
): Promise<void> => {
  for (const selector of [...new Set(selectors.filter(Boolean))]) {
    const locator = page.locator(selector);
    const count = await locator.count();
    if (count === 0) continue;
    await locator.evaluateAll((elements, requestedMode) => {
      for (const element of elements) {
        if (!(element instanceof HTMLElement || element instanceof SVGElement)) continue;
        const html = element as HTMLElement;
        html.dataset.imonCaptureTreatment = String(requestedMode);
        if (requestedMode === 'hide') {
          html.style.visibility = 'hidden';
        } else {
          html.style.filter = 'blur(14px)';
          html.style.userSelect = 'none';
          html.style.pointerEvents = 'none';
        }
      }
    }, mode);
  }
};

const elementGeometry = async (page: Page, target: CaptureTarget): Promise<CaptureElement> => {
  const locator = page.locator(target.selector).first();
  await locator.waitFor({state: 'attached'});
  const rect = await locator.boundingBox();
  if (!rect) throw new Error(`No visible bounding box for target ${target.id} (${target.selector})`);
  return {
    id: ensureId(target.id, 'element id'),
    label: target.label,
    role: target.role,
    safeToShow: target.safeToShow ?? true,
    rect: {
      x: Number(rect.x.toFixed(3)),
      y: Number(rect.y.toFixed(3)),
      width: Number(rect.width.toFixed(3)),
      height: Number(rect.height.toFixed(3)),
    },
  };
};

const main = async (): Promise<void> => {
  requirePrivacyReview(config.privacyReviewed);
  validateUrl(config.source);
  if (!Array.isArray(config.states) || config.states.length === 0) throw new Error('At least one capture state is required.');

  const viewport: CaptureViewport = config.viewport ?? {width: 1440, height: 900, deviceScaleFactor: 1};
  if (viewport.width <= 0 || viewport.height <= 0 || viewport.deviceScaleFactor <= 0) throw new Error('Viewport values must be positive.');

  const outputDir = path.resolve(path.dirname(absoluteConfigPath), config.outputDir ?? 'imon-capture');
  fs.mkdirSync(outputDir, {recursive: true});

  const browser = await chromium.launch({headless: config.browser?.headless ?? true});
  try {
    const context = await browser.newContext({
      viewport: {width: viewport.width, height: viewport.height},
      deviceScaleFactor: viewport.deviceScaleFactor,
      colorScheme: config.browser?.colorScheme ?? 'dark',
      reducedMotion: config.browser?.reducedMotion ?? 'no-preference',
    });
    const page = await context.newPage();
    await page.goto(validateUrl(config.source).toString(), {waitUntil: 'domcontentloaded'});
    for (const action of config.initialActions ?? []) await runAction(page, action);

    const manifest: CaptureManifest = {
      version: 1,
      source: sanitizedSource(config.source),
      viewport,
      states: [],
      privacyReviewed: true,
      notes: config.notes,
    };

    const seenStateIds = new Set<string>();
    for (const stateConfig of config.states) {
      const stateId = ensureId(stateConfig.id, 'state id');
      if (seenStateIds.has(stateId)) throw new Error(`Duplicate capture state: ${stateId}`);
      seenStateIds.add(stateId);

      if (stateConfig.url) await page.goto(validateUrl(stateConfig.url).toString(), {waitUntil: 'domcontentloaded'});
      for (const action of stateConfig.actions ?? []) await runAction(page, action);
      if (stateConfig.waitAfterMs) await page.waitForTimeout(stateConfig.waitAfterMs);

      const targets = stateConfig.elements ?? [];
      const automaticRedactions = targets.filter((target) => target.safeToShow === false).map((target) => target.selector);
      await applyStyleToSelectors(page, [...(config.redactSelectors ?? []), ...(stateConfig.redactSelectors ?? []), ...automaticRedactions], 'redact');
      await applyStyleToSelectors(page, [...(config.hideSelectors ?? []), ...(stateConfig.hideSelectors ?? [])], 'hide');

      const elements: CaptureElement[] = [];
      for (const target of targets) elements.push(await elementGeometry(page, target));

      const imageName = `${stateId}.png`;
      await page.screenshot({path: path.join(outputDir, imageName), fullPage: false, animations: 'disabled'});
      manifest.states.push({
        id: stateId,
        image: imageName,
        timestampMs: Date.now(),
        elements,
      });
    }

    const failures = validateCaptureManifest(manifest);
    if (failures.length) throw new Error(`Generated capture manifest is invalid:\n- ${failures.join('\n- ')}`);

    const manifestPath = path.join(outputDir, 'capture.manifest.json');
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(JSON.stringify({
      ok: true,
      outputDir,
      manifest: manifestPath,
      states: manifest.states.map((state) => ({id: state.id, image: state.image, elements: state.elements.length})),
      viewport,
      source: manifest.source,
    }, null, 2));
  } finally {
    await browser.close();
  }
};

await main();
