import '../styles/toolbar.css';

const selectors = {
  refreshButton: '[data-refresh-button]',
  zoomOutButton: '[data-zoom-out-button]',
  zoomOutTooltip: '[data-zoom-out-tooltip]',
  refreshTooltip: '[data-refresh-tooltip]',
};

export default class Toolbar {
  refreshButton: any;
  zoomOutButton: any;

  constructor() {
    this.refreshButton = document.querySelector(selectors.refreshButton);
    this.zoomOutButton = document.querySelector(selectors.zoomOutButton);
    const zoomOutTooltip = document.querySelector(selectors.zoomOutTooltip);
    const refreshTooltip = document.querySelector(selectors.refreshTooltip);

    this.zoomOutButton.addEventListener('mouseover', function() {
      if (zoomOutTooltip) {
        zoomOutTooltip.classList.toggle('hide');
      }
    });

    this.zoomOutButton.addEventListener('mouseout', function() {
      if (zoomOutTooltip) {
        zoomOutTooltip.classList.toggle('hide');
      }
    });

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
