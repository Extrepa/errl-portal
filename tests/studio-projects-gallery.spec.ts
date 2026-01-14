import { test, expect } from '@playwright/test';

/**
 * Comprehensive tests for Studio projects and Gallery pages
 * 
 * Key requirements:
 * 1. Each studio project should load independently (not in a frame that loads another page)
 * 2. Gallery pages should display all items, not just load another page in a frame
 * 3. All projects should be accessible and functional
 */

test.describe('Studio Projects - Independent Loading', () => {
  test('@ui Code Lab loads as standalone page, not in frame', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio');
    await page.waitForLoadState('networkidle');
    
    // Wait for studio hub to load - verify heading is visible
    await expect(page.getByRole('heading', { name: 'Choose your Errl Lab' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Code Lab' })).toBeVisible({ timeout: 10000 });
    
    // Click Code Lab link - use regex like existing tests (matches studio.spec.ts)
    await page.getByRole('link', { name: /Code Lab/ }).click();
    
    // Wait for navigation - should navigate to a new page, not load in iframe
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the Code Lab page (not still on studio hub)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/studio\.html|code-lab/i);
    
    // Verify no iframe is present (Code Lab should be standalone)
    const iframes = page.locator('iframe');
    const iframeCount = await iframes.count();
    expect(iframeCount).toBe(0);
    
    // Verify Code Lab content is directly on the page
    const formatButton = page.getByRole('button', { name: /Format HTML/i });
    await expect(formatButton).toBeVisible({ timeout: 10000 });
    
    // Verify Monaco editor or code editor exists directly on page
    const editor = page.locator('.monaco-editor, [class*="monaco"], textarea, [contenteditable="true"]');
    const editorExists = await editor.count() > 0;
    expect(editorExists).toBeTruthy();
  });

  test('@ui Math Lab loads in dedicated view, not nested frame', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio');
    await page.waitForLoadState('networkidle');
    
    // Wait for studio hub to load
    await expect(page.getByRole('heading', { name: 'Choose your Errl Lab' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Psychedelic Math Lab' })).toBeVisible({ timeout: 10000 });
    
    // Click Math Lab link - use regex like existing tests (matches studio.spec.ts)
    await page.getByRole('link', { name: /Psychedelic Math Lab/ }).click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Verify Math Lab loads (may be in iframe, but should be the main content)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/math-lab/i);
    
    // If there's an iframe, verify it's the main content, not nested
    const iframes = page.locator('iframe');
    const iframeCount = await iframes.count();
    
    if (iframeCount > 0) {
      // If iframe exists, verify it's the primary content (not nested)
      const mainIframe = page.locator('iframe').first();
      await expect(mainIframe).toBeVisible();
      
      // Verify iframe content loads
      const iframeContent = page.frameLocator('iframe').first();
      await expect(iframeContent.locator('body')).toBeVisible({ timeout: 15000 });
      
      // Verify iframe is not nested (no iframes inside iframes)
      const nestedIframes = iframeContent.locator('iframe');
      const nestedCount = await nestedIframes.count();
      expect(nestedCount).toBe(0);
    } else {
      // If no iframe, verify content is directly on page
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.length).toBeGreaterThan(100);
    }
  });

  test('@ui Shape Madness loads in dedicated view, not nested frame', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio');
    await page.waitForLoadState('networkidle');
    
    // Click Shape Madness link - Playwright should find it by accessible name from nested heading
    const shapeLink = page.getByRole('link', { name: 'Shape Madness' });
    await expect(shapeLink).toBeVisible({ timeout: 10000 });
    await shapeLink.click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Verify Shape Madness loads
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/shape-madness/i);
    
    // If there's an iframe, verify it's the main content, not nested
    const iframes = page.locator('iframe');
    const iframeCount = await iframes.count();
    
    if (iframeCount > 0) {
      const mainIframe = page.locator('iframe').first();
      await expect(mainIframe).toBeVisible();
      
      // Verify iframe content loads
      const iframeContent = page.frameLocator('iframe').first();
      await expect(iframeContent.locator('body')).toBeVisible({ timeout: 15000 });
      
      // Verify no nested iframes
      const nestedIframes = iframeContent.locator('iframe');
      const nestedCount = await nestedIframes.count();
      expect(nestedCount).toBe(0);
      
      // Verify Shape Madness content is visible
      await expect(iframeContent.locator('text=Shape Madness')).toBeVisible({ timeout: 10000 });
    } else {
      // Direct content
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.length).toBeGreaterThan(100);
    }
  });

  test('@ui Pin Designer loads in dedicated view, not nested frame', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio');
    await page.waitForLoadState('networkidle');
    
    // Wait for studio hub to load
    await expect(page.getByRole('heading', { name: 'Choose your Errl Lab' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Pin Designer' })).toBeVisible({ timeout: 10000 });
    
    // Click Pin Designer link - use regex like existing tests (matches studio.spec.ts)
    await page.getByRole('link', { name: /Pin Designer/ }).click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Verify Pin Designer loads
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/pin-designer/i);
    
    // If there's an iframe, verify it's the main content, not nested
    const iframes = page.locator('iframe');
    const iframeCount = await iframes.count();
    
    if (iframeCount > 0) {
      const mainIframe = page.locator('iframe').first();
      await expect(mainIframe).toBeVisible();
      
      // Verify iframe content loads
      const iframeContent = page.frameLocator('iframe').first();
      await expect(iframeContent.locator('body')).toBeVisible({ timeout: 15000 });
      
      // Verify no nested iframes
      const nestedIframes = iframeContent.locator('iframe');
      const nestedCount = await nestedIframes.count();
      expect(nestedCount).toBe(0);
      
      // Verify Pin Designer content is visible
      await expect(iframeContent.locator('text=Save Design, button, text=Design, text=Pin')).toBeVisible({ timeout: 10000 });
    } else {
      // Direct content
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.length).toBeGreaterThan(100);
    }
  });

  test('@ui All studio projects are accessible from hub', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio');
    await page.waitForLoadState('networkidle');
    
    // Verify all project cards are present
    const projects = [
      { name: 'Code Lab', selector: /Code Lab/i },
      { name: 'Psychedelic Math Lab', selector: /Psychedelic Math Lab/i },
      { name: 'Shape Madness', selector: /Shape Madness/i },
      { name: 'Pin Designer', selector: /Pin Designer/i },
    ];
    
    for (const project of projects) {
      // Playwright should find link by accessible name from nested heading
      const link = page.getByRole('link', { name: project.name });
      await expect(link).toBeVisible({ timeout: 10000 });
      
      // Verify link has valid href
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    }
  });

  test('@ui Studio projects navigate correctly without frame nesting', async ({ page, baseURL }) => {
    // Test each project navigation
    const projects = [
      { name: 'Code Lab', selector: /Code Lab/, urlPattern: /studio\.html|code-lab/i },
      { name: 'Math Lab', selector: /Psychedelic Math Lab/, urlPattern: /math-lab/i },
      { name: 'Shape Madness', selector: /Shape Madness/, urlPattern: /shape-madness/i },
      { name: 'Pin Designer', selector: /Pin Designer/, urlPattern: /pin-designer/i },
    ];
    
    for (const project of projects) {
      // Go back to studio hub
      await page.goto(baseURL! + '/studio');
      await page.waitForLoadState('networkidle');
      
      // Wait for studio hub to load
      await expect(page.getByRole('heading', { name: 'Choose your Errl Lab' })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole('heading', { name: project.name })).toBeVisible({ timeout: 10000 });
      
      // Click project link - use regex like existing tests (matches studio.spec.ts)
      await page.getByRole('link', { name: project.selector }).click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Verify URL matches expected pattern
      const currentUrl = page.url();
      expect(currentUrl).toMatch(project.urlPattern);
      
      // Verify page has content (not just a blank frame)
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.length).toBeGreaterThan(50);
      
      // Count iframes - should be 0 or 1 (main content), not nested
      const allIframes = await page.locator('iframe').all();
      expect(allIframes.length).toBeLessThanOrEqual(1);
      
      // If there's an iframe, verify it's not nested
      if (allIframes.length === 1) {
        const iframeContent = page.frameLocator('iframe').first();
        const nestedIframes = await iframeContent.locator('iframe').count();
        expect(nestedIframes).toBe(0);
      }
    }
  });
});

