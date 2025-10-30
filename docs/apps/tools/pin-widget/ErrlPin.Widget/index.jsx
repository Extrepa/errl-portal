export const command = "echo";
export const refreshFrequency = false;

export const render = () => (
  <iframe
    src="designer.html"
    style={{
      width: "500px",   // size of the widget window
      height: "500px",
      border: "1px solid #444",
      borderRadius: "8px",
      background: "white",
      transform: "scale(0.8)",       // shrink the whole app
      transformOrigin: "top left"    // anchor scaling
    }}
  />
);