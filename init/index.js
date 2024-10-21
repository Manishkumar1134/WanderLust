const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

//This is an async function (defined below) that connects to the MongoDB server using Mongoose.
main()
  .then(() => {
    console.log("Connected..");
  })
  .catch((err) => {
    console.log(err);
  });

//The main function establishes a connection to the MongoDB server at the address mongodb://127.0.0.1:27017/.
//The specific database being connected to is called wanderlust.
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust"); // db name -> wanderlust
}

const initDB = async () => {
  await Listing.deleteMany({});
  //adding owner to DB
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "670abb4272a27ca49b193193",
  }));
  await Listing.insertMany(initData.data);
  console.log("Data was initialized");
};
initDB();
