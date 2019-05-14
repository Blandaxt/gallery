// // config/database.js
// module.exports = {
//
//     'url' : 'mongodb://derp:derp1@ds215019.mlab.com:15019/auth' // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot
//
// };

// config/database.js
module.exports = {

    'url' : process.env.MONGO_BUBBLES_URL,
    // 'mongodb+srv://parayra:parayra@sav-auth-picture-testing-6rdwf.mongodb.net/test?retryWrites=true',
    'dbName': process.env.MONGO_BUBBLES_DATABASENAME,
    // 'sav-auth-picture-testing'
    auth: {
     user: process.env.MONGO_BUBBLES_USER,
     password: process.env.MONGO_BUBBLES_PASSWORD
   }
};
