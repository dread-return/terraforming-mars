import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import VenusScaleArc from '@/client/components/venus2/VenusScaleArc.vue';
import {BoardName} from '@/common/boards/BoardName';

describe('VenusScaleArc', () => {
  it('draws the Venus Phase 2 track, 0 to 48% in 2% steps, with the current level marked', () => {
    const wrapper = mount(VenusScaleArc, {...globalConfig, props: {level: 10, boardName: BoardName.THARSIS, venusPhase2Track: true}});
    const cells = wrapper.findAll('.venus-arc__cell');
    expect(cells).to.have.length(25);
    expect(cells[0].text()).eq('0');
    expect(cells[24].text()).eq('48');
    expect(wrapper.find('.venus-arc__cell--current').text()).eq('10');
  });

  it('shows the bonuses next to their steps', () => {
    const wrapper = mount(VenusScaleArc, {...globalConfig, props: {level: 0, boardName: BoardName.THARSIS, venusPhase2Track: true}});
    const bonuses = wrapper.findAll('[data-bonus]').map((e) => e.attributes('data-bonus'));
    expect(bonuses.filter((b) => b === 'drawcard')).to.have.length(2);
    expect(bonuses.filter((b) => b === 'tr')).to.have.length(1);
    // 36% to 48%: a standard resource on each step, and a wild resource on the last.
    expect(bonuses.filter((b) => b === 'standardResource')).to.have.length(7);
    expect(bonuses.filter((b) => b === 'wildResource')).to.have.length(1);
  });

  it('uses the GIGA board\'s own 1% track, with its colony at 24%', () => {
    const wrapper = mount(VenusScaleArc, {...globalConfig, props: {level: 3, boardName: BoardName.GIGA, venusPhase2Track: true}});
    expect(wrapper.findAll('.venus-arc__cell')).to.have.length(31);
    expect(wrapper.findAll('[data-bonus="colony"]')).to.have.length(1);
    expect(wrapper.findAll('[data-bonus="standardResource"]')).to.have.length(0);
  });
});
