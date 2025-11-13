const grid = document.getElementById("grid");
const info = document.getElementById("info");

const gridCountInput = document.getElementById("gridCount");
const mutationInput = document.getElementById("mutation");
const alphaInput = document.getElementById("alpha");
const reseedButton = document.getElementById("reseed");
const copyButton = document.getElementById("copy");

const settings = {
  gridCount: parseInt(gridCountInput.value, 10),
  mutation: parseInt(mutationInput.value, 10),
  alpha: parseInt(alphaInput.value, 10),
};

const selection = [];
const cells = [];
let latestCss = "";

function alphaValue() {
  return Math.min(1, Math.max(0.3, settings.alpha / 100));
}

function randomHue() {
  return Math.random() * 360;
}

function clampHue(value) {
  return ((value % 360) + 360) % 360;
}

function randomGenes() {
  const alpha = alphaValue();
  return {
    h1: randomHue(),
    h2: randomHue(),
    h3: randomHue(),
    alpha: alpha + (Math.random() - 0.5) * 0.15,
  };
}

function mixGenes(a, b) {
  const baseAlpha = (a.alpha + b.alpha) / 2;
  const alphaTarget = alphaValue();

  return {
    h1: clampHue((a.h1 + b.h1) / 2 + (Math.random() - 0.5) * settings.mutation),
    h2: clampHue((a.h2 + b.h2) / 2 + (Math.random() - 0.5) * settings.mutation),
    h3: clampHue((a.h3 + b.h3) / 2 + (Math.random() - 0.5) * settings.mutation),
    alpha: Math.min(
      1,
      Math.max(0.25, (baseAlpha + alphaTarget) / 2 + (Math.random() - 0.5) * 0.12)
    ),
  };
  }

function genesToCss(genes) {
  const stops = [
    `hsla(${genes.h1.toFixed(1)}, 85%, 60%, ${genes.alpha.toFixed(2)})`,
    `hsla(${genes.h2.toFixed(1)}, 85%, 60%, ${genes.alpha.toFixed(2)})`,
    `hsla(${genes.h3.toFixed(1)}, 85%, 60%, ${genes.alpha.toFixed(2)})`,
  ];
  return `linear-gradient(135deg, ${stops.join(", ")})`;
}

function updateIndices() {
  cells.forEach((cell, index) => {
    cell.dataset.index = `G${String(index + 1).padStart(2, "0")}`;
  });
}

function clearSelection() {
  selection.splice(0, selection.length).forEach((cell) => cell.classList.remove("selected"));
}

function createCell(genes) {
  const css = genesToCss(genes);
  const cell = document.createElement("button");
  cell.type = "button";
  cell.className = "cell";
  cell.style.background = css;
  cell.dataset.css = css;
  cell.dataset.genes = JSON.stringify(genes);

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `h: ${genes.h1.toFixed(0)}°, ${genes.h2.toFixed(0)}°, ${genes.h3.toFixed(
    0
  )}° · α ${(genes.alpha * 100).toFixed(0)}%`;
  cell.appendChild(meta);

  cell.addEventListener("click", () => handleSelect(cell));
  return cell;
}

function handleSelect(cell) {
  const index = selection.indexOf(cell);
  if (index !== -1) {
    selection.splice(index, 1);
    cell.classList.remove("selected");
    info.textContent = selection.length
      ? "Select one more gradient to breed."
      : "Selection cleared.";
    return;
  }

  if (selection.length === 2) {
    selection.shift().classList.remove("selected");
  }

  selection.push(cell);
  cell.classList.add("selected");

  if (selection.length === 2) {
    const genesA = JSON.parse(selection[0].dataset.genes);
    const genesB = JSON.parse(selection[1].dataset.genes);
    const childGenes = mixGenes(genesA, genesB);
    addCell(childGenes, { highlightNew: true });
    clearSelection();
    info.textContent = "Spawned a new gradient. Keep iterating!";
  } else {
    info.textContent = "Select one more gradient to breed.";
  }
}

function addCell(genes, { highlightNew = false } = {}) {
  const cell = createCell(genes);
  cells.push(cell);
  grid.appendChild(cell);
  updateIndices();

  latestCss = cell.dataset.css;
  if (highlightNew) {
    cell.classList.add("selected");
    requestAnimationFrame(() => {
      cell.classList.remove("selected");
    });
  }
}

function reseed() {
  clearSelection();
  grid.innerHTML = "";
  cells.length = 0;
  latestCss = "";

  for (let i = 0; i < settings.gridCount; i += 1) {
    addCell(randomGenes());
  }

  info.textContent = "Click two gradients to breed a new one.";
}

function copyLatestCss() {
  if (!latestCss && cells.length) {
    latestCss = cells[cells.length - 1].dataset.css;
  }
  if (!latestCss) {
    info.textContent = "Create a gradient first, then copy.";
    return;
  }

  const copy = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(latestCss);
    } else {
      const temp = document.createElement("textarea");
      temp.value = latestCss;
      temp.setAttribute("readonly", "");
      temp.style.position = "absolute";
      temp.style.left = "-9999px";
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }
  };

  copy()
    .then(() => {
      info.textContent = "Copied latest gradient CSS to clipboard.";
    })
    .catch(() => {
      info.textContent = "Clipboard blocked; copy manually from inspector.";
    });
}

gridCountInput.addEventListener("input", (event) => {
  settings.gridCount = parseInt(event.target.value, 10);
  reseed();
});

mutationInput.addEventListener("input", (event) => {
  settings.mutation = parseInt(event.target.value, 10);
  info.textContent = `Mutation set to ±${settings.mutation}°. Breed to see the change.`;
});

alphaInput.addEventListener("input", (event) => {
  settings.alpha = parseInt(event.target.value, 10);
  info.textContent = `Transparency target set to ${settings.alpha}%. New gradients will respect this mix.`;
});

reseedButton.addEventListener("click", reseed);
copyButton.addEventListener("click", copyLatestCss);

reseed();
