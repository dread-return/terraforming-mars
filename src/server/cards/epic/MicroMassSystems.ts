import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';

export class MicroMassSystems extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MICROMASS_SYSTEMS,
      tags: [Tag.POWER, Tag.SPACE],
      startingMegaCredits: 30,
      victoryPoints: {tag: Tag.POWER, per: 2},
      behavior: {
        production: {megacredits: 1, steel: 1},
      },
      action: {},

      metadata: {
        cardNumber: 'EP-MMS',
        description: 'You start with 1 M€ and 1 steel production, and 30 M€. 1 VP per 2 power tags you have.',
        renderData: CardRenderer.builder((b) => {
          b.br.br;
          b.production((pb) => pb.megacredits(1).steel(1)).nbsp.megacredits(30);
          b.corpBox('action', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.action('Gain 1 titanium, or add 1 radiation to another card.', (eb) => {
              eb.empty().startAction.titanium(1).or().resource(CardResource.RADIATION).asterix();
            });
          });
        }),
      },
    });
  }

  public override bespokeAction(player: IPlayer) {
    const titanium = new SelectOption('Gain 1 titanium').andThen(() => {
      player.stock.add(Resource.TITANIUM, 1, {log: true});
      return undefined;
    });
    const radiationCards = player.getResourceCards(CardResource.RADIATION).filter((c) => c !== this);
    if (radiationCards.length === 0) {
      return titanium;
    }
    const radiation = new SelectOption('Add 1 radiation to another card').andThen(() => {
      player.game.defer(new AddResourcesToCard(player, CardResource.RADIATION, {count: 1, filter: (c) => c !== this}));
      return undefined;
    });
    return new OrOptions(titanium, radiation);
  }
}
