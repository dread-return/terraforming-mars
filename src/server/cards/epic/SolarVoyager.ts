import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {SelectProjectCardToPlay} from '../../inputs/SelectProjectCardToPlay';

/** Its action plays a Venus, Mercury or Jovian card ignoring requirements (EpicHooks.ignoresAllRequirements). */
export class SolarVoyager extends ActiveCorporationCard implements ICorporationCard {
  public static readonly TAGS: ReadonlyArray<Tag> = [Tag.VENUS, Tag.MERCURY, Tag.JOVIAN];

  constructor() {
    super({
      name: CardName.SOLAR_VOYAGER,
      tags: [Tag.VENUS, Tag.MERCURY, Tag.JOVIAN],
      startingMegaCredits: 43,
      behavior: {
        production: {megacredits: 2},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-SOV',
        description: 'You start with 43 M€ and 2 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.br;
          b.megacredits(43).production((pb) => pb.megacredits(2));
          b.br;
          b.action('Play a card with a Venus, Mercury or Jovian tag, ignoring its requirements.', (eb) => {
            eb.empty().startAction.tag(Tag.VENUS).slash().tag(Tag.MERCURY).slash().tag(Tag.JOVIAN).asterix();
          }).br;
        }),
      },
    });
  }

  /** Set while its action plays a card, so the card's requirements are ignored. */
  public data: {pending?: boolean} = {};

  public static fits(card: {tags: ReadonlyArray<Tag>}): boolean {
    return SolarVoyager.TAGS.some((tag) => card.tags.includes(tag));
  }

  private playable(player: IPlayer): Array<IProjectCard> {
    const previous = this.data.pending;
    this.data.pending = true;
    try {
      return player.getPlayableCards().filter((c) => SolarVoyager.fits(c));
    } finally {
      this.data.pending = previous;
    }
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.playable(player).length > 0;
  }

  public override bespokeAction(player: IPlayer) {
    const cards = this.playable(player);
    this.data.pending = true;
    return new SelectProjectCardToPlay(player, cards).andThen(() => {
      this.data.pending = false;
      return undefined;
    });
  }
}
