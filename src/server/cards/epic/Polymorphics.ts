import {ICloneTagCard} from '../pathfinders/ICloneTagCard';
import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {EpicUtils} from './EpicUtils';

export class Polymorphics extends ActiveCorporationCard implements ICloneTagCard {
  constructor() {
    super({
      name: CardName.POLYMORPHICS,
      startingMegaCredits: 42,

      action: {},

      metadata: {
        cardNumber: 'EP-PLM',
        description: 'You start with 42 M€ and 1 production of your choice. When you reveal this corporation, choose its tag.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(42).production((pb) => pb.wild(1)).tag(Tag.WILD).asterix();
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Change this corporation\'s tag. The new tag counts as played, and as one of your tags.', (eb) => {
              eb.empty().startAction.tag(Tag.WILD).asterix();
            });
          });
        }),
      },
    });
  }

  public cloneTag: Tag = Tag.CLONE;

  public override get tags(): Array<Tag> {
    return [this.cloneTag];
  }

  /** The tags it can take: every tag in this game except wild and clone. */
  private static choices(player: IPlayer, current: Tag): Array<Tag> {
    return player.game.tags.filter((tag) => tag !== Tag.WILD && tag !== Tag.CLONE && tag !== current);
  }

  private chooseTag(player: IPlayer, played: boolean): OrOptions {
    return new OrOptions(...Polymorphics.choices(player, this.cloneTag).map((tag) => new SelectOption(tag, 'Choose').andThen(() => {
      player.playedCards.retagCard(this, () => this.cloneTag = tag);
      player.game.log('${0} turned ${1}\'s tag into a ${2} tag', (b) => b.player(player).card(this).string(tag));
      if (played) {
        // The new tag counts as played.
        player.onCardPlayed(this);
      }
      return undefined;
    }))).setTitle('Polymorphics: choose its tag');
  }

  public override bespokePlay(player: IPlayer) {
    player.defer(EpicUtils.gainAnyProduction(player, this));
    player.defer(this.chooseTag(player, false));
    return undefined;
  }

  public override bespokeCanAct(player: IPlayer) {
    return Polymorphics.choices(player, this.cloneTag).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    return this.chooseTag(player, true);
  }
}
