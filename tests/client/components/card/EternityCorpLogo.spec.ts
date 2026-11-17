import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import EternityCorpLogo from '@/client/components/card/EternityCorpLogo.vue';
import CardCorporationLogo from '@/client/components/card/CardCorporationLogo.vue';
import {CardName} from '@/common/cards/CardName';
import {EPIC_LOGOS} from '@/client/components/card/epicLogos';
import {byModule, byType, getCards} from '@/client/cards/ClientCardManifest';
import {CardType} from '@/common/cards/CardType';

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

  it('Epic corporations use their styled names', () => {
    const wrapper = shallowMount(EternityCorpLogo, {...globalConfig, props: {title: CardName.EXTERNAL_REVENUE_SERVICE}});
    expect(wrapper.classes()).to.include('et-logo-ep-ers');
    expect(wrapper.find('.et-line-0').text()).eq('ERS');
  });

  it('every Corporate Era corporation outside the official two has a styled name', () => {
    const official = [CardName.SATURN_SYSTEMS, CardName.TERACTOR];
    const missing = getCards(byModule('corpera'))
      .filter(byType(CardType.CORPORATION))
      .map((c) => c.name)
      .filter((name) => !official.includes(name) && EPIC_LOGOS[name] === undefined);
    expect(missing).deep.eq([]);
  });
});
