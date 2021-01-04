import * as d3 from 'd3';
import * as flamegraph from 'd3-flame-graph';
import 'd3-flame-graph/dist/d3-flamegraph.css';
import {debounce, escape} from 'lodash';
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
  codeAnchor: '[data-code-anchor]',
  codeNoAnchor: '[data-code-no-anchor]',
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
      .minFrameSize(1)
      .width(flameGraphWidth)
      .label(function(node: FlamegraphNode) {
        return escape(`${node.data.name} took ${formatNodeTime(node.value)}ms`);
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

    const code = document.querySelector(selectors.code);
    const codeLink = document.querySelector(selectors.codeAnchor);
    const codeNoLink = document.querySelector(selectors.codeNoAnchor);

    if (node.data.filepath) {
      const clickableLink = await this.generateClickableLink(
        node.data.filepath,
        node.data.line,
      );
      code!.querySelector('a')!.href = clickableLink;

      codeNoLink?.classList.add('hide');
      codeLink?.classList.remove('hide');
    } else {
      codeLink?.classList.add('hide');
      codeNoLink?.classList.remove('hide');
    }
    code!.querySelectorAll('.code-snippet').forEach(function(el) {
      el.textContent = node.data.code || node.data.filepath;
    });

    updateInfoText(selectors.line, `${node.data.line}`);
  }

  async generateClickableLink(
    filepath: string,
    lineNumber: number,
  ): Promise<any> {
    const url = this.url;
    const hostname = url.hostname;
    const themeId = await getThemeId();
    const link = `https://${hostname}/admin/themes/${themeId}?key=${filepath}${
      lineNumber ? `&line=${lineNumber}` : ''
    }`;
    return link;
  }

  destroy() {
    window.removeEventListener('resize', this.debouncedResize);
  }
}
