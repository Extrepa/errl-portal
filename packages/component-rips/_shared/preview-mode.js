/**
 * Preview Mode Helper
 * 
 * Hides controls when component is loaded in preview mode (URL contains ?preview=1)
 * Include this script in components that should hide controls in catalog previews.
 */

(function() {
  'use strict';
  
  // Check if we're in preview mode
  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get('preview') === '1';
  
  if (isPreview) {
    // Hide controls when in preview mode
    const hideControls = () => {
      const controls = document.querySelectorAll('.controls, #controls');
      controls.forEach(ctrl => {
        ctrl.style.display = 'none';
      });
    };
    
    // Hide immediately and also after DOM is ready
    hideControls();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', hideControls);
    }
    
    // Also hide after a short delay in case controls are added dynamically
    setTimeout(hideControls, 100);
  }
})();

