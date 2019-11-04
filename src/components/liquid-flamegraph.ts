import * as d3 from 'd3';
import * as flamegraph from 'd3-flame-graph';
import 'd3-flame-graph/dist/d3-flamegraph.css';
import {debounce} from 'lodash';
import {formatNodeTime, getThemeId, getURL} from '../utils';

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

  constructor(element: HTMLDivElement | null, profile: object) {
    if (!element) {
      throw new TypeError('Element does not exist on page');
    }
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
      .label(function(node: FlamegraphNode) {
        return `${node.data.name} took ${formatNodeTime(node.value)}ms`;
      })
      .onClick((node: FlamegraphNode) => {
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

  async displayNodeDetails(node: FlamegraphNode) {
    document.querySelector(
      selectors.partial,
    )!.innerHTML = `File: ${node.data.name}`;

    document.querySelector(
      selectors.nodeTime,
    )!.innerHTML = `Total Time: <b>${formatNodeTime(node.value)}ms</b>`;

    const clickableLink = await this.generateClickableLink(
      node.data.name,
      node.data.line,
    );

    document.querySelector(
      selectors.code,
    )!.innerHTML = `Code snippet: <a href="${clickableLink}" target="_blank"><i><span class="code-snippet">${node.data.code}</span></i></a>`;

    document.querySelector(
      selectors.line,
    )!.innerHTML = `Line: ${node.data.line}`;
  }

  async generateClickableLink(
    fileName: string,
    lineNumber: number,
  ): Promise<any> {
    const url = new URL(await getURL());
    const hostname = url.hostname;
    const themeId = await getThemeId();
    const fileDetails = fileName.split(':');
    const link = `https://${hostname}/admin/themes/${themeId}?key=${fileDetails[0]}s/${fileDetails[1]}.liquid&line=${lineNumber}`;
    return link;
  }

  destroy() {
    window.removeEventListener('resize', this.debouncedResize);
  }
}
