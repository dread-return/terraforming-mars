import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
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
          b.megacredits(40).br;
          b.effect('Whenever an ocean tile is placed, or when you play a card that requires oceans, increase your energy or M€ production 1 step.', (eb) => {
            eb.oceans(1, {all}).slash().text('ocean req.').startEffect.production((pb) => pb.energy(1)).or().production((pb) => pb.megacredits(1));
          });
        }),
      },
    });
  }

  private gainProduction(player: IPlayer) {
    player.defer(new OrOptions(
      new SelectOption('Increase your energy production 1 step').andThen(() => {
        player.production.add(Resource.ENERGY, 1, {log: true, from: {card: this}});
        return undefined;
      }),
      new SelectOption('Increase your M€ production 1 step').andThen(() => {
        player.production.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
        return undefined;
      }),
    ).setTitle('Aquarin Ent.: choose a production to increase'));
  }

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
