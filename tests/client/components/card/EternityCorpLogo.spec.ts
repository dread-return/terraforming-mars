import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import EternityCorpLogo from '@/client/components/card/EternityCorpLogo.vue';
import CardCorporationLogo from '@/client/components/card/CardCorporationLogo.vue';
import {CardName} from '@/common/cards/CardName';

describe('EternityCorpLogo', () => {
  it('renders the logo lines with the corporation style', () => {
    const wrapper = shallowMount(EternityCorpLogo, {
      ...globalConfig,
      props: {title: CardName.IOA},
    });
    expect(wrapper.classes()).to.include('et-logo-ioa');
    expect(wrapper.find('.et-line-0').text()).eq('IOA');
    expect(wrapper.find('.et-line-1').text()).eq('Io Academy');
  });

  it('is used by CardCorporationLogo for Eternity corporations only', () => {
    const eternity = shallowMount(CardCorporationLogo, {...globalConfig, props: {title: CardName.VENUSIA}});
    expect(eternity.findComponent(EternityCorpLogo).exists()).to.be.true;
    const base = shallowMount(CardCorporationLogo, {...globalConfig, props: {title: CardName.ECOLINE}});
    expect(base.findComponent(EternityCorpLogo).exists()).to.be.false;
  });
});
