import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {MercuryColonies} from '../../mercury/MercuryColonies';

export class MercurialShadowColony extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.MERCURIAL_SHADOW_COLONY,
      type: CardType.AUTOMATED,
      tags: [Tag.POWER, Tag.BUILDING, Tag.MERCURY],
      cost: 26,
      behavior: {
        production: {megacredits: 2, energy: 2},
      },
      metadata: {
        cardNumber: 'MM01',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2).energy(2)).colonies(1).asterix();
        }),
        description: 'Increase your M€ production 2 steps and energy production 2 steps. Place a colony on Mercury (you can place it disregarding the limit of 3).',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.defer(() => MercuryColonies.placeColonyOnMercury(player, {reservedSpace: true}));
    return undefined;
  }
}
