import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {isIProjectCard} from '../IProjectCard';
import {EpicUtils} from './EpicUtils';
import {WildResourceCorporation} from './WildResourceCorporation';
import {hasGlobalRequirement} from './WildResourceCorporation';
import {ALL_RESOURCES} from '../../../common/Resource';

export class FlexiChangeIndustry extends WildResourceCorporation {
  constructor() {
    super({
      name: CardName.FLEXI_CHANGE_INDUSTRY,
      tags: [Tag.WILD],
      startingMegaCredits: 32,
      resourceType: CardResource.WILD_RESOURCE,
      action: {},

      metadata: {
        cardNumber: 'EP-FLX',
        description: 'You start with 2 productions of choice and 32 M€ (+3 per other player).',
        renderData: CardRenderer.builder((b) => {
          b.production((pb) => pb.wild(1).wild(1)).megacredits(32).megacredits(3, {text: '+3'}).slash().otherPlayer();
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('Card with a global requirement: add a wild resource.', (eb) => {
              eb.temperature(1, {size: Size.SMALL}).oxygen(1, {size: Size.SMALL}).oceans(1, {size: Size.SMALL}).venus(1, {size: Size.SMALL}).startEffect.resource(CardResource.WILD_RESOURCE);
            });
            ce.vSpace(Size.TINY);
            ce.action('Spend 1 wild: +1 production, -1 another.', (eb) => {
              eb.resource(CardResource.WILD_RESOURCE).startAction.production((pb) => pb.plus().wild(1).nbsp.minus().wild(1));
            });
          });
        }),
      },
    });
  }

  protected override perOpponent() {
    return 3;
  }

  public override bespokePlay(player: IPlayer) {
    super.bespokePlay(player);
    // Two productions of your choice (may be the same), asked one after the other.
    player.defer(new OrOptions(
      ...ALL_RESOURCES.map((resource) => new SelectOption(`Increase your ${resource} production 1 step`).andThen(() => {
        player.production.add(resource, 1, {log: true, from: {card: this}});
        return EpicUtils.gainAnyProduction(player, this);
      })),
    ).setTitle('Flexi-Change Industry: choose your first starting production'));
    return undefined;
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    if (isIProjectCard(card) && hasGlobalRequirement(card)) {
      this.addWild(player);
    }
  }

  private lowerable(player: IPlayer): Array<Resource> {
    return ALL_RESOURCES.filter((r) => player.production.get(r) > (r === Resource.MEGACREDITS ? -5 : 0));
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.resourceCount > 0 && this.lowerable(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    player.removeResourceFrom(this, 1, {log: true});
    return new OrOptions(
      ...this.lowerable(player).map((lower) => new SelectOption(`Lower your ${lower} production 1 step`).andThen(() =>
        new OrOptions(
          ...ALL_RESOURCES.filter((r) => r !== lower).map((raise) => new SelectOption(`Raise your ${raise} production 1 step`).andThen(() => {
            player.production.add(lower, -1, {log: true});
            player.production.add(raise, 1, {log: true});
            return undefined;
          })),
        ).setTitle('Flexi-Change Industry: choose a production to raise'))),
    ).setTitle('Flexi-Change Industry: choose a production to lower');
  }
}
