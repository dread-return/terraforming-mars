import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {IStandardProjectCard} from '../IStandardProjectCard';
import {StealResources} from '../../deferredActions/StealResources';
import {RemoveResourcesFromCard} from '../../deferredActions/RemoveResourcesFromCard';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {all} from '../Options';

export class CEOHeartAttack extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.CEO_HEART_ATTACK,
      cost: 3,
      victoryPoints: -1,

      metadata: {
        cardNumber: 'N48',
        renderData: CardRenderer.builder((b) => {
          b.text('steal').megacredits(4, {all}).resource(CardResource.RADIATION, {all}).br;
          b.text('next card or standard project: -6 M€');
        }),
        description: 'Steal 4 M€ and a radiation from any player. Your next card or standard project costs 6 M€ less.',
      },
    });
  }

  public data = {pending: false};

  public override bespokePlay(player: IPlayer) {
    this.data = {pending: true};
    player.game.defer(new StealResources(player, Resource.MEGACREDITS, 4));
    if (player.opponents.some((p) => p.getCardsWithResources(CardResource.RADIATION).length > 0)) {
      player.game.defer(new RemoveResourcesFromCard(player, CardResource.RADIATION, 1, {source: 'opponents', mandatory: false}))
        .andThen((response) => {
          if (response.proceed && response.card !== undefined) {
            player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count: 1, log: true}));
          }
        });
    }
    return undefined;
  }

  public override getCardDiscount() {
    return this.data?.pending ? 6 : 0;
  }

  public getStandardProjectDiscount(_player: IPlayer, _card: IStandardProjectCard): number {
    return this.data?.pending ? 6 : 0;
  }

  public onCardPlayed(_player: IPlayer, card: ICard) {
    if (card.name !== this.name) {
      this.data = {pending: false};
    }
  }

  public onStandardProject() {
    this.data = {pending: false};
  }
}
