export function whenPageReady(minMs = 500) {
  return new Promise((resolve) => {
    const started = performance.now();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      const rest = Math.max(0, minMs - (performance.now() - started));
      const idle = (cb) => (
        window.requestIdleCallback
          ? window.requestIdleCallback(cb, { timeout: 800 })
          : setTimeout(cb, 180)
      );
      setTimeout(() => idle(resolve), rest);
    };
    const afterPaint = () => requestAnimationFrame(() => requestAnimationFrame(finish));
    if (document.readyState === 'complete') afterPaint();
    else {
      window.addEventListener('load', afterPaint, { once: true });
      setTimeout(afterPaint, 1200);
    }
  });
}
