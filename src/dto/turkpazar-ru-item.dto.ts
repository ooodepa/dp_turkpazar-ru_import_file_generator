import TurkpazarRuItemPackage from './turkpazar-ru-item-package.dto';
import TurkpazarRuItemVariants from './turkpazar-ru-item-variants.dto';

export default interface TurkpazarRuItem {
  name: string; //Item name
  description: string; //Item description
  category: string; //Item category
  subcategory: string; //Item subcategory
  destination: string; //Item destination
  price: string; //Price in USD
  count: string; //Count in lot
  package: TurkpazarRuItemPackage;
  variants: TurkpazarRuItemVariants[];
  images: string[]; //link to image, link to image, link to image, ...
}
