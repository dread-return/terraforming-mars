import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Space} from '../../boards/Space';
import {Tag} from '../../../common/cards/Tag';

export class SupernovaAsteroid extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.SUPERNOVA_ASTEROID,
      tags: [Tag.SPACE],
      cost: 54,
      behavior: {
        drawCard: 1,
      },
      metadata: {
        cardNumber: 'E126',
        renderData: CardRenderer.builder((b) => {
          b.oceans(1).oceans(1).asterix().br.greenery().greenery().asterix().cards(1);
        }),
        description: 'Place 1 ocean, then 1 ocean adjacent to it if possible. Then place 2 greeneries adjacent to each other and adjacent to at least one of those oceans. Draw a card.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    const board = game.board;
    const oceans: Array<Space> = [];
    const greeneries = () => {
      const land = () => new Set(board.getAvailableSpacesOnLand(player));
      const firstChoices = [...land()].filter((s) => board.getAdjacentSpaces(s).some((a) => oceans.includes(a)));
      const withPartner = firstChoices.filter((s) => board.getAdjacentSpaces(s).some((a) => land().has(a)));
      const choices = withPartner.length > 0 ? withPartner : firstChoices;
      if (choices.length === 0) {
        return undefined;
      }
      return new SelectSpace('Select space for the first greenery (next to one of those oceans)', choices).andThen((g1) => {
        game.addGreenery(player, g1);
        const second = board.getAdjacentSpaces(g1).filter((a) => land().has(a));
        if (second.length === 0) {
          return undefined;
        }
        return new SelectSpace('Select space for the second greenery (next to the first)', second).andThen((g2) => {
          game.addGreenery(player, g2);
          return undefined;
        });
      });
    };
    if (board.getAvailableSpacesForOcean(player).length === 0) {
      return undefined;
    }
    player.defer(new SelectSpace('Select space for the first ocean', board.getAvailableSpacesForOcean(player)).andThen((o1) => {
      game.addOcean(player, o1);
      oceans.push(o1);
      const adjacent = board.getAvailableSpacesForOcean(player).filter((s) => board.getAdjacentSpaces(o1).includes(s));
      if (adjacent.length === 0) {
        return greeneries();
      }
      return new SelectSpace('Select space for the second ocean (next to the first)', adjacent).andThen((o2) => {
        game.addOcean(player, o2);
        oceans.push(o2);
        return greeneries();
      });
    }));
    return undefined;
  }
}
