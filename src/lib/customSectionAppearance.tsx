import { Children, cloneElement, createElement, isValidElement, type ReactNode, type CSSProperties, type ReactElement } from 'react';
import { customDesktopLayoutStyle, customElementStyle, type CustomElementKey, type CustomElementStyles } from './customSectionElements';

/** Apply only to authored layout nodes, never descend into the sanitized text renderer. */
export function applyCustomSectionAppearance(node: ReactNode, styles?: CustomElementStyles, mediaParent?: 'image' | 'video'): ReactNode {
  const result = Children.map(node, child => {
    if (!isValidElement(child)) return child;
    const element = child as ReactElement<{ children?: ReactNode; style?: CSSProperties; className?: string; 'data-custom-element'?: CustomElementKey }>;
    const props = element.props;
    const tag = typeof element.type === 'string' ? element.type : '';
    const classes = props.className || '';
    let key = props['data-custom-element'];
    if (!key) {
      if (tag === 'h2') key = 'heading';
      else if (tag === 'h4' || tag === 'summary') key = 'itemHeading';
      else if (tag === 'p') key = 'itemText';
      else if (tag === 'img' || (props as { src?: string }).src && tag !== 'iframe') key = 'image';
      else if (tag === 'iframe') key = 'video';
      else if (tag === 'details' || classes.includes('p-4') || classes.includes('grid-cols-3')) key = 'item';
      else if (classes.includes('text-4xl')) key = 'price';
      else if (classes.includes('text-3xl') || classes.includes('rounded-full') && !classes.includes('w-2')) key = 'icon';
    }
    const override = key ? styles?.[key] : undefined;
    const media = key === 'image' || key === 'video' ? key : undefined;
    const decorated = cloneElement(element, {
      style: override ? { ...props.style, ...customElementStyle(override) } : props.style,
      ...(props.children !== undefined ? { children: applyCustomSectionAppearance(props.children, styles, media || mediaParent) } : {}),
    });
    return media && !mediaParent ? createElement('div', {
      className: 'custom-section-media-layout',
      style: customDesktopLayoutStyle(override),
      'data-custom-media': media,
    }, decorated) : decorated;
  });
  return Array.isArray(node) ? result : result?.[0] ?? null;
}