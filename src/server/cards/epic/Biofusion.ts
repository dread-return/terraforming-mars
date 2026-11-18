import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardResource} from '../../../common/CardResource';
import {all} from '../Options';
import {SelectCard} from '../../inputs/SelectCard';
import {keep, LogType} from '../../deferredActions/ChooseCards';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class Biofusion extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.BIOFUSION,
      tags: [Tag.RADIOACTIVE, Tag.MARS],
      startingMegaCredits: 47,
      initialActionText: 'Reveal cards until you reveal one with a radiation icon, and take it',
      action: {},

      metadata: {
        cardNumber: 'EP-BFS',
        description: 'You start with 47 M€. First action: reveal cards until one with a radiation icon; take it.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(47).cards(1, {secondaryTag: Tag.RADIOACTIVE});
          b.corpBox('effect-action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Pay 2 M€: steal 1 radiation.', (eb) => {
              eb.megacredits(2).startAction.resource(CardResource.RADIATION, {all}).asterix();
            });
            ce.effect('Radiation may be used as microbes.', (eb) => {
              eb.resource(CardResource.RADIATION).startEffect.resource(CardResource.MICROBE);
            });
          });
        }),
      },
    });
  }

  public override initialAction(player: IPlayer) {
    const game = player.game;
    const cards = game.projectDeck.drawByConditionOrThrow(game, 1, (c) => c.tags.includes(Tag.RADIOACTIVE) || c.resourceType === CardResource.RADIATION);
    keep(player, cards, [], LogType.DREW);
    return undefined;
  }

  private targets(player: IPlayer): Array<ICard> {
    return player.opponents.flatMap((o) => o.getCardsWithResources(CardResource.RADIATION).filter((c) => c.protectedResources !== true));
  }

  public override bespokeCanAct(player: IPlayer) {
    return player.canAfford(2) && player.getResourceCards(CardResource.RADIATION).length > 0 && this.targets(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return new SelectCard('Biofusion: steal 1 radiation from', 'Steal', this.targets(player)).andThen(([card]) => {
      const owner = player.opponents.find((o) => o.tableau.has(card.name));
      player.game.defer(new SelectPaymentDeferred(player, 2).andThen(() => {
        owner?.removeResourceFrom(card, 1, {removingPlayer: player, log: true});
        player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count: 1}));
      }));
      return undefined;
    });
  }
  // Radiation as microbes: free conversion in EpicHooks.freeActionOption.
}
