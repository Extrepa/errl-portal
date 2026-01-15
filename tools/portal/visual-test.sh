#!/bin/bash
# Quick visual test of critical features
# Run after making changes to verify nothing broke

echo "🎨 Starting Visual Test Suite for Errl Portal..."
echo ""
echo "This will open your browser to test critical features"
echo "Press CTRL+C to skip any test"
echo ""

# Start dev server in background (bind to IPv4 loopback to avoid ::1 permissions)
echo "🚀 Starting dev server..."
npm run portal:dev -- --host 127.0.0.1 --port 5174 &
DEV_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server..."
sleep 3

BASE_URL="http://127.0.0.1:5174"

# Test 1: Main Portal
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Main Portal"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Opening: $BASE_URL/"
echo ""
echo "✅ Check: Page loads without errors"
echo "✅ Check: Errl character visible"
echo "✅ Check: WebGL effects rendering"
echo "✅ Check: No console errors (F12)"
echo ""
read -p "Press ENTER when test complete..."

open "$BASE_URL/" 2>/dev/null || xdg-open "$BASE_URL/" 2>/dev/null

# Test 2: About Page
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: About Page"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Opening: $BASE_URL/about/"
echo ""
echo "✅ Check: About page loads"
echo "✅ Check: Animated eyes/mouth work"
echo "✅ Check: 'Back to Portal' link works"
echo ""
read -p "Press ENTER when test complete..."

open "$BASE_URL/about/" 2>/dev/null || xdg-open "$BASE_URL/about/" 2>/dev/null

# Test 3: Pin Designer
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Pin Designer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Opening: $BASE_URL/pin-designer/"
echo ""
echo "✅ Check: Canvas loads"
echo "✅ Check: Can add/edit elements"
echo "✅ Check: Tools panel works"
echo ""
read -p "Press ENTER when test complete..."

open "$BASE_URL/pin-designer/" 2>/dev/null || xdg-open "$BASE_URL/pin-designer/" 2>/dev/null

# Test 4: Gallery
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Gallery"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Opening: $BASE_URL/gallery/"
echo ""
echo "✅ Check: Gallery loads"
echo "✅ Check: Images display correctly"
echo ""
read -p "Press ENTER when test complete..."

open "$BASE_URL/gallery/" 2>/dev/null || xdg-open "$BASE_URL/gallery/" 2>/dev/null

# Test 5: Assets page links (Pin Widget + Color Customizer)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Assets Page Links"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Opening: $BASE_URL/assets/"
echo ""
echo "✅ Check: Assets page loads"
echo "✅ Check: Pin Widget link opens /studio/pin-widget/ErrlPin.Widget/designer.html"
echo "✅ Check: Color Customizer link opens /studio/svg-colorer/index.html"
echo ""
read -p "Press ENTER when test complete..."

open "$BASE_URL/assets/" 2>/dev/null || xdg-open "$BASE_URL/assets/" 2>/dev/null

# Test 5: Mobile View
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 6: Mobile Responsive"
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
