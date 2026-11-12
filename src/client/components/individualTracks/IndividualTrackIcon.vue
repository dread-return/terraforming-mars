<!-- An icon on the individual global parameter tracks: a reward spot, a track's symbol, or a leader's resource. -->
<template>
  <svg class="individual-track-icon" viewBox="0 0 32 32" width="30" height="30" :data-kind="kind" aria-hidden="true">
    <!-- Production boxes: a brown frame around the resource. -->
    <template v-if="kind === 'plantProduction' || kind === 'heatProduction' || kind === 'steelProduction'">
      <rect x="2" y="2" width="28" height="28" rx="3" fill="#8a5a2c" stroke="#3a2410" stroke-width="1.5" />
      <rect x="7" y="7" width="18" height="18" rx="2" :fill="innerFill" stroke="#3a2410" stroke-width="1" />
      <path v-if="kind === 'plantProduction'" d="M10 22 C10 14 15 10 23 10 C23 17 19 23 10 22 Z M10 22 L19 14" fill="#b8e6a0" stroke="#1f5e24" stroke-width="1.3" stroke-linejoin="round" />
      <g v-else-if="kind === 'heatProduction'" fill="none" stroke="#ffe48a" stroke-width="1.6" stroke-linecap="round">
        <path d="M11 22 C9 19 13 18 11 15 C9 12 13 11 11 9" />
        <path d="M16 22 C14 19 18 18 16 15 C14 12 18 11 16 9" />
        <path d="M21 22 C19 19 23 18 21 15 C19 12 23 11 21 9" />
      </g>
      <g v-else fill="#e8e2d6" stroke="#2b2b2b" stroke-width="1">
        <path d="M11 23 L19 12" stroke-width="2.4" stroke-linecap="round" fill="none" />
        <rect x="13" y="9" width="10" height="5" rx="1" transform="rotate(35 18 11.5)" />
      </g>
    </template>

    <!-- Plain resources, as the leader of a track receives them. -->
    <template v-else-if="kind === 'plant'">
      <rect x="2" y="2" width="28" height="28" rx="3" fill="#4caf50" stroke="#1f5e24" stroke-width="1.5" />
      <path d="M8 24 C8 13 15 8 25 8 C25 17 20 25 8 24 Z M8 24 L20 13" fill="#b8e6a0" stroke="#1f5e24" stroke-width="1.4" stroke-linejoin="round" />
    </template>
    <template v-else-if="kind === 'heat'">
      <rect x="2" y="2" width="28" height="28" rx="3" fill="#e8472b" stroke="#6b1a0c" stroke-width="1.5" />
      <g fill="none" stroke="#ffe48a" stroke-width="2" stroke-linecap="round">
        <path d="M10 25 C7 21 13 20 10 16 C7 12 13 11 10 7" />
        <path d="M16 25 C13 21 19 20 16 16 C13 12 19 11 16 7" />
        <path d="M22 25 C19 21 25 20 22 16 C19 12 25 11 22 7" />
      </g>
    </template>
    <template v-else-if="kind === 'steel'">
      <rect x="2" y="2" width="28" height="28" rx="3" fill="#9a6a3a" stroke="#3a2410" stroke-width="1.5" />
      <g fill="#e8e2d6" stroke="#2b2b2b" stroke-width="1">
        <path d="M9 24 L21 10" stroke-width="3" stroke-linecap="round" fill="none" />
        <rect x="13" y="6" width="13" height="6" rx="1" transform="rotate(40 19.5 9)" />
      </g>
    </template>
    <template v-else-if="kind === 'megacredits'">
      <circle cx="16" cy="16" r="14" fill="#f4c542" stroke="#8a6a0c" stroke-width="2" />
      <text x="16" y="22" text-anchor="middle" font-size="18" font-weight="bold" font-family="Prototype, sans-serif" fill="#3a2a00">{{ count }}</text>
    </template>

    <!-- A new ocean tile. -->
    <template v-else-if="kind === 'ocean'">
      <polygon points="16,1 29,8.5 29,23.5 16,31 3,23.5 3,8.5" fill="#2a7fc1" stroke="#c9d3da" stroke-width="2" />
      <path d="M16 7 C20 13 22 16 22 19 A6 6 0 0 1 10 19 C10 16 12 13 16 7 Z" fill="#cfeaff" stroke="#1d5f93" stroke-width="1" />
    </template>

    <!-- A Postlude card (not in the game yet). -->
    <template v-else-if="kind === 'postlude'">
      <rect x="6" y="2" width="20" height="28" rx="2.5" fill="#2e3a40" stroke="#d8dde0" stroke-width="1.5" />
      <circle cx="19" cy="9" r="3" fill="#c9a77a" />
      <g fill="#8fa0a8">
        <rect x="9" y="16" width="3" height="10" />
        <rect x="13" y="13" width="4" height="13" />
        <rect x="18" y="18" width="3" height="8" />
        <rect x="22" y="15" width="2" height="11" />
      </g>
    </template>

    <!-- The extra milestone or award. -->
    <template v-else-if="kind === 'milestoneAward'">
      <path d="M16 15 C11 11 6 10 1 10 C4 14 8 17 12 18 C9 19 7 21 5 23 C10 23 14 21 16 19 Z" fill="#e8b92a" stroke="#8a6a0c" stroke-width="1" />
      <path d="M16 15 C21 11 26 10 31 10 C28 14 24 17 20 18 C23 19 25 21 27 23 C22 23 18 21 16 19 Z" fill="#e8b92a" stroke="#8a6a0c" stroke-width="1" />
      <polygon points="16,6 22,9.5 22,20.5 16,24 10,20.5 10,9.5" fill="#f6cf3e" stroke="#8a6a0c" stroke-width="1.5" />
      <rect x="14.7" y="10" width="2.6" height="7" rx="1" fill="#1a1a1a" />
      <circle cx="16" cy="19.6" r="1.5" fill="#1a1a1a" />
    </template>

    <!-- Track symbols, shown at the start of each track. -->
    <template v-else-if="kind === 'oxygen'">
      <polygon points="16,1 29,8.5 29,23.5 16,31 3,23.5 3,8.5" fill="#4caf50" stroke="#d8e6d8" stroke-width="2" />
      <path d="M9 23 C9 14 15 9 23 9 C23 17 19 24 9 23 Z M9 23 L19 14" fill="#b8e6a0" stroke="#1f5e24" stroke-width="1.3" stroke-linejoin="round" />
    </template>
    <template v-else-if="kind === 'temperature'">
      <polygon points="16,1 29,8.5 29,23.5 16,31 3,23.5 3,8.5" fill="#e8742b" stroke="#f1d9c4" stroke-width="2" />
      <rect x="14" y="6" width="4" height="14" rx="2" fill="#fff" />
      <circle cx="16" cy="22" r="4.5" fill="#d33" stroke="#fff" stroke-width="1.2" />
      <rect x="15.1" y="12" width="1.8" height="9" fill="#d33" />
    </template>
    <template v-else-if="kind === 'cities'">
      <polygon points="16,1 29,8.5 29,23.5 16,31 3,23.5 3,8.5" fill="#6d7479" stroke="#e1e4e6" stroke-width="2" />
      <g fill="#eef0f1">
        <rect x="7" y="16" width="4" height="9" />
        <rect x="12" y="11" width="5" height="14" />
        <rect x="18" y="14" width="3" height="11" />
        <rect x="22" y="18" width="3" height="7" />
      </g>
    </template>
  </svg>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';

export type IndividualTrackIconKind =
  'postlude' | 'plantProduction' | 'heatProduction' | 'steelProduction' | 'ocean' | 'milestoneAward' |
  'plant' | 'heat' | 'steel' | 'megacredits' |
  'oxygen' | 'temperature' | 'cities';

export default defineComponent({
  name: 'IndividualTrackIcon',
  props: {
    kind: {
      type: String as PropType<IndividualTrackIconKind>,
      required: true,
    },
    // The amount shown on a M€ icon.
    count: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    innerFill(): string {
      switch (this.kind) {
      case 'plantProduction': return '#4caf50';
      case 'heatProduction': return '#e8472b';
      default: return '#9a6a3a';
      }
    },
  },
});
</script>
