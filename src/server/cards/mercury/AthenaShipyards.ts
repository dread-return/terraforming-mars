import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';

export class AthenaShipyards extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ATHENA_SHIPYARDS,
      tags: [Tag.SCIENCE, Tag.SPACE],
      startingMegaCredits: 40,
      metadata: {
        cardNumber: 'MMC03',
        description: 'You start with 40 M€. Immediately when you play this card, draw 2 Rivalry Acts.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).actCard(2).asterix();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect('When you play or take part in a Rivalry Act, add an asset to it.', (eb) => {
              eb.actCard(1).asterix().startEffect.asset(1);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('When you play a science tag, add an asset to an Act.', (eb) => {
              eb.tag(Tag.SCIENCE).startEffect.asset(1);
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    // The Rivalry effect is in Mercury.startDevelopment.
    Mercury.drawActs(player, 2, 'rivalry');
    return undefined;
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = card.tags.filter((tag) => tag === Tag.SCIENCE).length;
    if (count > 0 && card !== this) {
      Mercury.gainAssets(player, count);
    }
    return undefined;
  }
}
