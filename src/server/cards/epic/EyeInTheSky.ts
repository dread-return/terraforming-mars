import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {questionmark} from '../render/DynamicVictoryPoints';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';

const TAGS = [Tag.MOON, Tag.VENUS, Tag.MARS, Tag.JOVIAN];

export class EyeInTheSky extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.EYE_IN_THE_SKY,
      tags: [Tag.SPACE],
      startingMegaCredits: 38,
      victoryPoints: 'special',

      metadata: {
        cardNumber: 'EP-EIS',
        description: 'You start with 38 M€. 1 VP for each set of Moon, Venus, Mars and Jovian tags you have.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(38).br;
          b.effect('Each time you play a Moon, Venus, Mars or Jovian tag, gain 3 M€.', (eb) => {
            eb.tag(Tag.MOON).tag(Tag.VENUS).tag(Tag.MARS).tag(Tag.JOVIAN).startEffect.megacredits(3);
          });
        }),
        victoryPoints: questionmark(),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = player.tags.cardTagCount(card, TAGS);
    if (count > 0) {
      player.stock.add(Resource.MEGACREDITS, 3 * count, {log: true, from: {card: this}});
    }
  }

  public override getVictoryPoints(player: IPlayer): number {
    return Math.min(...TAGS.map((tag) => player.tags.count(tag, 'raw')));
  }
}
