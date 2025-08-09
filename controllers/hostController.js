const Home = require("../models/home");
const fs = require("fs");


exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === 'true';

  Home.findById(homeId).then(home => {
    if (!home) {
      console.log("Home not found for editing.");
      return res.redirect("/host/host-home-list");
    }

    console.log(homeId, editing, home);
    res.render("host/edit-home", {
      home: home,
      pageTitle: "Edit your Home",
      currentPage: "host-homes",
      editing: editing,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getHostHomes = (req, res, next) => {
  Home.find().then(registeredHomes => {
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    })
})
.catch((error) => {
  console.log("Error fetching Homes: ",error)
});
};

exports.postAddHome = (req, res, next) => {
  const { houseName, description, price, location, rating } = req.body;
  console.log(houseName, description, price, location, rating);
  console.log("Photo file: ", req.file);

  if (!req.file) {
    console.log("No file uploaded");
    return res.status(422).send("No file uploaded");
  }

  const photo = req.file.path; // Assuming the file path is stored in req.file.path
  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo,
    description,
  });
  home.save().then(() => {
    console.log("Home added successfully");
  });

  res.redirect("/host/host-home-list");
};


exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } = req.body;
  Home.findById(id).then((home) => {
    home.houseName = houseName;
    home.price = price;
    home.location = location;
    home.rating = rating;
    // home.photo = photo;
    home.description = description;

    if(req.file){
      fs.unlink(home.photo, (err) => {
        if (err) {
          console.log("Error deleting old photo: ", err);
        } else {
          console.log("Old photo deleted successfully");
        }
      });
      // Update the photo path with the new file
      home.photo = req.file.path;
    }
  home.save().then(result => {console.log("Home updated successfully", result);
  }).catch(error => {
    console.log("Error updating Home: ", error);
  });
  }).catch(error => {
    console.log("Error finding Home for update: ", error);
  });
  // Redirect to the host home list after saving
  res.redirect("/host/host-home-list");
};



exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  console.log('Came to delete ', homeId);
  Home.findByIdAndDelete(homeId).then(() => {
    res.redirect("/host/host-home-list");
  });
};