const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist !");
    return res.redirect("/listings"); // Add return here to stop further execution
  }
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newlisting = new Listing(req.body.listing);
  // to add username in new listing
  newlisting.owner = req.user._id;
  //save image url and filename to listing models
  newlisting.image = { url, filename };
  await newlisting.save();
  req.flash("success", "New Listing Created !"); //key,message
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist !");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  //if not any image are send in url
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    //save image url and filename to listing models
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Edit Successfully !"); //key,message
  res.redirect(`/listings/${id}`);
};

module.exports.distroyLinsting = async (req, res) => {
  const { id } = req.params;
  let deletedlisting = await Listing.findByIdAndDelete(id);
  console.log(deletedlisting);
  req.flash("success", "Listing Deleted Successfully !"); //key,message
  res.redirect("/listings");
};
