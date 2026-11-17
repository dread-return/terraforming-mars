import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {SelectPlayer} from '../../inputs/SelectPlayer';

export class CriticalHitEnterprises extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.CRITICAL_HIT_ENTERPRISES,
      tags: [Tag.SPACE, Tag.EVENT],
      startingMegaCredits: 39,

      metadata: {
        cardNumber: 'EP-CHE',
        description: 'You start with 39 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(39);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When you play an "Asteroid" event or the ASTEROID project, a player with more TR loses 1 TR.', (eb) => {
              eb.plate('Asteroid').asterix().startEffect.minus().tr(1, {all});
            });
          });
        }),
      },
    });
  }

  private strike(player: IPlayer) {
    const targets = player.opponents.filter((p) => p.terraformRating > player.terraformRating);
    if (targets.length === 0) {
      return;
    }
    player.defer(new SelectPlayer(targets, 'Select a player to lose 1 TR', 'Lose TR').andThen((target) => {
      target.decreaseTerraformRating(1, {log: true});
      return undefined;
    }));
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (card.type === CardType.EVENT && card.name.toLowerCase().includes('asteroid')) {
      this.strike(player);
    }
  }

  public onStandardProject(player: IPlayer, project: IStandardProjectCard) {
    if (project.name === CardName.ASTEROID_STANDARD_PROJECT) {
      this.strike(player);
    }
  }
}
