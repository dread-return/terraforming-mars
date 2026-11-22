import {CardName} from '../../../common/cards/CardName';
import {IPlayer} from '../../IPlayer';
import {PlayerInput} from '../../PlayerInput';
import {CardRenderer} from '../render/CardRenderer';
import {CeoCard} from './CeoCard';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Turmoil} from '../../turmoil/Turmoil';
import {Size} from '../../../common/cards/render/Size';
import {Resource} from '../../../common/Resource';

export class Zan extends CeoCard {
  constructor() {
    super({
      name: CardName.ZAN,
      metadata: {
        cardNumber: 'L26',
        renderData: CardRenderer.builder((b) => {
          b.effect('You are immune to Reds\' ruling policy.', (eb) => eb.startEffect.redsInactive().asterix());
          b.br.br;
          b.opgArrow().text('ALL', {size: Size.SMALL}).delegates(1).colon().reds().megacredits(1);
        }),
        description: 'Once per game, place all of your available delegates in Reds. Gain 1 M€ for each delegate placed this way.',
      },
    });
  }

  public override canAct(player: IPlayer): boolean {
    // Giga Turmoil leaves some parties out. Without Reds there is nowhere to place the delegates.
    return super.canAct(player) && Turmoil.getTurmoil(player.game).isInPlay(PartyName.REDS);
  }

  public action(player: IPlayer): PlayerInput | undefined {
    this.isDisabled = true;
    const game = player.game;
    const turmoil = Turmoil.getTurmoil(game);
    const totalAvailableDelegates = turmoil.delegateReserve.get(player);
    // Bounded by the count so that a delegate that cannot be sent can never spin this forever.
    for (let i = 0; i < totalAvailableDelegates; i++) {
      turmoil.sendDelegateToParty(player, PartyName.REDS, game);
    }
    // If we don't do this player will not get the bonus for POLITICIAN Awards
    player.totalDelegatesPlaced += totalAvailableDelegates;
    player.stock.add(Resource.MEGACREDITS, totalAvailableDelegates, {log: true});
    return undefined;
  }
}
