import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {ICard} from '../ICard';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {all} from '../Options';

export class Retrovirus extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.RETROVIRUS,
      tags: [Tag.RADIOACTIVE, Tag.ANIMAL, Tag.MICROBE],
      cost: 7,
      requirements: [{tag: Tag.SCIENCE}, {tag: Tag.MICROBE}],
      behavior: {addResourcesToAnyCard: {type: CardResource.ANIMAL, count: 1}},

      metadata: {
        cardNumber: 'N57',
        renderData: CardRenderer.builder((b) => {
          b.effect('When any microbe tag is played, including this, add a microbe or a radiation to ANY card.', (eb) => {
            eb.tag(Tag.MICROBE, {all}).startEffect.resource(CardResource.MICROBE).asterix().slash().resource(CardResource.RADIATION).asterix();
          }).br;
          b.resource(CardResource.ANIMAL).asterix();
        }),
        description: 'Requires a science tag and a microbe tag. Add an animal to ANY card.',
      },
    });
  }

  public onCardPlayedByAnyPlayer(thisCardOwner: IPlayer, card: ICard) {
    const count = card.tags.filter((tag) => tag === Tag.MICROBE).length;
    for (let i = 0; i < count; i++) {
      this.addMicrobeOrRadiation(thisCardOwner);
    }
    return undefined;
  }

  private addMicrobeOrRadiation(player: IPlayer) {
    const microbe = player.getResourceCards(CardResource.MICROBE).length > 0;
    const radiation = player.getResourceCards(CardResource.RADIATION).length > 0;
    if (microbe && radiation) {
      player.defer(new OrOptions(
        new SelectOption('Add a microbe to a card').andThen(() => {
          player.game.defer(new AddResourcesToCard(player, CardResource.MICROBE, {count: 1, log: true}));
          return undefined;
        }),
        new SelectOption('Add a radiation to a card').andThen(() => {
          player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count: 1, log: true}));
          return undefined;
        }),
      ).setTitle('Retrovirus: add a microbe or a radiation'));
    } else if (microbe || radiation) {
      player.game.defer(new AddResourcesToCard(player, microbe ? CardResource.MICROBE : CardResource.RADIATION, {count: 1, log: true}));
    }
  }
}
