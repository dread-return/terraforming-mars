import {inplaceRemove} from '../../../common/utils/utils';
import {SerializedCard} from '../../SerializedCard';
import {newProjectCard} from '../../createCard';
import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectCard} from '../../inputs/SelectCard';

export class TyrellCorporation extends ActiveCorporationCard {
  constructor() {
    super({
      name: CardName.TYRELL_CORPORATION,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 46,

      action: {},

      metadata: {
        cardNumber: 'EP-TYR',
        description: 'You start with 46 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(46);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Reveal and place a space or building card here from hand, with 2 resources on it, OR double the resources on a card here.', (eb) => {
              eb.empty().startAction.selfReplicatingRobots();
              eb.nbsp.or().nbsp.arrow().multiplierWhite().text('x2');
            });
            ce.vSpace(Size.SMALL);
            ce.plainText('(Effect: cards here may be played as if from hand, costing 1 M€ less per resource on them.)');
          });
        }),
      },
    });
  }

  /** Cards hosted here, like Self-Replicating Robots. They are not played cards. */
  public targetCards: Array<IProjectCard> = [];

  public override getCardDiscount(_player: IPlayer, card: IProjectCard): number {
    return this.targetCards.find((c) => c.name === card.name)?.resourceCount ?? 0;
  }

  private static selectable(player: IPlayer): Array<IProjectCard> {
    return player.cardsInHand.filter((card) => card.tags.includes(Tag.SPACE) || card.tags.includes(Tag.BUILDING));
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.targetCards.length > 0 || TyrellCorporation.selectable(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const options = new OrOptions();
    if (this.targetCards.length > 0) {
      options.options.push(new SelectCard('Select a card to double its resources', 'Double', this.targetCards).andThen(([card]) => {
        const before = card.resourceCount;
        card.resourceCount *= 2;
        player.game.log('${0} doubled the resources on ${1} from ${2} to ${3}', (b) => b.player(player).card(card).number(before).number(card.resourceCount));
        return undefined;
      }));
    }
    const selectable = TyrellCorporation.selectable(player);
    if (selectable.length > 0) {
      options.options.push(new SelectCard('Select a card to place on Tyrell Corporation', 'Place', selectable).andThen(([card]) => {
        inplaceRemove(player.cardsInHand, card);
        this.targetCards.push(card);
        card.resourceCount = 2;
        player.game.log('${0} placed ${1} on ${2}', (b) => b.player(player).card(card).card(this));
        return undefined;
      }));
    }
    return options.options.length === 1 ? options.options[0] : options;
  }

  public serialize(serialized: SerializedCard): void {
    serialized.targetCards = this.targetCards.map((t) => ({card: {name: t.name}, resourceCount: t.resourceCount}));
  }

  public deserialize(serialized: SerializedCard): void {
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
