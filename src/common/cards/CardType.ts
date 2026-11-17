export enum CardType {
    EVENT = 'event',
    ACTIVE = 'active',
    AUTOMATED = 'automated',
    PRELUDE = 'prelude',
    CORPORATION = 'corporation',
    CEO = 'ceo',
    STANDARD_PROJECT = 'standard_project',
    STANDARD_ACTION = 'standard_action',
    // High Orbit silver cards: they work like blue cards, but never count as blue cards.
    INFRASTRUCTURE = 'infrastructure',
    // Mercury vs Mars Act cards (Treaties and Rivalries): a separate deck, developed with assets.
    ACT = 'act',
    // Proxy cards are not real cards, but for operations that need a card-like behavior.
    PROXY = 'proxy',
}
