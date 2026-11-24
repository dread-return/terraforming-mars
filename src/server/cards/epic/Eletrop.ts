import {CorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {all, digit} from '../Options';
import {EpicHooks} from './EpicHooks';

export class Eletrop extends CorporationCard {
  constructor() {
    super({
      name: CardName.ELETROP,
      tags: [Tag.POWER],
      startingMegaCredits: 48,

      metadata: {
        cardNumber: 'EP-ELT',
        description: 'You start with 48 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(48);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.production((pb) => pb.energy(1, {all})).asterix().startEffect.production((pb) => pb.energy(1));
            });
            ce.vSpace(Size.TINY);
            ce.effect('Your energy production always equals the total energy production of your opponents. You can\'t raise it. For each step you would lower it, pay 2 energy instead.', (eb) => {
              eb.minus().production((pb) => pb.energy(1)).startEffect.minus().energy(2, {digit});
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    EpicHooks.syncEletrop(player.game);
    return undefined;
  }
}
