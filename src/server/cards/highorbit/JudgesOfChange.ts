import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {IActionCard} from '../ICard';
import {DrawCards} from '../../deferredActions/DrawCards';
import {SerializedCard} from '../../SerializedCard';

/**
 * Effect: each even TR you reach adds a science resource here (only new highs count, so losing and regaining
 * TR doesn't pay twice). Action: spend a science resource to draw one card per player and keep one.
 */
export class JudgesOfChange extends CorporationCard implements ICorporationCard, IActionCard {
  /** Highest TR reached since the corporation came into play. */
  public highestTR: number | undefined = undefined;

  constructor() {
    super({
      name: CardName.JUDGES_OF_CHANGE,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 33,
      resourceType: CardResource.SCIENCE,
      victoryPoints: {resourcesHere: {}},
      behavior: {
        tr: 2,
      },
      metadata: {
        cardNumber: 'HO81',
        description: 'You start with 33 M€ and 2 extra TR.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(33).nbsp.tr(2);
          b.corpBox('action', (ce) => {
            ce.vSpace();
            ce.effect('Each even TR you reach adds a science resource here.', (eb) => {
              eb.text('even TR').asterix().startEffect.resource(CardResource.SCIENCE);
            });
            ce.action('Spend 1 science here: draw 1 card per player, keep 1.', (eb) => {
              eb.resource(CardResource.SCIENCE).startAction.text('#').cards(1).asterix();
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    this.highestTR = player.terraformRating;
    return undefined;
  }

  public onIncreaseTerraformRatingByAnyPlayer(cardOwner: IPlayer, player: IPlayer) {
    if (cardOwner !== player || this.highestTR === undefined) {
      return;
    }
    const tr = player.terraformRating;
    let count = 0;
    for (let value = this.highestTR + 1; value <= tr; value++) {
      if (value % 2 === 0) {
        count++;
      }
    }
    if (tr > this.highestTR) {
      this.highestTR = tr;
    }
    if (count > 0) {
      player.addResourceTo(this, {qty: count, log: true});
    }
  }

  public canAct(): boolean {
    return this.resourceCount > 0;
  }

  public action(player: IPlayer) {
    player.removeResourceFrom(this, 1, {log: true});
    player.game.defer(DrawCards.keepSome(player, player.game.players.length, {keepMax: 1}));
    return undefined;
  }

  public serialize(serialized: SerializedCard) {
    serialized.data = {highestTR: this.highestTR ?? -1};
  }

  public deserialize(serialized: SerializedCard) {
    const data = serialized.data as {highestTR?: number} | undefined;
    const value = data?.highestTR;
    this.highestTR = value === undefined || value < 0 ? undefined : value;
  }
}
