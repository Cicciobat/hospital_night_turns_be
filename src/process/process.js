const jwt = require("jose");
const secretKey = new TextEncoder().encode(process.env.SECRET_KEY);
require('dotenv').config()


const fisherYatesShuffle = (array) => {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

const generateTurns = (people) => {
    const hours = 7;
    let message = fisherYatesShuffle(JSON.parse(people));
    let numberOfPeople = message.length;
    let turnation = []
    let counter = 0;
    let currentDate = new Date('1970-01-01T00:00:00');
    let turn = hours / numberOfPeople;

    for (const person of message) {
        let newDate = new Date(currentDate.getTime() + (counter.toFixed(2) * 60 * 60 * 1000));
        const hour = `${"0" + newDate.getHours()}:${newDate.getMinutes() < 10 ? "0" + newDate.getMinutes() : newDate.getMinutes()}`

        turnation = [...turnation,
            {
                turn: hour,
                name: person
            }
        ]

        counter += turn;
    }

    return {turns: turnation, date: new Date(Date.now()).toLocaleString()}
}

const verifyToken = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({message: 'Unauthorized - No token provided'});
    }
    try {
        req.user = await jwt.jwtVerify(token, secretKey);
        next();
    } catch (error) {
        return res.status(401).json({message: 'Unauthorized - Invalid token'});
    }

}

module.exports = {generateTurns, verifyToken}