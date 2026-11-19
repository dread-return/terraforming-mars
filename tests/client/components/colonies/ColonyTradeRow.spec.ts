import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import ColonyTradeRow from '@/client/components/colonies/ColonyTradeRow.vue';
import {ColonyName} from '@/common/colonies/ColonyName';
import {getColonyOrThrow} from '@/client/colonies/ClientColonyManifest';

describe('ColonyTradeRow', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(ColonyTradeRow, {
      ...globalConfig,
      props: {
        metadata: getColonyOrThrow(ColonyName.GANYMEDE),
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('draws The Asteroid Belt rewards as icons, with counts beside them rather than over them', () => {
    const wrapper = shallowMount(ColonyTradeRow, {
      ...globalConfig,
      props: {metadata: getColonyOrThrow(ColonyName.ASTEROID_BELT)},
    });
    const steps = wrapper.findAll('.asteroid-belt-trade > div');
    expect(steps).has.length(7);
    // Counts sit next to the icons, never on top of them.
    expect(steps[1].text()).eq('2');
    expect(steps[1].findAll('.resource.wild')).has.length(1);
    expect(steps[6].text()).eq('2');
    expect(steps[6].findAll('.resource.asteroid')).has.length(1);
    expect(steps[6].findAll('.card-resource-wild-resource')).has.length(1);
    for (const step of steps) {
      for (const icon of step.findAll('.resource')) {
        expect(icon.text()).eq('');
      }
    }
  });
});
