const fog = document.getElementById("fog");
const midiButton = document.getElementById("midi");
const hueInput = document.getElementById("hue");
const bloomInput = document.getElementById("bloom");

let midiEnabled = false;
let midiAccess = null;

function update() {
  document.documentElement.style.setProperty("--hue", `${hueInput.value}deg`);
  fog.style.opacity = (0.4 + parseFloat(bloomInput.value) * 0.8).toFixed(2);
}

hueInput.addEventListener("input", update);
bloomInput.addEventListener("input", update);
update();

async function enableMIDI() {
  if (midiEnabled) {
    // Disable MIDI
    if (midiAccess) {
      midiAccess.close();
      midiAccess = null;
    }
    midiEnabled = false;
    midiButton.textContent = "Enable MIDI";
    midiButton.disabled = false;
    return;
  }

  if (!navigator.requestMIDIAccess) {
    alert("WebMIDI not supported. Use sliders or keyboard (H/B keys).");
    midiButton.disabled = false;
    return;
  }

  try {
    midiAccess = await navigator.requestMIDIAccess();
    midiEnabled = true;
    midiButton.textContent = "Disable MIDI";
    midiButton.disabled = false;

    for (const input of midiAccess.inputs.values()) {
      input.onmidimessage = (e) => {
        const [st, cc, val] = e.data;
        if ((st & 0xf0) === 0xb0) {
          // CC
          if (cc === 1) {
            hueInput.value = ((val / 127) * 360) | 0;
            update();
          }
          if (cc === 2) {
            bloomInput.value = (0.4 + (val / 127) * 0.6).toFixed(2);
            update();
          }
        }
      };
    }
  } catch (e) {
    console.error("MIDI access denied", e);
    alert("MIDI permission needed.");
    midiButton.disabled = false;
  }
}

midiButton.addEventListener("click", () => {
  midiButton.disabled = true;
  enableMIDI();
});

// Keyboard fallback
window.addEventListener("keydown", (e) => {
  if (e.key === "h") {
    hueInput.value = ((parseInt(hueInput.value) + 15) % 360).toString();
    update();
  }
  if (e.key === "b") {
    bloomInput.value = Math.min(1, parseFloat(bloomInput.value) + 0.05).toFixed(2);
    update();
  }
});
