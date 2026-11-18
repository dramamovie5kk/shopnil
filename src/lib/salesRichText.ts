import DOMPurify from 'dompurify';
import * as cssTree from 'css-tree';

// Presentation only: never allow CSS to fetch resources, cover checkout, or hide other content.
const allowedProperties = /^(color|background-color|font-(size|weight|style|family|variant)|line-height|letter-spacing|word-spacing|text-(align|decoration|transform|shadow|indent|overflow)|white-space|overflow-wrap|word-break|vertical-align|border(-(?:top|right|bottom|left))?(-(?:color|style|width|radius))?|border-radius|padding(-(?:top|right|bottom|left))?|margin(-(?:top|right|bottom|left))?|max-width|min-width|width|height|min-height|max-height|display|list-style-type|opacity|box-sizing|box-shadow|gap|row-gap|column-gap|flex(-(?:direction|wrap|flow|grow|shrink|basis))?|align-(?:items|content|self)|justify-(?:items|content|self)|grid-(?:template-(?:columns|rows)|auto-(?:columns|rows|flow)|column|row)|aspect-ratio)$/;
const unsafeValue = /url\s*\(|expression\s*\(|@|\\|\/\*|(?:env|attr)\s*\(/i;

export function sanitizeSalesCssDeclarations(source: string, layout = false, scope = '', keyframes: Set<string> = new Set()): string {
  try {
    const ast = cssTree.parse(source, { context: 'declarationList' });
    if (ast.type !== 'DeclarationList') return '';
    const safe: string[] = [];
    ast.children.forEach(node => {
      if (node.type !== 'Declaration') return;
      const property = node.property.toLowerCase();
      const layoutProperty = /^(background|object-fit|object-position|order|position|top|right|bottom|left|inset|z-index|overflow|overflow-x|overflow-y|transform|transform-origin|transition(-[a-z-]+)?|animation(-[a-z-]+)?|pointer-events|cursor|stroke-width|fill|stroke|-webkit-font-smoothing|backdrop-filter|content)$/.test(property);
      const variable = /^--[\w-]+$/.test(property);
      if (!allowedProperties.test(property) && !(layout && (layoutProperty || variable))) return;
      let value = cssTree.generate(node.value);
      if (unsafeValue.test(value) || node.important || (!layout && /var\s*\(/i.test(value))) return;
      if (property === 'position' && !/^(relative|absolute|static|sticky)$/.test(value)) return;
      if (layout) value = value.replace(/--([\w-]+)/g, `--salesrt-${scope}-$1`);
      if (layout && /^animation(-name)?$/.test(property)) value = value.replace(/[A-Za-z_][\w-]*/g, name => keyframes.has(name) ? `salesrt-${scope}-${name}` : name);
      // Negative spacing and giant dimensions can obscure unrelated controls.
      if (/^(margin|width|height|max-|min-|font-size|text-indent|gap|row-gap|column-gap|flex-basis|grid-)/.test(node.property) && /-\d|\d{4,}/.test(value)) return;
      safe.push(`${variable ? `--salesrt-${scope}-${property.slice(2)}` : property}:${value}`);
    });
    return safe.join(';');
  } catch { return ''; }
}

export function scopeSalesCss(source: string, scope: string, layout = false): string {
  try {
    const ast = cssTree.parse(source);
    if (ast.type !== 'StyleSheet') return '';
    const root = `[data-sales-rich-text="${scope}"] [data-sales-html-root]`;
    const keyframes = new Set<string>();
    if (layout) cssTree.walk(ast, node => { if (node.type === 'Atrule' && /^(-webkit-)?keyframes$/.test(node.name) && node.prelude) keyframes.add(cssTree.generate(node.prelude).trim()); });
    const compile = (children: typeof ast.children): string => {
    const rules: string[] = [];
    children.forEach(node => {
      if (layout && node.type === 'Atrule' && node.name === 'media' && node.block && node.prelude) {
        const query = cssTree.generate(node.prelude);
        if (/^[\w\s():.,\/-]+$/.test(query)) rules.push(`@media ${query}{${compile(node.block.children as typeof ast.children)}}`);
        return;
      }
      if (layout && node.type === 'Atrule' && /^(-webkit-)?keyframes$/.test(node.name) && node.block && node.prelude) {
        const name = cssTree.generate(node.prelude).trim();
        if (!/^[A-Za-z_][\w-]*$/.test(name)) return;
        const frames: string[] = [];
        node.block.children.forEach(frame => {
          if (frame.type !== 'Rule') return;
          const selector = cssTree.generate(frame.prelude);
          if (!/^[\s\d.%,a-z]+$/i.test(selector)) return;
          const body = sanitizeSalesCssDeclarations(cssTree.generate(frame.block).slice(1, -1), layout, scope, keyframes);
          if (body) frames.push(`${selector}{${body}}`);
        });
        rules.push(`@keyframes salesrt-${scope}-${name}{${frames.join('')}}`);
        return;
      }
      if (node.type !== 'Rule' || node.prelude?.type !== 'SelectorList') return;
      const declarations = sanitizeSalesCssDeclarations(cssTree.generate(node.block).slice(1, -1), layout, scope, keyframes);
      if (!declarations) return;
      const selectors: string[] = [];
      node.prelude.children.forEach(selector => {
        const text = cssTree.generate(selector);
        // Restrict to ordinary descendant selectors; no sibling/relational escapes.
        if ((/^[\w\s.*\->]+$/.test(text) || (layout && /^[\w\s.*\->:]+$/.test(text) && !/:(?!:?(?:root|hover|active|focus|focus-visible|before|after)\b)/.test(text))) && !/[+~]/.test(text)) {
          const scopedClasses = text.replace(/\.([\w-]+)/g, `.salesrt-${scope}-$1`);
          selectors.push(layout
            ? (/^(?:html|body|:root)$/.test(text) ? root : `${root} ${scopedClasses.replace(/^(?:html|body|:root)\s*/, '')}`)
            : `[data-sales-rich-text="${scope}"] ${scopedClasses}`);
        }
      });
      if (!selectors.length) return;
      // A pasted page's body usually fills the browser (min-height:100vh + centering); inside a section that only adds empty space.
      const rootOnly = selectors.filter(sel => sel === root);
      const rest = selectors.filter(sel => sel !== root);
      if (rest.length) rules.push(`${rest.join(',')}{${declarations}}`);
      const rootDeclarations = declarations.split(';').filter(d => !/^(min-height|height):.*v(h|min|max)\b/.test(d)).join(';');
      if (rootOnly.length && rootDeclarations) rules.push(`${root}{${rootDeclarations}}`);
    });
    return rules.join('\n');
    };
    return compile(ast.children);
  } catch { return ''; }
}

export function sanitizeSalesHtml(source: string, scope: string, layout = false): { html: string; css: string; fonts: string[] } {
  // Parse inertly; never insert unsanitized elements into the live document.
  const document = new DOMParser().parseFromString(source, 'text/html');
  const fonts = layout ? Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.getAttribute('href') || '').filter(href => {
    try {
      const url = new URL(href);
      return url.protocol === 'https:' && url.hostname === 'fonts.googleapis.com' && /^\/css2?$/.test(url.pathname) && !url.username && !url.password;
    } catch { return false; }
  }) : [];
  const css = Array.from(document.querySelectorAll('style')).map(style => scopeSalesCss(style.textContent || '', scope, layout)).join('\n');
  document.querySelectorAll('style').forEach(style => style.remove());
  const html = DOMPurify.sanitize(document.body.innerHTML, {
    ALLOWED_TAGS: ['span', 'div', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'small', 'mark', 'sub', 'sup', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'hr', ...(layout ? ['section', 'article', 'header', 'footer', 'main', 'aside', 'nav', 'figure', 'figcaption', 'img', 'svg', 'path', 'circle', 'rect', 'line', 'polyline'] : [])],
    ALLOWED_ATTR: ['class', 'style', 'href', 'title', 'dir', 'lang', ...(layout ? ['src', 'alt', 'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'points', 'aria-hidden'] : [])],
    ALLOW_DATA_ATTR: false,
  });
  const clean = new DOMParser().parseFromString(html, 'text/html');
  clean.querySelectorAll('[class]').forEach(element => {
    const classes = (element.getAttribute('class') || '').split(/\s+/).filter(name => /^[\w-]+$/.test(name));
    element.setAttribute('class', classes.map(name => `salesrt-${scope}-${name}`).join(' '));
  });
  clean.querySelectorAll('[style]').forEach(element => {
    const style = sanitizeSalesCssDeclarations(element.getAttribute('style') || '', layout, scope);
    if (style) element.setAttribute('style', style);
    else element.removeAttribute('style');
  });
  // Common order-link anchors from pasted designs scroll to the real checkout.
  clean.querySelectorAll('a[href]').forEach(link => {
    if (/^#(order|buy|checkout|order-form|orderform)$/i.test(link.getAttribute('href') || '')) link.setAttribute('href', '#checkout');
  });
  clean.querySelectorAll('img').forEach(image => {
    if (!/^https?:\/\//i.test(image.getAttribute('src') || '')) image.remove();
  });
  return { html: clean.body.innerHTML, css, fonts };
}

export const hasSalesMarkup = (text: string): boolean => /<\/?[a-z][^>]*>/i.test(text);

export function splitSalesText(text: string, separator: string | RegExp): string[] {
  return hasSalesMarkup(text) ? [text] : text.split(separator);
}

export function salesPlainText(text: string): string {
  if (!hasSalesMarkup(text)) return text;
  const doc = new DOMParser().parseFromString(text, 'text/html');
  doc.querySelectorAll('style,script').forEach(element => element.remove());
  return doc.body.textContent || '';
}