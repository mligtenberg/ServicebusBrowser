export function sequenceNumberToKey(sequenceNumber: string): string {
  // the max sequence number of a long is 19 digits long
  const prefixAmount = 20 - sequenceNumber.length;
  let key = '';
  for (let i = 0; i < prefixAmount; i++) {
    key += '0';
  }
  key += sequenceNumber;

  return key;
}
