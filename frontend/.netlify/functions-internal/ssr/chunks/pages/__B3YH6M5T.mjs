import '@astrojs/internal-helpers/path';
import { A as AstroError, c as InvalidImageService, d as ExpectedImageOptions, E as ExpectedImage, F as FailedToFetchRemoteImageDimensions, e as createAstro, f as createComponent, g as ImageMissingAlt, r as renderTemplate, m as maybeRenderHead, h as addAttribute, s as spreadAttributes, i as renderComponent, u as unescapeHTML, j as Fragment, k as renderSlot, l as renderHead } from '../astro_AKpy6RvW.mjs';
import { createClient } from '@sanity/client';
import 'kleur/colors';
import { r as resolveSrc, i as isRemoteImage, a as isESMImportedImage, b as isLocalService, D as DEFAULT_HASH_PROPS } from '../astro/assets-service_n3Fzkd-j.mjs';
import 'clsx';
import { getIconData, iconToSVG } from '@iconify/utils';
/* empty css                            */
/* empty css                            */
import imageUrlBuilder from '@sanity/image-url';
/* empty css                           */

const decoder = new TextDecoder();
const toUTF8String = (input, start = 0, end = input.length) => decoder.decode(input.slice(start, end));
const toHexString = (input, start = 0, end = input.length) => input.slice(start, end).reduce((memo, i) => memo + ("0" + i.toString(16)).slice(-2), "");
const readInt16LE = (input, offset = 0) => {
  const val = input[offset] + input[offset + 1] * 2 ** 8;
  return val | (val & 2 ** 15) * 131070;
};
const readUInt16BE = (input, offset = 0) => input[offset] * 2 ** 8 + input[offset + 1];
const readUInt16LE = (input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8;
const readUInt24LE = (input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16;
const readInt32LE = (input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16 + (input[offset + 3] << 24);
const readUInt32BE = (input, offset = 0) => input[offset] * 2 ** 24 + input[offset + 1] * 2 ** 16 + input[offset + 2] * 2 ** 8 + input[offset + 3];
const readUInt32LE = (input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16 + input[offset + 3] * 2 ** 24;
const methods = {
  readUInt16BE,
  readUInt16LE,
  readUInt32BE,
  readUInt32LE
};
function readUInt(input, bits, offset, isBigEndian) {
  offset = offset || 0;
  const endian = isBigEndian ? "BE" : "LE";
  const methodName = "readUInt" + bits + endian;
  return methods[methodName](input, offset);
}
function readBox(buffer, offset) {
  if (buffer.length - offset < 4)
    return;
  const boxSize = readUInt32BE(buffer, offset);
  if (buffer.length - offset < boxSize)
    return;
  return {
    name: toUTF8String(buffer, 4 + offset, 8 + offset),
    offset,
    size: boxSize
  };
}
function findBox(buffer, boxName, offset) {
  while (offset < buffer.length) {
    const box = readBox(buffer, offset);
    if (!box)
      break;
    if (box.name === boxName)
      return box;
    offset += box.size;
  }
}

const BMP = {
  validate: (input) => toUTF8String(input, 0, 2) === "BM",
  calculate: (input) => ({
    height: Math.abs(readInt32LE(input, 22)),
    width: readUInt32LE(input, 18)
  })
};

const TYPE_ICON = 1;
const SIZE_HEADER$1 = 2 + 2 + 2;
const SIZE_IMAGE_ENTRY = 1 + 1 + 1 + 1 + 2 + 2 + 4 + 4;
function getSizeFromOffset(input, offset) {
  const value = input[offset];
  return value === 0 ? 256 : value;
}
function getImageSize$1(input, imageIndex) {
  const offset = SIZE_HEADER$1 + imageIndex * SIZE_IMAGE_ENTRY;
  return {
    height: getSizeFromOffset(input, offset + 1),
    width: getSizeFromOffset(input, offset)
  };
}
const ICO = {
  validate(input) {
    const reserved = readUInt16LE(input, 0);
    const imageCount = readUInt16LE(input, 4);
    if (reserved !== 0 || imageCount === 0)
      return false;
    const imageType = readUInt16LE(input, 2);
    return imageType === TYPE_ICON;
  },
  calculate(input) {
    const nbImages = readUInt16LE(input, 4);
    const imageSize = getImageSize$1(input, 0);
    if (nbImages === 1)
      return imageSize;
    const imgs = [imageSize];
    for (let imageIndex = 1; imageIndex < nbImages; imageIndex += 1) {
      imgs.push(getImageSize$1(input, imageIndex));
    }
    return {
      height: imageSize.height,
      images: imgs,
      width: imageSize.width
    };
  }
};

const TYPE_CURSOR = 2;
const CUR = {
  validate(input) {
    const reserved = readUInt16LE(input, 0);
    const imageCount = readUInt16LE(input, 4);
    if (reserved !== 0 || imageCount === 0)
      return false;
    const imageType = readUInt16LE(input, 2);
    return imageType === TYPE_CURSOR;
  },
  calculate: (input) => ICO.calculate(input)
};

const DDS = {
  validate: (input) => readUInt32LE(input, 0) === 542327876,
  calculate: (input) => ({
    height: readUInt32LE(input, 12),
    width: readUInt32LE(input, 16)
  })
};

const gifRegexp = /^GIF8[79]a/;
const GIF = {
  validate: (input) => gifRegexp.test(toUTF8String(input, 0, 6)),
  calculate: (input) => ({
    height: readUInt16LE(input, 8),
    width: readUInt16LE(input, 6)
  })
};

const brandMap = {
  avif: "avif",
  mif1: "heif",
  msf1: "heif",
  // hief-sequence
  heic: "heic",
  heix: "heic",
  hevc: "heic",
  // heic-sequence
  hevx: "heic"
  // heic-sequence
};
function detectBrands(buffer, start, end) {
  let brandsDetected = {};
  for (let i = start; i <= end; i += 4) {
    const brand = toUTF8String(buffer, i, i + 4);
    if (brand in brandMap) {
      brandsDetected[brand] = 1;
    }
  }
  if ("avif" in brandsDetected) {
    return "avif";
  } else if ("heic" in brandsDetected || "heix" in brandsDetected || "hevc" in brandsDetected || "hevx" in brandsDetected) {
    return "heic";
  } else if ("mif1" in brandsDetected || "msf1" in brandsDetected) {
    return "heif";
  }
}
const HEIF = {
  validate(buffer) {
    const ftype = toUTF8String(buffer, 4, 8);
    const brand = toUTF8String(buffer, 8, 12);
    return "ftyp" === ftype && brand in brandMap;
  },
  calculate(buffer) {
    const metaBox = findBox(buffer, "meta", 0);
    const iprpBox = metaBox && findBox(buffer, "iprp", metaBox.offset + 12);
    const ipcoBox = iprpBox && findBox(buffer, "ipco", iprpBox.offset + 8);
    const ispeBox = ipcoBox && findBox(buffer, "ispe", ipcoBox.offset + 8);
    if (ispeBox) {
      return {
        height: readUInt32BE(buffer, ispeBox.offset + 16),
        width: readUInt32BE(buffer, ispeBox.offset + 12),
        type: detectBrands(buffer, 8, metaBox.offset)
      };
    }
    throw new TypeError("Invalid HEIF, no size found");
  }
};

const SIZE_HEADER = 4 + 4;
const FILE_LENGTH_OFFSET = 4;
const ENTRY_LENGTH_OFFSET = 4;
const ICON_TYPE_SIZE = {
  ICON: 32,
  "ICN#": 32,
  // m => 16 x 16
  "icm#": 16,
  icm4: 16,
  icm8: 16,
  // s => 16 x 16
  "ics#": 16,
  ics4: 16,
  ics8: 16,
  is32: 16,
  s8mk: 16,
  icp4: 16,
  // l => 32 x 32
  icl4: 32,
  icl8: 32,
  il32: 32,
  l8mk: 32,
  icp5: 32,
  ic11: 32,
  // h => 48 x 48
  ich4: 48,
  ich8: 48,
  ih32: 48,
  h8mk: 48,
  // . => 64 x 64
  icp6: 64,
  ic12: 32,
  // t => 128 x 128
  it32: 128,
  t8mk: 128,
  ic07: 128,
  // . => 256 x 256
  ic08: 256,
  ic13: 256,
  // . => 512 x 512
  ic09: 512,
  ic14: 512,
  // . => 1024 x 1024
  ic10: 1024
};
function readImageHeader(input, imageOffset) {
  const imageLengthOffset = imageOffset + ENTRY_LENGTH_OFFSET;
  return [
    toUTF8String(input, imageOffset, imageLengthOffset),
    readUInt32BE(input, imageLengthOffset)
  ];
}
function getImageSize(type) {
  const size = ICON_TYPE_SIZE[type];
  return { width: size, height: size, type };
}
const ICNS = {
  validate: (input) => toUTF8String(input, 0, 4) === "icns",
  calculate(input) {
    const inputLength = input.length;
    const fileLength = readUInt32BE(input, FILE_LENGTH_OFFSET);
    let imageOffset = SIZE_HEADER;
    let imageHeader = readImageHeader(input, imageOffset);
    let imageSize = getImageSize(imageHeader[0]);
    imageOffset += imageHeader[1];
    if (imageOffset === fileLength)
      return imageSize;
    const result = {
      height: imageSize.height,
      images: [imageSize],
      width: imageSize.width
    };
    while (imageOffset < fileLength && imageOffset < inputLength) {
      imageHeader = readImageHeader(input, imageOffset);
      imageSize = getImageSize(imageHeader[0]);
      imageOffset += imageHeader[1];
      result.images.push(imageSize);
    }
    return result;
  }
};

const J2C = {
  // TODO: this doesn't seem right. SIZ marker doesn't have to be right after the SOC
  validate: (input) => toHexString(input, 0, 4) === "ff4fff51",
  calculate: (input) => ({
    height: readUInt32BE(input, 12),
    width: readUInt32BE(input, 8)
  })
};

const JP2 = {
  validate(input) {
    if (readUInt32BE(input, 4) !== 1783636e3 || readUInt32BE(input, 0) < 1)
      return false;
    const ftypBox = findBox(input, "ftyp", 0);
    if (!ftypBox)
      return false;
    return readUInt32BE(input, ftypBox.offset + 4) === 1718909296;
  },
  calculate(input) {
    const jp2hBox = findBox(input, "jp2h", 0);
    const ihdrBox = jp2hBox && findBox(input, "ihdr", jp2hBox.offset + 8);
    if (ihdrBox) {
      return {
        height: readUInt32BE(input, ihdrBox.offset + 8),
        width: readUInt32BE(input, ihdrBox.offset + 12)
      };
    }
    throw new TypeError("Unsupported JPEG 2000 format");
  }
};

const EXIF_MARKER = "45786966";
const APP1_DATA_SIZE_BYTES = 2;
const EXIF_HEADER_BYTES = 6;
const TIFF_BYTE_ALIGN_BYTES = 2;
const BIG_ENDIAN_BYTE_ALIGN = "4d4d";
const LITTLE_ENDIAN_BYTE_ALIGN = "4949";
const IDF_ENTRY_BYTES = 12;
const NUM_DIRECTORY_ENTRIES_BYTES = 2;
function isEXIF(input) {
  return toHexString(input, 2, 6) === EXIF_MARKER;
}
function extractSize(input, index) {
  return {
    height: readUInt16BE(input, index),
    width: readUInt16BE(input, index + 2)
  };
}
function extractOrientation(exifBlock, isBigEndian) {
  const idfOffset = 8;
  const offset = EXIF_HEADER_BYTES + idfOffset;
  const idfDirectoryEntries = readUInt(exifBlock, 16, offset, isBigEndian);
  for (let directoryEntryNumber = 0; directoryEntryNumber < idfDirectoryEntries; directoryEntryNumber++) {
    const start = offset + NUM_DIRECTORY_ENTRIES_BYTES + directoryEntryNumber * IDF_ENTRY_BYTES;
    const end = start + IDF_ENTRY_BYTES;
    if (start > exifBlock.length) {
      return;
    }
    const block = exifBlock.slice(start, end);
    const tagNumber = readUInt(block, 16, 0, isBigEndian);
    if (tagNumber === 274) {
      const dataFormat = readUInt(block, 16, 2, isBigEndian);
      if (dataFormat !== 3) {
        return;
      }
      const numberOfComponents = readUInt(block, 32, 4, isBigEndian);
      if (numberOfComponents !== 1) {
        return;
      }
      return readUInt(block, 16, 8, isBigEndian);
    }
  }
}
function validateExifBlock(input, index) {
  const exifBlock = input.slice(APP1_DATA_SIZE_BYTES, index);
  const byteAlign = toHexString(
    exifBlock,
    EXIF_HEADER_BYTES,
    EXIF_HEADER_BYTES + TIFF_BYTE_ALIGN_BYTES
  );
  const isBigEndian = byteAlign === BIG_ENDIAN_BYTE_ALIGN;
  const isLittleEndian = byteAlign === LITTLE_ENDIAN_BYTE_ALIGN;
  if (isBigEndian || isLittleEndian) {
    return extractOrientation(exifBlock, isBigEndian);
  }
}
function validateInput(input, index) {
  if (index > input.length) {
    throw new TypeError("Corrupt JPG, exceeded buffer limits");
  }
}
const JPG = {
  validate: (input) => toHexString(input, 0, 2) === "ffd8",
  calculate(input) {
    input = input.slice(4);
    let orientation;
    let next;
    while (input.length) {
      const i = readUInt16BE(input, 0);
      if (input[i] !== 255) {
        input = input.slice(1);
        continue;
      }
      if (isEXIF(input)) {
        orientation = validateExifBlock(input, i);
      }
      validateInput(input, i);
      next = input[i + 1];
      if (next === 192 || next === 193 || next === 194) {
        const size = extractSize(input, i + 5);
        if (!orientation) {
          return size;
        }
        return {
          height: size.height,
          orientation,
          width: size.width
        };
      }
      input = input.slice(i + 2);
    }
    throw new TypeError("Invalid JPG, no size found");
  }
};

const KTX = {
  validate: (input) => {
    const signature = toUTF8String(input, 1, 7);
    return ["KTX 11", "KTX 20"].includes(signature);
  },
  calculate: (input) => {
    const type = input[5] === 49 ? "ktx" : "ktx2";
    const offset = type === "ktx" ? 36 : 20;
    return {
      height: readUInt32LE(input, offset + 4),
      width: readUInt32LE(input, offset),
      type
    };
  }
};

const pngSignature = "PNG\r\n\n";
const pngImageHeaderChunkName = "IHDR";
const pngFriedChunkName = "CgBI";
const PNG = {
  validate(input) {
    if (pngSignature === toUTF8String(input, 1, 8)) {
      let chunkName = toUTF8String(input, 12, 16);
      if (chunkName === pngFriedChunkName) {
        chunkName = toUTF8String(input, 28, 32);
      }
      if (chunkName !== pngImageHeaderChunkName) {
        throw new TypeError("Invalid PNG");
      }
      return true;
    }
    return false;
  },
  calculate(input) {
    if (toUTF8String(input, 12, 16) === pngFriedChunkName) {
      return {
        height: readUInt32BE(input, 36),
        width: readUInt32BE(input, 32)
      };
    }
    return {
      height: readUInt32BE(input, 20),
      width: readUInt32BE(input, 16)
    };
  }
};

const PNMTypes = {
  P1: "pbm/ascii",
  P2: "pgm/ascii",
  P3: "ppm/ascii",
  P4: "pbm",
  P5: "pgm",
  P6: "ppm",
  P7: "pam",
  PF: "pfm"
};
const handlers = {
  default: (lines) => {
    let dimensions = [];
    while (lines.length > 0) {
      const line = lines.shift();
      if (line[0] === "#") {
        continue;
      }
      dimensions = line.split(" ");
      break;
    }
    if (dimensions.length === 2) {
      return {
        height: parseInt(dimensions[1], 10),
        width: parseInt(dimensions[0], 10)
      };
    } else {
      throw new TypeError("Invalid PNM");
    }
  },
  pam: (lines) => {
    const size = {};
    while (lines.length > 0) {
      const line = lines.shift();
      if (line.length > 16 || line.charCodeAt(0) > 128) {
        continue;
      }
      const [key, value] = line.split(" ");
      if (key && value) {
        size[key.toLowerCase()] = parseInt(value, 10);
      }
      if (size.height && size.width) {
        break;
      }
    }
    if (size.height && size.width) {
      return {
        height: size.height,
        width: size.width
      };
    } else {
      throw new TypeError("Invalid PAM");
    }
  }
};
const PNM = {
  validate: (input) => toUTF8String(input, 0, 2) in PNMTypes,
  calculate(input) {
    const signature = toUTF8String(input, 0, 2);
    const type = PNMTypes[signature];
    const lines = toUTF8String(input, 3).split(/[\r\n]+/);
    const handler = handlers[type] || handlers.default;
    return handler(lines);
  }
};

const PSD = {
  validate: (input) => toUTF8String(input, 0, 4) === "8BPS",
  calculate: (input) => ({
    height: readUInt32BE(input, 14),
    width: readUInt32BE(input, 18)
  })
};

const svgReg = /<svg\s([^>"']|"[^"]*"|'[^']*')*>/;
const extractorRegExps = {
  height: /\sheight=(['"])([^%]+?)\1/,
  root: svgReg,
  viewbox: /\sviewBox=(['"])(.+?)\1/i,
  width: /\swidth=(['"])([^%]+?)\1/
};
const INCH_CM = 2.54;
const units = {
  in: 96,
  cm: 96 / INCH_CM,
  em: 16,
  ex: 8,
  m: 96 / INCH_CM * 100,
  mm: 96 / INCH_CM / 10,
  pc: 96 / 72 / 12,
  pt: 96 / 72,
  px: 1
};
const unitsReg = new RegExp(
  `^([0-9.]+(?:e\\d+)?)(${Object.keys(units).join("|")})?$`
);
function parseLength(len) {
  const m = unitsReg.exec(len);
  if (!m) {
    return void 0;
  }
  return Math.round(Number(m[1]) * (units[m[2]] || 1));
}
function parseViewbox(viewbox) {
  const bounds = viewbox.split(" ");
  return {
    height: parseLength(bounds[3]),
    width: parseLength(bounds[2])
  };
}
function parseAttributes(root) {
  const width = root.match(extractorRegExps.width);
  const height = root.match(extractorRegExps.height);
  const viewbox = root.match(extractorRegExps.viewbox);
  return {
    height: height && parseLength(height[2]),
    viewbox: viewbox && parseViewbox(viewbox[2]),
    width: width && parseLength(width[2])
  };
}
function calculateByDimensions(attrs) {
  return {
    height: attrs.height,
    width: attrs.width
  };
}
function calculateByViewbox(attrs, viewbox) {
  const ratio = viewbox.width / viewbox.height;
  if (attrs.width) {
    return {
      height: Math.floor(attrs.width / ratio),
      width: attrs.width
    };
  }
  if (attrs.height) {
    return {
      height: attrs.height,
      width: Math.floor(attrs.height * ratio)
    };
  }
  return {
    height: viewbox.height,
    width: viewbox.width
  };
}
const SVG = {
  // Scan only the first kilo-byte to speed up the check on larger files
  validate: (input) => svgReg.test(toUTF8String(input, 0, 1e3)),
  calculate(input) {
    const root = toUTF8String(input).match(extractorRegExps.root);
    if (root) {
      const attrs = parseAttributes(root[0]);
      if (attrs.width && attrs.height) {
        return calculateByDimensions(attrs);
      }
      if (attrs.viewbox) {
        return calculateByViewbox(attrs, attrs.viewbox);
      }
    }
    throw new TypeError("Invalid SVG");
  }
};

const TGA = {
  validate(input) {
    return readUInt16LE(input, 0) === 0 && readUInt16LE(input, 4) === 0;
  },
  calculate(input) {
    return {
      height: readUInt16LE(input, 14),
      width: readUInt16LE(input, 12)
    };
  }
};

function readIFD(input, isBigEndian) {
  const ifdOffset = readUInt(input, 32, 4, isBigEndian);
  return input.slice(ifdOffset + 2);
}
function readValue(input, isBigEndian) {
  const low = readUInt(input, 16, 8, isBigEndian);
  const high = readUInt(input, 16, 10, isBigEndian);
  return (high << 16) + low;
}
function nextTag(input) {
  if (input.length > 24) {
    return input.slice(12);
  }
}
function extractTags(input, isBigEndian) {
  const tags = {};
  let temp = input;
  while (temp && temp.length) {
    const code = readUInt(temp, 16, 0, isBigEndian);
    const type = readUInt(temp, 16, 2, isBigEndian);
    const length = readUInt(temp, 32, 4, isBigEndian);
    if (code === 0) {
      break;
    } else {
      if (length === 1 && (type === 3 || type === 4)) {
        tags[code] = readValue(temp, isBigEndian);
      }
      temp = nextTag(temp);
    }
  }
  return tags;
}
function determineEndianness(input) {
  const signature = toUTF8String(input, 0, 2);
  if ("II" === signature) {
    return "LE";
  } else if ("MM" === signature) {
    return "BE";
  }
}
const signatures = [
  // '492049', // currently not supported
  "49492a00",
  // Little endian
  "4d4d002a"
  // Big Endian
  // '4d4d002a', // BigTIFF > 4GB. currently not supported
];
const TIFF = {
  validate: (input) => signatures.includes(toHexString(input, 0, 4)),
  calculate(input) {
    const isBigEndian = determineEndianness(input) === "BE";
    const ifdBuffer = readIFD(input, isBigEndian);
    const tags = extractTags(ifdBuffer, isBigEndian);
    const width = tags[256];
    const height = tags[257];
    if (!width || !height) {
      throw new TypeError("Invalid Tiff. Missing tags");
    }
    return { height, width };
  }
};

function calculateExtended(input) {
  return {
    height: 1 + readUInt24LE(input, 7),
    width: 1 + readUInt24LE(input, 4)
  };
}
function calculateLossless(input) {
  return {
    height: 1 + ((input[4] & 15) << 10 | input[3] << 2 | (input[2] & 192) >> 6),
    width: 1 + ((input[2] & 63) << 8 | input[1])
  };
}
function calculateLossy(input) {
  return {
    height: readInt16LE(input, 8) & 16383,
    width: readInt16LE(input, 6) & 16383
  };
}
const WEBP = {
  validate(input) {
    const riffHeader = "RIFF" === toUTF8String(input, 0, 4);
    const webpHeader = "WEBP" === toUTF8String(input, 8, 12);
    const vp8Header = "VP8" === toUTF8String(input, 12, 15);
    return riffHeader && webpHeader && vp8Header;
  },
  calculate(input) {
    const chunkHeader = toUTF8String(input, 12, 16);
    input = input.slice(20, 30);
    if (chunkHeader === "VP8X") {
      const extendedHeader = input[0];
      const validStart = (extendedHeader & 192) === 0;
      const validEnd = (extendedHeader & 1) === 0;
      if (validStart && validEnd) {
        return calculateExtended(input);
      } else {
        throw new TypeError("Invalid WebP");
      }
    }
    if (chunkHeader === "VP8 " && input[0] !== 47) {
      return calculateLossy(input);
    }
    const signature = toHexString(input, 3, 6);
    if (chunkHeader === "VP8L" && signature !== "9d012a") {
      return calculateLossless(input);
    }
    throw new TypeError("Invalid WebP");
  }
};

const typeHandlers = /* @__PURE__ */ new Map([
  ["bmp", BMP],
  ["cur", CUR],
  ["dds", DDS],
  ["gif", GIF],
  ["heif", HEIF],
  ["icns", ICNS],
  ["ico", ICO],
  ["j2c", J2C],
  ["jp2", JP2],
  ["jpg", JPG],
  ["ktx", KTX],
  ["png", PNG],
  ["pnm", PNM],
  ["psd", PSD],
  ["svg", SVG],
  ["tga", TGA],
  ["tiff", TIFF],
  ["webp", WEBP]
]);
const types = Array.from(typeHandlers.keys());

const firstBytes = /* @__PURE__ */ new Map([
  [56, "psd"],
  [66, "bmp"],
  [68, "dds"],
  [71, "gif"],
  [73, "tiff"],
  [77, "tiff"],
  [82, "webp"],
  [105, "icns"],
  [137, "png"],
  [255, "jpg"]
]);
function detector(input) {
  const byte = input[0];
  const type = firstBytes.get(byte);
  if (type && typeHandlers.get(type).validate(input)) {
    return type;
  }
  return types.find((fileType) => typeHandlers.get(fileType).validate(input));
}

const globalOptions = {
  disabledTypes: []
};
function lookup(input) {
  const type = detector(input);
  if (typeof type !== "undefined") {
    if (globalOptions.disabledTypes.indexOf(type) > -1) {
      throw new TypeError("disabled file type: " + type);
    }
    const size = typeHandlers.get(type).calculate(input);
    if (size !== void 0) {
      size.type = size.type ?? type;
      return size;
    }
  }
  throw new TypeError("unsupported file type: " + type);
}

async function probe(url) {
  const response = await fetch(url);
  if (!response.body || !response.ok) {
    throw new Error("Failed to fetch image");
  }
  const reader = response.body.getReader();
  let done, value;
  let accumulatedChunks = new Uint8Array();
  while (!done) {
    const readResult = await reader.read();
    done = readResult.done;
    if (done)
      break;
    if (readResult.value) {
      value = readResult.value;
      let tmp = new Uint8Array(accumulatedChunks.length + value.length);
      tmp.set(accumulatedChunks, 0);
      tmp.set(value, accumulatedChunks.length);
      accumulatedChunks = tmp;
      try {
        const dimensions = lookup(accumulatedChunks);
        if (dimensions) {
          await reader.cancel();
          return dimensions;
        }
      } catch (error) {
      }
    }
  }
  throw new Error("Failed to parse the size");
}

async function getConfiguredImageService() {
  if (!globalThis?.astroAsset?.imageService) {
    const { default: service } = await import(
      // @ts-expect-error
      '../astro/assets-service_n3Fzkd-j.mjs'
    ).then(n => n.s).catch((e) => {
      const error = new AstroError(InvalidImageService);
      error.cause = e;
      throw error;
    });
    if (!globalThis.astroAsset)
      globalThis.astroAsset = {};
    globalThis.astroAsset.imageService = service;
    return service;
  }
  return globalThis.astroAsset.imageService;
}
async function getImage$1(options, imageConfig) {
  if (!options || typeof options !== "object") {
    throw new AstroError({
      ...ExpectedImageOptions,
      message: ExpectedImageOptions.message(JSON.stringify(options))
    });
  }
  if (typeof options.src === "undefined") {
    throw new AstroError({
      ...ExpectedImage,
      message: ExpectedImage.message(
        options.src,
        "undefined",
        JSON.stringify(options)
      )
    });
  }
  const service = await getConfiguredImageService();
  const resolvedOptions = {
    ...options,
    src: await resolveSrc(options.src)
  };
  if (options.inferSize && isRemoteImage(resolvedOptions.src)) {
    try {
      const result = await probe(resolvedOptions.src);
      resolvedOptions.width ??= result.width;
      resolvedOptions.height ??= result.height;
      delete resolvedOptions.inferSize;
    } catch {
      throw new AstroError({
        ...FailedToFetchRemoteImageDimensions,
        message: FailedToFetchRemoteImageDimensions.message(resolvedOptions.src)
      });
    }
  }
  const originalFilePath = isESMImportedImage(resolvedOptions.src) ? resolvedOptions.src.fsPath : void 0;
  const clonedSrc = isESMImportedImage(resolvedOptions.src) ? (
    // @ts-expect-error - clone is a private, hidden prop
    resolvedOptions.src.clone ?? resolvedOptions.src
  ) : resolvedOptions.src;
  resolvedOptions.src = clonedSrc;
  const validatedOptions = service.validateOptions ? await service.validateOptions(resolvedOptions, imageConfig) : resolvedOptions;
  const srcSetTransforms = service.getSrcSet ? await service.getSrcSet(validatedOptions, imageConfig) : [];
  let imageURL = await service.getURL(validatedOptions, imageConfig);
  let srcSets = await Promise.all(
    srcSetTransforms.map(async (srcSet) => ({
      transform: srcSet.transform,
      url: await service.getURL(srcSet.transform, imageConfig),
      descriptor: srcSet.descriptor,
      attributes: srcSet.attributes
    }))
  );
  if (isLocalService(service) && globalThis.astroAsset.addStaticImage && !(isRemoteImage(validatedOptions.src) && imageURL === validatedOptions.src)) {
    const propsToHash = service.propertiesToHash ?? DEFAULT_HASH_PROPS;
    imageURL = globalThis.astroAsset.addStaticImage(
      validatedOptions,
      propsToHash,
      originalFilePath
    );
    srcSets = srcSetTransforms.map((srcSet) => ({
      transform: srcSet.transform,
      url: globalThis.astroAsset.addStaticImage(srcSet.transform, propsToHash, originalFilePath),
      descriptor: srcSet.descriptor,
      attributes: srcSet.attributes
    }));
  }
  return {
    rawOptions: resolvedOptions,
    options: validatedOptions,
    src: imageURL,
    srcSet: {
      values: srcSets,
      attribute: srcSets.map((srcSet) => `${srcSet.url} ${srcSet.descriptor}`).join(", ")
    },
    attributes: service.getHTMLAttributes !== void 0 ? await service.getHTMLAttributes(validatedOptions, imageConfig) : {}
  };
}

const $$Astro$d = createAstro("https://www.robbywebb.com");
const $$Image = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$Image;
  const props = Astro2.props;
  if (props.alt === void 0 || props.alt === null) {
    throw new AstroError(ImageMissingAlt);
  }
  if (typeof props.width === "string") {
    props.width = parseInt(props.width);
  }
  if (typeof props.height === "string") {
    props.height = parseInt(props.height);
  }
  const image = await getImage(props);
  const additionalAttributes = {};
  if (image.srcSet.values.length > 0) {
    additionalAttributes.srcset = image.srcSet.attribute;
  }
  return renderTemplate`${maybeRenderHead()}<img${addAttribute(image.src, "src")}${spreadAttributes(additionalAttributes)}${spreadAttributes(image.attributes)}>`;
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/node_modules/astro/components/Image.astro", void 0);

const $$Astro$c = createAstro("https://www.robbywebb.com");
const $$Picture = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$Picture;
  const defaultFormats = ["webp"];
  const defaultFallbackFormat = "png";
  const specialFormatsFallback = ["gif", "svg", "jpg", "jpeg"];
  const { formats = defaultFormats, pictureAttributes = {}, fallbackFormat, ...props } = Astro2.props;
  if (props.alt === void 0 || props.alt === null) {
    throw new AstroError(ImageMissingAlt);
  }
  const originalSrc = await resolveSrc(props.src);
  const optimizedImages = await Promise.all(
    formats.map(
      async (format) => await getImage({
        ...props,
        src: originalSrc,
        format,
        widths: props.widths,
        densities: props.densities
      })
    )
  );
  let resultFallbackFormat = fallbackFormat ?? defaultFallbackFormat;
  if (!fallbackFormat && isESMImportedImage(originalSrc) && specialFormatsFallback.includes(originalSrc.format)) {
    resultFallbackFormat = originalSrc.format;
  }
  const fallbackImage = await getImage({
    ...props,
    format: resultFallbackFormat,
    widths: props.widths,
    densities: props.densities
  });
  const imgAdditionalAttributes = {};
  const sourceAdditionalAttributes = {};
  if (props.sizes) {
    sourceAdditionalAttributes.sizes = props.sizes;
  }
  if (fallbackImage.srcSet.values.length > 0) {
    imgAdditionalAttributes.srcset = fallbackImage.srcSet.attribute;
  }
  return renderTemplate`${maybeRenderHead()}<picture${spreadAttributes(pictureAttributes)}> ${Object.entries(optimizedImages).map(([_, image]) => {
    const srcsetAttribute = props.densities || !props.densities && !props.widths ? `${image.src}${image.srcSet.values.length > 0 ? ", " + image.srcSet.attribute : ""}` : image.srcSet.attribute;
    return renderTemplate`<source${addAttribute(srcsetAttribute, "srcset")}${addAttribute("image/" + image.options.format, "type")}${spreadAttributes(sourceAdditionalAttributes)}>`;
  })} <img${addAttribute(fallbackImage.src, "src")}${spreadAttributes(imgAdditionalAttributes)}${spreadAttributes(fallbackImage.attributes)}> </picture>`;
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/node_modules/astro/components/Picture.astro", void 0);

const imageConfig = {"service":{"entrypoint":"astro/assets/services/sharp","config":{}},"domains":[],"remotePatterns":[]};
					const getImage = async (options) => await getImage$1(options, imageConfig);

const sanityClient = createClient(
            {"apiVersion":"v2023-08-24","projectId":"o6m55439","dataset":"production","useCdn":true}
          );

globalThis.sanityClient = sanityClient;

const icons = {"local":{"prefix":"local","lastModified":1713888935,"icons":{"arrow-top-right":{"body":"<path fill=\"none\" d=\"m11 1.325-10 10m10-10H2m9 0v9\"/>","width":12,"height":13},"close":{"body":"<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M6 18 18 6M6 6l12 12\"/>","width":24,"height":24},"corner-dashed":{"body":"<path fill=\"currentColor\" d=\"M1.14 19.3C.92 18 .7 16.89.6 15.78a16.16 16.16 0 0 1 0-3.11c0-.21.74-.53 1.09-.49s1 .47 1 .72c-.08 1.82-.26 3.64-.41 5.47a3.66 3.66 0 0 1-.09.94c0 .13-.41.23-.62.22s-.41-.22-.43-.23m.51 5.05c.72.25.67.8.7 1.26a20.45 20.45 0 0 1-.16 3 12 12 0 0 0-.27 2.05c0 .5-.19.76-.82.91-.08 0-.28-.08-.29-.14-.27-1.63-.2-3.14-.46-4.77 0-.33-.15-.64-.23-1-.12-.59.51-1.32 1.53-1.31zM1.38 6.08c-.11-1-.16-2.54-.24-3.21A10.16 10.16 0 0 1 1 .91c0-.32.39-.66.69-.9.09-.07.48.17.74.27 1.02.41.57 1.2.57 1.9s-.45 2.71-.43 3.45-.21 1-1.09.62c-.11-.05-.15-.25-.1-.17zM.91 55.87c-.26-1.26-.53-2.4-.68-3.55a17 17 0 0 1-.17-3.11c0-.2.72-.55 1.08-.53s1 .44 1 .68c0 .91 0 1.83-.07 2.74l-.13 2.61a3.12 3.12 0 0 1-.05.91c0 .13-.4.33-.61.38s-.35-.12-.37-.13zm.82 4.73c.74-.23.78.28.93.68a8.48 8.48 0 0 0 1.19 2.51A2.78 2.78 0 0 0 5.29 65c.48.1.55.38.3 1a.57.57 0 0 1-.29.22 5.07 5.07 0 0 1-4-2.57c-.19-.27-.39-.52-.56-.79-.37-.53 0-1.64.99-2.26zm-1.09-18c-.15-1-.26-2.53-.36-3.2a10.18 10.18 0 0 1-.28-2c0-.32.37-.67.66-.92.09-.07.49.15.75.24 1.08.37.69 1.18.7 1.88s-.34 2.72-.29 3.47-.17 1-1.06.66c-.13-.01-.18-.23-.12-.13zm29.19 22.99c-1.3.29-2.38.59-3.48.77a17.81 17.81 0 0 1-3.09.25c-.21 0-.58-.7-.57-1s.41-1 .65-1c1.83-.05 3.66 0 5.49 0a3.35 3.35 0 0 1 1 0c.13 0 .26.4.25.61s-.24.35-.25.37zm5.01-.81c.2-.73.76-.72 1.22-.77a19 19 0 0 1 3 0 12.19 12.19 0 0 0 2.07.16c.5-.06.76.16 1 .78a.38.38 0 0 1-.12.3c-1.62.34-3.13.36-4.74.7a9.53 9.53 0 0 0-1 .29c-.62.18-1.38-.44-1.43-1.46zm-18.21 1.48c-.47.09-1.09.18-1.7.27l-1.58.22a12.35 12.35 0 0 1-2.13.37c-.35 0-.64-.35-.8-.63-.05-.09.29-.5.44-.76.66-1.11 1.28-.75 1.94-.79s2.5.24 3.29.16 1 .13.7 1c-.04.17-.26.22-.16.16zm49.68-2.01c-1.29.29-2.38.59-3.47.77a18 18 0 0 1-3.1.25c-.2 0-.58-.69-.56-1s.4-1 .64-1c1.83-.05 3.66 0 5.5 0a3.35 3.35 0 0 1 1 0c.13 0 .25.4.25.61a.61.61 0 0 1-.26.37zm5.02-.81c.2-.73.75-.71 1.22-.77a19 19 0 0 1 3 0 12.07 12.07 0 0 0 2.06.16c.5-.06.77.16 1 .78a.38.38 0 0 1-.13.3c-1.61.35-3.13.36-4.74.7-.32.07-.63.19-1 .29-.6.18-1.37-.44-1.41-1.46zm-18.21 1.48c-.94.19-2.52.36-3.19.49a10.85 10.85 0 0 1-1.94.36c-.32 0-.68-.34-.94-.62-.08-.09.12-.5.2-.76.32-1.1 1.15-.74 1.85-.78s2.74.23 3.48.15 1 .13.7 1c-.04.17-.28.24-.16.16zm49.68-2.01c-1.3.29-2.38.59-3.48.77a18.86 18.86 0 0 1-3.09.26c-.21 0-.58-.7-.57-1.06s.41-1 .65-1h5.49a3.35 3.35 0 0 1 1 0c.13 0 .26.4.26.61a.73.73 0 0 1-.26.42m5.01-.81c.21-.73.76-.71 1.22-.77a19.15 19.15 0 0 1 3 0 13.21 13.21 0 0 0 2.06.17c.5-.07.77.15.95.77a.38.38 0 0 1-.12.3c-1.62.35-3.13.36-4.74.7-.32.07-.64.19-.95.29-.61.18-1.37-.44-1.42-1.46M89.6 63.58c-.94.19-2.52.36-3.18.49a11 11 0 0 1-1.94.36c-.32 0-.69-.34-1-.62-.08-.09.13-.5.2-.76.33-1.1 1.16-.74 1.86-.78s2.73.23 3.47.15 1 .13.7 1c.01.17-.21.23-.11.16z\"/>","width":115.07,"height":67.12},"instagram":{"body":"<path fill=\"none\" d=\"M13.5 4.825v.01M1 5.325a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4v-8m5 4a3 3 0 1 0 6 0 3 3 0 0 0-6 0\"/>"},"link":{"body":"<path fill=\"none\" stroke=\"#354052\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"m6 12.326 6-6m-4-3 .463-.537a5 5 0 0 1 7.071 7.072l-.534.464m-5 5-.397.535a5.068 5.068 0 0 1-7.127 0 4.972 4.972 0 0 1 0-7.071L3 8.326\"/>"},"logo":{"body":"<style>.st0{fill:var(--color-pink)}</style><path d=\"M63.35 71.99v85.59H49.86v-1.84h11.65V71.99z\" class=\"st0\"/><path d=\"M106.35 87.77c-.06.76-.63 1.37-1.39 1.48l-62.34.26h-1.86l-22.5.01-4.84 2.07-.94-1.59 5.16-2.26.18-.02 22.93-.07h1.86l61.06-.08-19.8-17.95-.23-.07.53-1.77 3.41 1.02 17.61 17.3c.69.61 1.21.9 1.16 1.67m-1.44-20-.53 1.77.23.07c1.23-.28 2.47-.56 3.71-.82zm-43.4 4.88c.61.21 1.22.41 1.84.6v-1.26h-1.84z\" class=\"st0\"/><path d=\"M123.96 65.04c-.18.7-.75 1.2-1.46 1.28-4.73.54-9.48 1.46-14.18 2.47l-3.41-1.02-.53 1.77.23.07c-.73.16-1.45.32-2.17.48-11.74 2.64-23.88 5.38-36.02 3.83-1.06-.14-2.08-.38-3.07-.68v-1.26h-1.84v.66c-.22-.08-.43-.16-.66-.24-2.18-.77-4.24-1.5-6.44-1.5h-.04c-3.86.01-7.92 1.48-11.84 2.9-2.77 1-5.64 2.05-8.45 2.57-1.98.37-3.91.56-5.74.56-6.02 0-11.04-1.97-13.98-5.64-3.35-4.18-3.96-10.67-1.53-16.54 2.39-5.8 7.03-11.4 13.81-16.61 3.33-2.57 6.04-5.2 8.27-8.05.38-.49.78-.97 1.19-1.45 1.64-1.96 3.19-3.81 3.11-6.14-.11-2.84-3.14-6.82-6.09-6.99-2.8-.16-5.12 2.18-5.82 3.31-.64 1.06-.71 2.05-1.19 2.96-.55 1.03-1.16 1.83-2.09 2.79-1.1 1.13-2.59 1.58-3.29 2.1-.78.58-1.41 1.05-2.19 2.46-.39.72-.48 4.5-.31 7.45.02.41.03 1.07.04 1.8.01.96.02 2.04.07 2.93.04.61-.31 1.15-.88 1.38-.56.23-1.2.07-1.59-.38-1.48-1.71-6.33-7.68-6.85-12.59-.19-1.79 1.48-5.9 2.31-7.61.57-1.18.6-2.72.63-4.36.04-2.05.08-4.16 1.23-5.82C15.33 8.88 19 7.24 24.41 6.98c5.35-.26 11.35 1.26 15.65 3.96 4.88 3.06 7.86 8.33 7.59 13.41-.29 5.54-4.09 10.73-11.63 15.84-.58.4-1.18.79-1.77 1.19-4.79 3.19-9.74 6.49-12 11.55-.68 1.55-2.03 5.5.29 8.82.68.97 1.62 1.7 2.66 2.07 1.38.49 2.75.38 4.08-.31 1.99-1.04 3.74-3.4 4.47-6.02.28-1.02.53-1.99.78-2.94.71-2.7 1.38-5.25 2.55-8.56 1.23-3.47 8.75-13.3 15.5-15.17 7.46-2.07 15.27-1.59 22.58 1.4 7.21 2.94 13.7 7.39 19.96 11.69l28.14 19.31c.6.41.87 1.12.7 1.82\" class=\"st0\"/><path fill=\"var(--color-white)\" d=\"M160.98 89.18h-16.04l-9.69-17.87c-1.22-2.06-3.15-3.1-5.8-3.1H125v20.97h-14.37V33.19h26.68c6.78 0 11.87 1.47 15.29 4.41 3.41 2.94 5.12 7.19 5.12 12.75 0 4.24-1.17 7.82-3.49 10.76-2.33 2.94-5.61 4.91-9.85 5.92 3.23.69 5.8 2.78 7.7 6.27zm-19.02-33.44c1.4-1 2.1-2.65 2.1-4.92 0-2.33-.7-4.01-2.1-5.04-1.4-1.03-3.72-1.55-6.95-1.55h-10.17v13.02h10.17c3.23 0 5.54-.5 6.95-1.51m31.75 30.62c-4.21-2.36-7.45-5.69-9.73-10.01-2.28-4.31-3.41-9.38-3.41-15.21 0-5.82 1.14-10.89 3.41-15.21 2.28-4.31 5.52-7.64 9.73-9.97 4.21-2.33 9.17-3.49 14.89-3.49s10.68 1.17 14.89 3.49c4.21 2.33 7.44 5.65 9.69 9.97 2.25 4.32 3.37 9.38 3.37 15.21 0 5.82-1.14 10.89-3.41 15.21-2.28 4.32-5.52 7.65-9.73 10.01-4.21 2.36-9.15 3.53-14.81 3.53-5.72 0-10.68-1.17-14.89-3.53m24.82-12.15c2.38-2.99 3.57-7.35 3.57-13.06 0-5.72-1.2-10.06-3.61-13.02-2.41-2.96-5.71-4.45-9.89-4.45-4.24 0-7.55 1.47-9.93 4.41-2.38 2.94-3.57 7.29-3.57 13.06 0 5.77 1.19 10.14 3.57 13.1 2.38 2.97 5.69 4.45 9.93 4.45 4.23 0 7.54-1.5 9.93-4.49m69.6-9.06c1.75 2.36 2.62 5.26 2.62 8.7 0 3.07-.81 5.76-2.42 8.06-1.62 2.3-3.92 4.09-6.91 5.36-2.99 1.27-6.5 1.91-10.52 1.91h-27.88V33.19h27.08c5.88 0 10.55 1.31 14.02 3.93 3.47 2.62 5.2 6.16 5.2 10.6 0 2.86-.77 5.39-2.3 7.58-1.54 2.2-3.68 3.8-6.43 4.8 3.27 1.02 5.79 2.7 7.54 5.05m-30.9-9.96h10.4c2.75 0 4.76-.42 6.04-1.27 1.27-.85 1.91-2.2 1.91-4.05 0-1.96-.64-3.39-1.91-4.29-1.27-.9-3.28-1.35-6.04-1.35h-10.4zm18.07 21.56c1.24-.93 1.87-2.45 1.87-4.57s-.62-3.64-1.87-4.57c-1.24-.93-3.32-1.39-6.23-1.39h-11.83v11.91h11.83c2.91.01 4.99-.45 6.23-1.38m69.12-11.6c1.75 2.36 2.62 5.26 2.62 8.7 0 3.07-.81 5.76-2.42 8.06-1.62 2.3-3.92 4.09-6.91 5.36-2.99 1.27-6.5 1.91-10.52 1.91h-27.88V33.19h27.08c5.88 0 10.55 1.31 14.02 3.93 3.47 2.62 5.2 6.16 5.2 10.6 0 2.86-.77 5.39-2.3 7.58-1.54 2.2-3.68 3.8-6.43 4.8 3.28 1.02 5.79 2.7 7.54 5.05m-30.9-9.96h10.4c2.75 0 4.76-.42 6.04-1.27 1.27-.85 1.91-2.2 1.91-4.05 0-1.96-.64-3.39-1.91-4.29-1.27-.9-3.28-1.35-6.04-1.35h-10.4zm18.07 21.56c1.24-.93 1.87-2.45 1.87-4.57s-.62-3.64-1.87-4.57c-1.24-.93-3.32-1.39-6.23-1.39h-11.83v11.91h11.83c2.91.01 4.99-.45 6.23-1.38m50.23-12.51v24.94h-14.61V64.24L323.7 33.19h16.44l14.3 19.46 14.45-19.46h16.6z\"/><path d=\"M166.28 98.05 145 157.58h-12.33l-12.58-35.72-12.75 35.72H94.93L73.74 98.05h15.79l12.33 37.74 13.34-37.74h10.72l12.75 38.42 12.92-38.42h14.69zm4.17 0h42.3v11.99h-27.19v11.32h25.5v11.91h-25.5v12.33h27.19v11.99h-42.3zm100.7 33.99c1.86 2.51 2.79 5.59 2.79 9.25 0 3.27-.86 6.12-2.58 8.57-1.72 2.45-4.17 4.35-7.35 5.7-3.18 1.35-6.91 2.03-11.19 2.03h-29.64V98.05h28.79c6.25 0 11.22 1.39 14.9 4.18 3.69 2.79 5.53 6.54 5.53 11.27 0 3.04-.82 5.73-2.45 8.06-1.63 2.34-3.91 4.04-6.84 5.11 3.51 1.08 6.19 2.86 8.04 5.37m-32.84-10.6h11.06c2.93 0 5.07-.45 6.42-1.35 1.35-.9 2.03-2.34 2.03-4.31 0-2.08-.68-3.6-2.03-4.56-1.35-.96-3.49-1.44-6.42-1.44h-11.06zm19.21 22.93c1.32-.98 1.98-2.6 1.98-4.86 0-2.25-.66-3.87-1.98-4.85-1.32-.98-3.53-1.48-6.63-1.48h-12.58v12.67h12.58c3.09-.01 5.3-.5 6.63-1.48m69.75-12.33c1.86 2.51 2.79 5.59 2.79 9.25 0 3.27-.86 6.12-2.58 8.57-1.72 2.45-4.17 4.35-7.35 5.7-3.18 1.35-6.91 2.03-11.19 2.03H279.3V98.05h28.79c6.25 0 11.22 1.39 14.9 4.18 3.69 2.79 5.53 6.54 5.53 11.27 0 3.04-.82 5.73-2.45 8.06-1.63 2.34-3.91 4.04-6.84 5.11 3.51 1.08 6.18 2.86 8.04 5.37m-32.85-10.6h11.06c2.93 0 5.07-.45 6.42-1.35 1.35-.9 2.03-2.34 2.03-4.31 0-2.08-.68-3.6-2.03-4.56-1.35-.96-3.49-1.44-6.42-1.44h-11.06zm19.21 22.93c1.32-.98 1.98-2.6 1.98-4.86 0-2.25-.66-3.87-1.98-4.85-1.32-.98-3.53-1.48-6.63-1.48h-12.58v12.67H307c3.1-.01 5.31-.5 6.63-1.48\" class=\"st0\"/>","width":385.49,"height":163.57},"logo-old":{"body":"<g fill=\"none\"><path fill=\"#fff\" d=\"M15.114 83.5 2.97 49.66h9.024l7.056 21.216 7.632-21.216h6.24l7.296 21.648L47.61 49.66h8.496L43.866 83.5H36.81l-7.248-20.352L22.17 83.5zm43.58 0V49.66H82.6v6.816H67.143v6.432h14.352v6.816H67.143v6.96h15.456V83.5H58.695m28.525 0V49.66h16.32c3.648 0 6.464.8 8.448 2.4 2.016 1.568 3.024 3.68 3.024 6.336 0 1.76-.448 3.296-1.344 4.608-.864 1.312-2.08 2.288-3.648 2.928 1.888.576 3.344 1.552 4.368 2.928 1.024 1.344 1.536 3.024 1.536 5.04 0 2.976-1.072 5.328-3.216 7.056-2.112 1.696-5.008 2.544-8.688 2.544h-16.8m8.448-20.4h6.288c1.6 0 2.768-.288 3.504-.864.768-.576 1.152-1.456 1.152-2.64 0-1.184-.384-2.048-1.152-2.592-.736-.576-1.904-.864-3.504-.864h-6.288v6.96m0 13.92h7.152c1.632 0 2.816-.304 3.552-.912.768-.64 1.152-1.584 1.152-2.832 0-1.248-.384-2.176-1.152-2.784-.736-.608-1.92-.912-3.552-.912h-7.152v7.44m24.295 6.48V49.66h16.32c3.648 0 6.464.8 8.448 2.4 2.016 1.568 3.024 3.68 3.024 6.336 0 1.76-.448 3.296-1.344 4.608-.864 1.312-2.08 2.288-3.648 2.928 1.888.576 3.344 1.552 4.368 2.928 1.024 1.344 1.536 3.024 1.536 5.04 0 2.976-1.072 5.328-3.216 7.056-2.112 1.696-5.008 2.544-8.688 2.544zm8.448-20.4h6.288c1.6 0 2.768-.288 3.504-.864.768-.576 1.152-1.456 1.152-2.64 0-1.184-.384-2.048-1.152-2.592-.736-.576-1.904-.864-3.504-.864h-6.288zm0 13.92h7.152c1.632 0 2.816-.304 3.552-.912.768-.64 1.152-1.584 1.152-2.832 0-1.248-.384-2.176-1.152-2.784-.736-.608-1.92-.912-3.552-.912h-7.152z\"/><path fill=\"#F49AC2\" d=\"M3.072 48V14.16h16.272c3.84 0 6.8.944 8.88 2.832 2.112 1.856 3.168 4.448 3.168 7.776 0 2.528-.64 4.656-1.92 6.384-1.248 1.696-3.072 2.88-5.472 3.552 1.792.48 3.232 1.712 4.32 3.696L33.6 48h-9.696l-5.856-10.752c-.384-.672-.88-1.152-1.488-1.44-.576-.288-1.248-.432-2.016-.432h-2.64V48H3.072Zm8.832-18.864h5.856c3.488 0 5.232-1.376 5.232-4.128 0-2.72-1.744-4.08-5.232-4.08h-5.856zm40.184 19.392c-3.424 0-6.432-.72-9.024-2.16-2.56-1.472-4.56-3.52-6-6.144-1.44-2.624-2.16-5.68-2.16-9.168 0-3.52.704-6.576 2.112-9.168 1.44-2.624 3.456-4.656 6.048-6.096 2.592-1.44 5.6-2.16 9.024-2.16 3.424 0 6.416.72 8.976 2.16 2.592 1.44 4.608 3.472 6.048 6.096 1.44 2.592 2.16 5.648 2.16 9.168 0 3.488-.72 6.544-2.16 9.168-1.44 2.624-3.456 4.672-6.048 6.144-2.56 1.44-5.552 2.16-8.976 2.16Zm0-7.392c2.496 0 4.448-.88 5.856-2.64 1.44-1.792 2.16-4.272 2.16-7.44s-.704-5.632-2.112-7.392c-1.408-1.76-3.376-2.64-5.904-2.64s-4.496.88-5.904 2.64c-1.408 1.76-2.112 4.224-2.112 7.392s.704 5.648 2.112 7.44c1.408 1.76 3.376 2.64 5.904 2.64M73.527 48V14.16h16.32c3.648 0 6.464.8 8.448 2.4 2.016 1.568 3.024 3.68 3.024 6.336 0 1.76-.448 3.296-1.344 4.608-.864 1.312-2.08 2.288-3.648 2.928 1.888.576 3.344 1.552 4.368 2.928 1.024 1.344 1.536 3.024 1.536 5.04 0 2.976-1.072 5.328-3.216 7.056C96.903 47.152 94.007 48 90.327 48zm8.448-20.4h6.288c1.6 0 2.768-.288 3.504-.864.768-.576 1.152-1.456 1.152-2.64 0-1.184-.384-2.048-1.152-2.592-.736-.576-1.904-.864-3.504-.864h-6.288zm0 13.92h7.152c1.632 0 2.816-.304 3.552-.912.768-.64 1.152-1.584 1.152-2.832 0-1.248-.384-2.176-1.152-2.784-.736-.608-1.92-.912-3.552-.912h-7.152zM106.27 48V14.16h16.32c3.648 0 6.464.8 8.448 2.4 2.016 1.568 3.024 3.68 3.024 6.336 0 1.76-.448 3.296-1.344 4.608-.864 1.312-2.08 2.288-3.648 2.928 1.888.576 3.344 1.552 4.368 2.928 1.024 1.344 1.536 3.024 1.536 5.04 0 2.976-1.072 5.328-3.216 7.056C129.646 47.152 126.75 48 123.07 48zm8.448-20.4h6.288c1.6 0 2.768-.288 3.504-.864.768-.576 1.152-1.456 1.152-2.64 0-1.184-.384-2.048-1.152-2.592-.736-.576-1.904-.864-3.504-.864h-6.288zm0 13.92h7.152c1.632 0 2.816-.304 3.552-.912.768-.64 1.152-1.584 1.152-2.832 0-1.248-.384-2.176-1.152-2.784-.736-.608-1.92-.912-3.552-.912h-7.152zM146.466 48V33.024L133.458 14.16h10.128l7.44 10.992 7.44-10.992h9.84l-13.008 18.864V48z\"/></g>","width":169,"height":98},"plus":{"body":"<path fill=\"currentColor\" d=\"M8 1.325v14m-7-7h14\"/>","width":16,"height":15}},"width":18,"height":19}};

const cache = /* @__PURE__ */ new WeakMap();

const $$Astro$b = createAstro("https://www.robbywebb.com");
const $$Icon = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$Icon;
  class AstroIconError extends Error {
    constructor(message) {
      super(message);
    }
  }
  const req = Astro2.request;
  const { name = "", title, "is:inline": inline = false, ...props } = Astro2.props;
  const map = cache.get(req) ?? /* @__PURE__ */ new Map();
  const i = map.get(name) ?? 0;
  map.set(name, i + 1);
  cache.set(req, map);
  const includeSymbol = !inline && i === 0;
  let [setName, iconName] = name.split(":");
  if (!setName && iconName) {
    const err = new AstroIconError(`Invalid "name" provided!`);
    throw err;
  }
  if (!iconName) {
    iconName = setName;
    setName = "local";
    if (!icons[setName]) {
      const err = new AstroIconError('Unable to load the "local" icon set!');
      throw err;
    }
    if (!(iconName in icons[setName].icons)) {
      const err = new AstroIconError(`Unable to locate "${name}" icon!`);
      throw err;
    }
  }
  const collection = icons[setName];
  if (!collection) {
    const err = new AstroIconError(`Unable to locate the "${setName}" icon set!`);
    throw err;
  }
  const iconData = getIconData(collection, iconName ?? setName);
  if (!iconData) {
    const err = new AstroIconError(`Unable to locate "${name}" icon!`);
    throw err;
  }
  const id = `ai:${collection.prefix}:${iconName ?? setName}`;
  if (props.size) {
    props.width = props.size;
    props.height = props.size;
    delete props.size;
  }
  const renderData = iconToSVG(iconData);
  const normalizedProps = { ...renderData.attributes, ...props };
  const normalizedBody = renderData.body;
  return renderTemplate`${maybeRenderHead()}<svg${spreadAttributes(normalizedProps)}${addAttribute(name, "data-icon")}> ${title && renderTemplate`<title>${title}</title>`} ${inline ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, { "id": id }, { "default": ($$result2) => renderTemplate`${unescapeHTML(normalizedBody)}` })}` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${includeSymbol && renderTemplate`<symbol${addAttribute(id, "id")}>${unescapeHTML(normalizedBody)}</symbol>`}<use${addAttribute(`#${id}`, "xlink:href")}></use> ` })}`} </svg>`;
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/node_modules/astro-icon/components/Icon.astro", void 0);

const $$Astro$a = createAstro("https://www.robbywebb.com");
const $$SocialIcons = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$SocialIcons;
  return renderTemplate`${maybeRenderHead()}<div class="social-icons astro-dv46nlzh"> <a href="https://www.instagram.com/rwebbdrums/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="astro-dv46nlzh"> ${renderComponent($$result, "Icon", $$Icon, { "name": "instagram", "class": "astro-dv46nlzh" })} </a> </div> `;
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/src/components/SocialIcons.astro", void 0);

const $$Astro$9 = createAstro("https://www.robbywebb.com");
const $$MainContent = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$MainContent;
  const { class: className } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<main${addAttribute([[className, "main-content"], "astro-ftvwmmpp"], "class:list")}> ${renderSlot($$result, $$slots["default"])} ${renderComponent($$result, "SocialIcons", $$SocialIcons, { "class": "astro-ftvwmmpp" })} </main> `;
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/src/components/MainContent.astro", void 0);

const $$Astro$8 = createAstro("https://www.robbywebb.com");
const $$PageHeader = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$PageHeader;
  const { text, class: className } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<h1${addAttribute(className + " astro-yj6ryvpd", "class")}>${text}</h1> `;
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/src/components/text/PageHeader.astro", void 0);

const $$Astro$7 = createAstro("https://www.robbywebb.com");
const $$ViewTransitions = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$ViewTransitions;
  const { fallback = "animate" } = Astro2.props;
  return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>`;
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/node_modules/astro/components/ViewTransitions.astro", void 0);

const $$Astro$6 = createAstro("https://www.robbywebb.com");
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Footer;
  return renderTemplate`${maybeRenderHead()}<footer class="footer astro-sz7xmlte"> <div class="footer-info astro-sz7xmlte"> <p class="astro-sz7xmlte">
Robby Webb &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} </p> <p class="astro-sz7xmlte">
Website by
<a href="https://wavelandweb.com" target="_blank" rel="noopener noreferrer" class="astro-sz7xmlte">
Wave Land Web ${renderComponent($$result, "Icon", $$Icon, { "name": "arrow-top-right", "class": "astro-sz7xmlte" })}</a> </p> </div> </footer> `;
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/src/components/Footer.astro", void 0);

const $$Astro$5 = createAstro("https://www.robbywebb.com");
const $$Logo = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Logo;
  const { class: className } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<a href="/"${addAttribute(className + " astro-tvrurpns", "class")} title="Home" aria-label="Home"> ${renderComponent($$result, "Icon", $$Icon, { "name": "logo", "class": "astro-tvrurpns" })} </a> `;
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/src/components/Logo.astro", void 0);

const $$Astro$4 = createAstro("https://www.robbywebb.com");
const $$Desktop = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Desktop;
  const currentPath = Astro2.url.pathname;
  return renderTemplate`${maybeRenderHead()}<ul class="nav-items astro-ue6dt2m4"> <div class="nav-group astro-ue6dt2m4"> <li class="astro-ue6dt2m4"> <a href="/mixing"${addAttribute(currentPath.includes("/mixing"), "aria-current")} aria-label="Mixing" class="astro-ue6dt2m4">Mixing</a> </li> <li class="astro-ue6dt2m4"> <a href="/production"${addAttribute(currentPath.includes("/production"), "aria-current")} aria-label="Production" class="astro-ue6dt2m4">Production</a> </li> </div> ${renderComponent($$result, "Logo", $$Logo, { "class": "logo-custom astro-ue6dt2m4" })} <div class="nav-group astro-ue6dt2m4"> <li class="astro-ue6dt2m4"> <a href="/discography"${addAttribute(currentPath.includes("/discography"), "aria-current")} aria-label="Discography" class="astro-ue6dt2m4">Discography</a> </li> <li class="astro-ue6dt2m4"> <a href="/contact"${addAttribute(currentPath.includes("/contact"), "aria-current")} aria-label="Contact" class="astro-ue6dt2m4">Contact</a> </li> </div> </ul> `;
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/src/components/navigation/Desktop.astro", void 0);

const $$Astro$3 = createAstro("https://www.robbywebb.com");
const $$Mobile = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Mobile;
  const currentPath = Astro2.url.pathname;
  return renderTemplate`${maybeRenderHead()}<button id="hamburger" class="hamburger astro-g5chvtba" aria-expanded="false"> <div class="top astro-g5chvtba"></div> <div class="middle astro-g5chvtba"></div> <div class="bottom astro-g5chvtba"></div> </button> <div class="mobile-nav-overlay astro-g5chvtba"> <ul class="astro-g5chvtba"> <li class="astro-g5chvtba"> <a href="/mixing"${addAttribute(currentPath.includes("/mixing"), "aria-current")} aria-label="Mixing" class="astro-g5chvtba">Mixing</a> </li> <li class="astro-g5chvtba"> <a href="/production"${addAttribute(currentPath.includes("/production"), "aria-current")} aria-label="Production" class="astro-g5chvtba">Production</a> </li> <li class="astro-g5chvtba"> <a href="/discography"${addAttribute(currentPath.includes("/discography"), "aria-current")} aria-label="Discography" class="astro-g5chvtba">Discography</a> </li> <li class="astro-g5chvtba"> <a href="/contact"${addAttribute(currentPath.includes("/contact"), "aria-current")} aria-label="Contact" class="astro-g5chvtba">Contact</a> </li> </ul> </div>  `;
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/src/components/navigation/Mobile.astro", void 0);

const $$Astro$2 = createAstro("https://www.robbywebb.com");
const $$Navigation = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Navigation;
  return renderTemplate`${maybeRenderHead()}<nav class="navigation astro-cf5drfxn"> <div class="container astro-cf5drfxn"> ${renderComponent($$result, "MobileLogo", $$Logo, { "class": "logo-custom astro-cf5drfxn" })} ${renderComponent($$result, "Mobile", $$Mobile, { "class": "astro-cf5drfxn" })} ${renderComponent($$result, "Desktop", $$Desktop, { "class": "astro-cf5drfxn" })} </div> </nav> `;
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/src/components/navigation/Navigation.astro", void 0);

const $$Astro$1 = createAstro("https://www.robbywebb.com");
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title,
    description = "Philadelphia based producer, drummer and engineer",
    socialImage
  } = Astro2.props;
  const canonicalURL = new URL(Astro2.url.pathname, Astro2.site);
  const socialImageURL = new URL(socialImage || "/images/headshot.jpg", canonicalURL);
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><!-- SEO --><title>${title}</title><meta name="title"${addAttribute(title, "content")}><meta name="description"${addAttribute(description, "content")}><meta name="keywords" content="Music, Musician, Drums, Drummer, Recording, Recording Engineer, Producer, Audio, Mixing, Mastering, Philadelphia, Philly"><meta name="generator"${addAttribute(Astro2.generator, "content")}><link rel="canonical"${addAttribute(canonicalURL, "href")}><!-- Facebook --><meta property="og:url"${addAttribute(canonicalURL, "content")}><meta property="og:type" content="website"><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(socialImageURL, "content")}><!-- Twitter --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:domain" content="robbywebb.com"><meta name="twitter:url"${addAttribute(canonicalURL, "content")}><meta name="twitter:title"${addAttribute(title, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><meta name="twitter:image"${addAttribute(socialImageURL, "content")}><!-- Fonts --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap" rel="stylesheet"><!-- TODO: replace favicon --><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"><link rel="manifest" href="/site.webmanifest"><meta name="msapplication-TileColor" content="#000000"><meta name="theme-color" content="#000000"><!-- Named slot for injecting head content -->${renderSlot($$result, $$slots["head"])}<!-- Animations -->${renderComponent($$result, "ViewTransitions", $$ViewTransitions, {})}${renderHead()}</head> <body> ${renderComponent($$result, "Navigation", $$Navigation, {})} ${renderSlot($$result, $$slots["default"])} ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/src/layouts/Layout.astro", void 0);

const imageBuilder = imageUrlBuilder(sanityClient);
function urlForImage(source) {
  return imageBuilder.image(source);
}

const projects = await sanityClient.fetch(
  `*[_type == "project"] | order(publishedAt desc)`
);
const sortedAlbums = projects.map(async (project) => {
  const { artist, mainImage, slug, title, musicLinks, credits, label, releaseYear, type } = project;
  const artistData = await sanityClient.fetch(`*[_id == "${artist._ref}"]`);
  const image = await getImage({
    src: urlForImage(mainImage.asset).format("webp").url(),
    format: "webp",
    inferSize: true
  });
  return {
    image: image.src,
    artist: artistData[0],
    title,
    slug: slug.current,
    credits,
    label,
    year: releaseYear,
    type,
    musicLinks
  };
});
const albumData = await Promise.all(sortedAlbums);

const $$Astro = createAstro("https://www.robbywebb.com");
const prerender = false;
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { slug } = Astro2.params;
  const album = albumData.find((album2) => album2.slug === slug);
  const { title, image, artist, type, credits, label, musicLinks } = album || {};
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `Robby Webb | ${title}`, "class": "astro-xkiijjty" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "MainContent", $$MainContent, { "class": "astro-xkiijjty" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "PageHeader", $$PageHeader, { "text": `${title}`, "class": "astro-xkiijjty" })} ${maybeRenderHead()}<div class="album astro-xkiijjty"> ${renderComponent($$result3, "Picture", $$Picture, { "src": image, "width": 1e3, "height": 1e3, "formats": ["avif", "webp"], "title": `${artist.name}: ${title}`, "loading": "eager", "alt": `${artist.name}: ${title}`, "class": "astro-xkiijjty" })} <div class="astro-xkiijjty"> <h2 class="astro-xkiijjty">${artist.name}</h2> <p class="astro-xkiijjty"><strong class="astro-xkiijjty">Project:</strong> "${title}" ${type}</p> <p class="astro-xkiijjty"><strong class="astro-xkiijjty">Credits:</strong> ${credits}</p> <p class="astro-xkiijjty"><strong class="astro-xkiijjty">Label:</strong> ${label}</p> <div class="album-links astro-xkiijjty"> ${musicLinks?.map((link) => renderTemplate`<a class="site-cta pill astro-xkiijjty"${addAttribute(link.link, "href")} target="_blank" rel="noopener noreferrer"> ${link.text} </a>`)} </div> </div> </div> ` })} ` })} `;
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/src/pages/discography/[...slug].astro", void 0);

const $$file = "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/src/pages/discography/[...slug].astro";
const $$url = "/discography/[...slug]";

const ____slug_ = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { $$MainContent as $, ____slug_ as _, albumData as a, $$PageHeader as b, $$Layout as c, $$Icon as d, $$Picture as e, getConfiguredImageService as g, imageConfig as i };
