import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
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
        description: 'You start with 36 M€. First action: place a city tile.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(36).city();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.tag(Tag.MICROBE).slash().city({size: Size.SMALL}).startEffect.resource(CardResource.MICROBE);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Microbe tag or city: add a microbe here. Science tag: remove up to 2 here for 3 M€ each.', (eb) => {
              eb.tag(Tag.SCIENCE).startEffect.minus().resource(CardResource.MICROBE).colon().megacredits(3).asterix();
            });
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
