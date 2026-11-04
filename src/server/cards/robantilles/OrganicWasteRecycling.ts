import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {SerializedCard} from '../../SerializedCard';
import {newProjectCard} from '../../createCard';
import {Size} from '../../../common/cards/render/Size';
import {uppercase} from '../Options';

export class OrganicWasteRecycling extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ORGANIC_WASTE_RECYCLING,
      tags: [Tag.MICROBE, Tag.PLANT],
      cost: 25,
      victoryPoints: {tag: Tag.MICROBE, per: 2},

      metadata: {
        cardNumber: 'H44',
        renderData: CardRenderer.builder((b) => {
          b.action('Place a microbe or plant card from your hand here, with 1 resource on it per city you own, OR add 1 resource per city you own to a card here.', (eb) => {
            eb.empty().startAction.cards(1, {secondaryTag: Tag.MICROBE}).slash().city().or().city();
          }).br;
          b.text('Effect: a card here may be played as if from hand, costing 1 M€ less per resource on it.', {size: Size.TINY, uppercase}).br;
        }),
      },
    });
  }

  /** Cards hosted here. They are not considered played. */
  public targetCards: Array<IProjectCard> = [];

  public override getCardDiscount(_player: IPlayer, card: IProjectCard): number {
    return this.targetCards.find((c) => c.name === card.name)?.resourceCount ?? 0;
  }

  private eligibleCards(player: IPlayer) {
    return player.cardsInHand.filter((card) => card.tags.includes(Tag.MICROBE) || card.tags.includes(Tag.PLANT));
  }

  private cityCount(player: IPlayer) {
    return player.game.board.getCities(player).length;
  }

  public canAct(player: IPlayer): boolean {
    return this.targetCards.length > 0 || this.eligibleCards(player).length > 0;
  }

  public action(player: IPlayer) {
    const cities = this.cityCount(player);
    const orOptions = new OrOptions();
    const eligible = this.eligibleCards(player);
    if (eligible.length > 0) {
      orOptions.options.push(new SelectCard(`Select a card to place here with ${cities} resource(s)`, 'Place card', eligible,
        {played: CardName.SELF_REPLICATING_ROBOTS})
        .andThen(([card]) => {
          const idx = player.cardsInHand.findIndex((c) => c.name === card.name);
          player.cardsInHand.splice(idx, 1);
          this.targetCards.push(card);
          card.resourceCount = cities;
          player.game.log('${0} placed ${1} on ${2}', (b) => b.player(player).card(card).card(this));
          return undefined;
        }));
    }
    if (this.targetCards.length > 0) {
      orOptions.options.push(new SelectCard(`Select a card here to add ${cities} resource(s)`, 'Add resources', this.targetCards,
        {played: CardName.SELF_REPLICATING_ROBOTS})
        .andThen(([card]) => {
          card.resourceCount += cities;
          player.game.log('${0} added ${1} resource(s) to ${2}', (b) => b.player(player).number(cities).card(card));
          return undefined;
        }));
    }
    if (orOptions.options.length === 1) {
      return orOptions.options[0];
    }
    return orOptions;
  }

  serialize(serialized: SerializedCard): void {
    serialized.targetCards = this.targetCards.map((t) => ({card: {name: t.name}, resourceCount: t.resourceCount}));
  }

  deserialize(serialized: SerializedCard): void {
    this.targetCards = [];
    for (const target of serialized.targetCards ?? []) {
      const card = newProjectCard(target.card.name);
      if (card !== undefined) {
        card.resourceCount = target.resourceCount;
        this.targetCards.push(card);
      }
    }
  }
}
