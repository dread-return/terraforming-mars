import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Mercury} from '../../mercury/Mercury';
import {MercuryColonies} from '../../mercury/MercuryColonies';
import {all} from '../Options';

export class Hermes extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.HERMES,
      tags: [Tag.MERCURY],
      startingMegaCredits: 40,
      metadata: {
        cardNumber: 'MMC02',
        description: 'You start with 40 M€. Immediately when you play this card, place a colony on Mercury. Receive 2 Act cards.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(40).colonies(1).asterix().actCard(2);
          b.corpBox('effect', (ce) => {
            ce.effect('When ANY player plays a Mercury tag, including this, increase your M€ production 1 step and add an asset to an Act.', (eb) => {
              eb.tag(Tag.MERCURY, {all}).startEffect.production((pb) => pb.megacredits(1)).asset(1);
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.defer(() => MercuryColonies.placeColonyOnMercury(player));
    Mercury.drawActs(player, 2);
    return undefined;
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    const count = card.tags.filter((tag) => tag === Tag.MERCURY).length;
    if (count > 0) {
      thisCardOwner.production.add(Resource.MEGACREDITS, count, {log: true});
      Mercury.gainAssets(thisCardOwner, count);
    }
    return undefined;
  }
}
