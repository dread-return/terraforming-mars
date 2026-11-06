import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SendDelegateToArea} from '../../deferredActions/SendDelegateToArea';
import {all} from '../Options';

export class SolarSenate extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.SOLAR_SENATE,
      tags: [Tag.BUILDING],
      cost: 12,
      requirements: [{tag: Tag.EARTH}, {tag: Tag.MARS}],

      behavior: {
        production: {megacredits: 1},
      },

      metadata: {
        cardNumber: 'I42',
        renderData: CardRenderer.builder((b) => {
          b.colonies(1, {all}).colon().delegates(1, {all}).asterix().nbsp.production((pb) => pb.megacredits(1));
        }),
        description: 'Requires an Earth tag and a Mars tag. Each player with at least 1 colony adds a delegate to any party. ' +
          'Increase your M€ production 1 step.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    if (game.turmoil === undefined) {
      return undefined;
    }
    for (const p of game.playersInGenerationOrder) {
      const hasColony = game.colonies.some((colony) => colony.colonies.includes(p.id));
      if (hasColony) {
        game.defer(new SendDelegateToArea(p, 'Solar Senate: select a party for your delegate'));
      }
    }
    return undefined;
  }
}
