function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderList(items, className) {
  if (!Array.isArray(items) || items.length === 0) return "";
  return `<ul class="${className}">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

export function mountAboutPage(root, content) {
  if (!root || !content) return;
  const sectionMarkup = (content.sections || [])
    .map((section) => {
      const body = (section.body || [])
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("");
      const tools = renderList(section.tools || [], "about-tools-list");
      return `
        <section id="${escapeHtml(section.id)}" class="drip-section fade-in">
          <h2 class="section-title">${escapeHtml(section.title)}</h2>
          <h3 class="subtitle">${escapeHtml(section.kicker || "")}</h3>
          ${body}
          ${tools}
        </section>
      `;
    })
    .join('<div class="drip-divider" data-effect="goo-fade"></div>');

  const extrepa = content.extrepa || {};
  const extrepaLinks = (extrepa.links || [])
    .map(
      (link) =>
        `<a class="about-inline-link" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`
    )
    .join("");

  const extrepaObsessions = renderList(extrepa.obsessions || [], "extrepa-obsessions");
  const intro = (content.hero?.intro || []).map((line) => `<p>${escapeHtml(line)}</p>`).join("");

  const exploreCards = (content.explore?.cards || [])
    .map(
      (card) => `
        <a class="explore-card" href="${escapeHtml(card.href)}">
          <h4>${escapeHtml(card.title)}</h4>
          <p>${escapeHtml(card.description)}</p>
          <span>${escapeHtml(card.cta || "Explore")}</span>
        </a>
      `
    )
    .join("");

  root.innerHTML = `
    <section class="about-hero drip-section fade-in">
      <p class="about-eyebrow">${escapeHtml(content.hero?.eyebrow || "")}</p>
      <h1 class="about-hero-title">${escapeHtml(content.hero?.title || "")}</h1>
      <p class="about-hero-subtitle">${escapeHtml(content.hero?.subtitle || "")}</p>
      ${intro}
    </section>
    <div class="drip-divider" data-effect="light-fade"></div>
    ${sectionMarkup}
    <div class="drip-divider" data-effect="light-fade"></div>
    <section class="drip-section fade-in extrepa-section">
      <div class="extrepa-panel-left">
        <div class="extrepa-avatar-placeholder" role="img" aria-label="${escapeHtml(extrepa.imageAlt || "Extrepa placeholder")}"></div>
        <p class="section-title">${escapeHtml(extrepa.title || "About Extrepa")}</p>
        <p class="extrepa-kicker">${escapeHtml(extrepa.kicker || "")}</p>
        <p class="extrepa-status">${escapeHtml(extrepa.currentlyBuilding || "")}</p>
        <div class="extrepa-links">${extrepaLinks}</div>
      </div>
      <div class="extrepa-panel-right">
        <p>${escapeHtml(extrepa.bio || "")}</p>
        ${extrepaObsessions}
      </div>
    </section>
    <div class="drip-divider" data-effect="goo-fade"></div>
    <section class="drip-section fade-in">
      <h2 class="section-title">${escapeHtml(content.explore?.title || "")}</h2>
      <h3 class="subtitle">${escapeHtml(content.explore?.subtitle || "")}</h3>
      <div class="explore-grid">${exploreCards}</div>
    </section>
  `;
}

export function mountStudioPage(root, content) {
  if (!root || !content) return;
  const projects = (content.projects || [])
    .map((project) => {
      const readinessLabel = content.readinessScale?.[project.readinessScore] || "Unknown";
      const tags = (project.tags || []).map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");
      const blockers = (project.blockers || [])
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
      const contributions = (project.contributionIdeas || [])
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
      const link = project.links?.[0];
      return `
        <article class="studio-card">
          <div class="studio-card__header">
            <h3 class="studio-card__title">${escapeHtml(project.title)}</h3>
            <span class="studio-card__badge">${escapeHtml(project.status)}</span>
          </div>
          <p class="studio-card__description">${escapeHtml(project.description)}</p>
          <div class="studio-readiness">
            <span class="studio-readiness__label">Readiness ${escapeHtml(project.readinessScore)}/5</span>
            <div class="studio-readiness__meter" aria-hidden="true">
              <span style="width:${Math.max(0, Math.min(100, project.readinessScore * 20))}%"></span>
            </div>
            <p class="studio-readiness__text">${escapeHtml(readinessLabel)}</p>
          </div>
          <ul class="studio-chip-list">${tags}</ul>
          <div class="studio-card__meta">
            <p class="studio-card__meta-title">Blockers</p>
            <ul>${blockers}</ul>
          </div>
          <div class="studio-card__meta">
            <p class="studio-card__meta-title">Contribution ideas</p>
            <ul>${contributions}</ul>
          </div>
          <p class="studio-card__updated">Last updated: ${escapeHtml(project.lastUpdated || "TBD")}</p>
          ${
            link
              ? `<a class="studio-card__cta" href="${escapeHtml(link.href)}">${escapeHtml(link.label || "Open")}</a>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  root.innerHTML = `
    <header class="studio-header" id="studio">
      <span class="studio-header__pill">${escapeHtml(content.hero?.pill || "")}</span>
      <div class="studio-header__body">
        <div class="studio-header__copy">
          <h1 class="studio-header__title">${escapeHtml(content.hero?.title || "")}</h1>
          <p class="studio-header__subtitle">${escapeHtml(content.hero?.subtitle || "")}</p>
        </div>
        <aside class="studio-header__meta">
          <p class="studio-header__meta-title">${escapeHtml(content.hero?.metaTitle || "")}</p>
          <p>${escapeHtml(content.hero?.metaText || "")}</p>
        </aside>
      </div>
    </header>
    <section class="studio-card-grid">${projects}</section>
  `;
}

export function setupFadeInSections(scope = document) {
  const sections = scope.querySelectorAll(".drip-section.fade-in");
  if (typeof window.IntersectionObserver === "function") {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { root: null, rootMargin: "0px 0px -20% 0px", threshold: 0.15 }
    );
    sections.forEach((section) => revealObserver.observe(section));
  } else {
    sections.forEach((section) => section.classList.add("is-visible"));
  }
}
