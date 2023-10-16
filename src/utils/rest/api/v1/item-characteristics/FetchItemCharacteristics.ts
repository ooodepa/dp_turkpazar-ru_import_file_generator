import axios from 'axios';

import GetItemCharacteristicDto from './dto/get-item-characteristic.dto';

export default class FetchItemCharacteristics {
  static async get() {
    try {
      let url = 'https://de-pa.by/api/v1/item-characteristics';
      const response = await axios.get(url);
      const json: GetItemCharacteristicDto[] = response.data;
      return json;
    } catch (exception) {
      return [];
    }
  }
}
