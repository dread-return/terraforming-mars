/**
 * Makes a card's content fit its card face.
 *
 * Some cards have more icons or text than their face has room for: the text runs under the victory point badge, the
 * resource counter or the expansion icon, is cut off at the bottom (only readable by scrolling or hovering), or a
 * row of icons is wider than the card. This zooms the card's content out just enough to fit, down to MIN_ZOOM; the
 * content box is widened in its own pixels at the same time, so text re-wraps into the extra room. A card that still
 * doesn't fit stays at MIN_ZOOM and keeps the usual scrolling and tall-on-hover behaviour.
 *
 * The zoom is set through the --card-fit custom property and the card-content--fit class (cards_v2.less), so the
 * tall-on-hover rule still wins over the fitted height. Standard project cards (Industries) keep their box's own
 * size (cards.less unsets it), so there the content just gets smaller.
 */

export const MIN_ZOOM = 0.66;
const FIT_CLASS = 'card-content--fit';
const FURNITURE = '.card-points, .card-resources-counter, .resource-card-icon-expansion-container, .project-icon-expansion-container';
const ICONS = '.card-item-container, .card-production-box, .card-effect-box, .card-resource, .card-tile, .card-special';

function overlaps(a: DOMRect, b: DOMRect, pad: number): boolean {
  return a.left < b.right - pad && a.right > b.left + pad && a.top < b.bottom - pad && a.bottom > b.top + pad;
}

function textLines(el: HTMLElement): Array<DOMRect> {
  const rects: Array<DOMRect> = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    if ((node.textContent ?? '').trim() === '') {
      continue;
    }
    range.selectNodeContents(node);
    for (const r of Array.from(range.getClientRects())) {
      if (r.width > 0) {
        rects.push(r);
      }
    }
  }
  return rects;
}

/** Whether everything in `content` is visible and clear of the card's badges. */
export function cardContentFits(card: HTMLElement, content: HTMLElement): boolean {
  if (content.scrollHeight > content.clientHeight + 1) {
    return false;
  }
  const cardRect = card.getBoundingClientRect();
  const furniture = Array.from(card.querySelectorAll<HTMLElement>(FURNITURE))
    .filter((el) => !content.contains(el))
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 0);
  for (const line of textLines(content)) {
    if (line.right > cardRect.right - 4 || line.left < cardRect.left + 4 || line.bottom > cardRect.bottom - 3) {
      return false;
    }
    if (furniture.some((f) => overlaps(line, f, 2))) {
      return false;
    }
  }
  for (const el of Array.from(content.querySelectorAll<HTMLElement>(ICONS))) {
    const r = el.getBoundingClientRect();
    if (r.width === 0) {
      continue;
    }
    if (r.right > cardRect.right - 2 || r.left < cardRect.left + 2 || r.bottom > cardRect.bottom - 1) {
      return false;
    }
    if (furniture.some((f) => overlaps(r, f, 3))) {
      return false;
    }
  }
  return true;
}

function setZoom(content: HTMLElement, zoom: number | undefined): void {
  if (zoom === undefined) {
    content.classList.remove(FIT_CLASS);
    for (const p of ['--card-fit', '--card-fit-w', '--card-fit-h', '--card-fit-pad']) {
      content.style.removeProperty(p);
    }
    return;
  }
  if (!content.classList.contains(FIT_CLASS)) {
    // The box's own size (cards differ: standard projects are shorter), so zoomed out it covers the same area.
    const cs = getComputedStyle(content);
    content.style.setProperty('--card-fit-w', cs.width);
    content.style.setProperty('--card-fit-h', cs.height);
    content.style.setProperty('--card-fit-pad', cs.paddingTop);
    content.classList.add(FIT_CLASS);
  }
  content.style.setProperty('--card-fit', String(zoom));
}

/** Fits the content of one card (a .card-container element). Returns the zoom used (1 when it already fit). */
export function fitCardContent(card: HTMLElement): number {
  const content = card.querySelector<HTMLElement>(':scope > .card-content-wrapper > .card-content');
  if (content === null || card.getBoundingClientRect().width === 0) {
    return 1;
  }
  setZoom(content, undefined);
  if (cardContentFits(card, content)) {
    return 1;
  }
  setZoom(content, MIN_ZOOM);
  if (!cardContentFits(card, content)) {
    return MIN_ZOOM;
  }
  let low = MIN_ZOOM;
  let high = 1;
  for (let i = 0; i < 6; i++) {
    const mid = (low + high) / 2;
    setZoom(content, mid);
    if (cardContentFits(card, content)) {
      low = mid;
    } else {
      high = mid;
    }
  }
  setZoom(content, low);
  return low;
}

// Cards are fitted when they first come into view (the card list has thousands; hands are often collapsed).
let observer: IntersectionObserver | undefined;

function getObserver(): IntersectionObserver | undefined {
  if (observer === undefined && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          observer?.unobserve(entry.target);
          fitCardContent(entry.target as HTMLElement);
        }
      }
    }, {rootMargin: '200px'});
  }
  return observer;
}

/** Fits `card` once it's on screen, and again once the fonts have loaded. */
export function fitCardContentWhenVisible(card: HTMLElement): void {
  const obs = getObserver();
  if (obs === undefined) {
    return;
  }
  obs.unobserve(card);
  obs.observe(card);
  document.fonts?.ready.then(() => {
    if (card.isConnected && card.getBoundingClientRect().width > 0) {
      obs.unobserve(card);
      obs.observe(card);
    }
  });
}
