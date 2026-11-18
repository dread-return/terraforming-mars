import {shallowMount} from '@vue/test-utils';
import {globalConfig} from './getLocalVue';
import {expect} from 'chai';
import GigaMarsBoard from '@/client/components/GigaMarsBoard.vue';
import Board from '@/client/components/Board.vue';
import BoardSpace from '@/client/components/BoardSpace.vue';
import {SpaceModel} from '@/common/models/SpaceModel';
import {SpaceType} from '@/common/boards/SpaceType';
import {DEFAULT_EXPANSIONS} from '@/common/cards/GameModule';
import {BoardName} from '@/common/boards/BoardName';
import {GIGA_SPACES} from '@/common/boards/gigaMap';

const spaces: Array<SpaceModel> = [
  {id: 'c01', bonus: [], spaceType: SpaceType.COLONY},
  {id: 'c02', bonus: [], spaceType: SpaceType.COLONY},
  ...GIGA_SPACES.map((s) => ({id: s.id, bonus: [...s.bonus], spaceType: s.kind === 'ocean' ? SpaceType.OCEAN : SpaceType.LAND})),
];

describe('GigaMarsBoard', () => {
  it('places every Mars space and lists the off-Mars spaces', () => {
    const wrapper = shallowMount(GigaMarsBoard, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, venusScaleLevel: 0, temperature: -12, oxygen_level: 7.5, oceans_count: 4},
    });
    const marsSpaces = wrapper.findAllComponents(BoardSpace).filter((w) => w.attributes('data-test') === 'board-space');
    expect(marsSpaces).has.length(175);
    // Space 1 is the first hex of the top row; space 175 the last hex of the bottom row.
    expect(marsSpaces[0].attributes('style')).contains('margin: 8px 0px 0px 174px');
    expect(wrapper.findAllComponents(BoardSpace)).has.length(177);
  });

  it('shows the global parameters', () => {
    const wrapper = shallowMount(GigaMarsBoard, {
      ...globalConfig,
      props: {spaces, expansions: {...DEFAULT_EXPANSIONS, venus: true}, venusScaleLevel: 24, temperature: 3, oxygen_level: 7.5, oceans_count: 21},
    });
    expect(wrapper.find('[data-test=giga-track-value-temperature]').text()).eq('+3 °C');
    expect(wrapper.find('[data-test=giga-track-value-oxygen]').text()).eq('7.5 %');
    expect(wrapper.find('[data-test=giga-track-value-venus]').text()).eq('24 %');
    // 21 oceans is the maximum.
    expect(wrapper.find('[data-test=giga-track-value-oceans] img').exists()).is.true;
  });

  it('is what Board draws for the GIGA board', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, tileView: 'show', venusScaleLevel: 0, boardName: BoardName.GIGA},
    });
    expect(wrapper.findComponent(GigaMarsBoard).exists()).is.true;
  });
});
