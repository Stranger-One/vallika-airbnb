const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  // console.log(req.query.search);
  const filter = req.query.category ? req.query : req.query.search ? { $or: [
    { title: { $regex: req.query.search, $options: 'i' } }, // Case-insensitive regex for title
    { location: { $regex: req.query.search, $options: 'i' } }, // Case-insensitive regex for place
  ]  } : {};
  
  
  
  const allListings = await Listing.find(filter);
  
  
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  // console.log("this is my req body", req.body);

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;

  newListing.image = { url, filename };

  // Geocode user-provided location
  const location = req.body.listing.location;

  // Assuming user provides location in the form
  const geocodingURL = `https://us1.locationiq.com/v1/autocomplete.php?key=pk.4030f71cf955428548a422d4845c838e&q=${location}&limit=1&format=json`;

  try {
    const response = await fetch(geocodingURL);
    const data = await response.json();

    if (data && data.length > 0) {
      // Save coordinates to the listing
      const { lat, lon } = data[0];
      newListing.coordinates = { lat, lon };
    } else {
      req.flash("error", "Invalid location. Could not geocode.");
      return res.redirect("/listings/new");
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");

    res.redirect("/listings");
  } catch (error) {
    console.error("Geocoding error:", error);
    req.flash("error", "Something went wrong while geocoding.");
    res.redirect("/listings/new");
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  let originalImage = listing.image.url;
  originalImageUrl = originalImage.replace("/upload", "/upload/h_250,w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  // console.log(deletedListing);
  req.flash("success", " Listing Deleted!");
  res.redirect("/listings");
};
