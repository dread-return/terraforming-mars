import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Resource} from '../../../common/Resource';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class HackerAttack extends PreludeCard {
  constructor() {
    super({
      name: CardName.HACKER_ATTACK,
      tags: [Tag.WILD],
      behavior: {
        production: {megacredits: 1},
      },
      metadata: {
        cardNumber: 'EP23',
        renderData: CardRenderer.builder((b) => {
          b.text('LOOK/REVEAL').production((pb) => pb.megacredits(-2, {all}).nbsp.megacredits(1));
        }),
        description: 'Opponents reveal their starting hands. All opponents decrease their M\u20ac production 2 steps. Increase your M\u20ac production 1 step.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const p of player.opponents) {
      player.game.log('${0} revealed their hand: ${1}', (b) => b.player(p).cards(p.cardsInHand));
      p.production.add(Resource.MEGACREDITS, -2, {log: true, from: {player}});
    }
    return undefined;
  }
}
