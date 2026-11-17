import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

export class LandmarkAchievements extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.LANDMARK_ACHIEVEMENTS,
      tags: [Tag.EARTH],
      startingMegaCredits: 40,
      initialActionText: 'Fund an award for free',

      metadata: {
        cardNumber: 'EP-LMA',
        description: 'You start with 40 M€. First action: fund an award for free.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(40).award();
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.SMALL);
            ce.effect(undefined, (eb) => {
              eb.text('opp.').award().asterix().startEffect.cards(2);
            });
            ce.vSpace(Size.SMALL);
            ce.effect('*An award or milestone. An OPPONENT buys one: draw 2 cards. You buy one: +1 TR.', (eb) => {
              eb.text('you').award().asterix().startEffect.tr(1);
            });
          });
        }),
      },
    });
  }

  public data: {free?: boolean} = {};

  public override initialAction(player: IPlayer) {
    const game = player.game;
    const open = game.awards.filter((a) => !game.hasBeenFunded(a));
    if (open.length === 0 || game.allAwardsFunded()) {
      return undefined;
    }
    return new OrOptions(...open.map((award) => new SelectOption(`Fund ${award.name} for free`, 'Fund').andThen(() => {
      this.data.free = true;
      game.fundAward(player, award);
      return undefined;
    }))).setTitle('Landmark Achievements: fund an award for free');
  }
  // The other effects are in EpicHooks.onMilestoneOrAward.
}
