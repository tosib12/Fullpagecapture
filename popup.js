const captureBtn = document.getElementById("captureBtn");
const statusEl = document.getElementById("status");

function setStatus(message, kind = "") {
  statusEl.textContent = message;
  statusEl.className = "status" + (kind ? " " + kind : "");
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function execute(tabId, func, args = []) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func,
    args
  });
  return results?.[0]?.result;
}

captureBtn.addEventListener("click", async () => {
  captureBtn.disabled = true;
  setStatus("Preparing page…");
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.windowId) throw new Error("No active tab found.");
    if (!/^https?:/.test(tab.url || "")) {
      throw new Error("This page cannot be captured. Open a normal HTTP or HTTPS website.");
    }

    const original = await execute(tab.id, () => ({
      x: window.scrollX,
      y: window.scrollY,
      width: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0),
      height: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      dpr: window.devicePixelRatio || 1
    }));

    if (!original || !original.width || !original.height) throw new Error("Could not measure this page.");
    const step = Math.max(200, original.viewportHeight - 90);
    const positions = [];
    for (let y = 0; y < original.height; y += step) positions.push(Math.min(y, Math.max(0, original.height - original.viewportHeight)));
    const uniquePositions = [...new Set(positions)];
    const shots = [];
    let previousY = -1;

    for (let i = 0; i < uniquePositions.length; i++) {
      const y = uniquePositions[i];
      await execute(tab.id, targetY => window.scrollTo(0, targetY), [y]);
      await sleep(220);
      const current = await execute(tab.id, () => ({
        y: window.scrollY,
        width: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0),
        height: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0)
      }));
      if (current.y === previousY && i > 0) continue;
      previousY = current.y;
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
      shots.push({ dataUrl, y: current.y });
      setStatus(`Capturing page… ${Math.min(i + 1, uniquePositions.length)} / ${uniquePositions.length}`);
    }

    await execute(tab.id, (y) => window.scrollTo(0, y), [original.y]);
    setStatus("Combining screenshots…");

    const images = await Promise.all(shots.map(shot => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ img, y: shot.y });
      img.onerror = () => reject(new Error("A screenshot could not be processed."));
      img.src = shot.dataUrl;
    })));

    const scale = images[0].img.width / original.viewportWidth;
    const canvasWidth = Math.min(Math.round(original.width * scale), 16000);
    const canvasHeight = Math.min(Math.round(original.height * scale), 30000);
    if (original.height * scale > 30000 || original.width * scale > 16000) {
      throw new Error("This page is too large for one image. Try a shorter page.");
    }
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    for (const item of images) {
      const top = Math.round(item.y * scale);
      const remaining = canvasHeight - top;
      if (remaining <= 0) continue;
      const sourceHeight = Math.min(item.img.height, Math.ceil(remaining));
      ctx.drawImage(item.img, 0, 0, item.img.width, sourceHeight, 0, top, canvasWidth, sourceHeight);
    }

    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Could not create the final image.");
    const objectUrl = URL.createObjectURL(blob);
    const safeTitle = (tab.title || "webpage").replace(/[\\/:*?"<>|]+/g, "_").slice(0, 80);
    await chrome.downloads.download({
      url: objectUrl,
      filename: `Fullpagecapture/${safeTitle}.png`,
      saveAs: true
    });
    setStatus("Capture ready. Check your downloads.", "success");
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  } catch (error) {
    setStatus(error?.message || "Capture failed. Try reloading the page.", "error");
  } finally {
    captureBtn.disabled = false;
  }
});