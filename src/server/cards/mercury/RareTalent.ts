import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';

export class RareTalent extends ActCard {
  constructor() {
    super({
      name: CardName.RARE_TALENT,
      kind: 'rivalry',
      steps: 3,
      tags: [Tag.WILD],
      metadata: {
        cardNumber: 'ACT54',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).cards(1).asterix();
        }),
        description: 'Victory: draw a card with a tag of your choice. After being played, when you perform an action, the wild tag counts as any tag of your choice.',
      },
    });
  }

  public override victory(victor: IPlayer) {
    const tags = [Tag.BUILDING, Tag.SPACE, Tag.SCIENCE, Tag.POWER, Tag.EARTH, Tag.JOVIAN, Tag.VENUS, Tag.PLANT, Tag.MICROBE, Tag.ANIMAL, Tag.CITY, Tag.MARS, Tag.MERCURY];
    victor.defer(new OrOptions(...tags.map((tag) => new SelectOption(tag).andThen(() => {
      victor.drawCard(1, {tag});
      return undefined;
    }))).setTitle('Rare Talent: draw a card with this tag'));
  }
}
