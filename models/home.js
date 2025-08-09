const mongoose = require('mongoose');


const homeSchema = mongoose.Schema({
  houseName: {type: String, required: true},
  price: {type: String, required: true},
  location: {type: String, required: true},
  rating: {type: String, required: true},
  houseName: String,
  photo: String,
  description: String
});

// homeSchema.pre('findOneAndDelete',async function(next) {
//   const homeId = this.getQuery()["_id"];
//   await favourite.deleteMany({houseId: homeId});
//   next();
// })

module.exports = mongoose.model('Home', homeSchema);
//ek model bana do with name Home, homeSchema ko use karke ek model bana hai