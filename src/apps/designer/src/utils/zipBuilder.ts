export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

const textEncoder = new TextEncoder();

const toBytes = (value: number, size: number): Uint8Array => {
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i += 1) {
    bytes[i] = (value >> (8 * i)) & 0xff;
  }
  return bytes;
};

const concat = (chunks: Uint8Array[]): Uint8Array => {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });
  return output;
};

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const crc32 = (data: Uint8Array): number => {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const encodeName = (name: string): Uint8Array => textEncoder.encode(name);

const makeLocalHeader = (nameBytes: Uint8Array, crc: number, size: number): Uint8Array => {
  const header = new Uint8Array(30 + nameBytes.length);
  header.set(toBytes(0x04034b50, 4), 0);
  header.set(toBytes(20, 2), 4);
  header.set(toBytes(0, 2), 6);
  header.set(toBytes(0, 2), 8);
  header.set(toBytes(0, 2), 10);
  header.set(toBytes(0, 2), 12);
  header.set(toBytes(crc, 4), 14);
  header.set(toBytes(size, 4), 18);
  header.set(toBytes(size, 4), 22);
  header.set(toBytes(nameBytes.length, 2), 26);
  header.set(toBytes(0, 2), 28);
  header.set(nameBytes, 30);
  return header;
};

const makeCentralHeader = (
  nameBytes: Uint8Array,
  crc: number,
  size: number,
  offset: number
): Uint8Array => {
  const header = new Uint8Array(46 + nameBytes.length);
  header.set(toBytes(0x02014b50, 4), 0);
  header.set(toBytes(20, 2), 4);
  header.set(toBytes(20, 2), 6);
  header.set(toBytes(0, 2), 8);
  header.set(toBytes(0, 2), 10);
  header.set(toBytes(0, 2), 12);
  header.set(toBytes(0, 2), 14);
  header.set(toBytes(crc, 4), 16);
  header.set(toBytes(size, 4), 20);
  header.set(toBytes(size, 4), 24);
  header.set(toBytes(nameBytes.length, 2), 28);
  header.set(toBytes(0, 2), 30);
  header.set(toBytes(0, 2), 32);
  header.set(toBytes(0, 2), 34);
  header.set(toBytes(0, 2), 36);
  header.set(toBytes(0, 4), 38);
  header.set(toBytes(offset, 4), 42);
  header.set(nameBytes, 46);
  return header;
};

const makeEndHeader = (count: number, size: number, offset: number): Uint8Array => {
  const header = new Uint8Array(22);
  header.set(toBytes(0x06054b50, 4), 0);
  header.set(toBytes(0, 2), 4);
  header.set(toBytes(0, 2), 6);
  header.set(toBytes(count, 2), 8);
  header.set(toBytes(count, 2), 10);
  header.set(toBytes(size, 4), 12);
  header.set(toBytes(offset, 4), 16);
  header.set(toBytes(0, 2), 20);
  return header;
};

export const createZip = (entries: ZipEntry[]): Uint8Array => {
  const localChunks: Uint8Array[] = [];
  const centralChunks: Uint8Array[] = [];
  let offset = 0;

  entries.forEach((entry) => {
    const nameBytes = encodeName(entry.name);
    const data = entry.data;
    const crc = crc32(data);
    const localHeader = makeLocalHeader(nameBytes, crc, data.length);

    localChunks.push(localHeader, data);
    centralChunks.push(makeCentralHeader(nameBytes, crc, data.length, offset));

    offset += localHeader.length + data.length;
  });

  const centralDirectory = concat(centralChunks);
  const endHeader = makeEndHeader(entries.length, centralDirectory.length, offset);

  return concat([...localChunks, centralDirectory, endHeader]);
};
