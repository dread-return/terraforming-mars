import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import ActTrack from '@/client/components/mercury/ActTrack.vue';
import {CardName} from '@/common/cards/CardName';
import {useFakeLocalStorage} from '../FakeLocalStorage';

describe('ActTrack', () => {
  useFakeLocalStorage();

  it('draws a Treaty as one row ending in the handshake', () => {
    const wrapper = mount(ActTrack, {...globalConfig, props: {kind: 'treaty', steps: [7, 7]}});
    expect(wrapper.findAll('.act-track__line')).to.have.length(1);
    const steps = wrapper.findAll('.act-track__step');
    expect(steps).to.have.length(7);
    expect(steps[6].classes()).contains('act-track__step--handshake');
    expect(wrapper.findAll('.act-track__step--handshake')).to.have.length(1);
  });

  it('draws a Rivalry as a column per player, each with its own length', () => {
    const wrapper = mount(ActTrack, {...globalConfig, props: {kind: 'rivalry', steps: [4, 5]}});
    expect(wrapper.findAll('.act-track__line--initiator .act-track__step')).to.have.length(4);
    expect(wrapper.findAll('.act-track__line--partner .act-track__step')).to.have.length(5);
  });

  it('fills in the assets of an Act in development and puts the cubes on the start squares', () => {
    const wrapper = mount(ActTrack, {...globalConfig, props: {
      kind: 'rivalry',
      steps: [4, 4],
      development: {card: CardName.ASTEROID_RIGHTS_MVM, kind: 'rivalry', initiator: 'blue', partner: 'red', steps: [4, 4], progress: [3, 1]},
    }});
    expect(wrapper.findAll('.act-track__line--initiator [data-test="act-step-filled"]')).to.have.length(3);
    expect(wrapper.findAll('.act-track__line--partner [data-test="act-step-filled"]')).to.have.length(1);
    expect(wrapper.find('.act-track__line--initiator [data-test="act-start"] .board-cube--blue').exists()).is.true;
    expect(wrapper.find('.act-track__line--partner [data-test="act-start"] .board-cube--red').exists()).is.true;
  });
});
