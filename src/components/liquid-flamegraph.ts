import * as d3 from 'd3';
import * as flamegraph from 'd3-flame-graph';
import 'd3-flame-graph/dist/d3-flamegraph.css';
import {debounce} from 'lodash';
import {
  formatNodeTime,
  getThemeId,
  emptyHTMLNode,
  updateInfoText,
} from '../utils';

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
  url: URL;

  constructor(element: HTMLDivElement | null, profile: object, url: URL) {
    if (!element) {
      throw new TypeError('Element does not exist on page');
    }
    this.element = element;
    this.profile = profile;
    this.url = url;
    this.flamegraph = this.create(this.curWindowWidth());
    this.debouncedResize = debounce(this.resizeToFitWindow, 300);

    window.addEventListener('resize', this.debouncedResize.bind(this));
    this.display();
  }

  display(): void {
    emptyHTMLNode(this.element);
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
    updateInfoText(selectors.partial, node.data.name);
    updateInfoText(selectors.nodeTime, `${formatNodeTime(node.value)}ms`);

    const clickableLink = await this.generateClickableLink(
      node.data.name,
      node.data.line,
    );

    const codeLink = document.querySelector(selectors.code);
    codeLink!.querySelector('a')!.href = clickableLink;
    codeLink!.querySelector('.code-snippet')!.textContent = node.data.code;

    updateInfoText(selectors.line, `${node.data.line}`);
  }

  async generateClickableLink(
    fileName: string,
    lineNumber: number,
  ): Promise<any> {
    const url = this.url;
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
