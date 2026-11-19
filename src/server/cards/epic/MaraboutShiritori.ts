import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {keep, LogType} from '../../deferredActions/ChooseCards';
import {isIProjectCard} from '../IProjectCard';

export class MaraboutShiritori extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MARABOUT_SHIRITORI,
      tags: [Tag.EARTH],
      startingMegaCredits: 42,
      initialActionText: 'Reveal cards until you have 3 that cost less than 20 M€, and take them',

      metadata: {
        cardNumber: 'EP-MSH',
        description: 'You start with 42 M€. First action: reveal cards until 3 cost under 20 M€; take those.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(42).cards(3).text('<20', {size: Size.SMALL});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('A card sharing a tag with the last card you played this generation costs 3 M€ less.', (eb) => {
              eb.emptyTag().text('=').emptyTag().asterix().startEffect.megacredits(-3);
            });
          });
        }),
      },
    });
  }

  public data: {generation?: number, tags?: Array<Tag>} = {};

  public override initialAction(player: IPlayer) {
    const game = player.game;
    const cards = game.projectDeck.drawByConditionOrThrow(game, 3, (card) => card.cost < 20);
    keep(player, cards, [], LogType.DREW);
    return undefined;
  }

  public override getCardDiscount(player: IPlayer, card: IProjectCard) {
    if (this.data.generation !== player.game.generation) {
      return 0;
    }
    const last = this.data.tags ?? [];
    return card.tags.some((t) => t !== Tag.WILD && last.includes(t)) ? 3 : 0;
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card !== this && isIProjectCard(card)) {
      this.data.generation = player.game.generation;
      this.data.tags = card.type === CardType.EVENT ? [Tag.EVENT, ...card.tags] : [...card.tags];
    }
  }
}
