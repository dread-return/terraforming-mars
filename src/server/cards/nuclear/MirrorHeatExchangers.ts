import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {IActionCard, ICard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {SelectCard} from '../../inputs/SelectCard';
import {all} from '../Options';

export class MirrorHeatExchangers extends Card implements IProjectCard, IActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.MIRROR_HEAT_EXCHANGERS,
      tags: [Tag.RADIOACTIVE],
      cost: 12,
      requirements: {temperature: -20},
      behavior: {stock: {plants: 1, heat: 1}},

      metadata: {
        cardNumber: 'N70',
        renderData: CardRenderer.builder((b) => {
          b.action('Remove a radiation from ANY card to gain 1 M€ for every radioactive tag you own.', (eb) => {
            eb.resource(CardResource.RADIATION, {all}).startAction.megacredits(1).slash().tag(Tag.RADIOACTIVE);
          }).br;
          b.plants(1).heat(1);
        }),
        description: 'Requires -20 °C or warmer. Gain 1 plant and 1 heat.',
      },
    });
  }

  private targets(player: IPlayer): Array<{card: ICard, owner: IPlayer}> {
    return player.game.players.flatMap((owner) =>
      owner.getCardsWithResources(CardResource.RADIATION).map((card) => ({card, owner})));
  }

  public canAct(player: IPlayer): boolean {
    return this.targets(player).length > 0;
  }

  public action(player: IPlayer) {
    const targets = this.targets(player);
    const pay = (owner: IPlayer, card: ICard) => {
      owner.removeResourceFrom(card, 1, {removingPlayer: player, log: true});
      player.stock.add(Resource.MEGACREDITS, player.tags.count(Tag.RADIOACTIVE), {log: true});
    };
    if (targets.length === 1) {
      pay(targets[0].owner, targets[0].card);
      return undefined;
    }
    return new SelectCard('Select a card to remove a radiation from', 'Remove', targets.map((t) => t.card))
      .andThen(([card]) => {
        const target = targets.find((t) => t.card.name === card.name);
        if (target !== undefined) {
          pay(target.owner, target.card);
        }
        return undefined;
      });
  }
}
