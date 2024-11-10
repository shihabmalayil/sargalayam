// db.js
const mongoose = require('mongoose');

async function connectToDatabase() {
    try {
        await mongoose.connect('mongodb+srv://malayilshihab:unr6K9KAtNnoptKW@sargalyam.mkwwy.mongodb.net/', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
}

module.exports = connectToDatabase;