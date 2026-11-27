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
    expect(marsSpaces[0].attributes('style')).contains('margin: 124px 0px 0px 300px');
    expect(wrapper.findAllComponents(BoardSpace)).has.length(177);
    // Off-Mars spaces orbit the planet; with only Phobos and Ganymede, they take the first two spots top left.
    const offMars = wrapper.findAllComponents(BoardSpace).filter((w) => w.attributes('data-test') === 'off-mars-space');
    expect(offMars).has.length(2);
    expect(offMars[0].attributes('style')).contains('margin: 67px 0px 0px 129px');
    expect(offMars[1].attributes('style')).contains('margin: 33px 0px 0px 199px');
    expect(wrapper.find('#colony_spaces').exists()).is.false;
  });

  it('puts an off-Mars space without a spot of its own under the board', () => {
    const wrapper = shallowMount(GigaMarsBoard, {
      ...globalConfig,
      props: {spaces: [...spaces, {id: 'c74', bonus: [], spaceType: SpaceType.COLONY}], expansions: DEFAULT_EXPANSIONS, venusScaleLevel: 0},
    });
    expect(wrapper.findAllComponents(BoardSpace).filter((w) => w.attributes('data-test') === 'off-mars-space')).has.length(2);
    expect(wrapper.find('#colony_spaces').findAllComponents(BoardSpace)).has.length(1);
  });

  it('shows the global parameters on the dial', () => {
    const wrapper = shallowMount(GigaMarsBoard, {
      ...globalConfig,
      props: {spaces, expansions: {...DEFAULT_EXPANSIONS, venus: true}, venusScaleLevel: 24, temperature: 3, oxygen_level: 7.5, oceans_count: 4},
    });
    const active = (track: string) => wrapper.find(`[data-test=giga-track-${track}] .val-is-active`).text();
    expect(wrapper.findAll('[data-test=giga-track-temperature] .global-numbers-value')).has.length(41);
    expect(wrapper.findAll('[data-test=giga-track-oxygen] .global-numbers-value')).has.length(31);
    expect(wrapper.findAll('[data-test=giga-track-venus] .global-numbers-value')).has.length(31);
    expect(active('temperature')).eq('+3');
    expect(active('oxygen')).eq('7.5');
    expect(active('venus')).eq('24');
    expect(wrapper.find('[data-test=giga-oceans]').text()).eq('4/21');
    // Heat production x2, ocean, temperature, card, TR, colony.
    expect(wrapper.findAll('.giga-dial-bonus')).has.length(7);
  });

  it('leaves out the Venus track without Venus, and ticks off the oceans when they are all placed', () => {
    const wrapper = shallowMount(GigaMarsBoard, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, venusScaleLevel: 0, temperature: -30, oxygen_level: 0, oceans_count: 21},
    });
    expect(wrapper.find('[data-test=giga-track-venus]').exists()).is.false;
    expect(wrapper.findAll('.giga-dial-bonus')).has.length(4);
    expect(wrapper.find('[data-test=giga-oceans] img').exists()).is.true;
  });

  it('is what Board draws for the GIGA board', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, tileView: 'show', venusScaleLevel: 0, boardName: BoardName.GIGA},
    });
    expect(wrapper.findComponent(GigaMarsBoard).exists()).is.true;
  });
});
