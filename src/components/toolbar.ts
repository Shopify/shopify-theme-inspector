const selectors = {
  refreshButton: '[data-refresh-button]',
  refreshTooltip: '[data-refresh-tooltip]',
};

export default class Toolbar {
  refreshButton: any;

  constructor() {
    this.refreshButton = document.querySelector(selectors.refreshButton);
    const refreshTooltip = document.querySelector(selectors.refreshTooltip);

    this.refreshButton.addEventListener('mouseover', function() {
      if (refreshTooltip) {
        refreshTooltip.classList.toggle('hide');
      }
    });

    this.refreshButton.addEventListener('mouseout', function() {
      if (refreshTooltip) {
        refreshTooltip.classList.toggle('hide');
      }
    });
  }
}
