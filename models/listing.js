const mongoose = require("mongoose");
const { schema } = require("./review");
const Schema = mongoose.Schema;
const Review = require("./review");
const { string } = require("joi");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url:String,
    filename:String
  },
  
  price: {
    type: Number,
    min: [0, "Price must be a positive number"], // Validation for positive numbers
  },
  location: String,
  country: String,
  category: {
    type:String,
    enum:["Trending","Rooms","Iconic Cities","Mountains","Amazing Pools","Camping","Farms"],
  },
  coordinates: {
    lat: Number,
    lon: Number,
  },
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
  }
});

listingSchema.post("findOneAndDelete",async(listing) => {
  if(listing){
  await Review.deleteMany({_id: {$in: listing.reviews}})
  }

})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;