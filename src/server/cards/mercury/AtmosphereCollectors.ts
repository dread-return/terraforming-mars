import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {Resource} from '../../../common/Resource';
import {IPlayer} from '../../IPlayer';

export class AtmosphereCollectors extends ActCard {
  constructor() {
    super({
      name: CardName.ATMOSPHERE_COLLECTORS,
      kind: 'rivalry',
      steps: 4,
      tags: [Tag.VENUS],
      defeatBehavior: {tr: -1},
      metadata: {
        cardNumber: 'ACT36',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).heat(1).slash().tag(Tag.VENUS).br.text('defeat:', {size: Size.SMALL}).minus().tr(1);
        }),
        description: 'Targeted player requires a Venus tag. Victory: gain 1 heat for every Venus tag you have (including this). Defeat: -1 TR.',
      },
    });
  }

  public override canDevelop(_initiator: IPlayer, other: IPlayer) {
    return other.tags.count(Tag.VENUS, 'raw') > 0;
  }

  public override victory(victor: IPlayer) {
    victor.stock.add(Resource.HEAT, victor.tags.count(Tag.VENUS, 'raw') + 1, {log: true});
  }
}
