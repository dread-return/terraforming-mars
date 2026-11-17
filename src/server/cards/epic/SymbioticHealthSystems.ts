import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';

export class SymbioticHealthSystems extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SYMBIOTIC_HEALTH_SYSTEMS,
      tags: [Tag.MICROBE],
      startingMegaCredits: 36,
      resourceType: CardResource.MICROBE,

      firstAction: {
        text: 'Place a city tile',
        city: {},
      },

      metadata: {
        cardNumber: 'EP-SHS',
        description: 'You start with 36 M€. As your first action, place a city tile.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(36).city().br;
          b.effect('Whenever you play a microbe tag or place a city tile, place 1 microbe on this card.', (eb) => {
            eb.tag(Tag.MICROBE).slash().city().startEffect.resource(CardResource.MICROBE);
          }).br;
          b.effect('Whenever you play a science tag, remove up to 2 microbes from this card and receive 3 M€ per microbe removed.', (eb) => {
            eb.tag(Tag.SCIENCE).startEffect.megacredits(3).slash().resource(CardResource.MICROBE).text('max 2');
          });
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const microbes = player.tags.cardTagCount(card, Tag.MICROBE);
    if (microbes > 0) {
      player.addResourceTo(this, {qty: microbes, log: true});
    }
    if (player.tags.cardTagCount(card, Tag.SCIENCE) > 0) {
      const qty = Math.min(2, this.resourceCount);
      if (qty > 0) {
        player.removeResourceFrom(this, qty, {log: true});
        player.stock.add(Resource.MEGACREDITS, 3 * qty, {log: true, from: {card: this}});
      }
    }
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (cardOwner.id === activePlayer.id && Board.isCitySpace(space) && space.player?.id === cardOwner.id) {
      cardOwner.addResourceTo(this, {qty: 1, log: true});
    }
  }
}
