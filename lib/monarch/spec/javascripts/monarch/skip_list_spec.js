//= require monarch_spec_helper

Screw.Unit(function(c) { with(c) {
  describe("Monarch.SkipList", function() {
    describe("insertion, removal, and search", function() {
      it("correctly handles operations for a randomized dataset", function() {
        var skipList, unusedLetters, insertedLetters, removedLetters;

        function randomNumber(upTo) {
          return Math.floor(Math.random() * upTo);
        }

        function randomElement(array, remove) {
          var i = randomNumber(array.length);
          var elt = array[i];
          if (remove) array.splice(i, 1);
          return elt;
        }

        function insert() {
          if (unusedLetters.length === 0) return;
          var letter = randomElement(unusedLetters, 'remove');
          var index = skipList.insert(letter, letter);
          insertedLetters.push(letter);
          insertedLetters = insertedLetters.sort();
          expect(index).to(eq, _.sortedIndex(insertedLetters, letter));
          expect(skipList.values()).to(equal, insertedLetters);
        }

        function find() {
          if (insertedLetters.length > 0) {
            var letter = randomElement(insertedLetters);
            var expectedIndex =  _.sortedIndex(insertedLetters, letter);
            expect(skipList.find(letter)).to(eq, letter); // key -> value (key and value are both the letter in this case)
            expect(skipList.indexOf(letter)).to(eq, expectedIndex);
            expect(skipList.at(expectedIndex)).to(eq, letter);
            expect(skipList.at(insertedLetters.length)).to(beUndefined);
          }
          if (removedLetters.length > 0) {
            var letter = randomElement(removedLetters);
            expect(skipList.find(letter)).to(beUndefined);
            expect(skipList.remove(letter)).to(eq, -1);
          }
        }

        function remove() {
          if (insertedLetters.length === 0) return;
          var letter = randomElement(insertedLetters, 'remove');
          var index = skipList.remove(letter);
          expect(index).to(eq, _.sortedIndex(insertedLetters, letter));
          removedLetters.push(letter);

          expect(skipList.values()).to(equal, insertedLetters.sort());
        }

        function randomAction() {
          switch (randomNumber(3)) {
            case 0: insert(); break;
            case 1: remove(); break;
            case 2: find(); break;
          }
        }

        function runTrial() {
          unusedLetters = [];
          insertedLetters = [];
          removedLetters = [];
          for (var i = 97; i <= 122; i++) { unusedLetters.push(String.fromCharCode(i)) }
          skipList = new Monarch.SkipList();
          _(100).times(randomAction);
        }

        _(100).times(runTrial);
      });
    });
  });
}});