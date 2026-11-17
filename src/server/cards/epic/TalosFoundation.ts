import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {digit} from '../Options';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';

export class TalosFoundation extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.TALOS_FOUNDATION,
      tags: [Tag.SCIENCE, Tag.BUILDING],
      startingMegaCredits: 41,
      action: {},

      metadata: {
        cardNumber: 'EP-TAL',
        description: 'You start with 41 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(41);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.action(undefined, (eb) => {
              eb.minus().cards(4, {digit}).startAction.production((pb) => pb.heat(2));
            });
            ce.vSpace(Size.SMALL);
            ce.action('Discard 4 cards: +2 heat production, OR +1 M€ and +1 energy, steel, titanium or plant production.', (eb) => {
              eb.text('or').startAction.production((pb) => pb.megacredits(1).wild(1)).asterix();
            });
          });
        }),
      },
    });
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.cardsInHand.length >= 4;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectCard('Talos Foundation: discard 4 cards', 'Discard', player.cardsInHand, {min: 4, max: 4}).andThen((cards) => {
      cards.forEach((c) => player.discardCardFromHand(c));
      const raise = (label: string, units: Array<[Resource, number]>) => new SelectOption(label).andThen(() => {
        units.forEach(([r, n]) => player.production.add(r, n, {log: true}));
        return undefined;
      });
      return new OrOptions(
        raise('+2 heat production', [[Resource.HEAT, 2]]),
        raise('+1 M€ and +1 energy production', [[Resource.MEGACREDITS, 1], [Resource.ENERGY, 1]]),
        raise('+1 M€ and +1 steel production', [[Resource.MEGACREDITS, 1], [Resource.STEEL, 1]]),
        raise('+1 M€ and +1 titanium production', [[Resource.MEGACREDITS, 1], [Resource.TITANIUM, 1]]),
        raise('+1 M€ and +1 plant production', [[Resource.MEGACREDITS, 1], [Resource.PLANTS, 1]]),
      ).setTitle('Talos Foundation: choose the production boost');
    });
  }
}
