import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {PreludeCard} from '../prelude/PreludeCard';
import {Resource} from '../../../common/Resource';
import {Size} from '../../../common/cards/render/Size';
import {all} from '../Options';

export class CorporationCoalition extends PreludeCard {
  constructor() {
    super({
      name: CardName.CORPORATION_COALITION,
      tags: [],
      metadata: {
        cardNumber: 'EP08',
        renderData: CardRenderer.builder((b) => {
          b.cards(1, {all}).tr(2, {all}).production((pb) => pb.megacredits(2, {all})).br.text('Then again for you only.', {size: Size.SMALL});
        }),
        description: 'ALL players draw a card, raise their TR 2 steps and increase their M\u20ac production 2 steps. Repeat this effect, but only for you.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const p of player.game.players) {
      const n = p === player ? 2 : 1;
      p.drawCard(n);
      p.increaseTerraformRating(2 * n);
      p.production.add(Resource.MEGACREDITS, 2 * n, {log: true});
    }
    return undefined;
  }
}
