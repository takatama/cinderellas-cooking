(function(root){
'use strict';
const manifest={
  "amatriciana.png": {
    "src": "assets/amatriciana.7b55842727c58409.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 764654
  },
  "aonori.webp": {
    "src": "assets/aonori.1641f82599cffda1.webp",
    "width": 512,
    "height": 512,
    "bytes": 209612
  },
  "bacon.webp": {
    "src": "assets/bacon.79a1259af931dc62.webp",
    "width": 512,
    "height": 512,
    "bytes": 202790
  },
  "breadcrumbs.webp": {
    "src": "assets/breadcrumbs.b49b61f27a5e2c97.webp",
    "width": 512,
    "height": 512,
    "bytes": 191328
  },
  "cabbage-rolls.png": {
    "src": "assets/cabbage-rolls.4d96a13f21020539.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1293204
  },
  "cabbage.webp": {
    "src": "assets/cabbage.afd17db2c778e2d0.webp",
    "width": 512,
    "height": 512,
    "bytes": 257742
  },
  "carbonara.png": {
    "src": "assets/carbonara.92980416f4d622e7.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 719730
  },
  "castle-door-closed.png": {
    "src": "assets/castle-door-closed.ace4ba2b25b66f1c.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 2241942,
    "small": {
      "src": "assets/castle-door-closed-768.5022268bf2f0deee.webp",
      "width": 768,
      "bytes": 667388
    }
  },
  "castle-door-open.png": {
    "src": "assets/castle-door-open.9f370f06ac6b8ff4.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 2106286,
    "small": {
      "src": "assets/castle-door-open-768.16f7f73e69f6bcff.webp",
      "width": 768,
      "bytes": 657702
    }
  },
  "castle-exterior.png": {
    "src": "assets/castle-exterior.61054acd41c11fe7.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 2369212,
    "small": {
      "src": "assets/castle-exterior-768.0261e1eaec2b5fcb.webp",
      "width": 768,
      "bytes": 731938
    }
  },
  "chicken-rice.png": {
    "src": "assets/chicken-rice.a8a08ece8068e89f.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 783930
  },
  "chicken.webp": {
    "src": "assets/chicken.74d0d01c9caeef4e.webp",
    "width": 512,
    "height": 512,
    "bytes": 222580
  },
  "chikuwabu.webp": {
    "src": "assets/chikuwabu.6bfb1a6cdaf28a1f.webp",
    "width": 512,
    "height": 512,
    "bytes": 49656
  },
  "company-workshop.png": {
    "src": "assets/company-workshop.4bd9662ca8818fe7.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 2125078
  },
  "covered-frying-pan.png": {
    "src": "assets/covered-frying-pan.a52ea92dfc5053e8.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1062900
  },
  "covered-pot.png": {
    "src": "assets/covered-pot.c965b0c332283fb8.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1185270
  },
  "curry-oden.png": {
    "src": "assets/curry-oden.a2b581c38872d2ac.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1210966
  },
  "curry-roux.webp": {
    "src": "assets/curry-roux.0196e14a2787c986.webp",
    "width": 512,
    "height": 512,
    "bytes": 71758
  },
  "curry.png": {
    "src": "assets/curry.0d5f62c08bbf9315.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1170472
  },
  "egg.webp": {
    "src": "assets/egg.5b29a627fdff8b87.webp",
    "width": 512,
    "height": 512,
    "bytes": 55992
  },
  "frying-pan.png": {
    "src": "assets/frying-pan.33019029004ebe05.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1027004
  },
  "frying-pot.png": {
    "src": "assets/frying-pot.ab377e6f43535a87.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1231420
  },
  "ground-meat.webp": {
    "src": "assets/ground-meat.7f4cdcfcd0baac60.webp",
    "width": 512,
    "height": 512,
    "bytes": 193246
  },
  "hamburg-steak.png": {
    "src": "assets/hamburg-steak.08170132b6cc3686.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1311744
  },
  "help-characters.png": {
    "src": "assets/help-characters.35fc292150adefbc.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1635596
  },
  "intro-characters.png": {
    "src": "assets/intro-characters.7baf5afad471b981.webp",
    "width": 1254,
    "height": 1254,
    "bytes": 1960192
  },
  "kitchen-background.png": {
    "src": "assets/kitchen-background.0f32a792733239ef.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1733824,
    "small": {
      "src": "assets/kitchen-background-768.23b56d3abeb5b8ee.webp",
      "width": 768,
      "bytes": 588292
    }
  },
  "magic-room.png": {
    "src": "assets/magic-room.23ba6b0c5695b193.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 2236688,
    "small": {
      "src": "assets/magic-room-768.5f0960491572cc91.webp",
      "width": 768,
      "bytes": 665484
    }
  },
  "mail-order-epilogue.png": {
    "src": "assets/mail-order-epilogue.0a7f7a303482e25d.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1833644
  },
  "mail-order-home.png": {
    "src": "assets/mail-order-home.fda8bde06a00e95d.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1557512
  },
  "menchi-katsu.png": {
    "src": "assets/menchi-katsu.ce058ab425d2eb50.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1331374
  },
  "mixing-bowl.png": {
    "src": "assets/mixing-bowl.ddd07c1f318747aa.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1169988
  },
  "mother-delighted.png": {
    "src": "assets/mother-delighted.0a272f4d09697d66.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1240832
  },
  "mother-pleased.png": {
    "src": "assets/mother-pleased.c6d92369bbf941f3.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1259358
  },
  "mother.png": {
    "src": "assets/mother.25b1133cd1e556e0.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1253828
  },
  "oden.png": {
    "src": "assets/oden.0e15c75773480935.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1235296
  },
  "omurice.png": {
    "src": "assets/omurice.48c65f6c4dc5d9a3.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 669514
  },
  "onion.webp": {
    "src": "assets/onion.0e357d1b9a7152ac.webp",
    "width": 512,
    "height": 512,
    "bytes": 204888
  },
  "oyakodon.png": {
    "src": "assets/oyakodon.a44d3ff3cdde7bdd.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 702332
  },
  "pasta.webp": {
    "src": "assets/pasta.b4d350dd799d7084.webp",
    "width": 512,
    "height": 512,
    "bytes": 167810
  },
  "pilaf.png": {
    "src": "assets/pilaf.e9c92054a294ed25.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 736326
  },
  "pork.webp": {
    "src": "assets/pork.1f7e147c06cfcb5f.webp",
    "width": 512,
    "height": 512,
    "bytes": 71306
  },
  "potato-croquettes.png": {
    "src": "assets/potato-croquettes.24b5f2fb9a5d297d.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1318820
  },
  "potato-salad.png": {
    "src": "assets/potato-salad.44ae1309691c24b6.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1276666
  },
  "potato.webp": {
    "src": "assets/potato.9cf3bf35084a8c44.webp",
    "width": 512,
    "height": 512,
    "bytes": 65214
  },
  "prince-delighted.png": {
    "src": "assets/prince-delighted.0f4a16e3f557929a.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1252376
  },
  "prince-pleased.png": {
    "src": "assets/prince-pleased.caac33a3d4ec46b5.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1238980
  },
  "prince.png": {
    "src": "assets/prince.8f342e6c73b7a341.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1239828
  },
  "pumpkin-pudding.png": {
    "src": "assets/pumpkin-pudding.2694331bb571d532.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1159576
  },
  "rice.webp": {
    "src": "assets/rice.72a45edb742e6404.webp",
    "width": 512,
    "height": 512,
    "bytes": 191550
  },
  "shirataki.webp": {
    "src": "assets/shirataki.0b82967d24da1f07.webp",
    "width": 512,
    "height": 512,
    "bytes": 55524
  },
  "sister-delighted.png": {
    "src": "assets/sister-delighted.f8d5ba937ee9fb94.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1633308
  },
  "sister-pleased.png": {
    "src": "assets/sister-pleased.40f338febf63fa48.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1633496
  },
  "tasting-table.png": {
    "src": "assets/tasting-table.d7199aa597aab3e5.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 871916
  },
  "tomato-spaghetti.png": {
    "src": "assets/tomato-spaghetti.f07683a6c9b29cf9.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 740188
  },
  "tomato.webp": {
    "src": "assets/tomato.3556d7b4d816bcb6.webp",
    "width": 512,
    "height": 512,
    "bytes": 225666
  },
  "vegetable-stir-fry.png": {
    "src": "assets/vegetable-stir-fry.14e39a88a805f524.webp",
    "width": 1536,
    "height": 1024,
    "bytes": 1379062
  }
};
root.AssetManifest=manifest;
if(typeof module!=='undefined')module.exports=manifest;
})(typeof window!=='undefined'?window:globalThis);
