import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';

export class LunaContracts extends ActCard {
  constructor() {
    super({
      name: CardName.LUNA_CONTRACTS,
      kind: 'rivalry',
      steps: 4,
      tags: [Tag.EARTH],
      victoryBehavior: {drawCard: {count: 2, tag: Tag.EARTH}},
      defeatBehavior: {tr: -1},
      metadata: {
        cardNumber: 'ACT33',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).cards(2, {secondaryTag: Tag.EARTH}).br.text('defeat:', {size: Size.SMALL}).minus().tr(1);
        }),
        description: 'Targeted player requires an Earth tag. Victory: draw 2 cards with an Earth tag. Defeat: -1 TR.',
      },
    });
  }

  public override canDevelop(_initiator: IPlayer, other: IPlayer) {
    return other.tags.count(Tag.EARTH, 'raw') > 0;
  }
}
