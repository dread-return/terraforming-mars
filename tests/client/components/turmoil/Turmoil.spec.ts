import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import Turmoil from '@/client/components/turmoil/Turmoil.vue';
import {PartyName} from '@/common/turmoil/PartyName';
import {fakePoliticalAgendasModel} from '../testHelpers';
import {TurmoilModel} from '@/common/models/TurmoilModel';
import {BonusId, PolicyId} from '@/common/turmoil/Types';

const GIGA_PARTIES = [PartyName.SPOME, PartyName.BUREAUCRATS, PartyName.EMPOWER, PartyName.POPULISTS, PartyName.CENTRISTS, PartyName.TRANSHUMANISTS];
const STANDARD_PARTIES = [PartyName.MARS, PartyName.SCIENTISTS, PartyName.UNITY, PartyName.GREENS, PartyName.REDS, PartyName.KELVINISTS];

function turmoilWith(parties: Array<PartyName>): TurmoilModel {
  const agenda = {bonusId: 'Ob01' as BonusId, policyId: 'Op01' as PolicyId};
  return {
    dominant: PartyName.GREENS,
    ruling: PartyName.GREENS,
    chairman: undefined,
    parties: parties.map((name) => ({name, delegates: [], partyLeader: undefined})),
    lobby: [],
    reserve: [],
    distant: undefined,
    coming: undefined,
    current: undefined,
    politicalAgendas: {
      ...fakePoliticalAgendasModel(),
      spome: agenda, bureaucrats: agenda, empower: agenda, populists: agenda, centrists: agenda, transhumanists: agenda,
    },
    policyActionUsers: [],
  };
}

function mountTurmoil(turmoil: TurmoilModel) {
  return shallowMount(Turmoil, {
    ...globalConfig,
    global: {
      ...globalConfig.global,
      mixins: [{methods: {getVisibilityState: () => true, setVisibilityState: () => {}}}],
    },
    props: {turmoil},
  });
}

describe('Turmoil', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(Turmoil, {
      ...globalConfig,
      global: {
        ...globalConfig.global,
        mixins: [{
          methods: {
            getVisibilityState: () => true,
            setVisibilityState: () => {},
          },
        }],
      },
      props: {
        turmoil: {
          dominant: PartyName.REDS,
          ruling: PartyName.REDS,
          chairman: undefined,
          parties: [],
          lobby: [],
          reserve: [],
          distant: undefined,
          coming: undefined,
          current: undefined,
          politicalAgendas: fakePoliticalAgendasModel(),
          policyActionUsers: [],
        },
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('lists the 12 Giga parties instead of the board before the party draft', () => {
    const wrapper = mountTurmoil(turmoilWith([...STANDARD_PARTIES, ...GIGA_PARTIES]));
    expect(wrapper.find('[data-test=turmoil-predraft]').exists()).is.true;
    expect(wrapper.findAll('.turmoil-predraft-party')).has.length(12);
    expect(wrapper.find('.turmoil-board').exists()).is.false;
  });

  it('shows the party board once 6 parties are in play', () => {
    const wrapper = mountTurmoil(turmoilWith([PartyName.MARS, PartyName.SPOME, PartyName.UNITY, PartyName.GREENS, PartyName.CENTRISTS, PartyName.KELVINISTS]));
    expect(wrapper.find('[data-test=turmoil-predraft]').exists()).is.false;
    expect(wrapper.findAll('.board-party')).has.length(6);
  });
});
