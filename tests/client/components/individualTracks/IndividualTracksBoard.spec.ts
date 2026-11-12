import {mount, shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import IndividualTracksBoard from '@/client/components/individualTracks/IndividualTracksBoard.vue';
import {fakePublicPlayerModel} from '../testHelpers';
import {useFakeLocalStorage} from '../FakeLocalStorage';

function positions(overrides: Partial<Record<'oxygen' | 'temperature' | 'oceans' | 'cities', number>> = {}) {
  return {positions: {oxygen: 0, temperature: 0, oceans: 0, cities: 0, ...overrides}, extraClaims: 0};
}

describe('IndividualTracksBoard', () => {
  useFakeLocalStorage();

  it('mounts with no players', () => {
    const wrapper = shallowMount(IndividualTracksBoard, {...globalConfig, props: {players: []}});
    expect(wrapper.exists()).to.be.true;
  });

  it('draws the four tracks with the lengths from the rulebook', () => {
    const wrapper = shallowMount(IndividualTracksBoard, {...globalConfig, props: {players: []}});
    for (const [name, length] of [['oxygen', 13], ['temperature', 15], ['oceans', 12], ['cities', 12]] as const) {
      const track = wrapper.find(`[data-test="individual-track-${name}"]`);
      // The start cell, one cell per step, and the end cell.
      expect(track.findAll('.individual-track__cell'), name).to.have.length(length + 2);
    }
  });

  it('draws the reward spots', () => {
    const wrapper = mount(IndividualTracksBoard, {...globalConfig, props: {players: []}});
    const rewards = (name: string) => wrapper.findAll(`[data-test="individual-track-${name}"] [data-reward]`).map((e) => e.attributes('data-reward'));
    expect(rewards('oxygen')).deep.eq(['postlude', 'plantProduction', 'milestoneAward']);
    expect(rewards('temperature')).deep.eq(['postlude', 'heatProduction', 'heatProduction', 'milestoneAward']);
    expect(rewards('oceans')).deep.eq(['postlude', 'ocean', 'milestoneAward']);
    expect(rewards('cities')).deep.eq(['postlude', 'steelProduction', 'milestoneAward']);
  });

  it('puts each player marker on its step of each track', () => {
    const blue = fakePublicPlayerModel({color: 'blue', individualTracks: positions({oxygen: 4, cities: 2})});
    const red = fakePublicPlayerModel({color: 'red', individualTracks: positions({oxygen: 4})});
    const wrapper = shallowMount(IndividualTracksBoard, {...globalConfig, props: {players: [blue, red]}});
    const vm = wrapper.vm;
    expect(vm.playersAt('oxygen', 4)).deep.eq(['blue', 'red']);
    expect(vm.playersAt('cities', 2)).deep.eq(['blue']);
    expect(vm.playersAt('oceans', 0)).deep.eq(['blue', 'red']);
    expect(wrapper.findAll('[data-test="marker-blue"]')).to.have.length(4);
  });

  it('ignores players without track data', () => {
    const wrapper = shallowMount(IndividualTracksBoard, {...globalConfig, props: {players: [fakePublicPlayerModel({color: 'blue'})]}});
    expect(wrapper.findAll('[data-test="marker-blue"]')).to.have.length(0);
  });

  it('lists extra milestone or award claims', () => {
    const blue = fakePublicPlayerModel({color: 'blue', individualTracks: {...positions(), extraClaims: 2}});
    const wrapper = shallowMount(IndividualTracksBoard, {...globalConfig, props: {players: [blue]}});
    expect(wrapper.find('[data-test="extra-claims"]').text()).contains('× 2');
  });
});
