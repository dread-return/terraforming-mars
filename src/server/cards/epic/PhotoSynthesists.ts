import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {Resource} from '../../../common/Resource';

export class PhotoSynthesists extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PHOTO_SYNTHESISTS,
      tags: [Tag.PLANT, Tag.POWER],
      startingMegaCredits: 40,
      behavior: {
        stock: {plants: 2},
        production: {plants: 1},
      },

      metadata: {
        cardNumber: 'EP-PHS',
        description: 'You start with 40 M€, 2 plants and 1 plant production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).plants(2).production((pb) => pb.plants(1)).br;
          b.effect('When you place a greenery tile, gain 2 energy. Each time you gain 1 step of energy production, gain 1 plant.', (eb) => {
            eb.greenery().colon().energy(2).nbsp.production((pb) => pb.energy(1)).startEffect.plants(1);
          });
        }),
      },
    });
  }

  public onTilePlaced(cardOwner: IPlayer, activePlayer: IPlayer, space: Space) {
    if (cardOwner.id === activePlayer.id && Board.isGreenerySpace(space) && space.player?.id === cardOwner.id) {
      cardOwner.stock.add(Resource.ENERGY, 2, {log: true, from: {card: this}});
    }
  }

  public onProductionGain(player: IPlayer, resource: Resource, amount: number) {
    if (resource === Resource.ENERGY && amount > 0) {
      player.stock.add(Resource.PLANTS, amount, {log: true, from: {card: this}});
    }
  }
}
