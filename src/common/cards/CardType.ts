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
    // Proxy cards are not real cards, but for operations that need a card-like behavior.
    PROXY = 'proxy',
}
