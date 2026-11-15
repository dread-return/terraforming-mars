import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {HighOrbit} from '../../highOrbit/HighOrbit';
import {InfrastructureCard} from './InfrastructureCard';

/**
 * "Get the first player marker": like Space Wargames, the owner is first player next generation
 * (HighOrbit.nextFirstPlayer reads `generationUsed`).
 */
export class PlanetaryOutpost extends InfrastructureCard {
  public generationUsed: number | undefined = undefined;

  constructor(copy: number = 1) {
    super(CardName.PLANETARY_OUTPOST, copy, {
      victoryPoints: 1,
      metadata: {
        cardNumber: 'HO49',
        renderData: CardRenderer.builder((b) => {
          b.firstPlayer().asterix();
        }),
        description: 'Take the first player marker for next generation. No other Planetary Outpost can be played this generation.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    return !HighOrbit.planetaryOutpostPlayedThisGeneration(player.game);
  }

  public override bespokePlay(player: IPlayer) {
    this.generationUsed = player.game.generation;
    player.game.log('${0} will be first player next generation (${1})', (b) => b.player(player).card(this));
    return undefined;
  }
}
