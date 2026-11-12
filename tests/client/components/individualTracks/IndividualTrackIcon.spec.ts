import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import IndividualTrackIcon from '@/client/components/individualTracks/IndividualTrackIcon.vue';

describe('IndividualTrackIcon', () => {
  it('draws something for every kind', () => {
    const kinds = [
      'postlude', 'plantProduction', 'heatProduction', 'steelProduction', 'ocean', 'milestoneAward',
      'plant', 'heat', 'steel', 'megacredits', 'oxygen', 'temperature', 'cities',
    ] as const;
    for (const kind of kinds) {
      const wrapper = mount(IndividualTrackIcon, {...globalConfig, props: {kind}});
      expect(wrapper.find('svg').element.children.length, kind).is.greaterThan(0);
    }
  });

  it('shows the amount on a M€ icon', () => {
    const wrapper = mount(IndividualTrackIcon, {...globalConfig, props: {kind: 'megacredits', count: 2}});
    expect(wrapper.find('text').text()).eq('2');
  });
});
