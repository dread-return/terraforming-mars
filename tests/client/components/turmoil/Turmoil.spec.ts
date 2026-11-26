import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import Turmoil from '@/client/components/turmoil/Turmoil.vue';
import {PartyName} from '@/common/turmoil/PartyName';
import {fakePoliticalAgendasModel} from '../testHelpers';
import {TurmoilModel} from '@/common/models/TurmoilModel';
import {BonusId, PolicyId} from '@/common/turmoil/Types';
import {PreferencesManager} from '@/client/utils/PreferencesManager';
import {useFakeLocalStorage} from '../FakeLocalStorage';

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

  describe('compact view', () => {
    useFakeLocalStorage();
    afterEach(() => PreferencesManager.resetForTest());

    it('swaps the party boards for one small panel per party, and remembers the choice', async () => {
      PreferencesManager.resetForTest();
      const turmoil = turmoilWith(STANDARD_PARTIES);
      turmoil.parties[3] = {name: PartyName.GREENS, delegates: [{color: 'red', number: 2}], partyLeader: 'red'};
      const wrapper = mountTurmoil(turmoil);
      expect(wrapper.find('.grid-parties').exists()).is.true;
      expect(wrapper.find('[data-test="turmoil-compact-parties"]').exists()).is.false;

      await wrapper.find('[data-test="turmoil-view-toggle"]').trigger('click');

      expect(wrapper.find('.grid-parties').exists()).is.false;
      const panels = wrapper.findAll('.turmoil-compact-party');
      expect(panels).to.have.length(6);
      expect(panels[3].classes()).to.include('turmoil-compact-party--dominant');
      expect(panels[3].findAll('.turmoil-compact-delegates .player-token.red')).to.have.length(2);
      expect(PreferencesManager.INSTANCE.values().compact_turmoil).is.true;

      await wrapper.find('[data-test="turmoil-view-toggle"]').trigger('click');
      expect(wrapper.find('.grid-parties').exists()).is.true;
    });
  });
});
