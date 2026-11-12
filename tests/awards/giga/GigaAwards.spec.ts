import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {fakeCard} from '../../TestingUtils';
import {Tag} from '../../../src/common/cards/Tag';
import {IAward} from '../../../src/server/awards/IAward';
import {Forerunner} from '../../../src/server/awards/giga/Forerunner';
import {GMartian} from '../../../src/server/awards/giga/GMartian';
import {Ionizer} from '../../../src/server/awards/giga/Ionizer';
import {Microbiologist} from '../../../src/server/awards/giga/Microbiologist';

describe('GIGA fan awards', () => {
  let player: TestPlayer;

  beforeEach(() => {
    [/* game */, player] = testGame(2);
  });

  const cases: Array<[string, new () => IAward, Tag, Tag]> = [
    ['Forerunner', Forerunner, Tag.GALACTIC, Tag.SPACE],
    ['G. Martian', GMartian, Tag.MARS, Tag.EARTH],
    ['Ionizer', Ionizer, Tag.RADIOACTIVE, Tag.SCIENCE],
    ['Microbiologist', Microbiologist, Tag.MICROBE, Tag.PLANT],
  ];

  for (const [name, Klass, tag, otherTag] of cases) {
    it(`${name} counts only ${tag} tags`, () => {
      const award = new Klass();
      expect(award.name).eq(name);
      expect(award.getScore(player)).eq(0);

      player.playedCards.push(fakeCard({tags: [tag]}));
      expect(award.getScore(player)).eq(1);

      player.playedCards.push(fakeCard({tags: [tag, tag]}));
      expect(award.getScore(player)).eq(3);

      player.playedCards.push(fakeCard({tags: [otherTag]}));
      expect(award.getScore(player)).eq(3);
    });
  }
});
