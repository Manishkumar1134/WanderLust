const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  //Index Route
  .get(wrapAsync(listingController.index))
  //Create Route
  .post(
    isLoggedIn,
    //multer parse the image and save to Cloudinary
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

//Always write /new route before /:id route
//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  //Show  Route
  .get(wrapAsync(listingController.showListing))
  //Update Route
  .put(
    isLoggedIn,
    isOwner,
    //multer parse the image and save to Cloudinary
    //upload.single("listing[image]"),

    upload.single("listing[image]"),
    (err, req, res, next) => {
      if (err) {
        console.log("Cloudinary Error:", err); // Log the actual error
        req.flash("error", "Image upload failed.");
        return res.redirect(`/listings/${req.params.id}`);
      }
      next();
    },

    validateListing,
    wrapAsync(listingController.updateListing)
  )
  //Delete Route
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.distroyLinsting));

//Edit Route
router.get(
  "/:id/edit",
  isOwner,
  isLoggedIn,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
