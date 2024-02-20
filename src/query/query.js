require('dotenv').config()
const DATABASE = process.env.DATABASE;

const connection = async (mongoose) => {
    await mongoose.connect(DATABASE)
        .then(conn => console.log('Database connected.'))
        .catch(err => console.error("Mongo error: ", err));

}

const closeConnection = async (mongoose) => {
    await mongoose.connection.close()
        .then(result => console.log('Database connection closed.'))
        .catch(err => console.log(err));
}

const getLoginData = async (model, mongoose, req) => {
    // Create a model based on the existing schema
    return await model.find({username: req.body.username}, null, null)
        .then((documents) => documents[0])
        .catch((error) => {
            console.error('Error finding documents:', error);
        });
}

const saveTurns = async (model, turns) => {

    await model.create(turns, null)
        .then(doc => doc)
        .catch((error) => {
            console.error('Error finding documents:', error);
        });

    return true;
}

const getTurns = async (model) => {
    let data = await model.find({}, null, null)
        .sort('-date')
        .limit(1)
        .then(doc => doc)
        .catch((error) => {
            console.error('Error finding documents:', error);
        });
    return data[0];
}


module.exports = {getLoginData, saveTurns, getTurns, connection, closeConnection}