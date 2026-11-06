import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectPlayer} from '../../inputs/SelectPlayer';
import {digit} from '../Options';

const GIFTS: ReadonlyArray<{resource: Resource, amount: number}> = [
  {resource: Resource.MEGACREDITS, amount: 6},
  {resource: Resource.PLANTS, amount: 3},
  {resource: Resource.HEAT, amount: 6},
];

export class CollaborationCrossCompanies extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.COLLABORATION_CROSS_COMPANIES,
      tags: [Tag.EARTH],
      cost: 2,
      requirements: {tr: 25},

      metadata: {
        cardNumber: 'I13',
        renderData: CardRenderer.builder((b) => {
          b.action('Give 6 M€, 3 plants or 6 heat to an opponent.', (eb) => {
            eb.empty().startAction.megacredits(6).slash().plants(3, {digit}).slash().heat(6, {digit}).asterix();
          }).br;
          b.effect('If that opponent raises their TR this generation, raise your TR 1 step.', (eb) => {
            eb.tr(1).asterix().startEffect.tr(1);
          });
        }),
        description: 'Requires a TR of at least 25.',
      },
    });
  }

  public data = {
    target: '',
    generation: -1,
    rewarded: false,
  };

  private affordableGifts(player: IPlayer) {
    return GIFTS.filter((gift) => player.stock.get(gift.resource) >= gift.amount);
  }

  public canAct(player: IPlayer) {
    return player.opponents.length > 0 && this.affordableGifts(player).length > 0;
  }

  private give(player: IPlayer, opponent: IPlayer) {
    return new OrOptions(...this.affordableGifts(player).map((gift) =>
      new SelectOption(`Give ${gift.amount} ${gift.resource}`).andThen(() => {
        player.stock.deduct(gift.resource, gift.amount);
        opponent.stock.add(gift.resource, gift.amount, {log: true, from: {player}});
        this.data = {target: opponent.id, generation: player.game.generation, rewarded: false};
        return undefined;
      }))).setTitle(`Select what to give ${opponent.name}`);
  }

  public action(player: IPlayer) {
    const opponents = player.opponents;
    if (opponents.length === 1) {
      return this.give(player, opponents[0]);
    }
    return new SelectPlayer(opponents, 'Select an opponent to collaborate with', 'Select')
      .andThen((opponent) => this.give(player, opponent));
  }

  public onIncreaseTerraformRatingByAnyPlayer(cardOwner: IPlayer, player: IPlayer, steps: number) {
    if (steps <= 0 || this.data.rewarded || this.data.generation !== cardOwner.game.generation || player.id !== this.data.target) {
      return;
    }
    this.data.rewarded = true;
    cardOwner.game.log('${0} raised their TR, so ${1} does too (${2})', (b) => b.player(player).player(cardOwner).card(this));
    cardOwner.increaseTerraformRating(1);
  }
}
