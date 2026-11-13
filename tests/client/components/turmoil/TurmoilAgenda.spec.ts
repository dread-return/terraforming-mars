import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import TurmoilAgenda from '@/client/components/turmoil/TurmoilAgenda.vue';

describe('TurmoilAgenda', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(TurmoilAgenda, {
      ...globalConfig,
      props: {
        id: 'mp01',
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('mounts without errors with a party badge', () => {
    const wrapper = shallowMount(TurmoilAgenda, {
      ...globalConfig,
      props: {
        id: 'mp01',
        showPartyBadge: true,
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('shows a Giga Turmoil policy with its icon from the Epic rulebook', () => {
    const wrapper = shallowMount(TurmoilAgenda, {
      ...globalConfig,
      props: {
        id: 'Ep01',
      },
    });
    const img = wrapper.find('img');
    expect(img.attributes('src')).eq('assets/parties/giga/agendas/empower-p1.png');
    expect(img.classes()).includes('giga-agenda-policy');
    expect(img.attributes('alt')).is.not.empty;
  });

  it('shows a Giga Turmoil bonus with its strip from the Epic rulebook', () => {
    const wrapper = shallowMount(TurmoilAgenda, {
      ...globalConfig,
      props: {
        id: 'Ob02',
      },
    });
    const img = wrapper.find('img');
    expect(img.attributes('src')).eq('assets/parties/giga/agendas/spome-b2.png');
    expect(img.classes()).includes('giga-agenda-bonus');
  });
});
