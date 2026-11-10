import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {PreludeCard} from '../prelude/PreludeCard';
import {Resource} from '../../../common/Resource';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';
import {all} from '../Options';

export class StrategicBaseBombardment extends PreludeCard {
  constructor() {
    super({
      name: CardName.STRATEGIC_BASE_BOMBARDMENT,
      tags: [Tag.SPACE],
      behavior: {
        global: {temperature: 1},
      },
      metadata: {
        cardNumber: 'EP56',
        renderData: CardRenderer.builder((b) => {
          b.temperature(1).production((pb) => pb.megacredits(-2, {all})).br.text('2x:').megacredits(-2, {all}).slash().wild(1).asterix();
        }),
        description: 'Raise the temperature 1 step. ALL OTHER players decrease their M\u20ac production 2 steps and, twice, lose 1 standard resource or 2 M\u20ac.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const p of player.opponents) {
      p.production.add(Resource.MEGACREDITS, -2, {log: true, from: {player}});
      for (let i = 0; i < 2; i++) {
        p.defer(() => {
          const opts = [Resource.MEGACREDITS, Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT]
            .filter((r) => p.stock.get(r) >= (r === Resource.MEGACREDITS ? 2 : 1))
            .map((r) => new SelectOption(r === Resource.MEGACREDITS ? 'Lose 2 M€' : 'Lose 1 ' + r).andThen(() => {
              p.stock.deduct(r, r === Resource.MEGACREDITS ? 2 : 1, {log: true, from: {player}});
              return undefined;
            }));
          if (opts.length === 0) {
            return undefined;
          }
          return new OrOptions(...opts).setTitle('Strategic Base Bombardment: lose a resource');
        });
      }
    }
    return undefined;
  }
}
