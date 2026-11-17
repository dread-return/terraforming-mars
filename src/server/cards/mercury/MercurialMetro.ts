import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {Units} from '../../../common/Units';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {all} from '../Options';
import {sum} from '../../../common/utils/utils';

export class MercurialMetro extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.MERCURIAL_METRO,
      type: CardType.AUTOMATED,
      tags: [Tag.BUILDING, Tag.MERCURY],
      cost: 14,
      victoryPoints: 1,
      metadata: {
        cardNumber: 'MM12',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.minus().energy(1).br.megacredits(1).slash().tag(Tag.MERCURY, {all}));
        }),
        description: 'Decrease your energy production 1 step. Increase your M€ production 1 step for every Mercury tag in game, including this.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.production.energy >= 1;
  }

  public productionBox(player: IPlayer): Units {
    // Every Mercury tag in game, including this card's.
    const tags = sum(player.game.players.map((p) => p.tags.count(Tag.MERCURY, 'raw'))) + 1;
    return Units.of({energy: -1, megacredits: tags});
  }

  public override bespokePlay(player: IPlayer) {
    player.production.adjust(this.productionBox(player), {log: true});
    return undefined;
  }
}
