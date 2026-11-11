import {ActionCard} from '../ActionCard';
import {AltSecondaryTag} from '../../../common/cards/render/AltSecondaryTag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardRequirements} from '../requirements/CardRequirements';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {EternityUtils} from './EternityUtils';
import {GlobalParameterRequirement} from '../requirements/GlobalParameterRequirement';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {Resource} from '../../../common/Resource';
import {TagCardRequirement} from '../requirements/TagCardRequirement';
import {Tag} from '../../../common/cards/Tag';

export class BigCheats extends ActionCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.BIG_CHEATS,
      tags: [Tag.WILD],
      cost: 16,
      resourceType: CardResource.CHEAT,
      victoryPoints: {resourcesHere: {}, per: 2, each: -1},
      action: {
        spend: {megacredits: 5},
        removeResourcesFromAnyCard: {type: CardResource.CHEAT, count: 1, source: 'all'},
      },
      metadata: {
        cardNumber: 'E48',
        renderData: CardRenderer.builder((b) => {
          b.action('Pay 5 M€: remove a cheat counter anywhere.', (eb) => {
            eb.megacredits(5).startAction.minus().resource(CardResource.CHEAT).asterix();
          }).br;
          b.cards(1, {secondaryTag: AltSecondaryTag.BLUE}).asterix().megacredits(0, {text: 'x/2'});
        }),
        description: 'Reveal cards until a blue card; take it and gain half its cost (round up). It may ignore tag and global requirements this generation: add a cheat counter here per tag and step ignored.',
      },
    });
  }

  public data: {card?: string, gen?: number} = {};
  public override bespokePlay(player: IPlayer) {
    EternityUtils.drawThen(player, 1, {cardType: CardType.ACTIVE}, (cards) => {
      const card = cards[0];
      if (card === undefined) {
        return;
      }
      player.stock.add(Resource.MEGACREDITS, Math.ceil(card.cost / 2), {log: true});
      this.data = {card: card.name, gen: player.game.generation};
    });
    return undefined;
  }
  private active(player: IPlayer, card: ICard): boolean {
    return card.name === this.data.card && player.game.generation === this.data.gen;
  }
  public ignoresGlobalRequirementsFor(player: IPlayer, card: ICard): boolean {
    return this.active(player, card);
  }
  public ignoresTagRequirementsFor(player: IPlayer, card: ICard): boolean {
    return this.active(player, card);
  }
  /** Counts the missing tags and global steps of the revealed card as it is played. */
  public beforeCardPlayedFor(player: IPlayer, card: ICard): void {
    if (!this.active(player, card)) {
      return;
    }
    let cheats = 0;
    for (const req of CardRequirements.compile([...card.requirements]).requirements) {
      if (req instanceof TagCardRequirement && req.max !== true) {
        cheats += Math.max(0, req.count - req.getScore(player));
      } else if (req instanceof GlobalParameterRequirement) {
        const score = req.getScore(player);
        const met = req.max ? score <= req.count : score >= req.count;
        if (!met) {
          cheats += req.distance(player);
        }
      }
    }
    this.data = {};
    if (cheats > 0) {
      player.addResourceTo(this, {qty: cheats, log: true});
    }
  }
}
