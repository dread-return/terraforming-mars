import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {PartyName} from '../../../common/turmoil/PartyName';
import {CardRenderer} from '../render/CardRenderer';
import {Card} from '../Card';
import {IProjectCard} from '../IProjectCard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class PlanetaryResearchInitiative extends Card implements IProjectCard {
  constructor() {
    super({
      name: CardName.PLANETARY_RESEARCH_INITIATIVE,
      type: CardType.AUTOMATED,
      tags: [Tag.SCIENCE, Tag.MARS, Tag.MERCURY],
      cost: 18,
      requirements: {party: PartyName.REDS},
      victoryPoints: 1,
      metadata: {
        cardNumber: 'MM27',
        renderData: CardRenderer.builder((b) => {
          b.wild(2).asterix().asset(1);
        }),
        description: 'Requires that Reds are ruling or that you have 2 delegates there. Place any 2 resources (NOT animals) on any cards. Add 1 asset to an Act.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (let i = 0; i < 2; i++) {
      player.game.defer(new AddResourcesToCard(player, undefined, {count: 1, filter: (card) => card.resourceType !== CardResource.ANIMAL}));
    }
    Mercury.gainAssets(player, 1);
    return undefined;
  }
}