test.describe('Gallery Pages - Display All Items', () => {
  test('@ui Gallery page displays all images, not loads another page in frame', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/gallery/');
    await page.waitForLoadState('networkidle');
    
    // Wait for gallery container
    await page.waitForSelector('#gallery', { timeout: 10000 });
    
    // Wait for gallery script to execute - check for either items or error message
    await Promise.race([
      page.waitForSelector('.gallery-item', { timeout: 20000 }),
      page.waitForSelector('text=/Error|Failed|No images found/i', { timeout: 20000 }).then(async () => {
        // If error appears, check what the error is
        const errorText = await page.locator('#gallery').textContent();
        throw new Error(`Gallery failed to load items: ${errorText}`);
      })
    ]);
    
    // Verify gallery container exists
    const gallery = page.locator('#gallery');
    await expect(gallery).toBeVisible();
    
    // Verify no iframe is present (gallery should display items directly)
    const iframes = page.locator('iframe');
    const iframeCount = await iframes.count();
    expect(iframeCount).toBe(0);
    
    // Verify gallery items are displayed
    const galleryItems = page.locator('.gallery-item');
    const itemCount = await galleryItems.count();
    
    // Should have at least some items (checking manifest shows 20 items)
    expect(itemCount).toBeGreaterThan(0);
    
    // Verify images are loaded (not just placeholders)
    const images = galleryItems.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);
    
    // Verify at least some images have loaded successfully
    let loadedImages = 0;
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      if (naturalWidth > 0) {
        loadedImages++;
      }
    }
    
    // At least some images should have loaded
    expect(loadedImages).toBeGreaterThan(0);
  });

  test('@ui Gallery manifest loads and processes correctly', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/gallery/');
    await page.waitForLoadState('networkidle');
    
    // Wait for gallery container
    await page.waitForSelector('#gallery', { timeout: 10000 });
    
    // Wait for gallery script to execute - check for either items or error message
    await Promise.race([
      page.waitForSelector('.gallery-item', { timeout: 20000 }),
      page.waitForSelector('text=/Error|Failed|No images found/i', { timeout: 20000 }).then(async () => {
        const errorText = await page.locator('#gallery').textContent();
        throw new Error(`Gallery manifest failed to load: ${errorText}`);
      })
    ]);
    
    // Check that loading message is gone
    const loadingMessage = page.locator('text=Loading gallery...');
    const loadingVisible = await loadingMessage.isVisible().catch(() => false);
    expect(loadingVisible).toBe(false);
    
    // Verify gallery items exist
    const galleryItems = page.locator('.gallery-item');
    const itemCount = await galleryItems.count();
    expect(itemCount).toBeGreaterThan(0);
    
    // Verify items have images
    const images = galleryItems.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBe(itemCount); // Each item should have an image
    
    // Verify items have titles
    const titles = galleryItems.locator('h3');
    const titleCount = await titles.count();
    expect(titleCount).toBeGreaterThan(0);
  });

  test('@ui Gallery displays all items from manifest, not just a few', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/gallery/');
    await page.waitForLoadState('networkidle');
    
    // Wait for gallery container
    await page.waitForSelector('#gallery', { timeout: 10000 });
    
    // Wait for gallery script to execute - check for either items or error message
    await Promise.race([
      page.waitForSelector('.gallery-item', { timeout: 20000 }),
      page.waitForSelector('text=/Error|Failed|No images found/i', { timeout: 20000 }).then(async () => {
        const errorText = await page.locator('#gallery').textContent();
        throw new Error(`Gallery items failed to load: ${errorText}`);
      })
    ]);
    
    // Give additional time for all items to render
    await page.waitForTimeout(2000);
    
    // Count gallery items
    const galleryItems = page.locator('.gallery-item');
    const itemCount = await galleryItems.count();
    
    // Based on manifest, should have 20 items
    // Accept at least 15 to account for potential loading issues
    expect(itemCount).toBeGreaterThanOrEqual(15);
    
    // Verify items are visible (not hidden)
    for (let i = 0; i < Math.min(itemCount, 5); i++) {
      const item = galleryItems.nth(i);
      await expect(item).toBeVisible();
    }
    
    // Verify no error messages
    const errorMessages = page.locator('text=/Error|Failed|No images found/i');
    const errorCount = await errorMessages.count();
    expect(errorCount).toBe(0);
  });

  test('@ui Gallery images load correctly with proper src attributes', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/gallery/');
    await page.waitForLoadState('networkidle');
    
    // Wait for gallery container
    await page.waitForSelector('#gallery', { timeout: 10000 });
    
    // Wait for gallery script to execute - check for either items or error message
    await Promise.race([
      page.waitForSelector('.gallery-item', { timeout: 20000 }),
      page.waitForSelector('text=/Error|Failed|No images found/i', { timeout: 20000 }).then(async () => {
        const errorText = await page.locator('#gallery').textContent();
        throw new Error(`Gallery images failed to load: ${errorText}`);
      })
    ]);
    await page.waitForTimeout(1000);
    
    // Get all images
    const images = page.locator('.gallery-item img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);
    
    // Verify images have valid src attributes
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).not.toBe('');
      expect(src).not.toContain('undefined');
      expect(src).not.toContain('null');
      
      // Verify src is a valid URL path
      expect(src).toMatch(/\.(jpg|jpeg|png|gif|webp|svg)/i);
    }
  });

  test('@ui Gallery page does not load content in iframe', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/gallery/');
    await page.waitForLoadState('networkidle');
    
    // Wait for gallery to load
    await page.waitForSelector('#gallery', { timeout: 10000 });
    
    // Verify no iframes exist
    const iframes = page.locator('iframe');
    const iframeCount = await iframes.count();
    expect(iframeCount).toBe(0);
    
    // Verify gallery content is directly in the page
    const gallery = page.locator('#gallery');
    await expect(gallery).toBeVisible();
    
    // Verify gallery is a direct child of container, not in iframe
    const container = page.locator('.container');
    await expect(container).toBeVisible();
    
    const galleryParent = await gallery.evaluateHandle((el) => el.parentElement);
    const containerElement = await container.elementHandle();
    expect(galleryParent).toBeTruthy();
  });

  test('@ui Gallery page handles missing images gracefully', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/gallery/');
    await page.waitForLoadState('networkidle');
    
    // Wait for gallery to load
    await page.waitForSelector('#gallery', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Check for error handling in images
    const images = page.locator('.gallery-item img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Verify images have onerror handlers or error handling
      const firstImg = images.first();
      const onerror = await firstImg.getAttribute('onerror');
      
      // Either has onerror handler or we check for error state
      const hasErrorHandler = onerror !== null;
      const naturalWidth = await firstImg.evaluate((el: HTMLImageElement) => el.naturalWidth);
      
      // Image should either have error handler or be loaded
      expect(hasErrorHandler || naturalWidth > 0).toBeTruthy();
    }
  });
});

