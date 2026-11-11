import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import HelpParty from '@/client/components/help/HelpParty.vue';
import {PartyName} from '@/common/turmoil/PartyName';

describe('HelpParty', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(HelpParty, {
      ...globalConfig,
      props: {party: {name: PartyName.GREENS, bonusIds: [], policyIds: []}},
    });
    expect(wrapper.exists()).to.be.true;
  });
});
