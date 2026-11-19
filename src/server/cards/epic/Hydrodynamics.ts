import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {Resource} from '../../../common/Resource';

export class Hydrodynamics extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HYDRODYNAMICS,
      tags: [Tag.POWER],
      startingMegaCredits: 38,

      metadata: {
        cardNumber: 'EP-HYD',
        description: 'You start with 38 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(38);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.oceans(1, {size: Size.SMALL}).startEffect.production((pb) => pb.energy(1));
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Your ocean tiles give +1 energy production. Tiles next to oceans give you 4 M€ instead of 2.', (eb) => {
              eb.emptyTile('normal', {size: Size.SMALL}).oceans(1, {size: Size.SMALL}).startEffect.megacredits(4);
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.oceanBonus = 4;
    return undefined;
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (cardOwner.id === activePlayer.id && Board.isUncoveredOceanSpace(space)) {
      cardOwner.production.add(Resource.ENERGY, 1, {log: true, from: {card: this}});
    }
  }
}
