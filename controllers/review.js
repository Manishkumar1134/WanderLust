const Listing = require("../models/listing");
const Review = require("../models/reviews");

module.exports.createRewiew = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  req.flash("success", "New Review Created !"); //key,message
  res.redirect(`/listings/${listing._id}`);
};

module.exports.distroyReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted !"); //key,message
  res.redirect(`/listings/${id}`);
};
