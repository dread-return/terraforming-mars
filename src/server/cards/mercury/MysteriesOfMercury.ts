import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {Units} from '../../../common/Units';
import {CardRenderer} from '../render/CardRenderer';
import {PreludeCard} from '../prelude/PreludeCard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';
import {SelectResource} from '../../inputs/SelectResource';
import {all} from '../Options';

export class MysteriesOfMercury extends PreludeCard {
  constructor() {
    super({
      name: CardName.MYSTERIES_OF_MERCURY,
      tags: [Tag.SCIENCE, Tag.MERCURY],
      metadata: {
        cardNumber: 'MMP04',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.wild(1)).text('+3').asterix().br;
          b.actCard(2).cards(1, {all}).asterix();
        }),
        description: 'Increase any production 1 step (not titanium) and gain 3 of that resource. Draw 2 Act cards. Every player draws a card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const kinds = Units.keys.filter((unit) => unit !== 'titanium');
    player.defer(new SelectResource('Select a production to increase 1 step (and gain 3 of that resource)', kinds).andThen((unit) => {
      player.production.add(unit, 1, {log: true});
      player.stock.add(unit, 3, {log: true});
      return undefined;
    }));
    Mercury.drawActs(player, 2);
    for (const p of player.game.playersInGenerationOrder) {
      p.drawCard();
    }
    return undefined;
  }
}
