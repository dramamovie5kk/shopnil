import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { renderSalesText, SalesRichText } from '@/components/salespage/SalesRichText';
import { sanitizeSalesHtml, scopeSalesCss, salesPlainText } from '@/lib/salesRichText';

describe('sales page authored text', () => {
  it('accepts only trusted HTTPS font stylesheets for custom HTML', () => {
    const source = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind+Siliguri"><link rel="stylesheet" href="https://bad.test/style.css"><link rel="stylesheet" href="https://fonts.googleapis.com.evil.test/css2?family=X">';
    expect(sanitizeSalesHtml(source, 'fonts', true).fonts).toEqual(['https://fonts.googleapis.com/css2?family=Hind+Siliguri']);
    expect(sanitizeSalesHtml(source, 'fonts').fonts).toEqual([]);
  });
  it('preserves document colors, gradients, image overlays and responsive rules only inside custom HTML', () => {
    const { html, css } = sanitizeSalesHtml('<style>:root{--bg:#fdf6ed}body{background:var(--bg);color:#3d2618}.hero{position:relative;background:linear-gradient(red,blue)}.overlay{position:absolute;bottom:0}@media(min-width:768px){.hero{display:grid;grid-template-columns:7fr 5fr}}</style><div class="hero"><img src="https://example.com/product.jpg" alt="পণ্য" onerror="alert(1)"><svg viewBox="0 0 24 24"><path d="M0 0h2"/></svg><div class="overlay">পণ্য</div></div>', 'document', true);
    expect(css).toContain('--salesrt-document-bg:#fdf6ed');
    expect(css).toContain('background:var(--salesrt-document-bg)');
    expect(css).toContain('[data-sales-html-root]{');
    expect(css).toContain('background:linear-gradient(red,blue)');
    expect(css).toContain('position:absolute;bottom:0');
    expect(css).toContain('@media (min-width:768px)');
    expect(css).toContain('grid-template-columns:7fr 5fr');
    expect(html).toContain('src="https://example.com/product.jpg"');
    expect(html).toContain('<svg');
    expect(html).not.toContain('onerror');
  });
  it('keeps custom HTML safety boundaries against resources and checkout escapes', () => {
    const { html, css } = sanitizeSalesHtml('<style>@import "https://bad.test";:root{--bad:url(https://bad.test)}body{position:fixed}.x{background:url(https://bad.test)}.x:has(+button){color:red}</style><img src="data:image/svg+xml,bad"><script>alert(1)</script><form><input></form>', 'document', true);
    expect(css).not.toMatch(/url|fixed|has|import|https/);
    expect(html).not.toMatch(/<img|<script|<form|<input/);
  });
  it('preserves custom HTML structural containers in a block root without executable content', () => {
    const { container } = render(<SalesRichText layout text='<section style="display:flex;gap:8px"><article>পণ্য</article><script>alert(1)</script></section>' />);
    expect(container.querySelector('[data-sales-rich-text]')?.tagName).toBe('DIV');
    expect(container.querySelector('section')?.style.gap).toBe('8px');
    expect(container.querySelector('article')?.textContent).toBe('পণ্য');
    expect(container.querySelector('script')).toBeNull();
  });
  it('preserves safe grid and flex layout in custom HTML without allowing positioning escapes', () => {
    const { html, css } = sanitizeSalesHtml('<style>.offer{display:grid;grid-template-columns:1fr 1fr;gap:12px;position:fixed}.row{display:flex;align-items:center;justify-content:space-between}</style><div class="offer" style="box-sizing:border-box;min-width:0;box-shadow:0 2px 4px gray"><div class="row">পণ্য</div></div>', 'layout');
    expect(css).toContain('grid-template-columns:1fr 1fr');
    expect(css).toContain('gap:12px');
    expect(css).toContain('align-items:center');
    expect(css).toContain('justify-content:space-between');
    expect(html).toContain('box-sizing:border-box');
    expect(css).not.toContain('position');
  });
  it('keeps optional plain Bengali text unchanged', () => {
    const text = 'সাধারণ লেখা\nদ্বিতীয় লাইন';
    expect(renderSalesText(text)).toBe(text);
  });
  it('renders HTML and inline CSS rather than printing tags', () => {
    const { container } = render(<div>{renderSalesText('পণ্য <strong style="color:red;font-size:24px">সেরা</strong>')}</div>);
    expect(container.querySelector('strong')?.textContent).toBe('সেরা');
    expect(container.querySelector('strong')?.style.color).toBe('red');
    expect(container.querySelector('strong')?.style.fontSize).toBe('24px');
  });
  it('supports style blocks scoped separately for each field', () => {
    const { html, css } = sanitizeSalesHtml('<style>.offer {color:green} body {color:red}</style><b class="offer">অফার</b>', 'field1');
    expect(html).toContain('class="salesrt-field1-offer"');
    expect(css).toContain('[data-sales-rich-text="field1"] .salesrt-field1-offer{color:green}');
    expect(css).not.toMatch(/(^|\n)body/);
    expect(scopeSalesCss('.offer {color:green}', 'field2')).toContain('"field2"');
  });
  it('removes scripts, event handlers, forms and unsafe links', () => {
    const { html } = sanitizeSalesHtml('<script>alert(1)</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)" onclick="alert(1)">লিংক</a><form><input></form>', 'safe');
    expect(html).not.toMatch(/script|onerror|onclick|javascript:|<form|<input|<img/i);
    expect(html).toContain('লিংক');
  });
  it('blocks remote CSS, relational escapes and checkout-covering positioning', () => {
    const { html, css } = sanitizeSalesHtml('<style>@import "https://bad.test/x";.x{background-image:url(https://bad.test);position:fixed;color:blue} .x + button{color:red}</style><b style="position:fixed;z-index:9999;background:url(https://bad.test);color:red">লেখা</b>', 'safe');
    expect(css).not.toMatch(/import|https|url|fixed|button/);
    expect(html).not.toMatch(/fixed|z-index|https|url/);
    expect(html).toContain('color:red');
  });
  it('renders HTML and CSS inside a heading field like the hero headline', () => {
    const { container } = render(<h1>{renderSalesText('৩ পিস <span style="color:#f39c12">প্রিমিয়াম</span> বেড শিট')}</h1>);
    const span = container.querySelector<HTMLElement>('h1 [data-sales-html-root] [style]');
    expect(span?.textContent).toBe('প্রিমিয়াম');
    expect(span?.style.color).toBe('rgb(243, 156, 18)');
  });
  it('keeps full design CSS (gradients, pseudo badges, animations) in ordinary text fields', () => {
    const { container } = render(<p>{renderSalesText('<style>.b{background:linear-gradient(#000,#fff)}.b::after{content:"x";position:absolute}@keyframes k{to{opacity:1}}.b{animation:k 1s}</style><div class="b">ok</div>')}</p>);
    const css = container.querySelector('style:not(:empty)')?.textContent ?? '';
    expect(css).toContain('linear-gradient');
    expect(css).toContain('::after');
    expect(css).toMatch(/@keyframes salesrt-\S+-k/);
  });
  it('produces plain text for non-HTML destinations', () => {
    expect(salesPlainText('<style>b{color:red}</style><b>অর্ডার</b>')).toBe('অর্ডার');
  });
  it('isolates authored classes from existing site utilities', () => {
    expect(sanitizeSalesHtml('<b class="fixed z-50">লেখা</b>', 'safe').html).toContain('class="salesrt-safe-fixed salesrt-safe-z-50"');
  });
  it('drops full-screen body height from pasted pages so the HTML section has no empty gap', () => {
    const { css } = sanitizeSalesHtml('<style>body{min-height:100vh;padding:20px}.c{min-height:100vh}</style><div class="c">x</div>', 'g', true);
    expect(css).not.toMatch(/\[data-sales-html-root\]\{[^}]*min-height/);
    expect(css).toContain('padding:20px');
  });
});
