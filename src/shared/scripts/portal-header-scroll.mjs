/**
 * Adds .errl-header--scrolled when the page scrolls — subtle glass only when needed.
 */
export function bindHeaderScroll() {
  const onScroll = () => {
    const scrolled = window.scrollY > 8;
    document.querySelectorAll('.errl-header').forEach((header) => {
      header.classList.toggle('errl-header--scrolled', scrolled);
    });
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}
