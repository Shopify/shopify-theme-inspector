import * as d3 from 'd3';
import * as flamegraph from 'd3-flame-graph';
import 'd3-flame-graph/dist/d3-flamegraph.css';
import {debounce} from 'lodash';
import {formatNodeTime} from '../utils';

const selectors = {
  partial: '[data-partial]',
  nodeTime: '[data-node-time]',
  code: '[data-code]',
  line: '[data-line]',
};

export default class LiquidFlamegraph {
  element: HTMLDivElement;
  profile: object;
  flamegraph: any;
  debouncedResize: any;

  constructor(element, profile) {
    this.element = element;
    this.profile = profile;
    this.flamegraph = this.create(this.curWindowWidth());
    this.debouncedResize = debounce(this.resizeToFitWindow, 300);

    window.addEventListener('resize', this.debouncedResize.bind(this));
    this.display();
  }

  display(): void {
    this.element.innerHTML = '';
    d3.select(this.element)
      .datum(this.profile)
      .call(this.flamegraph);
  }

  create(flameGraphWidth: number) {
    return flamegraph
      .flamegraph()
      .inverted(true)
      .cellHeight(20)
      .width(flameGraphWidth)
      .label(function(node) {
        return `${node.data.name} took ${node.value}s`;
      })
      .onClick(node => {
        this.displayNodeDetails(node);
      });
  }

  resizeToFitWindow(): void {
    this.flamegraph = this.create(this.curWindowWidth());
    this.display();
  }

  curWindowWidth(): number {
    return window.innerWidth - 40;
  }

  displayNodeDetails(node): void {
    document.querySelector(
      selectors.partial,
    )!.innerHTML = `File: ${node.data.name}`;

    document.querySelector(
      selectors.nodeTime,
    )!.innerHTML = `Total Time: <b>${formatNodeTime(node.value)}ms</b>`;

    document.querySelector(
      selectors.code,
    )!.innerHTML = `Code snippet: <i><span class="code-snippet">${node.data.code}</span></i>`;

    document.querySelector(
      selectors.line,
    )!.innerHTML = `Line: ${node.data.line}`;
  }

  destroy() {
    window.removeEventListener('resize', this.debouncedResize);
  }
}
