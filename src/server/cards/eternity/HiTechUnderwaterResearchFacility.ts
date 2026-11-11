import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {SelectSpace} from '../../inputs/SelectSpace';
import {Tag} from '../../../common/cards/Tag';

export class HiTechUnderwaterResearchFacility extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.HI_TECH_UNDERWATER_RESEARCH_FACILITY,
      tags: [Tag.CITY, Tag.BUILDING, Tag.SCIENCE],
      cost: 28,
      requirements: [{tag: Tag.SCIENCE, count: 3}, {tag: Tag.BUILDING, count: 3}],
      victoryPoints: 2,
      metadata: {
        cardNumber: 'E17',
        renderData: CardRenderer.builder((b) => {
          b.action('Pay 12 M€ (steel may be used) to draw 2 cards and raise your TR 1 step.', (eb) => eb.megacredits(12).super((b) => b.steel(1)).startAction.cards(2).tr(1)).br;
          b.city().asterix();
        }),
        description: 'Requires 3 science tags and 3 building tags. Place a city on an area reserved for oceans, ignoring normal placement restrictions.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer) {
    return player.game.board.getAvailableSpacesForOcean(player).length > 0;
  }
  public override bespokePlay(player: IPlayer) {
    player.defer(new SelectSpace('Select an ocean area for the city', player.game.board.getAvailableSpacesForOcean(player)).andThen((space) => {
      player.game.addCity(player, space);
      return undefined;
    }));
    return undefined;
  }
  public canAct(player: IPlayer) {
    return player.canAfford({cost: 12, steel: true, tr: {tr: 1}});
  }
  public action(player: IPlayer) {
    player.game.defer(new SelectPaymentDeferred(player, 12, {canUseSteel: true}).andThen(() => {
      player.drawCard(2);
      player.increaseTerraformRating(1);
    }));
    return undefined;
  }
}
