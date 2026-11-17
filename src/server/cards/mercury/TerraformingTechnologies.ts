import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

export class TerraformingTechnologies extends ActCard {
  constructor() {
    super({
      name: CardName.TERRAFORMING_TECHNOLOGIES,
      kind: 'treaty',
      steps: 6,
      tags: [Tag.MARS, Tag.PLANT],
      bothBehavior: {tr: 1},
      metadata: {
        cardNumber: 'ACT05',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).cards(1, {secondaryTag: Tag.MARS}).slash().cards(1, {secondaryTag: Tag.PLANT});
        }),
        description: 'Resolve (both): raise your TR 1 step. Draw 1 card with a Mars or a plant tag (choose which).',
      },
    });
  }

  public override resolveFor(player: IPlayer, other: IPlayer | undefined) {
    super.resolveFor(player, other);
    player.defer(new OrOptions(
      new SelectOption('Draw a card with a Mars tag').andThen(() => {
        player.drawCard(1, {tag: Tag.MARS});
        return undefined;
      }),
      new SelectOption('Draw a card with a plant tag').andThen(() => {
        player.drawCard(1, {tag: Tag.PLANT});
        return undefined;
      }),
    ).setTitle('Terraforming Technologies'));
  }
}
