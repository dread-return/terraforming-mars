import {CorporationCard} from '../corporation/CorporationCard';
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

export class PlutonicPrototyping extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.PLUTONIC_PROTOTYPING,
      tags: [Tag.RADIOACTIVE, Tag.BUILDING],
      startingMegaCredits: 36,

      behavior: {
        stock: {steel: 2, titanium: 2, energy: 3},
      },

      metadata: {
        cardNumber: 'EP-PLP',
        description: 'You start with 36 M€, 1 titanium or steel production, 2 steel, 2 titanium and 3 energy.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(36).production((pb) => pb.titanium(1).or().steel(1));
          b.br;
          b.steel(2, {digit}).titanium(2, {digit}).energy(3, {digit});
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Steel and titanium are interchangeable when paying for building and space cards.', (eb) => {
              eb.tag(Tag.BUILDING).slash().tag(Tag.SPACE).startEffect.steel(1).text('=').titanium(1);
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.defer(new OrOptions(
      new SelectOption('Gain 1 titanium production').andThen(() => {
        player.production.add(Resource.TITANIUM, 1, {log: true});
        return undefined;
      }),
      new SelectOption('Gain 1 steel production').andThen(() => {
        player.production.add(Resource.STEEL, 1, {log: true});
        return undefined;
      }),
    ).setTitle('Plutonic Prototyping: starting production'));
    return undefined;
  }
  // Payment is in Player.paymentOptionsForCard (EpicHooks.canUseSteel / canUseTitanium).
}
