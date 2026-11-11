import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import CardRenderEffectBoxComponent from '@/client/components/card/CardRenderEffectBoxComponent.vue';

describe('CardRenderEffectBoxComponent', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(CardRenderEffectBoxComponent, {
      ...globalConfig,
      props: {
        effectData: {
          is: 'effect',
          rows: [[], [], []],
        },
      },
    });
    expect(wrapper.exists()).to.be.true;
  });
  it('Eternity: wrap puts the result on its own line', () => {
    const wrapper = shallowMount(CardRenderEffectBoxComponent, {
      ...globalConfig,
      props: {
        effectData: {
          is: 'effect',
          rows: [[], [], []],
          wrap: true,
        },
      },
    });
    expect(wrapper.find('.card-effect-box-row-wrap').exists()).to.be.true;
  });
});
