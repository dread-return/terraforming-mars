import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import CardRenderItemComponent from '@/client/components/card/CardRenderItemComponent.vue';
import {CardRenderItemType} from '@/common/cards/render/CardRenderItemType';
import {Tag} from '@/common/cards/Tag';

describe('CardRenderItemComponent', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(CardRenderItemComponent, {
      ...globalConfig,
      props: {
        item: {
          is: 'item',
          type: CardRenderItemType.MEGACREDITS,
          amount: 3,
        },
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('draws a red cross over a cancelled tag', () => {
    const wrapper = shallowMount(CardRenderItemComponent, {
      ...globalConfig,
      props: {item: {is: 'item', type: CardRenderItemType.TAG, tag: Tag.EARTH, amount: 1, cancelled: true}},
    });
    expect(wrapper.find('.card-item-cancelled').exists()).is.true;
  });
});
