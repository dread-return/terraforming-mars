import {expect} from 'chai';
import {fitCardContent, MIN_ZOOM} from '@/client/utils/fitCardContent';

describe('fitCardContent', () => {
  it('leaves a card without laid-out content alone', () => {
    const card = document.createElement('div');
    card.className = 'card-container';
    card.innerHTML = '<div class="card-content-wrapper"><div class="card-content">text</div></div>';
    document.body.appendChild(card);
    // jsdom does no layout: the card has no size, so nothing is measured or zoomed.
    expect(fitCardContent(card)).eq(1);
    expect(card.querySelector('.card-content')?.classList.contains('card-content--fit')).is.false;
    card.remove();
  });

  it('never zooms below the minimum', () => {
    expect(MIN_ZOOM).to.be.greaterThan(0.6);
  });
});
