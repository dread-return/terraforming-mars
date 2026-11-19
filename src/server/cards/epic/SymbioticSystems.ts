import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {tagSet} from '../render/DynamicVictoryPoints';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';

const TAGS = [Tag.EARTH, Tag.VENUS, Tag.JOVIAN];

export class SymbioticSystems extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.SYMBIOTIC_SYSTEMS,
      tags: [Tag.EARTH, Tag.SPACE],
      startingMegaCredits: 50,
      victoryPoints: 'special',
      cardDiscount: [
        {tag: Tag.EARTH, amount: 1, per: 'card'},
        {tag: Tag.VENUS, amount: 1, per: 'card'},
        {tag: Tag.JOVIAN, amount: 1, per: 'card'},
      ],

      metadata: {
        cardNumber: 'EP-SYS',
        description: 'You start with 50 M€. 1 VP per set of Earth, Venus and Jovian tags you have.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(50);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Cards with an Earth, Venus or Jovian tag cost you 1 M€ less.', (eb) => {
              eb.tag(Tag.EARTH).slash().tag(Tag.VENUS).slash().tag(Tag.JOVIAN).startEffect.megacredits(-1);
            });
          });
        }),
        victoryPoints: tagSet(TAGS),
      },
    });
  }

  public override getVictoryPoints(player: IPlayer): number {
    return Math.min(...TAGS.map((tag) => player.tags.count(tag, 'raw')));
  }
}
