import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from './getLocalVue';
import JumpMenu from '@/client/components/JumpMenu.vue';

function addTarget(id: string): HTMLElement {
  const el = document.createElement('div');
  el.id = id;
  document.body.appendChild(el);
  return el;
}

describe('JumpMenu', () => {
  const added: Array<HTMLElement> = [];
  afterEach(() => {
    added.forEach((el) => el.remove());
    added.length = 0;
  });

  it('keeps the plain link to the board when Mars is all there is', async () => {
    added.push(addTarget('shortkey-board'));
    const wrapper = mount(JumpMenu, {...globalConfig, attachTo: document.body});
    await wrapper.find('a').trigger('click');
    expect(wrapper.find('[data-test="jump-menu-panel"]').exists()).is.false;
    wrapper.unmount();
  });

  it('lists the boards on the page, in page order', async () => {
    for (const id of ['shortkey-colonies', 'shortkey-board', 'shortkey-turmoil', 'shortkey-moonBoard']) {
      added.push(addTarget(id));
    }
    const wrapper = mount(JumpMenu, {...globalConfig, attachTo: document.body});
    await wrapper.find('a').trigger('click');
    const items = wrapper.findAll('.jump-menu__item').map((e) => e.attributes('data-target'));
    expect(items).deep.eq(['shortkey-board', 'shortkey-moonBoard', 'shortkey-turmoil', 'shortkey-colonies']);
    wrapper.unmount();
  });
});
