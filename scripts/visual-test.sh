#!/bin/bash
# Quick visual test of critical features
# Run after making changes to verify nothing broke

echo "🎨 Starting Visual Test Suite for Errl Portal..."
echo ""
echo "This will open your browser to test critical features"
echo "Press CTRL+C to skip any test"
echo ""

# Start dev server in background
echo "🚀 Starting dev server..."
npm run dev &
DEV_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server..."
sleep 3

BASE_URL="http://localhost:5173"

# Test 1: Main Portal
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Main Portal"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Opening: $BASE_URL/index.html"
echo ""
echo "✅ Check: Page loads without errors"
echo "✅ Check: Errl character visible"
echo "✅ Check: WebGL effects rendering"
echo "✅ Check: No console errors (F12)"
echo ""
read -p "Press ENTER when test complete..."

open "$BASE_URL/index.html" 2>/dev/null || xdg-open "$BASE_URL/index.html" 2>/dev/null

# Test 2: About Page
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: About Page"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Opening: $BASE_URL/portal/pages/about/index.html"
echo ""
echo "✅ Check: About page loads"
echo "✅ Check: Animated eyes/mouth work"
echo "✅ Check: 'Back to Portal' link works"
echo ""
read -p "Press ENTER when test complete..."

# Test 3: Pin Designer
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Pin Designer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Opening: $BASE_URL/portal/pages/pin-designer/index.html"
echo ""
echo "✅ Check: Canvas loads"
echo "✅ Check: Can add/edit elements"
echo "✅ Check: Tools panel works"
echo ""
read -p "Press ENTER when test complete..."

# Test 4: Gallery
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Gallery"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Opening: $BASE_URL/portal/pages/gallery/index.html"
echo ""
echo "✅ Check: Gallery loads"
echo "✅ Check: Images display correctly"
echo ""
read -p "Press ENTER when test complete..."

# Test 5: Mobile View
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Mobile Responsive"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 In Chrome DevTools:"
echo "   1. Press F12"
echo "   2. Click device toolbar (📱 icon)"
echo "   3. Test on iPhone/iPad views"
echo ""
echo "✅ Check: No horizontal scroll"
echo "✅ Check: Touch interactions work"
echo "✅ Check: All content visible"
echo ""
read -p "Press ENTER when test complete..."

# Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $DEV_PID 2>/dev/null

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Visual Test Suite Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If all tests passed, your changes are safe to commit!"
echo ""
