const image = (name) => `/images/${name}.jpg`;

export const productArt = {
  headphones: image("headphones"),
  headphonesGrey: image("headphones-grey"),
  watch: image("watch"),
  smartwatch: image("smartwatch"),
  sneaker: image("sneakers"),
  sneakerBlack: image("sneakers-black"),
  backpack: image("backpack"),
  camera: image("camera"),
  earbuds: image("earbuds"),
  speaker: image("speaker"),
  sunglasses: image("sunglasses"),
  lamp: image("lamp"),
  chair: image("chair"),
  bottle: image("bottle"),
  perfume: image("perfume"),
  keyboard: image("keyboard"),
  mouse: image("mouse"),
  skincare: image("skincare"),
  dumbbell: image("dumbbell"),
  mug: image("mug"),
  jacket: image("jacket"),
  handbag: image("handbag"),
  yogaMat: image("yoga-mat"),
};

export const categoryArtMap = {
  electronics: productArt.headphonesGrey,
  fashion: productArt.sneaker,
  home: productArt.chair,
  beauty: productArt.perfume,
  sports: productArt.sneakerBlack,
  accessories: productArt.sunglasses,
};

export const heroArt = image("shopper");
export const storeArt = image("store");
