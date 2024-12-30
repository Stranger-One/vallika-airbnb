const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js")
const listingController = require("../controllers/listing.js")
const multer  = require('multer');
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })


router.route("/")
.get(wrapAsync(listingController.index)) //index
.post(
 isLoggedIn, 
  upload.single('listing[image]'),
  validateListing,
  wrapAsync(listingController.createListing)
);//create route


  
  //New GET -->/listings/new  --> form --->submit
  //CREATE ---> /listings
  
  router.get("/new",isLoggedIn,listingController.renderNewForm);
  
  //show route ---> /listing/:id
  router.get("/:id",wrapAsync( listingController.showListing));
  
 
  //edit GET --> /listings/:id/edit -->edit form -->submit
  //update  PUT --> /listings/:id
  router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync( listingController.renderEditForm));
  //update route
  router.put("/:id",isLoggedIn,isOwner,upload.single('listing[image]'),validateListing, wrapAsync(listingController.updateListing));
  
  //delete route --> /listings/:id
  router.delete("/:id",isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));
  

  module.exports = router;
  