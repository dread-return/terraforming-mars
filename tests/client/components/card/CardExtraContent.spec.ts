import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import CardExtraContent from '@/client/components/card/CardExtraContent.vue';
import {CardName} from '@/common/cards/CardName';

describe('CardExtraContent', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(CardExtraContent, {
      ...globalConfig,
      props: {
        card: {
          name: CardName.ECOLINE,
        },
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('shows one disease badge per Panacea Biologics disease on a corporation', () => {
    const badges = (diseases?: number) => shallowMount(CardExtraContent, {
      ...globalConfig,
      props: {card: {name: CardName.ECOLINE, ...(diseases === undefined ? {} : {diseases})}},
    }).findAll('.card-disease-badge').length;
    expect(badges()).eq(0);
    expect(badges(1)).eq(1);
    expect(badges(3)).eq(3);
  });
});
