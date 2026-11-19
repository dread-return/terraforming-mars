import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectAmount} from '../../inputs/SelectAmount';

export class Troidco extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.TROIDCO,
      tags: [Tag.JOVIAN],
      startingMegaCredits: 51,
      behavior: {
        production: {steel: 2},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-TRO',
        description: 'You start with 51 M€ and 2 steel production.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(51).production((pb) => pb.steel(2));
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action(undefined, (eb) => {
              eb.megacredits(1, {text: 'x'}).text('x').steel(1).startAction.text('x').titanium(1);
            });
            ce.vSpace(Size.SMALL);
            ce.action('Pay X M€ and X steel for X titanium, OR pay X titanium for X M€ and X steel.', (eb) => {
              eb.text('x').titanium(1).startAction.megacredits(1, {text: 'x'}).text('x').steel(1);
            });
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return Math.min(player.megaCredits, player.steel) > 0 || player.titanium > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const options = new OrOptions();
    const buy = Math.min(player.megaCredits, player.steel);
    if (buy > 0) {
      options.options.push(new SelectOption('Pay M€ and steel to gain titanium').andThen(() => {
        return new SelectAmount('Select X', 'Convert', 1, buy, true).andThen((x) => {
          player.stock.deduct(Resource.MEGACREDITS, x, {log: true});
          player.stock.deduct(Resource.STEEL, x, {log: true});
          player.stock.add(Resource.TITANIUM, x, {log: true});
          return undefined;
        });
      }));
    }
    if (player.titanium > 0) {
      options.options.push(new SelectOption('Pay titanium to gain M€ and steel').andThen(() => {
        return new SelectAmount('Select X', 'Convert', 1, player.titanium, true).andThen((x) => {
          player.stock.deduct(Resource.TITANIUM, x, {log: true});
          player.stock.add(Resource.MEGACREDITS, x, {log: true});
          player.stock.add(Resource.STEEL, x, {log: true});
          return undefined;
        });
      }));
    }
    return options.options.length === 1 ? options.options[0] : options;
  }
}
