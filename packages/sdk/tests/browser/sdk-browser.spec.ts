import { test, expect } from '@playwright/test';

/**
 * Browser compatibility + wallet-signer contract tests for `@iln/sdk-next`.
 *
 * Crypto tests verify the browser bundle. Wallet tests inject a Freighter-shaped
 * `InvoiceTransactionSigner` and assert the same option contract the frontend
 * and `@iln/sdk` Freighter path rely on (address + networkPassphrase on every
 * `signTransaction` call).
 */
test.describe('ILN SDK browser bundle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/index.html');
    // Wait until the module script has run
    await page.waitForFunction(
      () => (window as any).__ilnReady !== undefined || (window as any).__ilnError !== null
    );
  });

  test('loads without errors', async ({ page }) => {
    const error = await page.evaluate(() => (window as any).__ilnError);
    expect(error).toBeNull();
    const ready = await page.evaluate(() => (window as any).__ilnReady);
    expect(ready).toBe(true);
  });

  test('randomBytes returns correct length via Web Crypto API', async ({ page }) => {
    const len = await page.evaluate(() => (window as any).__ilnRandomBytesLength);
    expect(len).toBe(32);
  });

  test('sha256 returns 32-byte digest', async ({ page }) => {
    const len = await page.evaluate(() => (window as any).__ilnHashLength);
    expect(len).toBe(32);
  });

  test('Web Crypto API is available', async ({ page }) => {
    const available = await page.evaluate(
      () => typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined'
    );
    expect(available).toBe(true);
  });

  test('works inside a sandboxed iframe', async ({ page }) => {
    await page.goto('about:blank');

    const message = page.evaluate(
      () =>
        new Promise<string>((resolve) => {
          window.addEventListener('message', (event) => resolve(event.data as string), {
            once: true,
          });
        })
    );

    await page.evaluate(() => {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-scripts');
      iframe.srcdoc =
        "<script>window.parent.postMessage(typeof crypto !== 'undefined' ? 'ok' : 'missing', '*')</" +
        'script>';
      document.body.appendChild(iframe);
    });

    expect(await message).toBe('ok');
  });
});

test.describe('Browser wallet signer contract (Freighter-shaped)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/index.html');
    await page.waitForFunction(() => (window as any).__ilnWalletHarnessReady === true);
  });

  test('mock Freighter signer forwards address and networkPassphrase', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const harness = (window as any).__ilnWalletHarness;
      harness.reset();
      const signed = await harness.signWithFreighterShape('UNSIGNED_BUNDLE_XDR', {
        address: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        networkPassphrase: 'Test SDF Network ; September 2015',
      });
      return { signed, calls: harness.getCalls() };
    });

    expect(result.signed).toBe('SIGNED:UNSIGNED_BUNDLE_XDR');
    expect(result.calls).toEqual([
      {
        method: 'signTransaction',
        args: [
          'UNSIGNED_BUNDLE_XDR',
          {
            address: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
            networkPassphrase: 'Test SDF Network ; September 2015',
          },
        ],
      },
    ]);
  });

  test('rejects signing when networkPassphrase is missing', async ({ page }) => {
    const message = await page.evaluate(async () => {
      const harness = (window as any).__ilnWalletHarness;
      harness.reset();
      try {
        await harness.signWithFreighterShape('UNSIGNED_XDR', {
          address: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
          networkPassphrase: '',
        });
        return null;
      } catch (err) {
        return err instanceof Error ? err.message : String(err);
      }
    });

    expect(message).toContain('networkPassphrase');
  });

  test('getPublicKey mirrors connected Freighter account', async ({ page }) => {
    const publicKey = await page.evaluate(async () => {
      const harness = (window as any).__ilnWalletHarness;
      harness.reset();
      harness.setAccount('GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBVKM');
      return harness.getPublicKey();
    });

    expect(publicKey).toBe('GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBVKM');
  });
});
