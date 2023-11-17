'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function(app) {

  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;
      if (!puzzle || !coordinate || !value) {
        return res.json({ error: 'Required field(s) missing' });
      }
      
      if (solver.validate(puzzle) !== "Valid") {
        return res.json({ error: solver.validate(puzzle)});
      }
    
      const row = coordinate.split("")[0];
      const column = coordinate.split("")[1];
      if (
        coordinate.length !== 2 ||
        !/[a-i]/i.test(row) ||
        !/[1-9]/i.test(column)
      ) {
        console.log("invalid coordinate :>>")
        return res.json({ error: 'Invalid coordinate' });
      }
      if (isNaN(+value) || value < 1 || value > 9) {
        return res.json({ error: 'Invalid value' });
      }
      if (puzzle.length !== 81) {
        return res.json({ error: 'Expected puzzle to be 81 characters long' });
      }
      if (/[^0-9.]/g.test(puzzle)) {
        return res.json({ error: "Invalid characters in puzzle" });
      }
      
      let index = (solver.letterToNumber(row) - 1) * 9 + (+column - 1);
      if(puzzle[index] == value) {
        return res.json({valid: true});
      }
      
      let validCol = solver.checkColPlacement(puzzle, row, column, value);
      let validReg = solver.checkRegionPlacement(puzzle, row, column, value);
      let validRow = solver.checkRowPlacement(puzzle, row, column, value);

      let conflicts = [];
      if (validCol && validReg && validRow) {
        res.json({ valid: true });
      } else {
        if (!validRow) {
          conflicts.push('row')
        }
        if (!validCol) {
          conflicts.push('column');
        }
        if (!validReg) {
          conflicts.push('region');
        }
        res.json({ valid: false, conflict: conflicts });
      }
    });


  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;
      if (solver.validate(puzzle) !== "Valid") {
        return res.json({ error: solver.validate(puzzle)});
      }

      if (!puzzle) {
        return res.json({ error: 'Required field missing' });
      }
      if (puzzle.length != 81) {
        return res.json({ error: "Expected puzzle to be 81 characters long" });
      }
      if (/[^0-9.]/g.test(puzzle)) {
        return res.json({ error: "Invalid characters in puzzle" });
      }
      let solvedString = solver.solve(puzzle);
      if (!solvedString) {
        res.json({ error: "Puzzle cannot be solved" });
      } else {
        res.json({ solution: solvedString });
      }

    });
};
