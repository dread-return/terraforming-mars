import {expect} from 'chai';
import {ArchitecturalContracts} from '../../../src/server/cards/betterments/ArchitecturalContracts';
import {testGame} from '../../TestGame';
import {addCity} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {CardName} from '../../../src/common/cards/CardName';
import {fakeCard} from '../../TestingUtils';
import {IStandardProjectCard} from '../../../src/server/cards/IStandardProjectCard';

describe('ArchitecturalContracts', () => {
  it('requires a city on Mars', () => {
    const card = new ArchitecturalContracts();
    const [/* game */, player] = testGame(2);
    expect(card.canPlay(player)).is.false;
    addCity(player);
    expect(card.canPlay(player)).is.true;
  });

  it('discounts city cards and the City standard project', () => {
    const card = new ArchitecturalContracts();
    const [/* game */, player] = testGame(2);
    expect(card.getCardDiscount(player, fakeCard({tags: [Tag.CITY, Tag.BUILDING]}))).eq(3);
    expect(card.getCardDiscount(player, fakeCard({tags: [Tag.BUILDING]}))).eq(0);
    const citySP = {name: CardName.CITY_STANDARD_PROJECT} as IStandardProjectCard;
    const powerSP = {name: CardName.POWER_PLANT_STANDARD_PROJECT} as IStandardProjectCard;
    expect(card.getStandardProjectDiscount(player, citySP)).eq(3);
    expect(card.getStandardProjectDiscount(player, powerSP)).eq(0);
  });
});
