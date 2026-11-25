import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import MercuryActs from '@/client/components/mercury/MercuryActs.vue';
import {MercuryModel} from '@/common/mercury/Mercury';
import {CardName} from '@/common/cards/CardName';
import {PublicPlayerModel} from '@/common/models/PlayerModel';
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

const players = [{name: 'Leo', color: 'blue'}, {name: 'Anna', color: 'red'}] as Array<PublicPlayerModel>;

describe('MercuryActs', () => {
  useFakeLocalStorage();

  it('lays out the Acts in development as cards with their tracks filled in', () => {
    const wrapper = mount(MercuryActs, {...globalConfig, props: {
      model: model({
        developments: [
          {card: CardName.FUNDRAISING_EVENTS, kind: 'treaty', initiator: 'blue', partner: 'red', steps: [6, 6], progress: [2, 0]},
          {card: CardName.INEQUALITY_FUND, kind: 'rivalry', initiator: 'red', partner: 'blue', steps: [4, 5], progress: [1, 3]},
        ],
      }),
      players,
    }});
    const acts = wrapper.findAll('[data-test="mercury-act"]');
    expect(acts).to.have.length(2);
    expect(acts[0].findAll('[data-test="act-progress"]').map((e) => e.text())).deep.eq(['2 / 6']);
    expect(acts[1].findAll('[data-test="act-progress"]').map((e) => e.text())).deep.eq(['1 / 4', '3 / 5']);
    expect(acts[0].find('.mercury-acts__players').text()).contains('Leo').and.contains('Anna');
    // The card's own track: a Treaty fills the shared row; a Rivalry fills each side.
    expect(acts[0].findAll('[data-test="act-step-filled"]')).to.have.length(2);
    expect(acts[1].findAll('.act-track__line--initiator [data-test="act-step-filled"]')).to.have.length(1);
    expect(acts[1].findAll('.act-track__line--partner [data-test="act-step-filled"]')).to.have.length(3);
  });

  it('says when no Act is in development', () => {
    const wrapper = mount(MercuryActs, {...globalConfig, props: {model: model()}});
    expect(wrapper.find('.mercury-acts__empty').exists()).is.true;
  });
});
