import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {keep, LogType} from '../../deferredActions/ChooseCards';
import {ALL_TAGS} from '../../../common/cards/Tag';

const NAMEABLE = ALL_TAGS.filter((t) => t !== Tag.WILD && t !== Tag.EVENT && t !== Tag.CLONE);

export class ACE extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ACE,
      tags: [Tag.WILD],
      startingMegaCredits: 30,
      initialActionText: 'Name a tag; reveal cards until 2 have it, and take them',
      action: {},

      metadata: {
        cardNumber: 'EP-ACE',
        description: 'You start with 30 M€. First action: name a tag, reveal cards until 2 have it, take those.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.megacredits(30).cards(2, {secondaryTag: Tag.WILD}).asterix();
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Name a tag. Gain 1 M€ per tag of that type you have (the wild tag counts).', (eb) => {
              eb.empty().startAction.megacredits(1).slash().emptyTag().asterix();
            });
          });
        }),
      },
    });
  }

  public override initialAction(player: IPlayer) {
    const game = player.game;
    return new OrOptions(...NAMEABLE.map((tag) => new SelectOption(`Name the ${tag} tag`).andThen(() => {
      const cards = game.projectDeck.drawByConditionOrThrow(game, 2, (c) => c.tags.includes(tag));
      keep(player, cards, [], LogType.DREW);
      return undefined;
    }))).setTitle('ACE: name a tag');
  }

  public override bespokeAction(player: IPlayer) {
    const counts = NAMEABLE.map((tag) => ({tag, count: player.tags.count(tag)}))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);
    if (counts.length === 0) {
      return undefined;
    }
    return new OrOptions(...counts.map(({tag, count}) => new SelectOption(`${tag}: gain ${count} M€`).andThen(() => {
      player.stock.add(Resource.MEGACREDITS, count, {log: true});
      return undefined;
    }))).setTitle('ACE: name a tag');
  }
}
