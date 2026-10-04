import { Game } from "../domain/Game.js";
import { GAME_STATUS } from "../domain/constants.js";


const game = new Game();

const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#status");
const cells = boardElement.querySelectorAll("[data-index]");


function render()
{
    for (const cell of cells)
    {
        const index = Number(cell.dataset.index);
        const mark = game.board.getCell(index);

        cell.textContent = mark ?? "";
    }

    if (game.status === GAME_STATUS.WON)
    {
        statusElement.textContent =
            `${game.winner.mark} wins!`;

        return;
    }

    if (game.status === GAME_STATUS.DRAW)
    {
        statusElement.textContent = "Draw!";

        return;
    }

    statusElement.textContent =
        `${game.currentPlayer.mark}'s turn`;
}


function handleCellClick(event)
{
    const index = Number(event.currentTarget.dataset.index);

    game.move(index);

    render();
}


for (const cell of cells)
{
    cell.addEventListener("click", handleCellClick);
}


render();