import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICloneTagCard} from '../pathfinders/ICloneTagCard';
import {declareActCloneTags} from '../../mercury/ActCloneTags';

export class InfrastructureAuctions extends ActCard implements ICloneTagCard {
  constructor() {
    super({
      name: CardName.INFRASTRUCTURE_AUCTIONS,
      kind: 'rivalry',
      steps: 4,
      metadata: {
        cardNumber: 'ACT43',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).text('2 planet tags of your choice', {size: Size.SMALL}).asterix();
        }),
        description: 'Victory: choose a planetary tag. When you play this card you can use each of its tags to trigger your cards. After being played, this card counts as having 2 tags of the planet you have chosen.',
      },
    });
  }

  public cloneTag: Tag = Tag.CLONE;

  public override get tags(): Array<Tag> {
    return [this.cloneTag, this.cloneTag];
  }

  public override victory(victor: IPlayer) {
    declareActCloneTags(victor, this, () => {});
  }
}
