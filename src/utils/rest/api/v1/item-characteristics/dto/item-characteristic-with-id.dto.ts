import ItemCharacteristicDto from './item-characteristic.dto';

export default interface ItemCharacteristicWithId
  extends ItemCharacteristicDto {
  dp_id: number;
}
