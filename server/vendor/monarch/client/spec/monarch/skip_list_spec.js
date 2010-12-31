//= require "../monarch_spec_helper"

Screw.Unit(function(c) { with(c) {
  describe("Monarch.SkipList", function() {
    
    
    describe("insertion, removal, and search", function() {
      it("correctly handles operations for a randomized dataset", function() {
        var unusedLetters = [];
        var insertedLetters = [];
        var removedLetters = [];

        for (var i = 97; i <= 122; i++) { unusedLetters.push(String.fromCharCode(i)) }


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
          console.debug("inserting", letter);
          skipList.insert(letter, letter);
          insertedLetters.push(letter);
          console.debug("insertedLetters", _.clone(insertedLetters));

          expect(skipList.values()).to(equal, insertedLetters.sort());
        }

        function find() {
          if (insertedLetters.length > 0) {
            var letter = randomElement(insertedLetters);
            expect(skipList.find(letter)).to(eq, letter);
          }
          if (removedLetters.length > 0) {
            var letter = randomElement(removedLetters);
            expect(skipList.find(letter)).to(beUndefined);
          }
        }

        function remove() {
          if (insertedLetters.length === 0) return;
          var letter = randomElement(insertedLetters, 'remove');
          console.debug("removing", letter);
          skipList.remove(letter);
          console.debug("insertedLetters:", _.clone(insertedLetters));

          removedLetters.push(letter);
          console.debug("removedLetters:", _.clone(removedLetters));

          expect(skipList.values()).to(equal, insertedLetters.sort());
        }

        function randomAction() {
          switch (randomNumber(3)) {
            case 0: insert(); break;
            case 1: remove(); break;
            case 2: find(); break;
          }
        }

        var skipList = new Monarch.SkipList();
        _(100).times(randomAction);
      });
    });
  });
}});