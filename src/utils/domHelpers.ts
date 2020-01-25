export function setTotalTime(totalTime: number) {
  updateInfoText('[data-total-time]', `${Math.trunc(totalTime * 1000)}ms`);
}

export function formatNodeTime(nodeTime: number) {
  const nodeTimeMs = Math.trunc(nodeTime * 1000);
  if (nodeTimeMs > 0) {
    return nodeTimeMs;
  } else {
    return '< 1';
  }
}

export function emptyHTMLNode(node: any) {
  if (!node) return;

  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

export function updateInfoText(selector: string, updateText: string) {
  document.querySelector(`${selector} b`)!.textContent = updateText;
}
