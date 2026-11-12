import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {influenceOf, gain, chooseOne} from './GigaEventHelpers';
import {DomesWilderness} from '../../../domesWilderness/DomesWilderness';

export class UniversalUprising extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.UNIVERSAL_UPRISING,
      description: 'Gain 1 plant per greenery you own and influence. Gain 5 M€ or 3 steel.',
      revealedDelegate: PartyName.BUREAUCRATS,
      currentDelegate: PartyName.TRANSHUMANISTS,
      renderData: CardRenderer.builder((b) => {
        b.plants(1).slash().greenery().influence({size: Size.SMALL}).nbsp.megacredits(5).slash().steel(3);
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    gain(player, Resource.PLANTS, DomesWilderness.countGreeneries(player.game.board.getGreeneries(player)) + influenceOf(player), this);
    chooseOne(player, 'Universal Uprising Global Event - select what to gain', [
      {title: 'Gain 5 M€', apply: () => gain(player, Resource.MEGACREDITS, 5, this)},
      {title: 'Gain 3 steel', apply: () => gain(player, Resource.STEEL, 3, this)},
    ]);
  }
}
