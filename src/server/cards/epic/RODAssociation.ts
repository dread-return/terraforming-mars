import {ActiveCorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {CardResource} from '../../../common/CardResource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IPlayer} from '../../IPlayer';
import {EpicUtils} from './EpicUtils';

export class RODAssociation extends ActiveCorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.ROD_ASSOCIATION,
      startingMegaCredits: 36,
      action: {},

      metadata: {
        cardNumber: 'EP-ROD',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(36);
          const s = {size: Size.SMALL};
          b.br;
          b.tag(Tag.SPACE, s).colon().titanium(1, s).nbsp.tag(Tag.POWER, s).colon().energy(1, s).nbsp.tag(Tag.BUILDING, s).colon().steel(1, s);
          b.br;
          b.tag(Tag.PLANT, s).colon().plants(1, s).nbsp.tag(Tag.CITY, s).colon().heat(1, s).nbsp.tag(Tag.SCIENCE, s).colon().cards(1, s);
          b.br;
          b.tag(Tag.EARTH, s).colon().megacredits(2, s).nbsp.tag(Tag.MOON, s).colon().megacredits(2, s).nbsp.tag(Tag.JOVIAN, s).colon().megacredits(3, s);
          b.br;
          b.tag(Tag.EVENT, s).colon().megacredits(1, s).nbsp.tag(Tag.MARS, s).colon().resource(CardResource.DATA, s).nbsp.tag(Tag.VENUS, s).colon().resource(CardResource.FLOATER, s);
          b.br;
          b.tag(Tag.MICROBE, s).colon().resource(CardResource.MICROBE, s).nbsp.tag(Tag.ANIMAL, s).colon().resource(CardResource.ANIMAL, s).nbsp.tag(Tag.RADIOACTIVE, s).colon().resource(CardResource.RADIATION, s)
            .nbsp.tag(Tag.WILD, s).colon().wild(1, s);
          b.corpBox('action', (ce) => {
            ce.action('Draw 2: gain the above per tag (2 M€ if no card), discard. Same when selling patents.', (eb) => {
              eb.empty().startAction.cards(2).colon().emptyTag().asterix();
            });
          });
        }),
      },
    });
  }

  public override bespokeAction(player: IPlayer) {
    const game = player.game;
    const cards = game.projectDeck.drawN(game, 2);
    game.log('${0} revealed ${1}', (b) => b.player(player).cards(cards));
    EpicUtils.rodGain(player, cards);
    game.projectDeck.discard(...cards);
    return undefined;
  }
}
