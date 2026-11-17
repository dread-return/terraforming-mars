import {expect} from 'chai';
import {shallowMount, VueWrapper} from '@vue/test-utils';
import {globalConfig} from '../getLocalVue';
import CardVictoryPoints from '@/client/components/card/CardVictoryPoints.vue';
import {CardRenderDynamicVictoryPoints} from '@/common/cards/render/CardRenderDynamicVictoryPoints';
import {CardRenderItemType} from '@/common/cards/render/CardRenderItemType';
import {RecursivePartial} from '@/common/utils/utils';
import {CardResource} from '@/common/CardResource';
import {Tag} from '@/common/cards/Tag';

describe('CardVictoryPoints', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    wrapper = shallowMount(CardVictoryPoints, {
      ...globalConfig,
      props: {
        victoryPoints: 0,
      },
    });
  });
  it('straight points', async () => {
    await wrapper.setProps({
      victoryPoints: 2,
    });
    expect(wrapper.text()).to.eq('2');
    expect(wrapper.find('[data-test=item]').exists()).is.false;
  });
  it('renders ?', async () => {
    await wrapper.setProps(prop({}));
    expect(wrapper.text()).to.eq('?');
  });
  it('points without item', async () => {
    await wrapper.setProps(prop({
      points: 5,
      target: 5,
    }));
    expect(wrapper.text()).to.eq('5');
    expect(wrapper.find('[data-test=item]').exists()).is.false;
  });
  it('renders points with item - points = target 10/', async () => {
    await wrapper.setProps(prop({item: {type: CardRenderItemType.RESOURCE, resource: CardResource.CAMP}, points: 10, target: 10}));
    expect(wrapper.text()).to.equal('10/');
    expect((wrapper.findComponent('[data-test=item]') as VueWrapper<any>).props().item.type).eq('resource');
    expect((wrapper.findComponent('[data-test=item]') as VueWrapper<any>).props().item.resource).eq('Camp');
  });
  it('renders points with item - points = target 5/10', async () => {
    await wrapper.setProps(prop({item: {type: CardRenderItemType.RESOURCE, resource: CardResource.ASTEROID}, points: 5, target: 10}));
    expect(wrapper.text()).to.equal('5/10');
    expect((wrapper.findComponent('[data-test=item]') as VueWrapper<any>).props().item.type).eq('resource');
    expect((wrapper.findComponent('[data-test=item]') as VueWrapper<any>).props().item.resource).eq('Asteroid');
  });
  it('search for life', async () => {
    await wrapper.setProps(prop({item: {type: CardRenderItemType.TAG, tag: Tag.SCIENCE}, targetOneOrMore: true}));
    expect(wrapper.text()).to.equal('*:3');
    expect((wrapper.findComponent('[data-test=item]') as VueWrapper<any>).props().item.type).eq('tag');
    expect((wrapper.findComponent('[data-test=item]') as VueWrapper<any>).props().item.tag).eq('science');
  });
  it('Eternity: tags added together', async () => {
    await wrapper.setProps(prop({
      item: {type: CardRenderItemType.TAG, tag: Tag.SCIENCE},
      extraItems: [{type: CardRenderItemType.TAG, tag: Tag.MICROBE}],
      points: 1,
      target: 3,
    }));
    expect(wrapper.text()).to.equal('1/3+');
    expect(wrapper.classes()).includes('card-points-multi');
  });
  it('Eternity: production box', async () => {
    await wrapper.setProps(prop({item: {type: CardRenderItemType.ENERGY}, production: true, points: -1, target: 1}));
    expect(wrapper.text()).to.equal('-1/');
    expect(wrapper.find('.card-points-production').exists()).is.true;
  });

  it('Epic: two terms on one badge, the second with a plus', async () => {
    await wrapper.setProps(prop({
      item: {type: CardRenderItemType.RESOURCE, resource: CardResource.MICROBE},
      points: 1,
      target: 3,
      also: {item: {type: CardRenderItemType.OCEANS}, points: 1, target: 1, asterisk: true},
    }));
    expect(wrapper.findAll('[data-test=item]')).has.length(2);
    expect(wrapper.text().replace(/\s/g, '')).to.eq('1/3+1/*');
    expect(wrapper.classes()).to.include('card-points-also');
  });
  it('Epic: a negative second term has no plus', async () => {
    await wrapper.setProps(prop({
      item: {type: CardRenderItemType.OCEANS},
      points: 1,
      target: 1,
      also: {item: {type: CardRenderItemType.GREENERY}, points: -1, target: 1},
    }));
    expect(wrapper.text().replace(/\s/g, '')).to.eq('1/-1/');
  });
  it('Epic: a tag set has no joiner; a label replaces the points', async () => {
    await wrapper.setProps(prop({
      item: {type: CardRenderItemType.TAG, tag: Tag.EARTH},
      extraItems: [{type: CardRenderItemType.TAG, tag: Tag.VENUS}],
      joiner: '',
      points: 1,
      target: 1,
    }));
    expect(wrapper.text().replace(/\s/g, '')).to.eq('1/');
    await wrapper.setProps(prop({item: {type: CardRenderItemType.VP}, label: '', points: 0, target: 0}));
    expect(wrapper.text().replace(/\s/g, '')).to.eq('');
  });

  function prop(vps: RecursivePartial<CardRenderDynamicVictoryPoints>) {
    return {
      victoryPoints: {
        item: undefined,
        points: 0,
        target: 0,
        targetOneOrMore: false,
        anyPlayer: false,
        ...vps,
      },
    };
  }
});
