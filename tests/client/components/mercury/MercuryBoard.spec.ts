import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import MercuryBoard from '@/client/components/mercury/MercuryBoard.vue';
import {MercuryModel} from '@/common/mercury/Mercury';
import {CardName} from '@/common/cards/CardName';
import {useFakeLocalStorage} from '../FakeLocalStorage';

function model(overrides: Partial<MercuryModel> = {}): MercuryModel {
  return {
    track: 0,
    market: {microbe: 0, floater: 0, data: 0, other: 0},
    developments: [],
    actDeckSize: 40,
    actDiscardSize: 0,
    ...overrides,
  };
}

describe('MercuryBoard', () => {
  useFakeLocalStorage();

  it('draws the Mercury track from 0 to 13, with the prize dots', () => {
    const wrapper = mount(MercuryBoard, {...globalConfig, props: {model: model({track: 5})}});
    const cells = wrapper.findAll('.mercury-track__cell');
    expect(cells).to.have.length(14);
    expect(wrapper.findAll('.mercury-track__dot')).to.have.length(6);
    expect(wrapper.find('.mercury-track__cell--current').attributes('data-step')).eq('5');
  });

  it('shows the Market Colonies stock', () => {
    const wrapper = mount(MercuryBoard, {...globalConfig, props: {model: model({market: {microbe: 2, floater: 6, data: 0, other: 1}})}});
    expect(wrapper.find('[data-test="market-floater"]').text()).contains('6 / 6');
    expect(wrapper.find('[data-test="market-microbe"]').text()).contains('2 / 6');
  });

  it('shows one track for a Treaty and two for a Rivalry', () => {
    const wrapper = mount(MercuryBoard, {...globalConfig, props: {model: model({
      developments: [
        {card: CardName.FUNDRAISING_EVENTS, kind: 'treaty', initiator: 'blue', partner: 'red', steps: [6, 6], progress: [2, 0]},
        {card: CardName.INEQUALITY_FUND, kind: 'rivalry', initiator: 'red', partner: 'green', steps: [4, 5], progress: [1, 3]},
      ],
    })}});
    const acts = wrapper.findAll('[data-test="mercury-act"]');
    expect(acts).to.have.length(2);
    expect(acts[0].findAll('[data-test="act-progress"]').map((e) => e.text())).deep.eq(['2 / 6']);
    expect(acts[1].findAll('[data-test="act-progress"]').map((e) => e.text())).deep.eq(['1 / 4', '3 / 5']);
  });

  it('says when no Act is in development', () => {
    const wrapper = mount(MercuryBoard, {...globalConfig, props: {model: model()}});
    expect(wrapper.find('.mercury-board__empty').exists()).is.true;
  });
});
