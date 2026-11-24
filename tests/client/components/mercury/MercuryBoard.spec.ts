import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import MercuryBoard from '@/client/components/mercury/MercuryBoard.vue';
import {MercuryModel} from '@/common/mercury/Mercury';
import {CardName} from '@/common/cards/CardName';
import {CardResource} from '@/common/CardResource';
import {SpaceModel} from '@/common/models/SpaceModel';
import {SpaceType} from '@/common/boards/SpaceType';
import {SpaceName} from '@/common/boards/SpaceName';
import {TileType} from '@/common/TileType';
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

function space(id: SpaceModel['id'], tileType?: TileType): SpaceModel {
  return {id, spaceType: SpaceType.COLONY, bonus: [], tileType};
}

const players = [{name: 'Leo', color: 'blue'}, {name: 'Anna', color: 'red'}] as Array<PublicPlayerModel>;

describe('MercuryBoard', () => {
  useFakeLocalStorage();

  it('draws the curved Mercury track from 0 to 13, with the prize dots and the marker', () => {
    const wrapper = mount(MercuryBoard, {...globalConfig, props: {model: model({track: 5})}});
    const cells = wrapper.findAll('.mercury-track__cell');
    expect(cells).to.have.length(14);
    expect(wrapper.findAll('.mercury-track__dot')).to.have.length(6);
    expect(wrapper.find('.mercury-track__cell--current').attributes('data-step')).eq('5');
    // The marker sits on step 5, and the track bends: steps further from the middle sit further left.
    const marker = wrapper.find('[data-test="mercury-marker"]').attributes('style');
    expect(marker).contains(cells[5].attributes('style')!.split(';')[0]);
    const left = (i: number) => parseInt(cells[i].attributes('style')!.match(/left: (\d+)px/)![1]);
    expect(left(0)).lt(left(7));
    expect(left(13)).lt(left(7));
  });

  it('shows the prizes: everybody on the right, the player who raised it on the left', () => {
    const wrapper = mount(MercuryBoard, {...globalConfig, props: {model: model()}});
    const seven = wrapper.find('[data-step="7"]');
    expect(seven.findAll('.mercury-track__everyone .mercury-icon').map((e) => e.classes())).deep.eq([
      ['mercury-icon', 'mercury-icon--act'], ['mercury-icon', 'mercury-icon--asset']]);
    expect(seven.findAll('.mercury-track__rising .mercury-icon')).to.have.length(1);
    expect(wrapper.find('[data-step="13"] .mercury-track__rising').exists()).is.false;
  });

  it('fills Market Colonies with the resources on it', () => {
    const wrapper = mount(MercuryBoard, {...globalConfig, props: {model: model({
      market: {microbe: 2, floater: 6, data: 0, other: 1},
      marketOther: [CardResource.ASTEROID],
    })}});
    expect(wrapper.find('[data-test="market-floater"]').findAll('[data-test="market-resource"]')).to.have.length(6);
    expect(wrapper.find('[data-test="market-microbe"]').findAll('[data-test="market-resource"]')).to.have.length(2);
    expect(wrapper.find('[data-test="market-data"]').findAll('[data-test="market-resource"]')).to.have.length(0);
    expect(wrapper.find('[data-test="market-other"] [data-test="market-resource"]').classes()).contains('card-resource-asteroid');
  });

  it('draws New Pompeii and Shadow Forest as board spaces, with their tiles', () => {
    const wrapper = mount(MercuryBoard, {...globalConfig, props: {
      model: model(),
      spaces: [space(SpaceName.NEW_POMPEII, TileType.CITY), space(SpaceName.SHADOW_FOREST)],
    }});
    expect(wrapper.find('#mercury_board').exists()).is.true;
    expect(wrapper.find(`[data_space_id="${SpaceName.NEW_POMPEII}"]`).exists()).is.true;
    expect(wrapper.find(`[data_space_id="${SpaceName.SHADOW_FOREST}"]`).exists()).is.true;
    expect(wrapper.findAll('.mercury-area')).to.have.length(2);
  });

  it('shows the Act deck size', () => {
    const wrapper = mount(MercuryBoard, {...globalConfig, props: {model: model({actDeckSize: 37})}});
    expect(wrapper.find('[data-test="act-deck-size"]').text()).eq('37');
  });

  it('lays out the Acts in development as cards with their tracks filled in', () => {
    const wrapper = mount(MercuryBoard, {...globalConfig, props: {
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
    const wrapper = mount(MercuryBoard, {...globalConfig, props: {model: model()}});
    expect(wrapper.find('.mercury-acts__empty').exists()).is.true;
  });
});
