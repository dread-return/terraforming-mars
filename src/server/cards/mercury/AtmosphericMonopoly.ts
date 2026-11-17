import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {all, digit} from '../Options';

export class AtmosphericMonopoly extends ActCard {
  constructor() {
    super({
      name: CardName.ATMOSPHERIC_MONOPOLY,
      kind: 'treaty',
      steps: 6,
      tags: [],
      metadata: {
        cardNumber: 'ACT22',
        renderData: CardRenderer.builder((b) => {
          b.minus().heat(1, {all}).asterix().heat(8, {digit});
        }),
        description: 'Resolve: steal all heat from the other players. Both of you gain 8 heat.',
      },
    });
  }

  public override resolveTreaty(owner: IPlayer, other: IPlayer | undefined) {
    for (const p of owner.game.players) {
      if (p !== owner && p !== other && p.heat > 0) {
        const heat = p.heat;
        p.stock.deduct(Resource.HEAT, heat, {log: true, from: {player: owner}});
        owner.stock.add(Resource.HEAT, heat, {log: true});
      }
    }
    owner.stock.add(Resource.HEAT, 8, {log: true});
    other?.stock.add(Resource.HEAT, 8, {log: true});
  }
}
