import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {EpicUtils} from './EpicUtils';

export class BuyNLarge extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.BUY_N_LARGE,
      tags: [Tag.WILD],
      startingMegaCredits: 37,

      metadata: {
        cardNumber: 'EP-BNL',
        description: 'You start with 37 M€ and 1 production each of 2 different resources of your choice.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(37).production((pb) => pb.wild(1).wild(1)).asterix().br;
          b.effect('When you play a standard project, gain 1 M€.', (eb) => {
            eb.plate('Standard projects').startEffect.megacredits(1);
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    EpicUtils.gainDifferentProductions(player, 2, this);
    return undefined;
  }

  public onStandardProject(player: IPlayer, _project: IStandardProjectCard) {
    player.stock.add(Resource.MEGACREDITS, 1, {log: true, from: {card: this}});
  }
}
