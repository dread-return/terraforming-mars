import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {Tag} from '../../../common/cards/Tag';

export class ExperimentalBioSeeding extends PreludeCard {
  constructor() {
    super({
      name: CardName.EXPERIMENTAL_BIO_SEEDING,
      tags: [Tag.SCIENCE, Tag.PLANT],
      startingMegacredits: -4,
      behavior: {
        greenery: {},
        production: {plants: 1},
        drawCard: {count: 1, tag: Tag.PLANT},
      },
      metadata: {
        cardNumber: 'EP02',
        renderData: CardRenderer.builder((b) => {
          b.greenery().production((pb) => pb.plants(1)).megacredits(-4).cards(1, {secondaryTag: Tag.PLANT});
        }),
        description: 'Place a greenery. Increase your plant production 1 step. Lose 4 M\u20ac. Reveal cards until you reveal a plant card; take it and discard the rest.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.canAfford(4);
  }
  public override bespokePlay(player: IPlayer) {
    player.game.defer(new SelectPaymentDeferred(player, 4));
    return undefined;
  }
}
