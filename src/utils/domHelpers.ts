export function setTotalTime(totalTime: number) {
  document.querySelector(
    '[data-total-time]',
  )!.innerHTML = `Total time to render liquid: <b>${Math.trunc(
    totalTime * 1000,
  )}ms</b>`;
}

export function formatNodeTime(nodeTime: number) {
  const nodeTimeMs = Math.trunc(nodeTime * 1000);
  if (nodeTimeMs > 0) {
    return nodeTimeMs;
  } else {
    return '< 1';
  }
}
