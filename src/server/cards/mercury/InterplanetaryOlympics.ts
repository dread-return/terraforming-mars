import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICloneTagCard} from '../pathfinders/ICloneTagCard';
import {declareActCloneTags} from '../../mercury/ActCloneTags';

export class InterplanetaryOlympics extends ActCard implements ICloneTagCard {
  constructor() {
    super({
      name: CardName.INTERPLANETARY_OLYMPICS,
      kind: 'treaty',
      steps: 7,
      metadata: {
        cardNumber: 'ACT53',
        renderData: CardRenderer.builder((b) => {
          b.tr(1).slash().text('set', {size: Size.SMALL}).asterix().br;
          b.tag(Tag.MERCURY).tag(Tag.VENUS).tag(Tag.EARTH).tag(Tag.MARS).tag(Tag.JOVIAN);
        }),
        description: 'Resolve (both): raise your TR 1 step for every set of a Mercury, Venus, Earth, Mars and Jovian tag. The planet tag of choice is chosen by the player who takes this card.',
      },
    });
  }

  public cloneTag: Tag = Tag.CLONE;

  public override get tags(): Array<Tag> {
    return [this.cloneTag];
  }

  public override resolveTreaty(owner: IPlayer, other: IPlayer | undefined) {
    declareActCloneTags(owner, this, () => {
      for (const p of [owner, ...(other === undefined ? [] : [other])]) {
        const sets = Math.min(...[Tag.MERCURY, Tag.VENUS, Tag.EARTH, Tag.MARS, Tag.JOVIAN].map((t) => p.tags.count(t, 'raw')));
        if (sets > 0) {
          p.increaseTerraformRating(sets, {log: true});
        }
      }
    });
  }
}
