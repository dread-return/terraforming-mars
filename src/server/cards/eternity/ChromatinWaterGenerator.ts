import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {CardType} from '../../../common/cards/CardType';
import {Card} from '../Card';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {PlaceOceanTile} from '../../deferredActions/PlaceOceanTile';
import {Tag} from '../../../common/cards/Tag';
import {Units} from '../../../common/Units';
import {tagsSum} from '../render/DynamicVictoryPoints';

export class ChromatinWaterGenerator extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.CHROMATIN_WATER_GENERATOR,
      tags: [Tag.MICROBE, Tag.BUILDING],
      cost: 22,
      requirements: [{greeneries: 1}, {tag: Tag.MICROBE}, {tag: Tag.SCIENCE, count: 2}],
      victoryPoints: 'special',
      metadata: {
        cardNumber: 'E53',
        victoryPoints: tagsSum([Tag.SCIENCE, Tag.MICROBE], 1, 3),
        renderData: CardRenderer.builder((b) => {
          b.action('Spend 1 titanium, 1 plant, 1 heat and 1 energy to place an ocean and add 1 microbe to any card.', (eb) => {
            eb.titanium(1).plants(1).heat(1).energy(1).startAction.wrap.oceans(1).resource(CardResource.MICROBE).asterix();
          });
        }),
        description: 'Requires that you have a greenery, a microbe tag and 2 science tags. 1 VP per 3 science and/or microbe tags you have.',
      },
    });
  }

  public override getVictoryPoints(player: IPlayer) {
    return Math.floor((player.tags.count(Tag.SCIENCE, 'raw') + player.tags.count(Tag.MICROBE, 'raw')) / 3);
  }
  public canAct(player: IPlayer) {
    return player.titanium >= 1 && player.plants >= 1 && player.heat >= 1 && player.energy >= 1;
  }
  public action(player: IPlayer) {
    player.stock.deductUnits(Units.of({titanium: 1, plants: 1, heat: 1, energy: 1}));
    player.game.defer(new PlaceOceanTile(player));
    player.game.defer(new AddResourcesToCard(player, CardResource.MICROBE, {count: 1}));
    return undefined;
  }
}
