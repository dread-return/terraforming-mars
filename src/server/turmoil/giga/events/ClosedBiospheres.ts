import {IGlobalEvent} from '../../globalEvents/IGlobalEvent';
import {GlobalEvent} from '../../globalEvents/GlobalEvent';
import {GlobalEventName} from '../../../../common/turmoil/globalEvents/GlobalEventName';
import {PartyName} from '../../../../common/turmoil/PartyName';
import {CardRenderer} from '../../../cards/render/CardRenderer';
import {Resource} from '../../../../common/Resource';
import {CardResource} from '../../../../common/CardResource';
import {IPlayer} from '../../../IPlayer';
import {Size} from '../../../../common/cards/render/Size';
import {AddResourcesToCard} from '../../../deferredActions/AddResourcesToCard';
import {influenceOf, gain, chooseOne, Choice} from './GigaEventHelpers';

export class ClosedBiospheres extends GlobalEvent implements IGlobalEvent {
  constructor() {
    super({
      name: GlobalEventName.CLOSED_BIOSPHERES,
      description: 'You may lower your plant production 1 step to gain 2 floaters, 3 titanium or 5 steel. Each influence adds 1 to the amount gained.',
      revealedDelegate: PartyName.SPOME,
      currentDelegate: PartyName.POPULISTS,
      renderData: CardRenderer.builder((b) => {
        b.production((pb) => pb.minus().plants(1)).colon().resource(CardResource.FLOATER, 2).slash().titanium(3).slash().steel(5).influence({size: Size.SMALL});
      }),
    });
  }

  public override bespokeResolvePlayer(player: IPlayer) {
    if (player.production.plants < 1) {
      return;
    }
    const bonus = influenceOf(player);
    const lowerPlants = () => player.production.add(Resource.PLANTS, -1, {log: true, from: {globalEvent: this}});
    const choices: Array<Choice> = [];
    if (player.getResourceCards(CardResource.FLOATER).length > 0) {
      choices.push({
        title: `Lower plant production 1 step to add ${2 + bonus} floater(s) to a card`,
        apply: () => {
          lowerPlants();
          player.game.defer(new AddResourcesToCard(player, CardResource.FLOATER, {count: 2 + bonus}));
        },
      });
    }
    choices.push({
      title: `Lower plant production 1 step to gain ${3 + bonus} titanium`,
      apply: () => {
        lowerPlants();
        gain(player, Resource.TITANIUM, 3 + bonus, this);
      },
    });
    choices.push({
      title: `Lower plant production 1 step to gain ${5 + bonus} steel`,
      apply: () => {
        lowerPlants();
        gain(player, Resource.STEEL, 5 + bonus, this);
      },
    });
    choices.push({title: 'Do not lower plant production', apply: () => {}});
    chooseOne(player, 'Closed Biospheres Global Event - select what to do', choices);
  }
}
