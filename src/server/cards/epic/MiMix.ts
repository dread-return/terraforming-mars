import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {CardName} from '../../../common/cards/CardName';
import {Tag} from '../../../common/cards/Tag';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {CardResource} from '../../../common/CardResource';
import {Space} from '../../boards/Space';
import {Board} from '../../boards/Board';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectAmount} from '../../inputs/SelectAmount';

export class MiMix extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.MIMIX,
      tags: [Tag.MICROBE],
      startingMegaCredits: 30,
      resourceType: CardResource.MICROBE,
      action: {},

      behavior: {
        production: {plants: 1},
      },

      firstAction: {
        text: 'Reveal cards until you reveal one with a microbe tag, and take it',
        drawCard: {count: 1, tag: Tag.MICROBE},
      },

      metadata: {
        cardNumber: 'EP-MMX',
        description: 'You start with 30 M€ and 1 plant production. First action: draw a microbe card.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(30).production((pb) => pb.plants(1)).cards(1, {secondaryTag: Tag.MICROBE});
          b.corpBox('effect-action', (ce) => {
            ce.effect(undefined, (eb) => {
              eb.greenery({size: Size.SMALL, any: true}).startEffect.production((pb) => pb.resource(CardResource.MICROBE));
            });
            ce.action('Any greenery: +1 microbe prod. here. 6 microbes: +1 plant prod., or move them.', (eb) => {
              eb.text('6').resource(CardResource.MICROBE).startAction.production((pb) => pb.plants(1)).asterix();
            });
          });
        }),
      },
    });
  }

  public data: {production: number} = {production: 0};

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space) {
    if (Board.isGreenerySpace(space)) {
      this.data.production++;
      cardOwner.game.log('${0} microbe production is now ${1}', (b) => b.card(this).number(this.data.production));
    }
  }

  public onProductionPhase(player: IPlayer) {
    if (this.data.production > 0) {
      player.addResourceTo(this, {qty: this.data.production, log: true});
    }
  }

  private others(player: IPlayer): Array<ICard> {
    return player.getResourceCards(CardResource.MICROBE).filter((c) => c !== this);
  }

  public override bespokeCanAct(player: IPlayer) {
    return this.resourceCount >= 6 || (this.resourceCount > 0 && this.others(player).length > 0);
  }

  public override bespokeAction(player: IPlayer) {
    const options: Array<SelectOption> = [];
    if (this.resourceCount >= 6) {
      options.push(new SelectOption('Spend 6 microbes here for +1 plant production').andThen(() => {
        player.removeResourceFrom(this, 6, {log: true});
        player.production.add(Resource.PLANTS, 1, {log: true});
        return undefined;
      }));
    }
    const others = this.others(player);
    if (this.resourceCount > 0 && others.length > 0) {
      options.push(new SelectOption('Move microbes from here to another card').andThen(() =>
        new SelectCard('Move microbes to', 'Select', others).andThen(([card]) =>
          new SelectAmount('How many microbes?', 'Move', 1, this.resourceCount, true).andThen((n) => {
            player.removeResourceFrom(this, n);
            player.addResourceTo(card, {qty: n, log: true});
            return undefined;
          }))));
    }
    return options.length === 1 ? options[0].cb(undefined) : new OrOptions(...options);
  }
}
