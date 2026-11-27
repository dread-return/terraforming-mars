import {mount, shallowMount} from '@vue/test-utils';
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

  it('draws a Giga Turmoil policy from the game\'s icons', () => {
    const wrapper = mount(TurmoilAgenda, {
      ...globalConfig,
      props: {
        id: 'Ep01',
      },
    });
    expect(wrapper.find('img').exists()).is.false;
    const policy = wrapper.find('.giga-policy');
    expect(policy.attributes('data-policy')).eq('Ep01');
    expect(policy.find('.card-resource-energy').exists()).is.true;
    expect(policy.find('.card-resource-money').text()).eq('2');
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
