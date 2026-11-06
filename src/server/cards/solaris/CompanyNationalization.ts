import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {PartyName} from '../../../common/turmoil/PartyName';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';
import {Resource} from '../../../common/Resource';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {digit} from '../Options';

export class CompanyNationalization extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.COMPANY_NATIONALIZATION,
      tags: [Tag.EARTH],
      cost: 4,
      requirements: {party: PartyName.REDS},

      metadata: {
        cardNumber: 'S32',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.megacredits(2)).megacredits(15).br;
          b.or().steel(12, {digit}).energy(4, {digit}).br;
          b.or().production((pb) => pb.titanium(2)).titanium(3, {digit});
        }),
        description: 'Requires Reds ruling or 2 delegates there. Choose one. DISCARD YOUR CORPORATION.',
      },
    });
  }

  public static discard(player: IPlayer, corp: ICorporationCard) {
    if (player.playedCards.remove(corp)) {
      player.game.log('${0} discarded ${1}', (b) => b.player(player).card(corp));
    }
  }

  public override bespokePlay(player: IPlayer) {
    const corps = player.playedCards.corporations();
    if (corps.length === 1) {
      CompanyNationalization.discard(player, corps[0]);
    } else if (corps.length > 1) {
      player.defer(new SelectCard('Select the corporation to discard', 'Discard', corps)
        .andThen(([corp]) => {
          CompanyNationalization.discard(player, corp);
          return undefined;
        }));
    }

    return new OrOptions(
      new SelectOption('Increase your M€ production 2 steps and gain 15 M€').andThen(() => {
        player.production.add(Resource.MEGACREDITS, 2, {log: true});
        player.stock.add(Resource.MEGACREDITS, 15, {log: true});
        return undefined;
      }),
      new SelectOption('Gain 12 steel and 4 energy').andThen(() => {
        player.stock.add(Resource.STEEL, 12, {log: true});
        player.stock.add(Resource.ENERGY, 4, {log: true});
        return undefined;
      }),
      new SelectOption('Increase your titanium production 2 steps and gain 3 titanium').andThen(() => {
        player.production.add(Resource.TITANIUM, 2, {log: true});
        player.stock.add(Resource.TITANIUM, 3, {log: true});
        return undefined;
      }),
    );
  }
}
