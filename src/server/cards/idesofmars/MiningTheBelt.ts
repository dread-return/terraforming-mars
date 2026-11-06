import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {Resource} from '../../../common/Resource';

export class MiningTheBelt extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.MINING_THE_BELT,
      tags: [Tag.SPACE, Tag.BUILDING],
      cost: 3,

      metadata: {
        cardNumber: 'I59',
        renderData: CardRenderer.builder((b) => {
          b.minus().cards(1, {secondaryTag: Tag.BUILDING}).colon().production((pb) => pb.steel(1)).br;
          b.minus().cards(1, {secondaryTag: Tag.SPACE}).colon().production((pb) => pb.titanium(1));
        }),
        description: 'Discard a card. If it has a building tag, increase your steel production 1 step. ' +
          'If it has a space tag, increase your titanium production 1 step.',
      },
    });
  }

  private discardable(player: IPlayer) {
    return player.cardsInHand.filter((card) => card.name !== this.name);
  }

  public override bespokeCanPlay(player: IPlayer) {
    return this.discardable(player).length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    return new SelectCard('Select a card to discard', 'Discard', this.discardable(player))
      .andThen(([card]) => {
        player.discardCardFromHand(card, {log: true});
        if (card.tags.includes(Tag.BUILDING)) {
          player.production.add(Resource.STEEL, 1, {log: true});
        }
        if (card.tags.includes(Tag.SPACE)) {
          player.production.add(Resource.TITANIUM, 1, {log: true});
        }
        return undefined;
      });
  }
}
