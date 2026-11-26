<!--
  The globe in the sidebar. With more than the Mars board on the page it opens a small menu, like the language and
  game info panels, listing each board and track in the game; picking one scrolls to it. With only Mars, a click goes
  straight to the board, as before.
-->
<template>
  <div ref="root" class="jump-menu" data-test="jump-menu">
    <a href="#board" :title="$t('Jump to board')" @click="onGlobeClick">
      <div class="sidebar_item sidebar_item_shortcut">
        <i class="sidebar_icon sidebar_icon--board" :class="{'sidebar_item--is-active': open}"></i>
      </div>
    </a>
    <div v-if="open" class="preferences_panel jump-menu__panel" data-test="jump-menu-panel">
      <div class="jump-menu__title" v-i18n>Jump to</div>
      <a
        v-for="target in available"
        :key="target.id"
        href="#"
        class="jump-menu__item"
        :data-target="target.id"
        @click.prevent="jump(target.id)"
      >
        <i class="jump-menu__icon" :class="'jump-menu__icon--' + target.icon"></i>
        <span v-i18n>{{ target.label }}</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue';

type JumpTarget = {id: string, label: string, icon: string};

/** Every place the menu can jump to, top to bottom of the page. Only the ones on the page are listed. */
const JUMP_TARGETS: ReadonlyArray<JumpTarget> = [
  {id: 'shortkey-milestones-awards', label: 'Milestones and awards', icon: 'milestones'},
  {id: 'shortkey-deltaProject', label: 'Delta Project', icon: 'delta'},
  {id: 'shortkey-board', label: 'Mars', icon: 'mars'},
  {id: 'shortkey-venusMapBoard', label: 'Venus', icon: 'venus'},
  {id: 'shortkey-moonBoard', label: 'The Moon', icon: 'moon'},
  {id: 'shortkey-mercury', label: 'Mercury', icon: 'mercury'},
  {id: 'shortkey-acts', label: 'Acts in development', icon: 'acts'},
  {id: 'shortkey-turmoil', label: 'Turmoil', icon: 'turmoil'},
  {id: 'shortkey-planetaryTracks', label: 'Planetary tracks', icon: 'pathfinders'},
  {id: 'shortkey-individualTracks', label: 'Individual tracks', icon: 'individual'},
  {id: 'shortkey-colonies', label: 'Colonies', icon: 'colonies'},
];

// Room for the top bar in the player view.
const SCROLL_MARGIN = 70;

const root = ref<HTMLElement>();
const open = ref(false);
const available = ref<Array<JumpTarget>>([]);

function onPage(): Array<JumpTarget> {
  return JUMP_TARGETS.filter((target) => document.getElementById(target.id) !== null);
}

function onGlobeClick(event: MouseEvent) {
  const targets = onPage();
  // Only Mars (or nothing found): keep the plain link to the board.
  if (targets.length <= 1) {
    open.value = false;
    return;
  }
  event.preventDefault();
  available.value = targets;
  open.value = !open.value;
}

function jump(id: string) {
  const el = document.getElementById(id);
  open.value = false;
  if (el === null) {
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_MARGIN;
  window.scrollTo({top: Math.max(0, top), behavior: 'smooth'});
}

function closeOnOutsideClick(event: MouseEvent) {
  if (open.value && event.target instanceof Node && root.value?.contains(event.target) === false) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('click', closeOnOutsideClick));
onBeforeUnmount(() => document.removeEventListener('click', closeOnOutsideClick));
</script>

<style scoped lang="less">
.jump-menu {
  position: relative;
}

.jump-menu__panel {
  top: 0;
  bottom: auto;
  left: 53px;
  z-index: 120;
  padding: 10px 14px 10px 12px;
  border-radius: 0 6px 6px 0;
}

.jump-menu__title {
  margin: 0 0 6px 2px;
  font-family: Prototype, sans-serif;
  font-size: 13px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #999;
}

.jump-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 4px 4px;
  border-radius: 4px;
  font-size: 15px;
  color: #ddd;
  text-decoration: none;
  white-space: nowrap;

  &:hover,
  &:focus {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }
}

.jump-menu__icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.jump-menu__icon--milestones { background-image: url(/assets/individual-tracks/extra-milestone-award.png); }
.jump-menu__icon--delta { background-image: url(/assets/expansion_icons/expansion_icon_deltaProject.png); }
.jump-menu__icon--mars { background-image: url(/assets/tags/mars.png); }
.jump-menu__icon--venus { background-image: url(/assets/tags/venus.png); }
.jump-menu__icon--moon { background-image: url(/assets/tags/moon.png); }
.jump-menu__icon--mercury { background-image: url(/assets/tags/mercury.png); }
.jump-menu__icon--acts { background-image: url(/assets/mercury/act_back.jpg); background-size: 20px 28px; border-radius: 2px; }
.jump-menu__icon--turmoil { background-image: url(/assets/expansion_icons/expansion_icon_turmoil.png); }
.jump-menu__icon--pathfinders { background-image: url(/assets/expansion_icons/expansion_icon_pathfinders.png); }
.jump-menu__icon--individual { background-image: url(/assets/global-parameters/oxygen.png); }
.jump-menu__icon--colonies { background-image: url(/assets/expansion_icons/expansion_icon_colonies.png); }
</style>
