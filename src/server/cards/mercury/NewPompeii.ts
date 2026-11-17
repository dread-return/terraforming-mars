import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {SpaceName} from '../../../common/boards/SpaceName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';
import {MercuryColonies} from '../../mercury/MercuryColonies';
import {SelectCard} from '../../inputs/SelectCard';

export class NewPompeii extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.NEW_POMPEII,
      type: CardType.AUTOMATED,
      tags: [Tag.BUILDING, Tag.SPACE, Tag.CITY, Tag.MERCURY],
      cost: 33,
      behavior: {
        production: {megacredits: 5},
      },
      metadata: {
        cardNumber: 'MM09',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(5)).actCard(3).asterix().br;
          b.city().asterix();
        }),
        description: 'Requires 3 colonies on Mercury. Increase your M€ production 5 steps. Draw 3 Act cards, then immediately resolve 2 Acts from your hand in your favour. Place a city tile on the New Pompeii reserved area.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return MercuryColonies.coloniesOnMercury(player.game) >= 3;
  }

  public override bespokePlay(player: IPlayer) {
    const space = player.game.board.spaces.find((s) => s.id === SpaceName.NEW_POMPEII);
    if (space !== undefined && space.tile === undefined) {
      player.game.addCity(player, space, this.name);
    }
    Mercury.drawActs(player, 3);
    for (let i = 0; i < 2; i++) {
      player.defer(() => {
        if (player.actCardsInHand.length === 0) {
          return undefined;
        }
        return new SelectCard('Select an Act to resolve in your favour', 'Resolve', player.actCardsInHand)
          .andThen(([card]) => {
            Mercury.resolveInFavour(player, card);
            return undefined;
          });
      });
    }
    return undefined;
  }
}
