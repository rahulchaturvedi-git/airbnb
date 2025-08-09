const path = require("path");
const rootDir = require("../utils/pathUtil");


const Home = require("../models/home");
const User = require("../models/user");

exports.getIndex = (req, res, next) => {
  console.log("session value: ",req.session);
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  })
  .catch((error) => {
    console.log("Error fetching Homes: ",error)
  });
};

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    })
});
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  })
};

exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favourites");
  // const favouriteHomes = favourites.map((fav) => fav.homeId);
  res.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "Favourites List",
    currentPage: "favourites",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};


exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id
  const userId = req.session.user._id; // Get the Favourite document ID from the route parameters
  const user = await User.findById(userId);
  if(!user.favourites.includes(homeId)){
    user.favourites.push(homeId);
    user.save();
  }
  
    res.redirect("/favourites");

};

exports.postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId; // Get the Favourite document ID from the route parameters
  const userId = req.session.user._id; // Get the Favourite document ID from the route parameters
  const user = await User.findById(userId);

  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter((fav) => fav != homeId);
    await user.save();
  }

  res.redirect("/favourites");
};



exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;

  Home.findById(homeId)
    .then((home) => {
      if (!home) {
        console.log("Home not found");
        return res.redirect("/homes");
      }

      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    })
    .catch((err) => {
      console.error("Error fetching home details:", err);
      res.redirect("/homes");
    });
};

exports.getHomeRules = [(req, res, next) => {
  if(!req.session.isLoggedIn){
    return res.redirect("/login");
  }
  next();
  },


  (req, res, next) => {
    const homeId = req.params.homeId;
    const rulesFileName = 'House Rules.pdf';
    const filePath = path.join(rootDir,'rules', rulesFileName)


    res.download(filePath,'Rules.pdf');
  },
]
