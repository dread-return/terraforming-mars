import {shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import SelectInfrastructure from '@/client/components/highOrbit/SelectInfrastructure.vue';
import {SelectInfrastructureModel} from '@/common/models/PlayerInputModel';
import {InputResponse} from '@/common/inputs/InputResponse';
import {CardName} from '@/common/cards/CardName';
import {fakePlayerViewModel} from '../testHelpers';
import {useFakeLocalStorage} from '../FakeLocalStorage';

function inputModel(): SelectInfrastructureModel {
  return {
    title: 'Infrastructures',
    buttonLabel: 'Buy',
    type: 'infrastructure',
    titanium: 5,
    sectors: [
      {category: 'satellites', usedBy: 'red', stacks: [
        {card: CardName.COMSAT, remaining: 2, disabledReason: 'This section was already used this generation'},
        {card: CardName.PROBE, remaining: 2, disabledReason: 'This section was already used this generation'},
      ]},
      {category: 'oreProducing', stacks: [
        {card: CardName.ASTEROID_MINE_2, remaining: 1},
        {card: CardName.AUTO_FACTORY, remaining: 0, disabledReason: 'No copies left'},
      ]},
      {category: 'advanced', stacks: [
        {card: CardName.HYDROPONICS, remaining: 2},
        {card: CardName.SPACE_HABITAT, remaining: 2, disabledReason: 'Not enough titanium'},
      ]},
    ],
  };
}

describe('SelectInfrastructure', () => {
  let saved: InputResponse | undefined;
  useFakeLocalStorage();

  function mountIt() {
    saved = undefined;
    return shallowMount(SelectInfrastructure, {
      ...globalConfig,
      props: {
        playerView: fakePlayerViewModel(),
        playerinput: inputModel(),
        onsave: (out: InputResponse) => {
          saved = out;
        },
        showsave: true,
        showtitle: true,
      },
    });
  }

  it('shows the three sections with their titles, two stacks each', () => {
    const wrapper = mountIt();
    const titles = wrapper.findAll('.infrastructure-sector-title').map((w) => w.text());
    expect(titles).deep.eq(['Satellites', 'Ore-producing', 'Advanced']);
    expect(wrapper.findAll('.infrastructure-stack')).has.length(6);
  });

  it('puts the cube of the player who used a section under its title', () => {
    const wrapper = mountIt();
    const cube = wrapper.find('[data-test=infrastructure-cube-satellites]');
    expect(cube.exists()).is.true;
    expect(cube.classes()).includes('board-cube--red');
    expect(wrapper.find('[data-test=infrastructure-cube-advanced]').exists()).is.false;
  });

  it('only offers stacks that can be bought, and preselects the first one', async () => {
    const wrapper = mountIt();
    expect(wrapper.findAll('input[type=radio]')).has.length(2);
    (wrapper.vm as unknown as {saveData: () => void}).saveData();
    expect(saved).deep.eq({type: 'infrastructure', card: CardName.ASTEROID_MINE_2});
  });

  it('sends the chosen stack', async () => {
    const wrapper = mountIt();
    const radio = wrapper.find('[data-test="infrastructure-stack-Hydroponics"] input');
    await radio.setValue(true);
    (wrapper.vm as unknown as {saveData: () => void}).saveData();
    expect(saved).deep.eq({type: 'infrastructure', card: CardName.HYDROPONICS});
  });

  it('shows why a stack is unavailable', () => {
    const wrapper = mountIt();
    const reasons = wrapper.findAll('.infrastructure-stack-reason').map((w) => w.text());
    expect(reasons).includes('No copies left');
    expect(reasons).includes('Not enough titanium');
  });
});
