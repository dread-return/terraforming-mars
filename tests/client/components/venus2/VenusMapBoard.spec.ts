import {mount, shallowMount} from '@vue/test-utils';
import {globalConfig} from '../getLocalVue';
import {expect} from 'chai';
import VenusMapBoard from '@/client/components/venus2/VenusMapBoard.vue';
import VenusMapSpace from '@/client/components/venus2/VenusMapSpace.vue';
import {VenusMapModel} from '@/common/models/VenusMapModel';
import {SpaceType} from '@/common/boards/SpaceType';
import {SpaceModel} from '@/common/models/SpaceModel';
import {TileType} from '@/common/TileType';

function space(id: SpaceModel['id'], spaceType: SpaceType, tileType?: TileType): SpaceModel {
  return {id, bonus: [], spaceType, color: undefined, highlight: undefined, tileType};
}

const model: VenusMapModel = {
  spaces: [
    space('v11', SpaceType.LAND),
    space('v01', SpaceType.VENUS_GAS_MINE),
    space('v12', SpaceType.LAND),
    space('v25', SpaceType.LAND, TileType.CITY),
  ],
};

describe('VenusMapBoard', () => {
  it('renders every space in id order, passing the tile view', () => {
    const wrapper = shallowMount(VenusMapBoard, {...globalConfig, props: {model, tileView: 'show'}});
    const spaces = wrapper.findAllComponents(VenusMapSpace);
    expect(spaces.map((s) => (s.props('space') as SpaceModel).id)).deep.eq(['v01', 'v11', 'v12', 'v25']);
    expect(spaces.every((s) => s.props('tileView') === 'show')).is.true;
  });

  it('labels empty reserved spaces only', () => {
    const wrapper = shallowMount(VenusMapBoard, {...globalConfig, props: {model}});
    const texts = wrapper.findAll('.venus-map-label').map((label) => label.text());
    // Stratopolis is empty; Maxwell Base has a city on it.
    expect(texts).deep.eq(['Stratopolis']);
  });
});

describe('VenusMapSpace', () => {
  it('marks yellow Gas Mine areas', () => {
    const wrapper = mount(VenusMapSpace, {...globalConfig, props: {space: model.spaces[1]}});
    expect(wrapper.classes()).includes('venus-map-space-type-gas');
    expect(wrapper.classes()).includes('venus-map-space-v01');
    const other = mount(VenusMapSpace, {...globalConfig, props: {space: model.spaces[0]}});
    expect(other.classes()).includes('venus-map-space-type-other');
  });
});
