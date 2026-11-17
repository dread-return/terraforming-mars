import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActCard} from '../../mercury/ActCard';
import {Tag} from '../../../common/cards/Tag';
import {Size} from '../../../common/cards/render/Size';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {IPlayer} from '../../IPlayer';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {ActHelpers} from '../../mercury/ActHelpers';

export class AsteroidRightsMvM extends ActCard {
  constructor() {
    super({
      name: CardName.ASTEROID_RIGHTS_MVM,
      kind: 'rivalry',
      steps: 4,
      tags: [Tag.SPACE],
      metadata: {
        cardNumber: 'ACT32',
        renderData: CardRenderer.builder((b) => {
          b.text('victory:', {size: Size.SMALL}).minus().resource(CardResource.ASTEROID).asterix().slash().minus().production((pb) => pb.titanium(1)).asterix();
        }),
        description: 'Victory: steal 1 asteroid or 1 titanium production from the defeated player.',
      },
    });
  }

  public override victory(victor: IPlayer, defeated: IPlayer | undefined) {
    if (defeated === undefined) {
      return;
    }
    victor.defer(() => {
      const options = new OrOptions().setTitle('Asteroid Rights');
      if (defeated.getResourceCount(CardResource.ASTEROID) > 0) {
        options.options.push(new SelectOption('Steal 1 asteroid').andThen(() => {
          ActHelpers.stealCardResources(victor, defeated, CardResource.ASTEROID, 1);
          return undefined;
        }));
      }
      if (defeated.production.titanium > 0) {
        options.options.push(new SelectOption('Steal 1 titanium production').andThen(() => {
          defeated.production.add(Resource.TITANIUM, -1, {log: true, from: {player: victor}});
          victor.production.add(Resource.TITANIUM, 1, {log: true});
          return undefined;
        }));
      }
      return options.options.length > 0 ? options : undefined;
    });
  }
}
