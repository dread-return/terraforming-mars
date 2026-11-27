import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {Resource} from '../../../common/Resource';
import {all} from '../Options';

export class AquarinEnt extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.AQUARIN_ENT,
      tags: [Tag.EARTH],
      startingMegaCredits: 40,

      metadata: {
        cardNumber: 'EP-AQE',
        description: 'You start with 40 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40);
          b.br;
          b.effect(undefined, (eb) => {
            eb.oceans(1, {size: Size.SMALL, all}).slash().cards(1, {secondaryTag: AltSecondaryTag.REQ, size: Size.SMALL}).startEffect.production((pb) => pb.megacredits(1));
          }).br;
          b.effect('Any ocean, or your card that requires oceans: +1 M€ production. *You may place oceans past the maximum (no TR).', (eb) => {
            eb.text('max', {size: Size.SMALL}).oceans(1, {size: Size.SMALL}).startEffect.oceans(1, {size: Size.SMALL}).asterix();
          }).br;
        }),
      },
    });
  }

  private gainProduction(player: IPlayer) {
    player.production.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
  }
  // Oceans past the maximum are in PlaceOceanTile and Game.addOcean (EpicHooks.oceansPastMax).

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space) {
    if (Board.isUncoveredOceanSpace(space)) {
      this.gainProduction(cardOwner);
    }
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const requiresOceans = card.requirements.some((r) => r.oceans !== undefined && r.max !== true);
    if (requiresOceans) {
      this.gainProduction(player);
    }
  }
}
