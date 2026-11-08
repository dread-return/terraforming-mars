import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import ContaminationTrack from '@/client/components/nuclear/ContaminationTrack.vue';

describe('ContaminationTrack', () => {
  it('draws the standard track, 0 to 19, with the marker on the current step', () => {
    const wrapper = shallowMount(ContaminationTrack, {...globalConfig, props: {level: 8}});
    const steps = wrapper.findAll('.contamination-step');
    expect(steps).has.length(20);
    expect(wrapper.find('.contamination-step--current').text()).contains('8');
    expect(wrapper.findAll('.contamination-reward-nuclear-zone')).has.length(5);
    expect(wrapper.findAll('.contamination-reward-heat')).has.length(0);
  });

  it('draws the Alt. track, 0 to 20, with its rewards', () => {
    const wrapper = shallowMount(ContaminationTrack, {...globalConfig, props: {level: 0, alt: true}});
    expect(wrapper.findAll('.contamination-step')).has.length(21);
    expect(wrapper.findAll('.contamination-reward-nuclear-zone')).has.length(4);
    expect(wrapper.findAll('.contamination-reward-heat')).has.length(1);
    expect(wrapper.findAll('.contamination-reward-energy')).has.length(1);
    expect(wrapper.findAll('.contamination-reward-data')).has.length(2);
    expect(wrapper.findAll('.contamination-reward-science')).has.length(1);
    expect(wrapper.findAll('.contamination-reward-radiation')).has.length(3);
  });
});
