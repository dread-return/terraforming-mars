import {mount} from '@vue/test-utils';
import {globalConfig} from './getLocalVue';
import {expect} from 'chai';
import BoardSpace from '@/client/components/BoardSpace.vue';
import {SpaceType} from '@/common/boards/SpaceType';
import {SpaceBonus} from '@/common/boards/SpaceBonus';
import {TileType} from '@/common/TileType';

describe('BoardSpace', () => {
  it('shows the co-owner\'s cube on a shared city (Joint Venture, Shared City)', () => {
    const wrapper = mount(BoardSpace, {
      ...globalConfig,
      props: {
        space: {
          id: 'm01',
          bonus: [],
          spaceType: SpaceType.LAND,
          tileType: TileType.CITY,
          color: 'red',
          coOwner: 'blue',
        },
        tileView: 'show',
      },
    });
    expect(wrapper.find('.board-cube-mars-coOwner').classes()).to.contain('board-cube--blue');
  });

  it('has visible tile', async () => {
    const wrapper = mount(BoardSpace, {
      ...globalConfig,
      props: {
        space: {
          id: 'm01',
          bonus: [],
          spaceType: SpaceType.LAND,
        },
        tileView: 'show',
      },
    });

    expect(wrapper.find('[data-test="tile"]').classes()).to.not.contain('board-hidden-tile');
  });

  it('has hidden tile if hidden props is passed', async () => {
    const wrapper = mount(BoardSpace, {
      ...globalConfig,
      props: {
        space: {
          id: 'm01',
          bonus: [],
          spaceType: SpaceType.LAND,
        },
        tileView: 'hide',
      },
    });

    expect(wrapper.find('[data-test="tile"]').classes()).to.contain('board-hidden-tile');
  });

  it('renders a neutral player cube instead of a space bonus', async () => {
    const wrapper = mount(BoardSpace, {
      ...globalConfig,
      props: {
        space: {
          id: 'm01',
          bonus: [SpaceBonus.STEEL],
          spaceType: SpaceType.LAND,
          cube: 'martian-nature-wonders',
        },
        tileView: 'show',
      },
    });

    expect(wrapper.find('[data-test="cube"]').exists()).is.true;
    expect(wrapper.find('.board-space-bonuses').exists()).is.false;
  });
});
