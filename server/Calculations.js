function checkWinner(state) {

    //for row
    for (let i = 0; i < 3; i++) {

        if (state[i * 3 + 0] == state[i * 3 + 1] && state[i * 3 + 1] == state[i * 3 + 2]) {
            if (state[i * 3 + 0]) {
                return state[i * 3 + 0]
            }
        }

        if (state[i + 0] == state[i + 3] && state[i + 3] == state[i + 6]) {
            if (state[i + 0]) {
                return state[i + 0]
            }
        }
    }

    if (state[0] == state[4] && state[4] == state[8]) {
        if (state[0]) {
            return state[0]
        }
    }
    if (state[2] == state[4] && state[4] == state[6]) {
        if (state[2]) {
            return state[2]
        }
    }
    if (state.length === 9) {
        const arr = state.filter(el => el !== undefined)
        if (arr.length === 9) {
            return 'Tie'
        }
    }
    //0 when no one is winner
    return 0
}

module.exports = checkWinner