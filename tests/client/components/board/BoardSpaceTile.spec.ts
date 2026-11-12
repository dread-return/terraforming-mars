import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import BoardSpaceTile from '@/client/components/board/BoardSpaceTile.vue';
import {SpaceType} from '@/common/boards/SpaceType';
import {TileType} from '@/common/TileType';
import {SpaceModel} from '@/common/models/SpaceModel';

describe('BoardSpaceTile', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(BoardSpaceTile, {
      ...globalConfig,
      props: {
        space: {
          id: '01',
          bonus: [],
          color: undefined,
          tileType: undefined,
          spaceType: SpaceType.LAND,
          highlight: undefined,
        },
        aresExtension: false,
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  const mount = (space: Partial<SpaceModel>, aresExtension = false) => shallowMount(BoardSpaceTile, {
    ...globalConfig,
    props: {
      space: {bonus: [], color: undefined, highlight: undefined, ...space} as SpaceModel,
      aresExtension,
    },
  });

  it('draws a dome in place of the city under it', () => {
    const wrapper = mount({id: '10', tileType: TileType.CITY, spaceType: SpaceType.LAND, upgrade: 'dome'});
    expect(wrapper.classes()).to.include('board-space-tile--dome');
    expect(wrapper.classes()).to.not.include('board-space-tile--city');
  });

  it('draws a wilderness in place of the greenery under it', () => {
    const wrapper = mount({id: '10', tileType: TileType.GREENERY, spaceType: SpaceType.LAND, upgrade: 'wilderness'});
    expect(wrapper.classes()).to.include('board-space-tile--wilderness');
    expect(wrapper.classes()).to.not.include('board-space-tile--greenery');
  });

  it('draws a city on a colony space with the space city tile', () => {
    const wrapper = mount({id: 'c01', tileType: TileType.CITY, spaceType: SpaceType.COLONY});
    expect(wrapper.classes()).to.include('board-space-tile--space-city');
    expect(wrapper.classes()).to.not.include('board-space-tile--city');
  });

  it('draws a city on the Venus map with the space city tile', () => {
    const wrapper = mount({id: 'v05', tileType: TileType.CITY, spaceType: SpaceType.LAND});
    expect(wrapper.classes()).to.include('board-space-tile--space-city');
  });

  it('uses the space city tile with Ares on too', () => {
    const wrapper = mount({id: 'c01', tileType: TileType.CITY, spaceType: SpaceType.COLONY}, true);
    expect(wrapper.classes()).to.include('board-space-tile--space-city');
  });

  it('keeps the normal city tile on Mars', () => {
    const wrapper = mount({id: '12', tileType: TileType.CITY, spaceType: SpaceType.LAND});
    expect(wrapper.classes()).to.include('board-space-tile--city');
    expect(wrapper.classes()).to.not.include('board-space-tile--space-city');
  });
});
