const express = require('express');
const gameManager = require("./game/gameController");
const inputManager = require("./input/inputManager");

const app = express();

/**
 * Manage the API request
 * Get the board, compute the move and send a response
 */
app.get('/move', async (request, response) => {
    // Get the board
    const board = request.query['b'];

    // Verify the board format
    if (!inputManager.isBoardValid(board))
        return response.status(400).send("Invalid board format: it must be not null, contains 42 characters and only contains 'm', 'h', and '0'");

    // Verify the board consistency
    if(!inputManager.isBoardLegal(board))
        return response.status(400).send("Illegal board: token floating in the air");

    // Verify if the given board is not already in a finished configuration
    if(inputManager.isGameFinished(board)) return response.status(422).send({detail:"Game is finished: there is a winner or a draw"});

    // Verify if it is the AI turn to play and if the human played twice
    let moveDifference = inputManager.moveCounter(board);
    if(moveDifference === 0) return response.status(422).json({detail: "Not the AI turn to play"});
    else if(moveDifference !== 1) return response.status(400).send("Illegal board: the player or the AI has played twice");

    try {
        // Get the move: the column
        let column = await gameManager.play(board);
        response.status(200).json({column: column});
    } catch (e) {
        response.status(422).json({detail: e.message});
    }
});

// Starting the server
app.listen(3000, () => {
    console.log('--- Server is listening on port 3000 ---');
});
