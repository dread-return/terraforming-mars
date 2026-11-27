import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import GigaPolicy, {GIGA_POLICY_LAYOUTS} from '@/client/components/turmoil/GigaPolicy.vue';

describe('GigaPolicy', () => {
  it('has a layout for every policy it lists', () => {
    expect(GIGA_POLICY_LAYOUTS.size).eq(44);
    for (const id of GIGA_POLICY_LAYOUTS) {
      const wrapper = mount(GigaPolicy, {...globalConfig, props: {id}});
      expect(wrapper.findAll('.giga-policy__row').length, id).to.be.greaterThan(0);
    }
  });

  it('draws an action as cost, arrow and result', () => {
    const wrapper = mount(GigaPolicy, {...globalConfig, props: {id: 'Up02'}});
    expect(wrapper.find('.card-resource-money').text()).eq('10');
    expect(wrapper.find('.card-red-arrow').exists()).is.true;
    expect(wrapper.find('.card-resource-trade-fleet').exists()).is.true;
  });
});