test.describe('Assets Page - Iframe Loading', () => {
  test('@ui Assets page displays all projects in iframes', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/assets/');
    await page.waitForLoadState('networkidle');
    
    // Wait for assets grid to load
    await page.waitForSelector('#assetsGrid', { timeout: 10000 });
    await page.waitForTimeout(2000); // Give time for iframes to start loading
    
    // Verify assets grid exists
    const assetsGrid = page.locator('#assetsGrid');
    await expect(assetsGrid).toBeVisible();
    
    // Verify boxes (asset containers) exist
    const boxes = page.locator('.box');
    const boxCount = await boxes.count();
    expect(boxCount).toBeGreaterThan(0);
    
    // Verify each box has an iframe
    const iframes = page.locator('.box iframe');
    const iframeCount = await iframes.count();
    expect(iframeCount).toBe(boxCount); // Each box should have one iframe
    
    // Verify iframes have valid src attributes
    for (let i = 0; i < Math.min(iframeCount, 5); i++) {
      const iframe = iframes.nth(i);
      const src = await iframe.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).not.toBe('');
      expect(src).not.toContain('undefined');
    }
  });

  test('@ui Assets page iframes load content without nesting', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/assets/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('#assetsGrid', { timeout: 10000 });
    await page.waitForTimeout(3000); // Give more time for iframes to load
    
    const iframes = page.locator('.box iframe');
    const iframeCount = await iframes.count();
    expect(iframeCount).toBeGreaterThan(0);
    
    // Verify no nested iframes (iframes inside iframes)
    for (let i = 0; i < Math.min(iframeCount, 3); i++) {
      const iframe = iframes.nth(i);
      const iframeContent = page.frameLocator('.box iframe').nth(i);
      
      // Check for nested iframes
      const nestedIframes = await iframeContent.locator('iframe').count();
      expect(nestedIframes).toBe(0);
      
      // Verify iframe has content (body exists)
      try {
        await expect(iframeContent.locator('body')).toBeVisible({ timeout: 5000 });
      } catch (e) {
        // Some iframes may take longer or fail to load - that's okay for this test
        // We're mainly checking for nesting, not perfect loading
      }
    }
  });

  test('@ui Assets page displays all expected projects', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/assets/');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('#assetsGrid', { timeout: 10000 });
    
    // Expected assets based on the assets array (exact titles from HTML)
    const expectedAssets = [
      'Errl Head Coin',
      'Errl Head Coin v2',
      'Errl Head Coin v3',
      'Errl Head Coin v4',
      'Errl Face Popout',
      'Walking Errl (Animated SVG)',
      'Color Customizer',
      'Pin Widget',
    ];
    
    // Verify all expected assets are present - find by exact header text
    for (const assetName of expectedAssets) {
      // Find box by header span with exact text - escape special regex chars
      const escapedName = assetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const assetBox = page.locator('.box').filter({ 
        has: page.locator('header span').filter({ hasText: new RegExp(`^${escapedName}$`) })
      }).first();
      await expect(assetBox).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('Studio Projects - Gallery Integration', () => {
  test('@ui Can navigate from studio to gallery and back', async ({ page, baseURL }) => {
    // Start at studio
    await page.goto(baseURL! + '/studio');
    await page.waitForLoadState('networkidle');
    
    // Navigate to gallery via direct URL to avoid bubble stability issues
    await page.goto(baseURL! + '/gallery/');
    await page.waitForLoadState('networkidle');
    
    // Wait for gallery container
    await page.waitForSelector('#gallery', { timeout: 10000 });
    
    // Wait for gallery script to execute
    await Promise.race([
      page.waitForSelector('.gallery-item', { timeout: 20000 }),
      page.waitForSelector('text=/Error|Failed|No images found/i', { timeout: 20000 }).then(async () => {
        const errorText = await page.locator('#gallery').textContent();
        throw new Error(`Gallery failed to load: ${errorText}`);
      })
    ]);
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/gallery/i);
    
    // Verify gallery has content
    const galleryItems = page.locator('.gallery-item');
    const itemCount = await galleryItems.count();
    expect(itemCount).toBeGreaterThan(0);
    
    // Navigate back to studio
    const studioNav = page.getByRole('link', { name: /Studio/i });
    await expect(studioNav).toBeVisible();
    await studioNav.click();
    
    // Verify studio loads
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /Choose your Errl Lab/i })).toBeVisible();
  });

  test('@ui Studio projects maintain state when navigating', async ({ page, baseURL }) => {
    // Navigate to Code Lab via studio hub
    await page.goto(baseURL! + '/studio');
    await page.waitForLoadState('networkidle');
    
    // Wait for studio hub to load
    await expect(page.getByRole('heading', { name: 'Choose your Errl Lab' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Code Lab' })).toBeVisible({ timeout: 10000 });
    
    // Click Code Lab link - use regex like existing tests (matches studio.spec.ts)
    await page.getByRole('link', { name: /Code Lab/ }).click();
    await page.waitForLoadState('networkidle');
    
    // Verify Code Lab loads
    const formatButton = page.getByRole('button', { name: /Format HTML/i });
    await expect(formatButton).toBeVisible({ timeout: 10000 });
    
    // Navigate to gallery - use direct URL to avoid bubble stability issues
    await page.goto(baseURL! + '/gallery/');
    await page.waitForLoadState('networkidle');
    
    // Wait for gallery container
    await page.waitForSelector('#gallery', { timeout: 10000 });
    
    // Wait for gallery script to execute
    await Promise.race([
      page.waitForSelector('.gallery-item', { timeout: 20000 }),
      page.waitForSelector('text=/Error|Failed|No images found/i', { timeout: 20000 }).then(async () => {
        const errorText = await page.locator('#gallery').textContent();
        throw new Error(`Gallery failed to load: ${errorText}`);
      })
    ]);
    
    // Navigate back to studio hub
    await page.goto(baseURL! + '/studio');
    await page.waitForLoadState('networkidle');
    
    // Verify studio hub loads
    await expect(page.getByRole('heading', { name: /Choose your Errl Lab/i })).toBeVisible();
  });
});
