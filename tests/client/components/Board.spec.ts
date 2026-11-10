import {shallowMount} from '@vue/test-utils';
import {globalConfig} from './getLocalVue';
import {expect} from 'chai';
import Board from '@/client/components/Board.vue';
import BoardSpace from '@/client/components/BoardSpace.vue';
import {SpaceModel} from '@/common/models/SpaceModel';
import {SpaceType} from '@/common/boards/SpaceType';
import {DEFAULT_EXPANSIONS} from '@/common/cards/GameModule';
import {BoardName} from '@/common/boards/BoardName';
import {SpaceName} from '@/common/boards/SpaceName';
import {TileType} from '@/common/TileType';

const spaces: SpaceModel[] = [
  {
    id: 'c01',
    bonus: [],
    spaceType: SpaceType.COLONY,
    color: undefined,
    highlight: undefined,
    tileType: undefined,
  },
  {
    id: 'c02',
    bonus: [],
    spaceType: SpaceType.COLONY,
    color: undefined,
    highlight: undefined,
    tileType: undefined,
  },
  {
    id: 'c69',
    bonus: [],
    spaceType: SpaceType.COLONY,
    color: undefined,
    highlight: undefined,
    tileType: undefined,
  },
  {
    id: '04',
    bonus: [],
    spaceType: SpaceType.OCEAN,
    color: undefined,
    highlight: undefined,
    tileType: undefined,
  },
];


describe('Board', () => {
  it('has visible tiles on the board', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, tileView: 'hide', venusScaleLevel: 0, boardName: BoardName.THARSIS},
    });

    const boardSpacesWrappers = wrapper.findAllComponents(BoardSpace).filter((wrapper) => {
      return wrapper.attributes('data-test') === 'board-space';
    });

    expect(
      boardSpacesWrappers.every((wrapper) => wrapper.props('tileView') === 'hide'),
    ).to.be.true;
  });

  it('has hidden tiles on the board', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, tileView: 'show', venusScaleLevel: 0, boardName: BoardName.THARSIS},
    });

    const boardSpacesWrappers = wrapper.findAllComponents(BoardSpace).filter((wrapper) => {
      return wrapper.attributes('data-test') === 'board-space';
    });

    expect(
      boardSpacesWrappers.every((wrapper) => wrapper.props('tileView') === 'show'),
    ).to.be.true;
  });

  it('emits toggleTileView on toggle button click', async () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, venusScaleLevel: 0, boardName: BoardName.THARSIS},
    });

    await wrapper.find('[data-test=hide-tiles-button]').trigger('click');
    expect(wrapper.emitted('toggleTileView')?.length).to.be.eq(1);
  });

  it('renders "show tiles" in toggle button if tiles are hidden', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, tileView: 'show', venusScaleLevel: 0, boardName: BoardName.THARSIS},
    });

    expect(wrapper.find('[data-test=hide-tiles-button]').text()).to.be.eq('show tiles');
  });

  it('renders "hide tiles" in toggle button if tiles are visible', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, tileView: 'hide', venusScaleLevel: 0, boardName: BoardName.THARSIS},
    });

    expect(wrapper.find('[data-test=hide-tiles-button]').text()).to.be.eq('hide tiles');
  });

  it('updates off-Mars spaces when the spaces change', async () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces, expansions: DEFAULT_EXPANSIONS, venusScaleLevel: 0, boardName: BoardName.THARSIS},
    });

    const updated = spaces.map((s) => s.id === SpaceName.GANYMEDE_COLONY ? {...s, tileType: TileType.CITY} : s);
    await wrapper.setProps({spaces: updated});

    const ganymede = wrapper.findAllComponents(BoardSpace).find((w) => w.props('text') === 'Ganymede Colony');
    expect(ganymede?.props('space').tileType).to.eq(TileType.CITY);
  });

  function venusValues(wrapper: ReturnType<typeof shallowMount>): Array<string> {
    return wrapper.findAll('.global-numbers-venus .global-numbers-value').map((w) => w.text());
  }

  it('draws the 0..30% Venus track', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {spaces, expansions: {...DEFAULT_EXPANSIONS, venus: true}, venusScaleLevel: 0, boardName: BoardName.THARSIS},
    });
    const values = venusValues(wrapper);
    expect(values).has.length(16);
    expect(values[0]).eq('30');
    expect(wrapper.classes()).does.not.include('board-cont--venus2');
  });

  it('draws the 24-step Venus Phase 2 track', () => {
    const wrapper = shallowMount(Board, {
      ...globalConfig,
      props: {
        spaces,
        expansions: {...DEFAULT_EXPANSIONS, venus: true, venusphase2: true},
        venusScaleLevel: 40,
        boardName: BoardName.AMAZONIS_PLANITIA,
        altVenusBoard: true,
        venusPhase2Track: true,
      },
    });
    const values = venusValues(wrapper);
    expect(values).has.length(25);
    expect(values[0]).eq('48');
    expect(values).does.not.include('33');
    expect(wrapper.find('.global-numbers-venus .val-is-active').text()).eq('40');
    expect(wrapper.classes()).includes('board-cont--venus2');
    expect(wrapper.find('.global-numbers').classes()).includes('global-numbers--venus2');
    // The Alt. Venus board's bonuses are replaced.
    expect(wrapper.find('.global-alt-venus').exists()).is.false;
  });
});
