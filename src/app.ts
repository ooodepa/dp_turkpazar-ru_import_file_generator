import fs from 'fs';

import env from './env';
import FetchItems from './utils/rest/api/v1/items';
import FetchItemBrands from './utils/rest/api/v1/item-brands';
import GetItemDto from './utils/rest/api/v1/items/dto/get-item.dto';
import FetchItemCategories from './utils/rest/api/v1/item-categories';
import TurkpazarRuImportFileDto from './dto/turkpazar-ru-import-file.dto';
import TurkpazarRuItemVariants from './dto/turkpazar-ru-item-variants.dto';
import FetchItemCharacteristics from './utils/rest/api/v1/item-characteristics/FetchItemCharacteristics';

async function main() {
  let items: GetItemDto[] = [];
  for (let i = 0; i < env.backend__brandUrls.length; i++) {
    const jItems = (
      await FetchItems.get({ brand: env.backend__brandUrls[i] })
    ).sort((a, b) => a.dp_model.localeCompare(b.dp_model));
    items = [...items, ...jItems];
  }

  const brands = (await FetchItemBrands.get()).sort(
    (a, b) => a.dp_sortingIndex - b.dp_sortingIndex,
  );
  const categories = (await FetchItemCategories.get()).sort(
    (a, b) => a.dp_sortingIndex - b.dp_sortingIndex,
  );

  const characteristics = (await FetchItemCharacteristics.get()).sort((a, b) =>
    a.dp_name.localeCompare(b.dp_name),
  );

  const importFileObject: TurkpazarRuImportFileDto = {
    items: [],
  };
  let xml = '';
  xml += `<?xml version="1.0"?> \n`;
  xml += `<Items> \n`;

  for (let i = 0; i < env.backend__brandUrls.length; ++i) {
    for (let j = 0; j < brands.length; ++j) {
      const jItBr = brands[j];
      if (env.backend__brandUrls[i] === jItBr.dp_urlSegment) {
        for (let k = 0; k < categories.length; ++k) {
          const jItCt = categories[k];
          if (brands[j].dp_id === jItCt.dp_itemBrandId && !jItCt.dp_isHidden) {
            for (let q = 0; q < items.length; ++q) {
              const jIt = items[q];
              if (categories[k].dp_id === jIt.dp_itemCategoryId) {
                // < < < < < < < < description
                let description = '';
                description += 'Данные номенклатуры: \n';
                description += `- Наименование: ${jIt.dp_name} \n`;
                description += `- Бренд: ${jItBr.dp_name} \n`;
                description += `- Категория: ${jItCt.dp_name} \n`;
                description += `- Модель: ${jIt.dp_model} \n`;

                if (jIt.dp_itemCharacteristics.length > 0) {
                  description += '\n';
                  description += 'Другие характеристики: \n';
                  jIt.dp_itemCharacteristics.forEach(e => {
                    for (let r = 0; r < characteristics.length; ++r) {
                      if (characteristics[r].dp_id === e.dp_characteristicId) {
                        if (characteristics[r].dp_isHidden) break;
                        description += `- ${characteristics[r].dp_name}: ${e.dp_value}\n`;
                        break;
                      }
                    }
                  });
                }

                description += '\n';
                description += 'Другое описание: \n';

                // if (jIt.dp_seoDescription.length > 32 && jIt.dp_seoDescription.length <= 300) {
                //   console.log(jIt.dp_model);
                // }

                description += jIt.dp_seoDescription;
                description = description.replace(/\\n_x000d_/g, '');
                description = description.replace(/\\n_x000d/g, '');
                description = description.replace(/\\n/g, '');
                // > > > > > > > > description

                // < < < < < < < < price
                let usdCostStr = '';
                for (let r = 0; r < jIt.dp_itemCharacteristics.length; ++r) {
                  const character = jIt.dp_itemCharacteristics[r];
                  if (character.dp_characteristicId === 24) {
                    usdCostStr = character.dp_value;
                    break;
                  }
                }

                const price =
                  usdCostStr === ''
                    ? jIt.dp_cost > 0
                      ? ''
                      : 'уточняйте'
                    : Number(usdCostStr).toFixed(2);
                // > > > > > > > > price

                // < < < < < < < < count
                let count = '';
                for (let r = 0; r < jIt.dp_itemCharacteristics.length; ++r) {
                  const character = jIt.dp_itemCharacteristics[r];
                  if (character.dp_characteristicId === 1) {
                    count = character.dp_value;
                    break;
                  }
                }

                if (count.length === 0) {
                  for (let r = 0; r < jIt.dp_itemCharacteristics.length; ++r) {
                    const character = jIt.dp_itemCharacteristics[r];
                    if (character.dp_characteristicId === 10) {
                      count = character.dp_value;
                      break;
                    }
                  }
                }
                // > > > > > > > > count

                // < < < < < < < < package
                let width = '';
                for (let r = 0; r < jIt.dp_itemCharacteristics.length; ++r) {
                  const character = jIt.dp_itemCharacteristics[r];
                  if (character.dp_characteristicId === 26) {
                    width = character.dp_value;
                    break;
                  }
                }

                let height = '';
                for (let r = 0; r < jIt.dp_itemCharacteristics.length; ++r) {
                  const character = jIt.dp_itemCharacteristics[r];
                  if (character.dp_characteristicId === 27) {
                    height = character.dp_value;
                    break;
                  }
                }

                let length = '';
                for (let r = 0; r < jIt.dp_itemCharacteristics.length; ++r) {
                  const character = jIt.dp_itemCharacteristics[r];
                  if (character.dp_characteristicId === 28) {
                    length = character.dp_value;
                    break;
                  }
                }

                let weight = '';
                for (let r = 0; r < jIt.dp_itemCharacteristics.length; ++r) {
                  const character = jIt.dp_itemCharacteristics[r];
                  if (character.dp_characteristicId === 2) {
                    weight = character.dp_value;
                    break;
                  }
                }
                // > > > > > > > > package

                // < < < < < < < < variants
                const variants: TurkpazarRuItemVariants[] = [];

                let nameEn = '';
                let nameRu = '';
                let nameTr = '';

                for (let r = 0; r < jIt.dp_itemCharacteristics.length; ++r) {
                  const character = jIt.dp_itemCharacteristics[r];
                  if (character.dp_characteristicId === 19) {
                    nameEn = character.dp_value;
                    break;
                  }
                }

                for (let r = 0; r < jIt.dp_itemCharacteristics.length; ++r) {
                  const character = jIt.dp_itemCharacteristics[r];
                  if (character.dp_characteristicId === 20) {
                    nameRu = character.dp_value;
                    break;
                  }
                }

                for (let r = 0; r < jIt.dp_itemCharacteristics.length; ++r) {
                  const character = jIt.dp_itemCharacteristics[r];
                  if (character.dp_characteristicId === 18) {
                    nameTr = character.dp_value;
                    break;
                  }
                }

                if (nameTr.length > 0) {
                  variants.push({
                    name: nameTr,
                    value: [nameTr],
                  });
                }

                if (nameEn.length > 0) {
                  variants.push({
                    name: nameEn,
                    value: [nameEn],
                  });
                }

                if (nameRu.length > 0) {
                  variants.push({
                    name: nameRu,
                    value: [nameRu],
                  });
                }
                // > > > > > > > > variants

                // < < < < < < < < images
                const images = jIt.dp_itemGalery.map(e => e.dp_photoUrl);
                if (jIt.dp_photoUrl.length) {
                  images.unshift(jIt.dp_photoUrl);
                }
                if (jIt.dp_itemGalery.length >= 9) {
                  console.log(jItCt.dp_urlSegment, jIt.dp_model);
                }
                // > > > > > > > > images

                importFileObject.items.push({
                  name: jIt.dp_name,
                  description,
                  category: jItBr.dp_name,
                  subcategory: jIt.dp_name,
                  destination: jIt.dp_model,
                  price,
                  count,
                  package: {
                    width,
                    height,
                    length,
                    weight,
                  },
                  variants: [],
                  images,
                });

                xml += `\t<Item> \n`;
                xml += `\t\t<Name>${jIt.dp_name}</Name> \n`;
                xml += `\t\t<Description>${description}</Description> \n`;
                xml += `\t\t<Category>${jItBr.dp_name}</Category> \n`;
                xml += `\t\t<Subcategory>${jItCt.dp_name}</Subcategory> \n`;
                xml += `\t\t<Destination>${jIt.dp_model}</Destination> \n`;
                xml += `\t\t<Price>${price}</Price> \n`;
                xml += `\t\t<Count>${count}</Count> \n`;
                xml += `\t\t<Package> \n`;
                xml += `\t\t\t<Width>${width}</Width> \n`;
                xml += `\t\t\t<Height>${height}</Height> \n`;
                xml += `\t\t\t<Length>${length}</Length> \n`;
                xml += `\t\t\t<Weight>${weight}</Weight> \n`;
                xml += `\t\t</Package> \n`;
                xml += `\t\t<Variants> \n`;
                variants.forEach(e => {
                  xml += `\t\t\t<Variant name=${JSON.stringify(e.name)}> \n`;
                  e.value.forEach(ee => {
                    xml += `\t\t\t\t<Value>${ee}</Value> \n`;
                  });
                  xml += `\t\t\t</Variant> \n`;
                  xml += `\t\t</Variants> \n`;
                });

                xml += `\t\t<Images> \n`;
                images.forEach(e => {
                  xml += `\t\t\t<Image>${e}</Image> \n`;
                });
                xml += `\t\t</Images> \n`;
                xml += `\t</Item> \n`;
              }
            }
          }
        }
        break;
      }
    }
  }

  xml += `</Items> \n`;

  await fs.promises.writeFile('./result/import.xml', xml);
  await fs.promises.writeFile(
    './result/import.json',
    JSON.stringify(importFileObject, null, 2),
  );
}

main();
