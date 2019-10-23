export function toggleDisplay(dataSelector) {
  const selectedDiv: HTMLDivElement = document.querySelector(dataSelector);
  selectedDiv.classList.toggle('hide');
}

export function setTotalTime(totalTime) {
  document.querySelector(
    '[data-total-time]',
  )!.innerHTML = `Total time to render liquid: <b>${Math.trunc(
    Number(totalTime) * 1000,
  )}ms</b>`;
}

export function formatNodeTime(nodeTime) {
  const nodeTimeMs = Math.trunc(nodeTime * 1000);
  if (nodeTimeMs > 0) {
    return nodeTimeMs;
  } else {
    return '< 1';
  }
}
