enum KijijiCategory {
  ArtsAndCollectibles = "Arts & Collectibles",
  Audio = "Audio",
  BabyItems = "Baby Items",
  Bikes = "Bikes",
  Books = "Books",
  BusinessAndIndustrial = "Business & Industrial",
  CamerasAndCamcorders = "Cameras & Camcorders",
  CDsDVDsAndBluray = "CDs, DVDs & Blu-ray",
  Clothing = "Clothing",
  Computers = "Computers",
  ComputerAccessories = "Computer Accessories",
  Electronics = "Electronics",
  FreeStuff = "Free Stuff",
  Furniture = "Furniture",
  GarageSales = "Garage Sales",
  HealthAndSpecialNeeds = "Health & Special Needs",
  HobbiesAndCrafts = "Hobbies & Crafts",
  HomeAppliances = "Home Appliances",
  HomeIndoor = "Home - Indoor",
  HomeOutdoorAndGarden = "Home - Outdoor & Garden",
  HomeRenovationMaterials = "Home Renovation Materials",
  JewelleryAndWatches = "Jewellery & Watches",
  MusicalInstruments = "Musical Instruments",
  Phones = "Phones",
  SportingGoodsAndExercise = "Sporting Goods & Exercise",
  Tools = "Tools",
  ToysAndGames = "Toys & Games",
  TVsAndVideo = "TVs & Video",
  VideoGamesAndConsoles = "Video Games & Consoles",
}

enum KijijiMusicalInstrumentCategory {
  AmpsAndPedals = "Amps & Pedals",
  Brass = "Brass",
  DrumsAndPercussion = "Drums & Percussion",
  Guitars = "Guitars",
  PerformanceAndDJEquipment = "Performance & DJ Equipment",
  PianosAndKeyboards = "Pianos & Keyboards",
  ProAudioAndRecordingEquipment = "Pro Audio & Recording Equipment",
  String = "String",
  Woodwind = "Woodwind",
  Other = "Other",
}

enum KijijiClothingCategory {
  Costumes = "Costumes",
  KidsAndYouth = "Kids & Youth",
  Mens = "Men's",
  MensShoes = "Men's Shoes",
  MultiItem = "Multi-item",
  Wedding = "Wedding",
  WomensBagsAndWallets = "Women's - Bags & Wallets",
  WomensBottoms = "Women's - Bottoms",
  WomensDressesAndSkirts = "Women's - Dresses & Skirts",
  WomensMaternity = "Women's - Maternity",
  WomensShoes = "Women's - Shoes",
  WomensTopsAndOuterwear = "Women's - Tops & Outerwear",
  Other = "Other",
  WomensOther = "Women's - Other",
}

export enum CraigsListSaleCategory {
  Antiques = "Antiques",  
  Appliances = "Appliances",  
  ArtsCrafts = "Arts & Crafts",  
  ATVsUTVsSnowmobiles = "ATVs, UTVs, Snowmobiles",  
  AutoParts = "Auto Parts",  
  AutoWheelsTires = "Auto Wheels & Tires",  
  Aviation = "Aviation",  
  BabyKidStuff = "Baby & Kid Stuff",  
  Barter = "Barter",  
  BicycleParts = "Bicycle Parts",  
  Bicycles = "Bicycles",  
  BoatParts = "Boat Parts",  
  Boats = "Boats",  
  BooksMagazines = "Books & Magazines",  
  BusinessCommercial = "Business/Commercial",  
  CarsTrucks = "Cars & Trucks",  
  CDsDVDsVHS = "CDs / DVDs / VHS",  
  CellPhones = "Cell Phones",  
  ClothingAccessories = "Clothing & Accessories",  
  Collectibles = "Collectibles",  
  ComputerParts = "Computer Parts",  
  Computers = "Computers",  
  Electronics = "Electronics",  
  FarmGarden = "Farm & Garden",  
  FreeStuff = "Free Stuff",  
  Furniture = "Furniture",  
  GarageMovingSales = "Garage & Moving Sales",  
  GeneralForSale = "General For Sale",  
  HealthBeauty = "Health and Beauty",  
  HeavyEquipment = "Heavy Equipment",  
  HouseholdItems = "Household Items",  
  Jewelry = "Jewelry",  
  Materials = "Materials",  
  MotorcycleParts = "Motorcycle Parts",  
  MotorcyclesScooters = "Motorcycles/Scooters",  
  MusicalInstruments = "Musical Instruments",  
  PhotoVideo = "Photo/Video",  
  RVs = "RVs",  
  SportingGoods = "Sporting Goods",  
  Tickets = "Tickets",  
  Tools = "Tools",  
  ToysGames = "Toys & Games",  
  Trailers = "Trailers",  
  VideoGaming = "Video Gaming",  
  Wanted = "Wanted",
}

export type CraigsListPostDetails = {
  postingTitle: string; 
  price: number;   
  cityOrNeighbourhood?: string;
  zipCode?: string; 
  description: string; 
  postingDetails?: CraigsListPostingDetails;
  replyOptions?: CraigListReplyOptions;
  locationInfo?: CraigListLocationInfo;
}

type CraigsListItemCondition = "new" | "like new" | "excellent" | "good" | "fair" | "salvage"

type CraigsListPostingDetails = {
  makeManufacturer: String;
  condition: CraigsListItemCondition; 
  modelNameNum: string; 
  dimensions: string;
  languageOfPosting: string;
  crpytoPay?: boolean;
  delivery? : boolean;
  includeMoreAdsLink: boolean;
}

type CraigListReplyOptions = {
  CLChat: boolean;
  publishPhoneNumber: boolean;
}

type CraigListLocationInfo = {
  street: string;
  crossStreet: string;
  city: string;
}