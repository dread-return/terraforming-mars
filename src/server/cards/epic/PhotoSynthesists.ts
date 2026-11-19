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
          b.br.br;
          b.megacredits(40).plants(2).production((pb) => pb.plants(1));
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.greenery({size: Size.SMALL}).startEffect.energy(2);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('Your greeneries give 2 energy. Each step of energy production you gain gives 1 plant.', (eb) => {
              eb.production((pb) => pb.energy(1)).startEffect.plants(1);
            });
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
