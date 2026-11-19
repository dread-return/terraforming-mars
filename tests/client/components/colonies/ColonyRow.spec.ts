import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import ColonyRow from '@/client/components/colonies/ColonyRow.vue';
import {ColonyName} from '@/common/colonies/ColonyName';
import {getColonyOrThrow} from '@/client/colonies/ClientColonyManifest';

describe('ColonyRow', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(ColonyRow, {
      ...globalConfig,
      props: {
        metadata: getColonyOrThrow(ColonyName.GANYMEDE),
        colony: {
          colonies: [],
          isActive: false,
          name: ColonyName.GANYMEDE,
          trackPosition: 1,
          visitor: undefined,
        },
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  function markers(name: ColonyName) {
    const wrapper = shallowMount(ColonyRow, {
      ...globalConfig,
      props: {
        metadata: getColonyOrThrow(name),
        colony: {colonies: [], isActive: true, name, trackPosition: 1, visitor: undefined},
      },
    });
    return wrapper.findAllComponents({name: 'ColonySpace'}).filter((s) => s.props('marker') === true);
  }

  it('shows the track marker, except on Market Colonies, which has no track', () => {
    expect(markers(ColonyName.GANYMEDE)).has.length(1);
    expect(markers(ColonyName.MARKET_COLONIES)).has.length(0);
  });
});
