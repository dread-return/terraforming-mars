import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardType} from '../../../common/cards/CardType';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICard} from '../ICard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {Tag} from '../../../common/cards/Tag';

export class TheGarrisonFoundation extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.THE_GARRISON_FOUNDATION,
      tags: [Tag.SPACE],
      startingMegaCredits: 9,
      behavior: {
        production: {megacredits: 2, steel: 1, titanium: 2},
      },
      metadata: {
        cardNumber: 'EC20',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(9).production((pb) => pb.megacredits(2).steel(1).titanium(2)).br;
          b.corpBox('effect', (ce) => ce.effect('When you play a standard project or a card that costs at least 25 M€, raise your TR 1 step.', (eb) => eb.text('25+ SP').slash().text('25+ card').startEffect.tr(1)));
        }),
        description: 'You start with 9 M\u20ac, 2 M\u20ac production, 1 steel production and 2 titanium production.',
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.type !== CardType.CORPORATION && card.type !== CardType.PRELUDE && card.cost !== undefined && card.cost >= 25) {
      player.increaseTerraformRating(1);
    }
    return undefined;
  }
  public onStandardProject(player: IPlayer, project: IStandardProjectCard) {
    if (project.cost >= 25) {
      player.increaseTerraformRating(1);
    }
  }
}
