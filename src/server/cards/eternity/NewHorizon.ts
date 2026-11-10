import {ALL_TAGS} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {PreludeCard} from '../prelude/PreludeCard';
import {SelectOption} from '../../inputs/SelectOption';
import {Tag} from '../../../common/cards/Tag';

export class NewHorizon extends PreludeCard {
  constructor() {
    super({
      name: CardName.NEW_HORIZON,
      tags: [],
      behavior: {
        tr: 1,
        stock: {megacredits: 12},
      },
      metadata: {
        cardNumber: 'EP42',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).megacredits(12).cards(1).asterix();
        }),
        description: 'Raise your TR 1 step. Gain 12 M\u20ac. Name a tag; reveal cards until you reveal that tag. Take that card and discard the rest.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.defer(new OrOptions(...ALL_TAGS.filter((t) => t !== Tag.CLONE && t !== Tag.WILD).map((tag) => new SelectOption(tag).andThen(() => {
      player.drawCard(1, {tag});
      return undefined;
    }))).setTitle('Name a tag'));
    return undefined;
  }
}
