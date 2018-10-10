/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * EXIF service is based on the exif-js library (https://github.com/jseidelin/exif-js)
 */
var CropEXIF = /** @class */ (function () {
    function CropEXIF() {
    }
    /**
     * @param {?} file
     * @param {?} startOffset
     * @param {?} sectionLength
     * @return {?}
     */
    CropEXIF.readIPTCData = /**
     * @param {?} file
     * @param {?} startOffset
     * @param {?} sectionLength
     * @return {?}
     */
    function (file, startOffset, sectionLength) {
        /** @type {?} */
        var dataView = new DataView(file);
        /** @type {?} */
        var data = {};
        /** @type {?} */
        var fieldValue;
        /** @type {?} */
        var fieldName;
        /** @type {?} */
        var dataSize;
        /** @type {?} */
        var segmentType;
        /** @type {?} */
        var segmentSize;
        /** @type {?} */
        var segmentStartPos = startOffset;
        while (segmentStartPos < startOffset + sectionLength) {
            if (dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos + 1) === 0x02) {
                segmentType = dataView.getUint8(segmentStartPos + 2);
                if (segmentType in CropEXIF.IptcFieldMap) {
                    dataSize = dataView.getInt16(segmentStartPos + 3);
                    segmentSize = dataSize + 5;
                    fieldName = CropEXIF.IptcFieldMap[segmentType];
                    fieldValue = CropEXIF.getStringFromDB(dataView, segmentStartPos + 5, dataSize);
                    // Check if we already stored a value with this name
                    if (data.hasOwnProperty(fieldName)) {
                        // Value already stored with this name, create multivalue field
                        if (data[fieldName] instanceof Array) {
                            data[fieldName].push(fieldValue);
                        }
                        else {
                            data[fieldName] = [data[fieldName], fieldValue];
                        }
                    }
                    else {
                        data[fieldName] = fieldValue;
                    }
                }
            }
            segmentStartPos++;
        }
        return data;
    };
    /**
     * @param {?} file
     * @param {?} tiffStart
     * @param {?} dirStart
     * @param {?} strings
     * @param {?} bigEnd
     * @return {?}
     */
    CropEXIF.readTags = /**
     * @param {?} file
     * @param {?} tiffStart
     * @param {?} dirStart
     * @param {?} strings
     * @param {?} bigEnd
     * @return {?}
     */
    function (file, tiffStart, dirStart, strings, bigEnd) {
        /** @type {?} */
        var entries = file.getUint16(dirStart, !bigEnd);
        /** @type {?} */
        var tags = {};
        /** @type {?} */
        var entryOffset;
        /** @type {?} */
        var tag;
        /** @type {?} */
        var i;
        for (i = 0; i < entries; i++) {
            entryOffset = dirStart + i * 12 + 2;
            tag = strings[file.getUint16(entryOffset, !bigEnd)];
            if (tag) {
                tags[tag] = CropEXIF.readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
            }
            else {
                console.warn('Unknown tag: ' + file.getUint16(entryOffset, !bigEnd));
            }
        }
        return tags;
    };
    /**
     * @param {?} file
     * @param {?} entryOffset
     * @param {?} tiffStart
     * @param {?} dirStart
     * @param {?} bigEnd
     * @return {?}
     */
    CropEXIF.readTagValue = /**
     * @param {?} file
     * @param {?} entryOffset
     * @param {?} tiffStart
     * @param {?} dirStart
     * @param {?} bigEnd
     * @return {?}
     */
    function (file, entryOffset, tiffStart, dirStart, bigEnd) {
        /** @type {?} */
        var type = file.getUint16(entryOffset + 2, !bigEnd);
        /** @type {?} */
        var numValues = file.getUint32(entryOffset + 4, !bigEnd);
        /** @type {?} */
        var valueOffset = file.getUint32(entryOffset + 8, !bigEnd) + tiffStart;
        /** @type {?} */
        var offset;
        /** @type {?} */
        var vals;
        /** @type {?} */
        var val;
        /** @type {?} */
        var n;
        /** @type {?} */
        var numerator;
        /** @type {?} */
        var denominator;
        switch (type) {
            case '1': // byte, 8-bit unsigned int
            case '7': // undefined, 8-bit byte, value depending on field
                // undefined, 8-bit byte, value depending on field
                if (numValues == 1) {
                    return file.getUint8(entryOffset + 8, !bigEnd);
                }
                else {
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getUint8(offset + n);
                    }
                    return vals;
                }
            case '2': // ascii, 8-bit byte
                // ascii, 8-bit byte
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                return this.getStringFromDB(file, offset, numValues - 1);
            case '3': // short, 16 bit int
                // short, 16 bit int
                if (numValues == 1) {
                    return file.getUint16(entryOffset + 8, !bigEnd);
                }
                else {
                    offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getUint16(offset + 2 * n, !bigEnd);
                    }
                    return vals;
                }
            case '4': // long, 32 bit int
                // long, 32 bit int
                if (numValues == 1) {
                    return file.getUint32(entryOffset + 8, !bigEnd);
                }
                else {
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getUint32(valueOffset + 4 * n, !bigEnd);
                    }
                    return vals;
                }
            case '5': // rational = two long values, first is numerator, second is denominator
                // rational = two long values, first is numerator, second is denominator
                if (numValues == 1) {
                    numerator = file.getUint32(valueOffset, !bigEnd);
                    denominator = file.getUint32(valueOffset + 4, !bigEnd);
                    val = new Number(numerator / denominator);
                    val.numerator = numerator;
                    val.denominator = denominator;
                    return val;
                }
                else {
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        numerator = file.getUint32(valueOffset + 8 * n, !bigEnd);
                        denominator = file.getUint32(valueOffset + 4 + 8 * n, !bigEnd);
                        vals[n] = new Number(numerator / denominator);
                        vals[n].numerator = numerator;
                        vals[n].denominator = denominator;
                    }
                    return vals;
                }
            case '9': // slong, 32 bit signed int
                // slong, 32 bit signed int
                if (numValues == 1) {
                    return file.getInt32(entryOffset + 8, !bigEnd);
                }
                else {
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getInt32(valueOffset + 4 * n, !bigEnd);
                    }
                    return vals;
                }
            case '10': // signed rational, two slongs, first is numerator, second is denominator
                // signed rational, two slongs, first is numerator, second is denominator
                if (numValues == 1) {
                    return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset + 4, !bigEnd);
                }
                else {
                    vals = [];
                    for (n = 0; n < numValues; n++) {
                        vals[n] = file.getInt32(valueOffset + 8 * n, !bigEnd) / file.getInt32(valueOffset + 4 + 8 * n, !bigEnd);
                    }
                    return vals;
                }
        }
    };
    /**
     * @param {?} element
     * @param {?} event
     * @param {?} handler
     * @return {?}
     */
    CropEXIF.addEvent = /**
     * @param {?} element
     * @param {?} event
     * @param {?} handler
     * @return {?}
     */
    function (element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        }
        else if (element.attachEvent) {
            element.attachEvent("on" + event, handler);
        }
    };
    /**
     * @param {?} url
     * @param {?} callback
     * @return {?}
     */
    CropEXIF.objectURLToBlob = /**
     * @param {?} url
     * @param {?} callback
     * @return {?}
     */
    function (url, callback) {
        /** @type {?} */
        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.responseType = "blob";
        http.onload = function (e) {
            if (this.status == 200 || this.status === 0) {
                callback(this.response);
            }
        };
        http.send();
    };
    /**
     * @param {?} binFile
     * @param {?} img
     * @param {?=} callback
     * @return {?}
     */
    CropEXIF.handleBinaryFile = /**
     * @param {?} binFile
     * @param {?} img
     * @param {?=} callback
     * @return {?}
     */
    function (binFile, img, callback) {
        /** @type {?} */
        var data = CropEXIF.findEXIFinJPEG(binFile);
        /** @type {?} */
        var iptcdata = CropEXIF.findIPTCinJPEG(binFile);
        img.exifdata = data || {};
        img.iptcdata = iptcdata || {};
        if (callback) {
            callback.call(img);
        }
    };
    /**
     * @param {?} img
     * @param {?} callback
     * @return {?}
     */
    CropEXIF.getImageData = /**
     * @param {?} img
     * @param {?} callback
     * @return {?}
     */
    function (img, callback) {
        var _this = this;
        if (img.src) {
            if (/^data\:/i.test(img.src)) { // Data URI
                /** @type {?} */
                var arrayBuffer = CropEXIF.base64ToArrayBuffer(img.src);
                this.handleBinaryFile(arrayBuffer, img, callback);
            }
            else if (/^blob\:/i.test(img.src)) { // Object URL
                /** @type {?} */
                var fileReader = new FileReader();
                fileReader.onload = function (e) {
                    _this.handleBinaryFile(e.target.result, img, callback);
                };
                CropEXIF.objectURLToBlob(img.src, function (blob) {
                    fileReader.readAsArrayBuffer(blob);
                });
            }
            else {
                /** @type {?} */
                var http = new XMLHttpRequest();
                /** @type {?} */
                var self_1 = this;
                http.onload = function () {
                    if (this.status == 200 || this.status === 0) {
                        self_1.handleBinaryFile(http.response, img, callback);
                    }
                    else {
                        throw "Could not load image";
                    }
                    http = null;
                };
                http.open("GET", img.src, true);
                http.responseType = "arraybuffer";
                http.send(null);
            }
        }
        else if (FileReader && (img instanceof window.Blob || img instanceof File)) {
            /** @type {?} */
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                console.debug('getImageData: Got file of length %o', e.target.result.byteLength);
                _this.handleBinaryFile(e.target.result, img, callback);
            };
            fileReader.readAsArrayBuffer(img);
        }
    };
    /**
     * @param {?} buffer
     * @param {?} start
     * @param {?} length
     * @return {?}
     */
    CropEXIF.getStringFromDB = /**
     * @param {?} buffer
     * @param {?} start
     * @param {?} length
     * @return {?}
     */
    function (buffer, start, length) {
        /** @type {?} */
        var outstr = "";
        for (var n = start; n < start + length; n++) {
            outstr += String.fromCharCode(buffer.getUint8(n));
        }
        return outstr;
    };
    /**
     * @param {?} file
     * @param {?} start
     * @return {?}
     */
    CropEXIF.readEXIFData = /**
     * @param {?} file
     * @param {?} start
     * @return {?}
     */
    function (file, start) {
        if (this.getStringFromDB(file, start, 4) != "Exif") {
            console.error("Not valid EXIF data! " + this.getStringFromDB(file, start, 4));
            return false;
        }
        /** @type {?} */
        var bigEnd;
        /** @type {?} */
        var tags;
        /** @type {?} */
        var exifData;
        /** @type {?} */
        var gpsData;
        /** @type {?} */
        var tiffOffset = start + 6;
        /** @type {?} */
        var tag;
        // test for TIFF validity and endianness
        if (file.getUint16(tiffOffset) == 0x4949) {
            bigEnd = false;
        }
        else if (file.getUint16(tiffOffset) == 0x4D4D) {
            bigEnd = true;
        }
        else {
            console.error("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
            return false;
        }
        if (file.getUint16(tiffOffset + 2, !bigEnd) != 0x002A) {
            console.error("Not valid TIFF data! (no 0x002A)");
            return false;
        }
        /** @type {?} */
        var firstIFDOffset = file.getUint32(tiffOffset + 4, !bigEnd);
        if (firstIFDOffset < 0x00000008) {
            console.error("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset + 4, !bigEnd));
            return false;
        }
        tags = CropEXIF.readTags(file, tiffOffset, tiffOffset + firstIFDOffset, this.TiffTags, bigEnd);
        if (tags.ExifIFDPointer) {
            exifData = CropEXIF.readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, this.ExifTags, bigEnd);
            for (tag in exifData) {
                switch (tag) {
                    case "LightSource":
                    case "Flash":
                    case "MeteringMode":
                    case "ExposureProgram":
                    case "SensingMethod":
                    case "SceneCaptureType":
                    case "SceneType":
                    case "CustomRendered":
                    case "WhiteBalance":
                    case "GainControl":
                    case "Contrast":
                    case "Saturation":
                    case "Sharpness":
                    case "SubjectDistanceRange":
                    case "FileSource":
                        exifData[tag] = this.StringValues[tag][exifData[tag]];
                        break;
                    case "ExifVersion":
                    case "FlashpixVersion":
                        exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                        break;
                    case "ComponentsConfiguration":
                        exifData[tag] =
                            this.StringValues.Components[exifData[tag][0]] +
                                this.StringValues.Components[exifData[tag][1]] +
                                this.StringValues.Components[exifData[tag][2]] +
                                this.StringValues.Components[exifData[tag][3]];
                        break;
                }
                tags[tag] = exifData[tag];
            }
        }
        if (tags.GPSInfoIFDPointer) {
            gpsData = this.readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, this.GPSTags, bigEnd);
            for (tag in gpsData) {
                switch (tag) {
                    case "GPSVersionID":
                        gpsData[tag] = gpsData[tag][0] +
                            "." + gpsData[tag][1] +
                            "." + gpsData[tag][2] +
                            "." + gpsData[tag][3];
                        break;
                }
                tags[tag] = gpsData[tag];
            }
        }
        return tags;
    };
    /**
     * @param {?} img
     * @param {?} callback
     * @return {?}
     */
    CropEXIF.getData = /**
     * @param {?} img
     * @param {?} callback
     * @return {?}
     */
    function (img, callback) {
        if ((img instanceof Image || img instanceof HTMLImageElement) && !img.complete)
            return false;
        if (!this.imageHasData(img)) {
            CropEXIF.getImageData(img, callback);
        }
        else {
            if (callback) {
                callback.call(img);
            }
        }
        return true;
    };
    ;
    /**
     * @param {?} img
     * @param {?} tag
     * @return {?}
     */
    CropEXIF.getTag = /**
     * @param {?} img
     * @param {?} tag
     * @return {?}
     */
    function (img, tag) {
        if (!this.imageHasData(img))
            return;
        return img.exifdata[tag];
    };
    ;
    /**
     * @param {?} img
     * @return {?}
     */
    CropEXIF.getAllTags = /**
     * @param {?} img
     * @return {?}
     */
    function (img) {
        if (!this.imageHasData(img))
            return {};
        /** @type {?} */
        var a;
        /** @type {?} */
        var data = img.exifdata;
        /** @type {?} */
        var tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    };
    ;
    /**
     * @param {?} img
     * @return {?}
     */
    CropEXIF.pretty = /**
     * @param {?} img
     * @return {?}
     */
    function (img) {
        if (!this.imageHasData(img))
            return "";
        /** @type {?} */
        var a;
        /** @type {?} */
        var data = img.exifdata;
        /** @type {?} */
        var strPretty = "";
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                if (typeof data[a] == "object") {
                    if (data[a] instanceof Number) {
                        strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                    }
                    else {
                        strPretty += a + " : [" + data[a].length + " values]\r\n";
                    }
                }
                else {
                    strPretty += a + " : " + data[a] + "\r\n";
                }
            }
        }
        return strPretty;
    };
    /**
     * @param {?} file
     * @return {?}
     */
    CropEXIF.findEXIFinJPEG = /**
     * @param {?} file
     * @return {?}
     */
    function (file) {
        /** @type {?} */
        var dataView = new DataView(file);
        /** @type {?} */
        var maxOffset = dataView.byteLength - 4;
        console.debug('findEXIFinJPEG: Got file of length %o', file.byteLength);
        if (dataView.getUint16(0) !== 0xffd8) {
            console.warn('Not a valid JPEG');
            return false; // not a valid jpeg
        }
        /** @type {?} */
        var offset = 2;
        /** @type {?} */
        var marker;
        /**
         * @return {?}
         */
        function readByte() {
            /** @type {?} */
            var someByte = dataView.getUint8(offset);
            offset++;
            return someByte;
        }
        /**
         * @return {?}
         */
        function readWord() {
            /** @type {?} */
            var someWord = dataView.getUint16(offset);
            offset = offset + 2;
            return someWord;
        }
        while (offset < maxOffset) {
            /** @type {?} */
            var someByte = readByte();
            if (someByte != 0xFF) {
                console.error('Not a valid marker at offset ' + offset + ", found: " + someByte);
                return false; // not a valid marker, something is wrong
            }
            marker = readByte();
            console.debug('Marker=%o', marker);
            /** @type {?} */
            var segmentLength = readWord() - 2;
            switch (marker) {
                case '0xE1':
                    return this.readEXIFData(dataView, offset);
                case '0xE0': // JFIF
                default:
                    offset += segmentLength;
            }
        }
    };
    /**
     * @param {?} file
     * @return {?}
     */
    CropEXIF.findIPTCinJPEG = /**
     * @param {?} file
     * @return {?}
     */
    function (file) {
        /** @type {?} */
        var dataView = new DataView(file);
        console.debug('Got file of length ' + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            console.warn('Not a valid JPEG');
            return false; // not a valid jpeg
        }
        /** @type {?} */
        var offset = 2;
        /** @type {?} */
        var length = file.byteLength;
        /** @type {?} */
        var isFieldSegmentStart = function (dataView, offset) {
            return (dataView.getUint8(offset) === 0x38 &&
                dataView.getUint8(offset + 1) === 0x42 &&
                dataView.getUint8(offset + 2) === 0x49 &&
                dataView.getUint8(offset + 3) === 0x4D &&
                dataView.getUint8(offset + 4) === 0x04 &&
                dataView.getUint8(offset + 5) === 0x04);
        };
        while (offset < length) {
            if (isFieldSegmentStart(dataView, offset)) {
                /** @type {?} */
                var nameHeaderLength = dataView.getUint8(offset + 7);
                if (nameHeaderLength % 2 !== 0)
                    nameHeaderLength += 1;
                // Check for pre photoshop 6 format
                if (nameHeaderLength === 0) {
                    // Always 4
                    nameHeaderLength = 4;
                }
                /** @type {?} */
                var startOffset = offset + 8 + nameHeaderLength;
                /** @type {?} */
                var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);
                return this.readIPTCData(file, startOffset, sectionLength);
            }
            // Not the marker, continue searching
            offset++;
        }
    };
    /**
     * @param {?} file
     * @return {?}
     */
    CropEXIF.readFromBinaryFile = /**
     * @param {?} file
     * @return {?}
     */
    function (file) {
        return CropEXIF.findEXIFinJPEG(file);
    };
    /**
     * @param {?} img
     * @return {?}
     */
    CropEXIF.imageHasData = /**
     * @param {?} img
     * @return {?}
     */
    function (img) {
        return !!(img.exifdata);
    };
    /**
     * @param {?} base64
     * @param {?=} contentType
     * @return {?}
     */
    CropEXIF.base64ToArrayBuffer = /**
     * @param {?} base64
     * @param {?=} contentType
     * @return {?}
     */
    function (base64, contentType) {
        contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
        base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
        /** @type {?} */
        var binary = atob(base64);
        /** @type {?} */
        var len = binary.length;
        /** @type {?} */
        var buffer = new ArrayBuffer(len);
        /** @type {?} */
        var view = new Uint8Array(buffer);
        for (var i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return buffer;
    };
    CropEXIF.ExifTags = {
        // version tags
        '0x9000': "ExifVersion",
        // EXIF version
        '0xA000': "FlashpixVersion",
        // Flashpix format version
        // colorspace tags
        '0xA001': "ColorSpace",
        // Color space information tag
        // image configuration
        '0xA002': "PixelXDimension",
        // Valid width of meaningful image
        '0xA003': "PixelYDimension",
        // Valid height of meaningful image
        '0x9101': "ComponentsConfiguration",
        // Information about channels
        '0x9102': "CompressedBitsPerPixel",
        // Compressed bits per pixel
        // user information
        '0x927C': "MakerNote",
        // Any desired information written by the manufacturer
        '0x9286': "UserComment",
        // Comments by user
        // related file
        '0xA004': "RelatedSoundFile",
        // Name of related sound file
        // date and time
        '0x9003': "DateTimeOriginal",
        // Date and time when the original image was generated
        '0x9004': "DateTimeDigitized",
        // Date and time when the image was stored digitally
        '0x9290': "SubsecTime",
        // Fractions of seconds for DateTime
        '0x9291': "SubsecTimeOriginal",
        // Fractions of seconds for DateTimeOriginal
        '0x9292': "SubsecTimeDigitized",
        // Fractions of seconds for DateTimeDigitized
        // picture-taking conditions
        '0x829A': "ExposureTime",
        // Exposure time (in seconds)
        '0x829D': "FNumber",
        // F number
        '0x8822': "ExposureProgram",
        // Exposure program
        '0x8824': "SpectralSensitivity",
        // Spectral sensitivity
        '0x8827': "ISOSpeedRatings",
        // ISO speed rating
        '0x8828': "OECF",
        // Optoelectric conversion factor
        '0x9201': "ShutterSpeedValue",
        // Shutter speed
        '0x9202': "ApertureValue",
        // Lens aperture
        '0x9203': "BrightnessValue",
        // Value of brightness
        '0x9204': "ExposureBias",
        // Exposure bias
        '0x9205': "MaxApertureValue",
        // Smallest F number of lens
        '0x9206': "SubjectDistance",
        // Distance to subject in meters
        '0x9207': "MeteringMode",
        // Metering mode
        '0x9208': "LightSource",
        // Kind of light source
        '0x9209': "Flash",
        // Flash status
        '0x9214': "SubjectArea",
        // Location and area of main subject
        '0x920A': "FocalLength",
        // Focal length of the lens in mm
        '0xA20B': "FlashEnergy",
        // Strobe energy in BCPS
        '0xA20C': "SpatialFrequencyResponse",
        //
        '0xA20E': "FocalPlaneXResolution",
        // Number of pixels in width direction per FocalPlaneResolutionUnit
        '0xA20F': "FocalPlaneYResolution",
        // Number of pixels in height direction per FocalPlaneResolutionUnit
        '0xA210': "FocalPlaneResolutionUnit",
        // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
        '0xA214': "SubjectLocation",
        // Location of subject in image
        '0xA215': "ExposureIndex",
        // Exposure index selected on camera
        '0xA217': "SensingMethod",
        // Image sensor type
        '0xA300': "FileSource",
        // Image source (3 == DSC)
        '0xA301': "SceneType",
        // Scene type (1 == directly photographed)
        '0xA302': "CFAPattern",
        // Color filter array geometric pattern
        '0xA401': "CustomRendered",
        // Special processing
        '0xA402': "ExposureMode",
        // Exposure mode
        '0xA403': "WhiteBalance",
        // 1 = auto white balance, 2 = manual
        '0xA404': "DigitalZoomRation",
        // Digital zoom ratio
        '0xA405': "FocalLengthIn35mmFilm",
        // Equivalent foacl length assuming 35mm film camera (in mm)
        '0xA406': "SceneCaptureType",
        // Type of scene
        '0xA407': "GainControl",
        // Degree of overall image gain adjustment
        '0xA408': "Contrast",
        // Direction of contrast processing applied by camera
        '0xA409': "Saturation",
        // Direction of saturation processing applied by camera
        '0xA40A': "Sharpness",
        // Direction of sharpness processing applied by camera
        '0xA40B': "DeviceSettingDescription",
        //
        '0xA40C': "SubjectDistanceRange",
        // Distance to subject
        // other tags
        '0xA005': "InteroperabilityIFDPointer",
        '0xA420': "ImageUniqueID" // Identifier assigned uniquely to each image
    };
    CropEXIF.TiffTags = {
        '0x0100': "ImageWidth",
        '0x0101': "ImageHeight",
        '0x8769': "ExifIFDPointer",
        '0x8825': "GPSInfoIFDPointer",
        '0xA005': "InteroperabilityIFDPointer",
        '0x0102': "BitsPerSample",
        '0x0103': "Compression",
        '0x0106': "PhotometricInterpretation",
        '0x0112': "Orientation",
        '0x0115': "SamplesPerPixel",
        '0x011C': "PlanarConfiguration",
        '0x0212': "YCbCrSubSampling",
        '0x0213': "YCbCrPositioning",
        '0x011A': "XResolution",
        '0x011B': "YResolution",
        '0x0128': "ResolutionUnit",
        '0x0111': "StripOffsets",
        '0x0116': "RowsPerStrip",
        '0x0117': "StripByteCounts",
        '0x0201': "JPEGInterchangeFormat",
        '0x0202': "JPEGInterchangeFormatLength",
        '0x012D': "TransferFunction",
        '0x013E': "WhitePoint",
        '0x013F': "PrimaryChromaticities",
        '0x0211': "YCbCrCoefficients",
        '0x0214': "ReferenceBlackWhite",
        '0x0132': "DateTime",
        '0x010E': "ImageDescription",
        '0x010F': "Make",
        '0x0110': "Model",
        '0x0131': "Software",
        '0x013B': "Artist",
        '0x8298': "Copyright"
    };
    CropEXIF.GPSTags = {
        '0x0000': "GPSVersionID",
        '0x0001': "GPSLatitudeRef",
        '0x0002': "GPSLatitude",
        '0x0003': "GPSLongitudeRef",
        '0x0004': "GPSLongitude",
        '0x0005': "GPSAltitudeRef",
        '0x0006': "GPSAltitude",
        '0x0007': "GPSTimeStamp",
        '0x0008': "GPSSatellites",
        '0x0009': "GPSStatus",
        '0x000A': "GPSMeasureMode",
        '0x000B': "GPSDOP",
        '0x000C': "GPSSpeedRef",
        '0x000D': "GPSSpeed",
        '0x000E': "GPSTrackRef",
        '0x000F': "GPSTrack",
        '0x0010': "GPSImgDirectionRef",
        '0x0011': "GPSImgDirection",
        '0x0012': "GPSMapDatum",
        '0x0013': "GPSDestLatitudeRef",
        '0x0014': "GPSDestLatitude",
        '0x0015': "GPSDestLongitudeRef",
        '0x0016': "GPSDestLongitude",
        '0x0017': "GPSDestBearingRef",
        '0x0018': "GPSDestBearing",
        '0x0019': "GPSDestDistanceRef",
        '0x001A': "GPSDestDistance",
        '0x001B': "GPSProcessingMethod",
        '0x001C': "GPSAreaInformation",
        '0x001D': "GPSDateStamp",
        '0x001E': "GPSDifferential"
    };
    CropEXIF.StringValues = {
        ExposureProgram: {
            '0': "Not defined",
            '1': "Manual",
            '2': "Normal program",
            '3': "Aperture priority",
            '4': "Shutter priority",
            '5': "Creative program",
            '6': "Action program",
            '7': "Portrait mode",
            '8': "Landscape mode"
        },
        MeteringMode: {
            '0': "Unknown",
            '1': "Average",
            '2': "CenterWeightedAverage",
            '3': "Spot",
            '4': "MultiSpot",
            '5': "Pattern",
            '6': "Partial",
            '255': "Other"
        },
        LightSource: {
            '0': "Unknown",
            '1': "Daylight",
            '2': "Fluorescent",
            '3': "Tungsten (incandescent light)",
            '4': "Flash",
            '9': "Fine weather",
            '10': "Cloudy weather",
            '11': "Shade",
            '12': "Daylight fluorescent (D 5700 - 7100K)",
            '13': "Day white fluorescent (N 4600 - 5400K)",
            '14': "Cool white fluorescent (W 3900 - 4500K)",
            '15': "White fluorescent (WW 3200 - 3700K)",
            '17': "Standard light A",
            '18': "Standard light B",
            '19': "Standard light C",
            '20': "D55",
            '21': "D65",
            '22': "D75",
            '23': "D50",
            '24': "ISO studio tungsten",
            '255': "Other"
        },
        Flash: {
            '0x0000': "Flash did not fire",
            '0x0001': "Flash fired",
            '0x0005': "Strobe return light not detected",
            '0x0007': "Strobe return light detected",
            '0x0009': "Flash fired, compulsory flash mode",
            '0x000D': "Flash fired, compulsory flash mode, return light not detected",
            '0x000F': "Flash fired, compulsory flash mode, return light detected",
            '0x0010': "Flash did not fire, compulsory flash mode",
            '0x0018': "Flash did not fire, auto mode",
            '0x0019': "Flash fired, auto mode",
            '0x001D': "Flash fired, auto mode, return light not detected",
            '0x001F': "Flash fired, auto mode, return light detected",
            '0x0020': "No flash function",
            '0x0041': "Flash fired, red-eye reduction mode",
            '0x0045': "Flash fired, red-eye reduction mode, return light not detected",
            '0x0047': "Flash fired, red-eye reduction mode, return light detected",
            '0x0049': "Flash fired, compulsory flash mode, red-eye reduction mode",
            '0x004D': "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
            '0x004F': "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
            '0x0059': "Flash fired, auto mode, red-eye reduction mode",
            '0x005D': "Flash fired, auto mode, return light not detected, red-eye reduction mode",
            '0x005F': "Flash fired, auto mode, return light detected, red-eye reduction mode"
        },
        SensingMethod: {
            '1': "Not defined",
            '2': "One-chip color area sensor",
            '3': "Two-chip color area sensor",
            '4': "Three-chip color area sensor",
            '5': "Color sequential area sensor",
            '7': "Trilinear sensor",
            '8': "Color sequential linear sensor"
        },
        SceneCaptureType: {
            '0': "Standard",
            '1': "Landscape",
            '2': "Portrait",
            '3': "Night scene"
        },
        SceneType: {
            '1': "Directly photographed"
        },
        CustomRendered: {
            '0': "Normal process",
            '1': "Custom process"
        },
        WhiteBalance: {
            '0': "Auto white balance",
            '1': "Manual white balance"
        },
        GainControl: {
            '0': "None",
            '1': "Low gain up",
            '2': "High gain up",
            '3': "Low gain down",
            '4': "High gain down"
        },
        Contrast: {
            '0': "Normal",
            '1': "Soft",
            '2': "Hard"
        },
        Saturation: {
            '0': "Normal",
            '1': "Low saturation",
            '2': "High saturation"
        },
        Sharpness: {
            '0': "Normal",
            '1': "Soft",
            '2': "Hard"
        },
        SubjectDistanceRange: {
            '0': "Unknown",
            '1': "Macro",
            '2': "Close view",
            '3': "Distant view"
        },
        FileSource: {
            '3': "DSC"
        },
        Components: {
            '0': "",
            '1': "Y",
            '2': "Cb",
            '3': "Cr",
            '4': "R",
            '5': "G",
            '6': "B"
        }
    };
    CropEXIF.IptcFieldMap = {
        '0x78': 'caption',
        '0x6E': 'credit',
        '0x19': 'keywords',
        '0x37': 'dateCreated',
        '0x50': 'byline',
        '0x55': 'bylineTitle',
        '0x7A': 'captionWriter',
        '0x69': 'headline',
        '0x74': 'copyright',
        '0x0F': 'category'
    };
    return CropEXIF;
}());
export { CropEXIF };
if (false) {
    /** @type {?} */
    CropEXIF.ExifTags;
    /** @type {?} */
    CropEXIF.TiffTags;
    /** @type {?} */
    CropEXIF.GPSTags;
    /** @type {?} */
    CropEXIF.StringValues;
    /** @type {?} */
    CropEXIF.IptcFieldMap;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JvcC1leGlmLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctaW1nLWNyb3AvIiwic291cmNlcyI6WyJzcmMvYXBwL2ZjLWltZy1jcm9wL2NsYXNzZXMvY3JvcC1leGlmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7SUE4U1MscUJBQVk7Ozs7OztJQUFuQixVQUFvQixJQUFJLEVBQUUsV0FBVyxFQUFFLGFBQWE7O1FBQ2xELElBQUksUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOztRQUNsQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7O1FBQ2QsSUFBSSxVQUFVLENBQWdEOztRQUE5RCxJQUFnQixTQUFTLENBQXFDOztRQUE5RCxJQUEyQixRQUFRLENBQTJCOztRQUE5RCxJQUFxQyxXQUFXLENBQWM7O1FBQTlELElBQWtELFdBQVcsQ0FBQzs7UUFDOUQsSUFBSSxlQUFlLEdBQUcsV0FBVyxDQUFDO1FBQ2xDLE9BQU8sZUFBZSxHQUFHLFdBQVcsR0FBRyxhQUFhLEVBQUU7WUFDcEQsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFLLElBQUksSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ2xHLFdBQVcsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDckQsSUFBSSxXQUFXLElBQUksUUFBUSxDQUFDLFlBQVksRUFBRTtvQkFDeEMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNsRCxXQUFXLEdBQUcsUUFBUSxHQUFHLENBQUMsQ0FBQztvQkFDM0IsU0FBUyxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQy9DLFVBQVUsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFB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RSxjQUFjO1NBQ3BCO1FBQ0QsVUFBVSxFQUFFO1lBQ1YsR0FBRyxFQUFFLEtBQUs7U0FDWDtRQUVELFVBQVUsRUFBRTtZQUNWLEdBQUcsRUFBRSxFQUFFO1lBQ1AsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLEVBQUUsSUFBSTtZQUNULEdBQUcsRUFBRSxJQUFJO1lBQ1QsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRSxHQUFHO1NBQ1Q7S0FDRjs0QkFFcUI7UUFDcEIsTUFBTSxFQUFFLFNBQVM7UUFDakIsTUFBTSxFQUFFLFFBQVE7UUFDaEIsTUFBTSxFQUFFLFVBQVU7UUFDbEIsTUFBTSxFQUFFLGFBQWE7UUFDckIsTUFBTSxFQUFFLFFBQVE7UUFDaEIsTUFBTSxFQUFFLGFBQWE7UUFDckIsTUFBTSxFQUFFLGVBQWU7UUFDdkIsTUFBTSxFQUFFLFVBQVU7UUFDbEIsTUFBTSxFQUFFLFdBQVc7UUFDbkIsTUFBTSxFQUFFLFVBQVU7S0FDbkI7bUJBNVNIOztTQUdhLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEVYSUYgc2VydmljZSBpcyBiYXNlZCBvbiB0aGUgZXhpZi1qcyBsaWJyYXJ5IChodHRwczovL2dpdGh1Yi5jb20vanNlaWRlbGluL2V4aWYtanMpXG4gKi9cbmV4cG9ydCBjbGFzcyBDcm9wRVhJRiB7XG5cbiAgc3RhdGljIEV4aWZUYWdzID0ge1xuXG4gICAgLy8gdmVyc2lvbiB0YWdzXG4gICAgJzB4OTAwMCc6IFwiRXhpZlZlcnNpb25cIiwgICAgICAgICAgICAgLy8gRVhJRiB2ZXJzaW9uXG4gICAgJzB4QTAwMCc6IFwiRmxhc2hwaXhWZXJzaW9uXCIsICAgICAgICAgLy8gRmxhc2hwaXggZm9ybWF0IHZlcnNpb25cblxuICAgIC8vIGNvbG9yc3BhY2UgdGFnc1xuICAgICcweEEwMDEnOiBcIkNvbG9yU3BhY2VcIiwgICAgICAgICAgICAgIC8vIENvbG9yIHNwYWNlIGluZm9ybWF0aW9uIHRhZ1xuXG4gICAgLy8gaW1hZ2UgY29uZmlndXJhdGlvblxuICAgICcweEEwMDInOiBcIlBpeGVsWERpbWVuc2lvblwiLCAgICAgICAgIC8vIFZhbGlkIHdpZHRoIG9mIG1lYW5pbmdmdWwgaW1hZ2VcbiAgICAnMHhBMDAzJzogXCJQaXhlbFlEaW1lbnNpb25cIiwgICAgICAgICAvLyBWYWxpZCBoZWlnaHQgb2YgbWVhbmluZ2Z1bCBpbWFnZVxuICAgICcweDkxMDEnOiBcIkNvbXBvbmVudHNDb25maWd1cmF0aW9uXCIsIC8vIEluZm9ybWF0aW9uIGFib3V0IGNoYW5uZWxzXG4gICAgJzB4OTEwMic6IFwiQ29tcHJlc3NlZEJpdHNQZXJQaXhlbFwiLCAgLy8gQ29tcHJlc3NlZCBiaXRzIHBlciBwaXhlbFxuXG4gICAgLy8gdXNlciBpbmZvcm1hdGlvblxuICAgICcweDkyN0MnOiBcIk1ha2VyTm90ZVwiLCAgICAgICAgICAgICAgIC8vIEFueSBkZXNpcmVkIGluZm9ybWF0aW9uIHdyaXR0ZW4gYnkgdGhlIG1hbnVmYWN0dXJlclxuICAgICcweDkyODYnOiBcIlVzZXJDb21tZW50XCIsICAgICAgICAgICAgIC8vIENvbW1lbnRzIGJ5IHVzZXJcblxuICAgIC8vIHJlbGF0ZWQgZmlsZVxuICAgICcweEEwMDQnOiBcIlJlbGF0ZWRTb3VuZEZpbGVcIiwgICAgICAgIC8vIE5hbWUgb2YgcmVsYXRlZCBzb3VuZCBmaWxlXG5cbiAgICAvLyBkYXRlIGFuZCB0aW1lXG4gICAgJzB4OTAwMyc6IFwiRGF0ZVRpbWVPcmlnaW5hbFwiLCAgICAgICAgLy8gRGF0ZSBhbmQgdGltZSB3aGVuIHRoZSBvcmlnaW5hbCBpbWFnZSB3YXMgZ2VuZXJhdGVkXG4gICAgJzB4OTAwNCc6IFwiRGF0ZVRpbWVEaWdpdGl6ZWRcIiwgICAgICAgLy8gRGF0ZSBhbmQgdGltZSB3aGVuIHRoZSBpbWFnZSB3YXMgc3RvcmVkIGRpZ2l0YWxseVxuICAgICcweDkyOTAnOiBcIlN1YnNlY1RpbWVcIiwgICAgICAgICAgICAgIC8vIEZyYWN0aW9ucyBvZiBzZWNvbmRzIGZvciBEYXRlVGltZVxuICAgICcweDkyOTEnOiBcIlN1YnNlY1RpbWVPcmlnaW5hbFwiLCAgICAgIC8vIEZyYWN0aW9ucyBvZiBzZWNvbmRzIGZvciBEYXRlVGltZU9yaWdpbmFsXG4gICAgJzB4OTI5Mic6IFwiU3Vic2VjVGltZURpZ2l0aXplZFwiLCAgICAgLy8gRnJhY3Rpb25zIG9mIHNlY29uZHMgZm9yIERhdGVUaW1lRGlnaXRpemVkXG5cbiAgICAvLyBwaWN0dXJlLXRha2luZyBjb25kaXRpb25zXG4gICAgJzB4ODI5QSc6IFwiRXhwb3N1cmVUaW1lXCIsICAgICAgICAgICAgLy8gRXhwb3N1cmUgdGltZSAoaW4gc2Vjb25kcylcbiAgICAnMHg4MjlEJzogXCJGTnVtYmVyXCIsICAgICAgICAgICAgICAgICAvLyBGIG51bWJlclxuICAgICcweDg4MjInOiBcIkV4cG9zdXJlUHJvZ3JhbVwiLCAgICAgICAgIC8vIEV4cG9zdXJlIHByb2dyYW1cbiAgICAnMHg4ODI0JzogXCJTcGVjdHJhbFNlbnNpdGl2aXR5XCIsICAgICAvLyBTcGVjdHJhbCBzZW5zaXRpdml0eVxuICAgICcweDg4MjcnOiBcIklTT1NwZWVkUmF0aW5nc1wiLCAgICAgICAgIC8vIElTTyBzcGVlZCByYXRpbmdcbiAgICAnMHg4ODI4JzogXCJPRUNGXCIsICAgICAgICAgICAgICAgICAgICAvLyBPcHRvZWxlY3RyaWMgY29udmVyc2lvbiBmYWN0b3JcbiAgICAnMHg5MjAxJzogXCJTaHV0dGVyU3BlZWRWYWx1ZVwiLCAgICAgICAvLyBTaHV0dGVyIHNwZWVkXG4gICAgJzB4OTIwMic6IFwiQXBlcnR1cmVWYWx1ZVwiLCAgICAgICAgICAgLy8gTGVucyBhcGVydHVyZVxuICAgICcweDkyMDMnOiBcIkJyaWdodG5lc3NWYWx1ZVwiLCAgICAgICAgIC8vIFZhbHVlIG9mIGJyaWdodG5lc3NcbiAgICAnMHg5MjA0JzogXCJFeHBvc3VyZUJpYXNcIiwgICAgICAgICAgICAvLyBFeHBvc3VyZSBiaWFzXG4gICAgJzB4OTIwNSc6IFwiTWF4QXBlcnR1cmVWYWx1ZVwiLCAgICAgICAgLy8gU21hbGxlc3QgRiBudW1iZXIgb2YgbGVuc1xuICAgICcweDkyMDYnOiBcIlN1YmplY3REaXN0YW5jZVwiLCAgICAgICAgIC8vIERpc3RhbmNlIHRvIHN1YmplY3QgaW4gbWV0ZXJzXG4gICAgJzB4OTIwNyc6IFwiTWV0ZXJpbmdNb2RlXCIsICAgICAgICAgICAgLy8gTWV0ZXJpbmcgbW9kZVxuICAgICcweDkyMDgnOiBcIkxpZ2h0U291cmNlXCIsICAgICAgICAgICAgIC8vIEtpbmQgb2YgbGlnaHQgc291cmNlXG4gICAgJzB4OTIwOSc6IFwiRmxhc2hcIiwgICAgICAgICAgICAgICAgICAgLy8gRmxhc2ggc3RhdHVzXG4gICAgJzB4OTIxNCc6IFwiU3ViamVjdEFyZWFcIiwgICAgICAgICAgICAgLy8gTG9jYXRpb24gYW5kIGFyZWEgb2YgbWFpbiBzdWJqZWN0XG4gICAgJzB4OTIwQSc6IFwiRm9jYWxMZW5ndGhcIiwgICAgICAgICAgICAgLy8gRm9jYWwgbGVuZ3RoIG9mIHRoZSBsZW5zIGluIG1tXG4gICAgJzB4QTIwQic6IFwiRmxhc2hFbmVyZ3lcIiwgICAgICAgICAgICAgLy8gU3Ryb2JlIGVuZXJneSBpbiBCQ1BTXG4gICAgJzB4QTIwQyc6IFwiU3BhdGlhbEZyZXF1ZW5jeVJlc3BvbnNlXCIsICAgIC8vXG4gICAgJzB4QTIwRSc6IFwiRm9jYWxQbGFuZVhSZXNvbHV0aW9uXCIsICAgLy8gTnVtYmVyIG9mIHBpeGVscyBpbiB3aWR0aCBkaXJlY3Rpb24gcGVyIEZvY2FsUGxhbmVSZXNvbHV0aW9uVW5pdFxuICAgICcweEEyMEYnOiBcIkZvY2FsUGxhbmVZUmVzb2x1dGlvblwiLCAgIC8vIE51bWJlciBvZiBwaXhlbHMgaW4gaGVpZ2h0IGRpcmVjdGlvbiBwZXIgRm9jYWxQbGFuZVJlc29sdXRpb25Vbml0XG4gICAgJzB4QTIxMCc6IFwiRm9jYWxQbGFuZVJlc29sdXRpb25Vbml0XCIsICAgIC8vIFVuaXQgZm9yIG1lYXN1cmluZyBGb2NhbFBsYW5lWFJlc29sdXRpb24gYW5kIEZvY2FsUGxhbmVZUmVzb2x1dGlvblxuICAgICcweEEyMTQnOiBcIlN1YmplY3RMb2NhdGlvblwiLCAgICAgICAgIC8vIExvY2F0aW9uIG9mIHN1YmplY3QgaW4gaW1hZ2VcbiAgICAnMHhBMjE1JzogXCJFeHBvc3VyZUluZGV4XCIsICAgICAgICAgICAvLyBFeHBvc3VyZSBpbmRleCBzZWxlY3RlZCBvbiBjYW1lcmFcbiAgICAnMHhBMjE3JzogXCJTZW5zaW5nTWV0aG9kXCIsICAgICAgICAgICAvLyBJbWFnZSBzZW5zb3IgdHlwZVxuICAgICcweEEzMDAnOiBcIkZpbGVTb3VyY2VcIiwgICAgICAgICAgICAgIC8vIEltYWdlIHNvdXJjZSAoMyA9PSBEU0MpXG4gICAgJzB4QTMwMSc6IFwiU2NlbmVUeXBlXCIsICAgICAgICAgICAgICAgLy8gU2NlbmUgdHlwZSAoMSA9PSBkaXJlY3RseSBwaG90b2dyYXBoZWQpXG4gICAgJzB4QTMwMic6IFwiQ0ZBUGF0dGVyblwiLCAgICAgICAgICAgICAgLy8gQ29sb3IgZmlsdGVyIGFycmF5IGdlb21ldHJpYyBwYXR0ZXJuXG4gICAgJzB4QTQwMSc6IFwiQ3VzdG9tUmVuZGVyZWRcIiwgICAgICAgICAgLy8gU3BlY2lhbCBwcm9jZXNzaW5nXG4gICAgJzB4QTQwMic6IFwiRXhwb3N1cmVNb2RlXCIsICAgICAgICAgICAgLy8gRXhwb3N1cmUgbW9kZVxuICAgICcweEE0MDMnOiBcIldoaXRlQmFsYW5jZVwiLCAgICAgICAgICAgIC8vIDEgPSBhdXRvIHdoaXRlIGJhbGFuY2UsIDIgPSBtYW51YWxcbiAgICAnMHhBNDA0JzogXCJEaWdpdGFsWm9vbVJhdGlvblwiLCAgICAgICAvLyBEaWdpdGFsIHpvb20gcmF0aW9cbiAgICAnMHhBNDA1JzogXCJGb2NhbExlbmd0aEluMzVtbUZpbG1cIiwgICAvLyBFcXVpdmFsZW50IGZvYWNsIGxlbmd0aCBhc3N1bWluZyAzNW1tIGZpbG0gY2FtZXJhIChpbiBtbSlcbiAgICAnMHhBNDA2JzogXCJTY2VuZUNhcHR1cmVUeXBlXCIsICAgICAgICAvLyBUeXBlIG9mIHNjZW5lXG4gICAgJzB4QTQwNyc6IFwiR2FpbkNvbnRyb2xcIiwgICAgICAgICAgICAgLy8gRGVncmVlIG9mIG92ZXJhbGwgaW1hZ2UgZ2FpbiBhZGp1c3RtZW50XG4gICAgJzB4QTQwOCc6IFwiQ29udHJhc3RcIiwgICAgICAgICAgICAgICAgLy8gRGlyZWN0aW9uIG9mIGNvbnRyYXN0IHByb2Nlc3NpbmcgYXBwbGllZCBieSBjYW1lcmFcbiAgICAnMHhBNDA5JzogXCJTYXR1cmF0aW9uXCIsICAgICAgICAgICAgICAvLyBEaXJlY3Rpb24gb2Ygc2F0dXJhdGlvbiBwcm9jZXNzaW5nIGFwcGxpZWQgYnkgY2FtZXJhXG4gICAgJzB4QTQwQSc6IFwiU2hhcnBuZXNzXCIsICAgICAgICAgICAgICAgLy8gRGlyZWN0aW9uIG9mIHNoYXJwbmVzcyBwcm9jZXNzaW5nIGFwcGxpZWQgYnkgY2FtZXJhXG4gICAgJzB4QTQwQic6IFwiRGV2aWNlU2V0dGluZ0Rlc2NyaXB0aW9uXCIsICAgIC8vXG4gICAgJzB4QTQwQyc6IFwiU3ViamVjdERpc3RhbmNlUmFuZ2VcIiwgICAgLy8gRGlzdGFuY2UgdG8gc3ViamVjdFxuXG4gICAgLy8gb3RoZXIgdGFnc1xuICAgICcweEEwMDUnOiBcIkludGVyb3BlcmFiaWxpdHlJRkRQb2ludGVyXCIsXG4gICAgJzB4QTQyMCc6IFwiSW1hZ2VVbmlxdWVJRFwiICAgICAgICAgICAgLy8gSWRlbnRpZmllciBhc3NpZ25lZCB1bmlxdWVseSB0byBlYWNoIGltYWdlXG4gIH07XG5cbiAgc3RhdGljIFRpZmZUYWdzID0ge1xuICAgICcweDAxMDAnOiBcIkltYWdlV2lkdGhcIixcbiAgICAnMHgwMTAxJzogXCJJbWFnZUhlaWdodFwiLFxuICAgICcweDg3NjknOiBcIkV4aWZJRkRQb2ludGVyXCIsXG4gICAgJzB4ODgyNSc6IFwiR1BTSW5mb0lGRFBvaW50ZXJcIixcbiAgICAnMHhBMDA1JzogXCJJbnRlcm9wZXJhYmlsaXR5SUZEUG9pbnRlclwiLFxuICAgICcweDAxMDInOiBcIkJpdHNQZXJTYW1wbGVcIixcbiAgICAnMHgwMTAzJzogXCJDb21wcmVzc2lvblwiLFxuICAgICcweDAxMDYnOiBcIlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb25cIixcbiAgICAnMHgwMTEyJzogXCJPcmllbnRhdGlvblwiLFxuICAgICcweDAxMTUnOiBcIlNhbXBsZXNQZXJQaXhlbFwiLFxuICAgICcweDAxMUMnOiBcIlBsYW5hckNvbmZpZ3VyYXRpb25cIixcbiAgICAnMHgwMjEyJzogXCJZQ2JDclN1YlNhbXBsaW5nXCIsXG4gICAgJzB4MDIxMyc6IFwiWUNiQ3JQb3NpdGlvbmluZ1wiLFxuICAgICcweDAxMUEnOiBcIlhSZXNvbHV0aW9uXCIsXG4gICAgJzB4MDExQic6IFwiWVJlc29sdXRpb25cIixcbiAgICAnMHgwMTI4JzogXCJSZXNvbHV0aW9uVW5pdFwiLFxuICAgICcweDAxMTEnOiBcIlN0cmlwT2Zmc2V0c1wiLFxuICAgICcweDAxMTYnOiBcIlJvd3NQZXJTdHJpcFwiLFxuICAgICcweDAxMTcnOiBcIlN0cmlwQnl0ZUNvdW50c1wiLFxuICAgICcweDAyMDEnOiBcIkpQRUdJbnRlcmNoYW5nZUZvcm1hdFwiLFxuICAgICcweDAyMDInOiBcIkpQRUdJbnRlcmNoYW5nZUZvcm1hdExlbmd0aFwiLFxuICAgICcweDAxMkQnOiBcIlRyYW5zZmVyRnVuY3Rpb25cIixcbiAgICAnMHgwMTNFJzogXCJXaGl0ZVBvaW50XCIsXG4gICAgJzB4MDEzRic6IFwiUHJpbWFyeUNocm9tYXRpY2l0aWVzXCIsXG4gICAgJzB4MDIxMSc6IFwiWUNiQ3JDb2VmZmljaWVudHNcIixcbiAgICAnMHgwMjE0JzogXCJSZWZlcmVuY2VCbGFja1doaXRlXCIsXG4gICAgJzB4MDEzMic6IFwiRGF0ZVRpbWVcIixcbiAgICAnMHgwMTBFJzogXCJJbWFnZURlc2NyaXB0aW9uXCIsXG4gICAgJzB4MDEwRic6IFwiTWFrZVwiLFxuICAgICcweDAxMTAnOiBcIk1vZGVsXCIsXG4gICAgJzB4MDEzMSc6IFwiU29mdHdhcmVcIixcbiAgICAnMHgwMTNCJzogXCJBcnRpc3RcIixcbiAgICAnMHg4Mjk4JzogXCJDb3B5cmlnaHRcIlxuICB9O1xuXG4gIHN0YXRpYyBHUFNUYWdzID0ge1xuICAgICcweDAwMDAnOiBcIkdQU1ZlcnNpb25JRFwiLFxuICAgICcweDAwMDEnOiBcIkdQU0xhdGl0dWRlUmVmXCIsXG4gICAgJzB4MDAwMic6IFwiR1BTTGF0aXR1ZGVcIixcbiAgICAnMHgwMDAzJzogXCJHUFNMb25naXR1ZGVSZWZcIixcbiAgICAnMHgwMDA0JzogXCJHUFNMb25naXR1ZGVcIixcbiAgICAnMHgwMDA1JzogXCJHUFNBbHRpdHVkZVJlZlwiLFxuICAgICcweDAwMDYnOiBcIkdQU0FsdGl0dWRlXCIsXG4gICAgJzB4MDAwNyc6IFwiR1BTVGltZVN0YW1wXCIsXG4gICAgJzB4MDAwOCc6IFwiR1BTU2F0ZWxsaXRlc1wiLFxuICAgICcweDAwMDknOiBcIkdQU1N0YXR1c1wiLFxuICAgICcweDAwMEEnOiBcIkdQU01lYXN1cmVNb2RlXCIsXG4gICAgJzB4MDAwQic6IFwiR1BTRE9QXCIsXG4gICAgJzB4MDAwQyc6IFwiR1BTU3BlZWRSZWZcIixcbiAgICAnMHgwMDBEJzogXCJHUFNTcGVlZFwiLFxuICAgICcweDAwMEUnOiBcIkdQU1RyYWNrUmVmXCIsXG4gICAgJzB4MDAwRic6IFwiR1BTVHJhY2tcIixcbiAgICAnMHgwMDEwJzogXCJHUFNJbWdEaXJlY3Rpb25SZWZcIixcbiAgICAnMHgwMDExJzogXCJHUFNJbWdEaXJlY3Rpb25cIixcbiAgICAnMHgwMDEyJzogXCJHUFNNYXBEYXR1bVwiLFxuICAgICcweDAwMTMnOiBcIkdQU0Rlc3RMYXRpdHVkZVJlZlwiLFxuICAgICcweDAwMTQnOiBcIkdQU0Rlc3RMYXRpdHVkZVwiLFxuICAgICcweDAwMTUnOiBcIkdQU0Rlc3RMb25naXR1ZGVSZWZcIixcbiAgICAnMHgwMDE2JzogXCJHUFNEZXN0TG9uZ2l0dWRlXCIsXG4gICAgJzB4MDAxNyc6IFwiR1BTRGVzdEJlYXJpbmdSZWZcIixcbiAgICAnMHgwMDE4JzogXCJHUFNEZXN0QmVhcmluZ1wiLFxuICAgICcweDAwMTknOiBcIkdQU0Rlc3REaXN0YW5jZVJlZlwiLFxuICAgICcweDAwMUEnOiBcIkdQU0Rlc3REaXN0YW5jZVwiLFxuICAgICcweDAwMUInOiBcIkdQU1Byb2Nlc3NpbmdNZXRob2RcIixcbiAgICAnMHgwMDFDJzogXCJHUFNBcmVhSW5mb3JtYXRpb25cIixcbiAgICAnMHgwMDFEJzogXCJHUFNEYXRlU3RhbXBcIixcbiAgICAnMHgwMDFFJzogXCJHUFNEaWZmZXJlbnRpYWxcIlxuICB9O1xuXG4gIHN0YXRpYyBTdHJpbmdWYWx1ZXMgPSB7XG4gICAgRXhwb3N1cmVQcm9ncmFtOiB7XG4gICAgICAnMCc6IFwiTm90IGRlZmluZWRcIixcbiAgICAgICcxJzogXCJNYW51YWxcIixcbiAgICAgICcyJzogXCJOb3JtYWwgcHJvZ3JhbVwiLFxuICAgICAgJzMnOiBcIkFwZXJ0dXJlIHByaW9yaXR5XCIsXG4gICAgICAnNCc6IFwiU2h1dHRlciBwcmlvcml0eVwiLFxuICAgICAgJzUnOiBcIkNyZWF0aXZlIHByb2dyYW1cIixcbiAgICAgICc2JzogXCJBY3Rpb24gcHJvZ3JhbVwiLFxuICAgICAgJzcnOiBcIlBvcnRyYWl0IG1vZGVcIixcbiAgICAgICc4JzogXCJMYW5kc2NhcGUgbW9kZVwiXG4gICAgfSxcbiAgICBNZXRlcmluZ01vZGU6IHtcbiAgICAgICcwJzogXCJVbmtub3duXCIsXG4gICAgICAnMSc6IFwiQXZlcmFnZVwiLFxuICAgICAgJzInOiBcIkNlbnRlcldlaWdodGVkQXZlcmFnZVwiLFxuICAgICAgJzMnOiBcIlNwb3RcIixcbiAgICAgICc0JzogXCJNdWx0aVNwb3RcIixcbiAgICAgICc1JzogXCJQYXR0ZXJuXCIsXG4gICAgICAnNic6IFwiUGFydGlhbFwiLFxuICAgICAgJzI1NSc6IFwiT3RoZXJcIlxuICAgIH0sXG4gICAgTGlnaHRTb3VyY2U6IHtcbiAgICAgICcwJzogXCJVbmtub3duXCIsXG4gICAgICAnMSc6IFwiRGF5bGlnaHRcIixcbiAgICAgICcyJzogXCJGbHVvcmVzY2VudFwiLFxuICAgICAgJzMnOiBcIlR1bmdzdGVuIChpbmNhbmRlc2NlbnQgbGlnaHQpXCIsXG4gICAgICAnNCc6IFwiRmxhc2hcIixcbiAgICAgICc5JzogXCJGaW5lIHdlYXRoZXJcIixcbiAgICAgICcxMCc6IFwiQ2xvdWR5IHdlYXRoZXJcIixcbiAgICAgICcxMSc6IFwiU2hhZGVcIixcbiAgICAgICcxMic6IFwiRGF5bGlnaHQgZmx1b3Jlc2NlbnQgKEQgNTcwMCAtIDcxMDBLKVwiLFxuICAgICAgJzEzJzogXCJEYXkgd2hpdGUgZmx1b3Jlc2NlbnQgKE4gNDYwMCAtIDU0MDBLKVwiLFxuICAgICAgJzE0JzogXCJDb29sIHdoaXRlIGZsdW9yZXNjZW50IChXIDM5MDAgLSA0NTAwSylcIixcbiAgICAgICcxNSc6IFwiV2hpdGUgZmx1b3Jlc2NlbnQgKFdXIDMyMDAgLSAzNzAwSylcIixcbiAgICAgICcxNyc6IFwiU3RhbmRhcmQgbGlnaHQgQVwiLFxuICAgICAgJzE4JzogXCJTdGFuZGFyZCBsaWdodCBCXCIsXG4gICAgICAnMTknOiBcIlN0YW5kYXJkIGxpZ2h0IENcIixcbiAgICAgICcyMCc6IFwiRDU1XCIsXG4gICAgICAnMjEnOiBcIkQ2NVwiLFxuICAgICAgJzIyJzogXCJENzVcIixcbiAgICAgICcyMyc6IFwiRDUwXCIsXG4gICAgICAnMjQnOiBcIklTTyBzdHVkaW8gdHVuZ3N0ZW5cIixcbiAgICAgICcyNTUnOiBcIk90aGVyXCJcbiAgICB9LFxuICAgIEZsYXNoOiB7XG4gICAgICAnMHgwMDAwJzogXCJGbGFzaCBkaWQgbm90IGZpcmVcIixcbiAgICAgICcweDAwMDEnOiBcIkZsYXNoIGZpcmVkXCIsXG4gICAgICAnMHgwMDA1JzogXCJTdHJvYmUgcmV0dXJuIGxpZ2h0IG5vdCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDAwNyc6IFwiU3Ryb2JlIHJldHVybiBsaWdodCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDAwOSc6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZVwiLFxuICAgICAgJzB4MDAwRCc6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZSwgcmV0dXJuIGxpZ2h0IG5vdCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDAwRic6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZSwgcmV0dXJuIGxpZ2h0IGRldGVjdGVkXCIsXG4gICAgICAnMHgwMDEwJzogXCJGbGFzaCBkaWQgbm90IGZpcmUsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZVwiLFxuICAgICAgJzB4MDAxOCc6IFwiRmxhc2ggZGlkIG5vdCBmaXJlLCBhdXRvIG1vZGVcIixcbiAgICAgICcweDAwMTknOiBcIkZsYXNoIGZpcmVkLCBhdXRvIG1vZGVcIixcbiAgICAgICcweDAwMUQnOiBcIkZsYXNoIGZpcmVkLCBhdXRvIG1vZGUsIHJldHVybiBsaWdodCBub3QgZGV0ZWN0ZWRcIixcbiAgICAgICcweDAwMUYnOiBcIkZsYXNoIGZpcmVkLCBhdXRvIG1vZGUsIHJldHVybiBsaWdodCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDAyMCc6IFwiTm8gZmxhc2ggZnVuY3Rpb25cIixcbiAgICAgICcweDAwNDEnOiBcIkZsYXNoIGZpcmVkLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlXCIsXG4gICAgICAnMHgwMDQ1JzogXCJGbGFzaCBmaXJlZCwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZSwgcmV0dXJuIGxpZ2h0IG5vdCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDA0Nyc6IFwiRmxhc2ggZmlyZWQsIHJlZC1leWUgcmVkdWN0aW9uIG1vZGUsIHJldHVybiBsaWdodCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDA0OSc6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZSwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZVwiLFxuICAgICAgJzB4MDA0RCc6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZSwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZSwgcmV0dXJuIGxpZ2h0IG5vdCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDA0Ric6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZSwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZSwgcmV0dXJuIGxpZ2h0IGRldGVjdGVkXCIsXG4gICAgICAnMHgwMDU5JzogXCJGbGFzaCBmaXJlZCwgYXV0byBtb2RlLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlXCIsXG4gICAgICAnMHgwMDVEJzogXCJGbGFzaCBmaXJlZCwgYXV0byBtb2RlLCByZXR1cm4gbGlnaHQgbm90IGRldGVjdGVkLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlXCIsXG4gICAgICAnMHgwMDVGJzogXCJGbGFzaCBmaXJlZCwgYXV0byBtb2RlLCByZXR1cm4gbGlnaHQgZGV0ZWN0ZWQsIHJlZC1leWUgcmVkdWN0aW9uIG1vZGVcIlxuICAgIH0sXG4gICAgU2Vuc2luZ01ldGhvZDoge1xuICAgICAgJzEnOiBcIk5vdCBkZWZpbmVkXCIsXG4gICAgICAnMic6IFwiT25lLWNoaXAgY29sb3IgYXJlYSBzZW5zb3JcIixcbiAgICAgICczJzogXCJUd28tY2hpcCBjb2xvciBhcmVhIHNlbnNvclwiLFxuICAgICAgJzQnOiBcIlRocmVlLWNoaXAgY29sb3IgYXJlYSBzZW5zb3JcIixcbiAgICAgICc1JzogXCJDb2xvciBzZXF1ZW50aWFsIGFyZWEgc2Vuc29yXCIsXG4gICAgICAnNyc6IFwiVHJpbGluZWFyIHNlbnNvclwiLFxuICAgICAgJzgnOiBcIkNvbG9yIHNlcXVlbnRpYWwgbGluZWFyIHNlbnNvclwiXG4gICAgfSxcbiAgICBTY2VuZUNhcHR1cmVUeXBlOiB7XG4gICAgICAnMCc6IFwiU3RhbmRhcmRcIixcbiAgICAgICcxJzogXCJMYW5kc2NhcGVcIixcbiAgICAgICcyJzogXCJQb3J0cmFpdFwiLFxuICAgICAgJzMnOiBcIk5pZ2h0IHNjZW5lXCJcbiAgICB9LFxuICAgIFNjZW5lVHlwZToge1xuICAgICAgJzEnOiBcIkRpcmVjdGx5IHBob3RvZ3JhcGhlZFwiXG4gICAgfSxcbiAgICBDdXN0b21SZW5kZXJlZDoge1xuICAgICAgJzAnOiBcIk5vcm1hbCBwcm9jZXNzXCIsXG4gICAgICAnMSc6IFwiQ3VzdG9tIHByb2Nlc3NcIlxuICAgIH0sXG4gICAgV2hpdGVCYWxhbmNlOiB7XG4gICAgICAnMCc6IFwiQXV0byB3aGl0ZSBiYWxhbmNlXCIsXG4gICAgICAnMSc6IFwiTWFudWFsIHdoaXRlIGJhbGFuY2VcIlxuICAgIH0sXG4gICAgR2FpbkNvbnRyb2w6IHtcbiAgICAgICcwJzogXCJOb25lXCIsXG4gICAgICAnMSc6IFwiTG93IGdhaW4gdXBcIixcbiAgICAgICcyJzogXCJIaWdoIGdhaW4gdXBcIixcbiAgICAgICczJzogXCJMb3cgZ2FpbiBkb3duXCIsXG4gICAgICAnNCc6IFwiSGlnaCBnYWluIGRvd25cIlxuICAgIH0sXG4gICAgQ29udHJhc3Q6IHtcbiAgICAgICcwJzogXCJOb3JtYWxcIixcbiAgICAgICcxJzogXCJTb2Z0XCIsXG4gICAgICAnMic6IFwiSGFyZFwiXG4gICAgfSxcbiAgICBTYXR1cmF0aW9uOiB7XG4gICAgICAnMCc6IFwiTm9ybWFsXCIsXG4gICAgICAnMSc6IFwiTG93IHNhdHVyYXRpb25cIixcbiAgICAgICcyJzogXCJIaWdoIHNhdHVyYXRpb25cIlxuICAgIH0sXG4gICAgU2hhcnBuZXNzOiB7XG4gICAgICAnMCc6IFwiTm9ybWFsXCIsXG4gICAgICAnMSc6IFwiU29mdFwiLFxuICAgICAgJzInOiBcIkhhcmRcIlxuICAgIH0sXG4gICAgU3ViamVjdERpc3RhbmNlUmFuZ2U6IHtcbiAgICAgICcwJzogXCJVbmtub3duXCIsXG4gICAgICAnMSc6IFwiTWFjcm9cIixcbiAgICAgICcyJzogXCJDbG9zZSB2aWV3XCIsXG4gICAgICAnMyc6IFwiRGlzdGFudCB2aWV3XCJcbiAgICB9LFxuICAgIEZpbGVTb3VyY2U6IHtcbiAgICAgICczJzogXCJEU0NcIlxuICAgIH0sXG5cbiAgICBDb21wb25lbnRzOiB7XG4gICAgICAnMCc6IFwiXCIsXG4gICAgICAnMSc6IFwiWVwiLFxuICAgICAgJzInOiBcIkNiXCIsXG4gICAgICAnMyc6IFwiQ3JcIixcbiAgICAgICc0JzogXCJSXCIsXG4gICAgICAnNSc6IFwiR1wiLFxuICAgICAgJzYnOiBcIkJcIlxuICAgIH1cbiAgfTtcblxuICBzdGF0aWMgSXB0Y0ZpZWxkTWFwID0ge1xuICAgICcweDc4JzogJ2NhcHRpb24nLFxuICAgICcweDZFJzogJ2NyZWRpdCcsXG4gICAgJzB4MTknOiAna2V5d29yZHMnLFxuICAgICcweDM3JzogJ2RhdGVDcmVhdGVkJyxcbiAgICAnMHg1MCc6ICdieWxpbmUnLFxuICAgICcweDU1JzogJ2J5bGluZVRpdGxlJyxcbiAgICAnMHg3QSc6ICdjYXB0aW9uV3JpdGVyJyxcbiAgICAnMHg2OSc6ICdoZWFkbGluZScsXG4gICAgJzB4NzQnOiAnY29weXJpZ2h0JyxcbiAgICAnMHgwRic6ICdjYXRlZ29yeSdcbiAgfTtcblxuICBzdGF0aWMgcmVhZElQVENEYXRhKGZpbGUsIHN0YXJ0T2Zmc2V0LCBzZWN0aW9uTGVuZ3RoKSB7XG4gICAgdmFyIGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGZpbGUpO1xuICAgIHZhciBkYXRhID0ge307XG4gICAgdmFyIGZpZWxkVmFsdWUsIGZpZWxkTmFtZSwgZGF0YVNpemUsIHNlZ21lbnRUeXBlLCBzZWdtZW50U2l6ZTtcbiAgICB2YXIgc2VnbWVudFN0YXJ0UG9zID0gc3RhcnRPZmZzZXQ7XG4gICAgd2hpbGUgKHNlZ21lbnRTdGFydFBvcyA8IHN0YXJ0T2Zmc2V0ICsgc2VjdGlvbkxlbmd0aCkge1xuICAgICAgaWYgKGRhdGFWaWV3LmdldFVpbnQ4KHNlZ21lbnRTdGFydFBvcykgPT09IDB4MUMgJiYgZGF0YVZpZXcuZ2V0VWludDgoc2VnbWVudFN0YXJ0UG9zICsgMSkgPT09IDB4MDIpIHtcbiAgICAgICAgc2VnbWVudFR5cGUgPSBkYXRhVmlldy5nZXRVaW50OChzZWdtZW50U3RhcnRQb3MgKyAyKTtcbiAgICAgICAgaWYgKHNlZ21lbnRUeXBlIGluIENyb3BFWElGLklwdGNGaWVsZE1hcCkge1xuICAgICAgICAgIGRhdGFTaXplID0gZGF0YVZpZXcuZ2V0SW50MTYoc2VnbWVudFN0YXJ0UG9zICsgMyk7XG4gICAgICAgICAgc2VnbWVudFNpemUgPSBkYXRhU2l6ZSArIDU7XG4gICAgICAgICAgZmllbGROYW1lID0gQ3JvcEVYSUYuSXB0Y0ZpZWxkTWFwW3NlZ21lbnRUeXBlXTtcbiAgICAgICAgICBmaWVsZFZhbHVlID0gQ3JvcEVYSUYuZ2V0U3RyaW5nRnJvbURCKGRhdGFWaWV3LCBzZWdtZW50U3RhcnRQb3MgKyA1LCBkYXRhU2l6ZSk7XG4gICAgICAgICAgLy8gQ2hlY2sgaWYgd2UgYWxyZWFkeSBzdG9yZWQgYSB2YWx1ZSB3aXRoIHRoaXMgbmFtZVxuICAgICAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KGZpZWxkTmFtZSkpIHtcbiAgICAgICAgICAgIC8vIFZhbHVlIGFscmVhZHkgc3RvcmVkIHdpdGggdGhpcyBuYW1lLCBjcmVhdGUgbXVsdGl2YWx1ZSBmaWVsZFxuICAgICAgICAgICAgaWYgKGRhdGFbZmllbGROYW1lXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgIGRhdGFbZmllbGROYW1lXS5wdXNoKGZpZWxkVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGRhdGFbZmllbGROYW1lXSA9IFtkYXRhW2ZpZWxkTmFtZV0sIGZpZWxkVmFsdWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRhdGFbZmllbGROYW1lXSA9IGZpZWxkVmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIH1cbiAgICAgIHNlZ21lbnRTdGFydFBvcysrO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIHN0YXRpYyByZWFkVGFncyhmaWxlLCB0aWZmU3RhcnQsIGRpclN0YXJ0LCBzdHJpbmdzLCBiaWdFbmQpOiB7IFtrZXk6IHN0cmluZ106IGFueSB9IHtcbiAgICB2YXIgZW50cmllcyA9IGZpbGUuZ2V0VWludDE2KGRpclN0YXJ0LCAhYmlnRW5kKSxcbiAgICAgIHRhZ3MgPSB7fSxcbiAgICAgIGVudHJ5T2Zmc2V0LCB0YWcsXG4gICAgICBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGVudHJpZXM7IGkrKykge1xuICAgICAgZW50cnlPZmZzZXQgPSBkaXJTdGFydCArIGkgKiAxMiArIDI7XG4gICAgICB0YWcgPSBzdHJpbmdzW2ZpbGUuZ2V0VWludDE2KGVudHJ5T2Zmc2V0LCAhYmlnRW5kKV07XG4gICAgICBpZiAodGFnKSB7XG4gICAgICAgIHRhZ3NbdGFnXSA9IENyb3BFWElGLnJlYWRUYWdWYWx1ZShmaWxlLCBlbnRyeU9mZnNldCwgdGlmZlN0YXJ0LCBkaXJTdGFydCwgYmlnRW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUud2FybignVW5rbm93biB0YWc6ICcgKyBmaWxlLmdldFVpbnQxNihlbnRyeU9mZnNldCwgIWJpZ0VuZCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFncztcbiAgfVxuXG4gIHN0YXRpYyByZWFkVGFnVmFsdWUoZmlsZSwgZW50cnlPZmZzZXQsIHRpZmZTdGFydCwgZGlyU3RhcnQsIGJpZ0VuZCkge1xuICAgIHZhciB0eXBlID0gZmlsZS5nZXRVaW50MTYoZW50cnlPZmZzZXQgKyAyLCAhYmlnRW5kKSxcbiAgICAgIG51bVZhbHVlcyA9IGZpbGUuZ2V0VWludDMyKGVudHJ5T2Zmc2V0ICsgNCwgIWJpZ0VuZCksXG4gICAgICB2YWx1ZU9mZnNldCA9IGZpbGUuZ2V0VWludDMyKGVudHJ5T2Zmc2V0ICsgOCwgIWJpZ0VuZCkgKyB0aWZmU3RhcnQsXG4gICAgICBvZmZzZXQsXG4gICAgICB2YWxzLCB2YWwsIG4sXG4gICAgICBudW1lcmF0b3IsIGRlbm9taW5hdG9yO1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICcxJzogLy8gYnl0ZSwgOC1iaXQgdW5zaWduZWQgaW50XG4gICAgICBjYXNlICc3JzogLy8gdW5kZWZpbmVkLCA4LWJpdCBieXRlLCB2YWx1ZSBkZXBlbmRpbmcgb24gZmllbGRcbiAgICAgICAgaWYgKG51bVZhbHVlcyA9PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIGZpbGUuZ2V0VWludDgoZW50cnlPZmZzZXQgKyA4LCAhYmlnRW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvZmZzZXQgPSBudW1WYWx1ZXMgPiA0ID8gdmFsdWVPZmZzZXQgOiAoZW50cnlPZmZzZXQgKyA4KTtcbiAgICAgICAgICB2YWxzID0gW107XG4gICAgICAgICAgZm9yIChuID0gMDsgbiA8IG51bVZhbHVlczsgbisrKSB7XG4gICAgICAgICAgICB2YWxzW25dID0gZmlsZS5nZXRVaW50OChvZmZzZXQgKyBuKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHM7XG4gICAgICAgIH1cblxuICAgICAgY2FzZSAnMic6IC8vIGFzY2lpLCA4LWJpdCBieXRlXG4gICAgICAgIG9mZnNldCA9IG51bVZhbHVlcyA+IDQgPyB2YWx1ZU9mZnNldCA6IChlbnRyeU9mZnNldCArIDgpO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdHJpbmdGcm9tREIoZmlsZSwgb2Zmc2V0LCBudW1WYWx1ZXMgLSAxKTtcblxuICAgICAgY2FzZSAnMyc6IC8vIHNob3J0LCAxNiBiaXQgaW50XG4gICAgICAgIGlmIChudW1WYWx1ZXMgPT0gMSkge1xuICAgICAgICAgIHJldHVybiBmaWxlLmdldFVpbnQxNihlbnRyeU9mZnNldCArIDgsICFiaWdFbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9mZnNldCA9IG51bVZhbHVlcyA+IDIgPyB2YWx1ZU9mZnNldCA6IChlbnRyeU9mZnNldCArIDgpO1xuICAgICAgICAgIHZhbHMgPSBbXTtcbiAgICAgICAgICBmb3IgKG4gPSAwOyBuIDwgbnVtVmFsdWVzOyBuKyspIHtcbiAgICAgICAgICAgIHZhbHNbbl0gPSBmaWxlLmdldFVpbnQxNihvZmZzZXQgKyAyICogbiwgIWJpZ0VuZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB2YWxzO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgJzQnOiAvLyBsb25nLCAzMiBiaXQgaW50XG4gICAgICAgIGlmIChudW1WYWx1ZXMgPT0gMSkge1xuICAgICAgICAgIHJldHVybiBmaWxlLmdldFVpbnQzMihlbnRyeU9mZnNldCArIDgsICFiaWdFbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHMgPSBbXTtcbiAgICAgICAgICBmb3IgKG4gPSAwOyBuIDwgbnVtVmFsdWVzOyBuKyspIHtcbiAgICAgICAgICAgIHZhbHNbbl0gPSBmaWxlLmdldFVpbnQzMih2YWx1ZU9mZnNldCArIDQgKiBuLCAhYmlnRW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHM7XG4gICAgICAgIH1cblxuICAgICAgY2FzZSAnNSc6ICAgIC8vIHJhdGlvbmFsID0gdHdvIGxvbmcgdmFsdWVzLCBmaXJzdCBpcyBudW1lcmF0b3IsIHNlY29uZCBpcyBkZW5vbWluYXRvclxuICAgICAgICBpZiAobnVtVmFsdWVzID09IDEpIHtcbiAgICAgICAgICBudW1lcmF0b3IgPSBmaWxlLmdldFVpbnQzMih2YWx1ZU9mZnNldCwgIWJpZ0VuZCk7XG4gICAgICAgICAgZGVub21pbmF0b3IgPSBmaWxlLmdldFVpbnQzMih2YWx1ZU9mZnNldCArIDQsICFiaWdFbmQpO1xuICAgICAgICAgIHZhbCA9IG5ldyBOdW1iZXIobnVtZXJhdG9yIC8gZGVub21pbmF0b3IpO1xuICAgICAgICAgIHZhbC5udW1lcmF0b3IgPSBudW1lcmF0b3I7XG4gICAgICAgICAgdmFsLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG4gICAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWxzID0gW107XG4gICAgICAgICAgZm9yIChuID0gMDsgbiA8IG51bVZhbHVlczsgbisrKSB7XG4gICAgICAgICAgICBudW1lcmF0b3IgPSBmaWxlLmdldFVpbnQzMih2YWx1ZU9mZnNldCArIDggKiBuLCAhYmlnRW5kKTtcbiAgICAgICAgICAgIGRlbm9taW5hdG9yID0gZmlsZS5nZXRVaW50MzIodmFsdWVPZmZzZXQgKyA0ICsgOCAqIG4sICFiaWdFbmQpO1xuICAgICAgICAgICAgdmFsc1tuXSA9IG5ldyBOdW1iZXIobnVtZXJhdG9yIC8gZGVub21pbmF0b3IpO1xuICAgICAgICAgICAgdmFsc1tuXS5udW1lcmF0b3IgPSBudW1lcmF0b3I7XG4gICAgICAgICAgICB2YWxzW25dLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB2YWxzO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgJzknOiAvLyBzbG9uZywgMzIgYml0IHNpZ25lZCBpbnRcbiAgICAgICAgaWYgKG51bVZhbHVlcyA9PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIGZpbGUuZ2V0SW50MzIoZW50cnlPZmZzZXQgKyA4LCAhYmlnRW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWxzID0gW107XG4gICAgICAgICAgZm9yIChuID0gMDsgbiA8IG51bVZhbHVlczsgbisrKSB7XG4gICAgICAgICAgICB2YWxzW25dID0gZmlsZS5nZXRJbnQzMih2YWx1ZU9mZnNldCArIDQgKiBuLCAhYmlnRW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHM7XG4gICAgICAgIH1cblxuICAgICAgY2FzZSAnMTAnOiAvLyBzaWduZWQgcmF0aW9uYWwsIHR3byBzbG9uZ3MsIGZpcnN0IGlzIG51bWVyYXRvciwgc2Vjb25kIGlzIGRlbm9taW5hdG9yXG4gICAgICAgIGlmIChudW1WYWx1ZXMgPT0gMSkge1xuICAgICAgICAgIHJldHVybiBmaWxlLmdldEludDMyKHZhbHVlT2Zmc2V0LCAhYmlnRW5kKSAvIGZpbGUuZ2V0SW50MzIodmFsdWVPZmZzZXQgKyA0LCAhYmlnRW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWxzID0gW107XG4gICAgICAgICAgZm9yIChuID0gMDsgbiA8IG51bVZhbHVlczsgbisrKSB7XG4gICAgICAgICAgICB2YWxzW25dID0gZmlsZS5nZXRJbnQzMih2YWx1ZU9mZnNldCArIDggKiBuLCAhYmlnRW5kKSAvIGZpbGUuZ2V0SW50MzIodmFsdWVPZmZzZXQgKyA0ICsgOCAqIG4sICFiaWdFbmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdmFscztcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBhZGRFdmVudChlbGVtZW50LCBldmVudCwgaGFuZGxlcikge1xuICAgIGlmIChlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgZmFsc2UpO1xuICAgIH0gZWxzZSBpZiAoZWxlbWVudC5hdHRhY2hFdmVudCkge1xuICAgICAgZWxlbWVudC5hdHRhY2hFdmVudChcIm9uXCIgKyBldmVudCwgaGFuZGxlcik7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG9iamVjdFVSTFRvQmxvYih1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICBodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICBodHRwLnJlc3BvbnNlVHlwZSA9IFwiYmxvYlwiO1xuICAgIGh0dHAub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSAyMDAgfHwgdGhpcy5zdGF0dXMgPT09IDApIHtcbiAgICAgICAgY2FsbGJhY2sodGhpcy5yZXNwb25zZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBodHRwLnNlbmQoKTtcbiAgfVxuXG4gIHN0YXRpYyBoYW5kbGVCaW5hcnlGaWxlKGJpbkZpbGUsIGltZywgY2FsbGJhY2s/KSB7XG4gICAgdmFyIGRhdGEgPSBDcm9wRVhJRi5maW5kRVhJRmluSlBFRyhiaW5GaWxlKTtcbiAgICB2YXIgaXB0Y2RhdGEgPSBDcm9wRVhJRi5maW5kSVBUQ2luSlBFRyhiaW5GaWxlKTtcbiAgICBpbWcuZXhpZmRhdGEgPSBkYXRhIHx8IHt9O1xuICAgIGltZy5pcHRjZGF0YSA9IGlwdGNkYXRhIHx8IHt9O1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2suY2FsbChpbWcpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBnZXRJbWFnZURhdGEoaW1nLCBjYWxsYmFjaykge1xuICAgIGlmIChpbWcuc3JjKSB7XG4gICAgICBpZiAoL15kYXRhXFw6L2kudGVzdChpbWcuc3JjKSkgeyAvLyBEYXRhIFVSSVxuICAgICAgICB2YXIgYXJyYXlCdWZmZXIgPSBDcm9wRVhJRi5iYXNlNjRUb0FycmF5QnVmZmVyKGltZy5zcmMpO1xuICAgICAgICB0aGlzLmhhbmRsZUJpbmFyeUZpbGUoYXJyYXlCdWZmZXIsIGltZywgY2FsbGJhY2spO1xuXG4gICAgICB9IGVsc2UgaWYgKC9eYmxvYlxcOi9pLnRlc3QoaW1nLnNyYykpIHsgLy8gT2JqZWN0IFVSTFxuICAgICAgICB2YXIgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gKGUpID0+IHtcbiAgICAgICAgICB0aGlzLmhhbmRsZUJpbmFyeUZpbGUoZS50YXJnZXQucmVzdWx0LCBpbWcsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICAgICAgQ3JvcEVYSUYub2JqZWN0VVJMVG9CbG9iKGltZy5zcmMsIGZ1bmN0aW9uIChibG9iKSB7XG4gICAgICAgICAgZmlsZVJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgaHR0cC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IDIwMCB8fCB0aGlzLnN0YXR1cyA9PT0gMCkge1xuICAgICAgICAgICAgc2VsZi5oYW5kbGVCaW5hcnlGaWxlKGh0dHAucmVzcG9uc2UsIGltZywgY2FsbGJhY2spO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBsb2FkIGltYWdlXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGh0dHAgPSBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBodHRwLm9wZW4oXCJHRVRcIiwgaW1nLnNyYywgdHJ1ZSk7XG4gICAgICAgIGh0dHAucmVzcG9uc2VUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xuICAgICAgICBodHRwLnNlbmQobnVsbCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChGaWxlUmVhZGVyICYmIChpbWcgaW5zdGFuY2VvZiB3aW5kb3cuQmxvYiB8fCBpbWcgaW5zdGFuY2VvZiBGaWxlKSkge1xuICAgICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSBlID0+IHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnZ2V0SW1hZ2VEYXRhOiBHb3QgZmlsZSBvZiBsZW5ndGggJW8nLCBlLnRhcmdldC5yZXN1bHQuYnl0ZUxlbmd0aCk7XG4gICAgICAgIHRoaXMuaGFuZGxlQmluYXJ5RmlsZShlLnRhcmdldC5yZXN1bHQsIGltZywgY2FsbGJhY2spO1xuICAgICAgfTtcblxuICAgICAgZmlsZVJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihpbWcpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBnZXRTdHJpbmdGcm9tREIoYnVmZmVyLCBzdGFydCwgbGVuZ3RoKSB7XG4gICAgdmFyIG91dHN0ciA9IFwiXCI7XG4gICAgZm9yICh2YXIgbiA9IHN0YXJ0OyBuIDwgc3RhcnQgKyBsZW5ndGg7IG4rKykge1xuICAgICAgb3V0c3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmZmVyLmdldFVpbnQ4KG4pKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHN0cjtcbiAgfVxuXG4gIHN0YXRpYyByZWFkRVhJRkRhdGEoZmlsZSwgc3RhcnQpIHtcbiAgICBpZiAodGhpcy5nZXRTdHJpbmdGcm9tREIoZmlsZSwgc3RhcnQsIDQpICE9IFwiRXhpZlwiKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiTm90IHZhbGlkIEVYSUYgZGF0YSEgXCIgKyB0aGlzLmdldFN0cmluZ0Zyb21EQihmaWxlLCBzdGFydCwgNCkpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBiaWdFbmQsXG4gICAgICB0YWdzLFxuICAgICAgZXhpZkRhdGEsIGdwc0RhdGEsXG4gICAgICB0aWZmT2Zmc2V0ID0gc3RhcnQgKyA2O1xuICAgIGxldCB0YWc6IHN0cmluZztcblxuICAgIC8vIHRlc3QgZm9yIFRJRkYgdmFsaWRpdHkgYW5kIGVuZGlhbm5lc3NcbiAgICBpZiAoZmlsZS5nZXRVaW50MTYodGlmZk9mZnNldCkgPT0gMHg0OTQ5KSB7XG4gICAgICBiaWdFbmQgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGZpbGUuZ2V0VWludDE2KHRpZmZPZmZzZXQpID09IDB4NEQ0RCkge1xuICAgICAgYmlnRW5kID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihcIk5vdCB2YWxpZCBUSUZGIGRhdGEhIChubyAweDQ5NDkgb3IgMHg0RDREKVwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoZmlsZS5nZXRVaW50MTYodGlmZk9mZnNldCArIDIsICFiaWdFbmQpICE9IDB4MDAyQSkge1xuICAgICAgY29uc29sZS5lcnJvcihcIk5vdCB2YWxpZCBUSUZGIGRhdGEhIChubyAweDAwMkEpXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBmaXJzdElGRE9mZnNldCA9IGZpbGUuZ2V0VWludDMyKHRpZmZPZmZzZXQgKyA0LCAhYmlnRW5kKTtcblxuICAgIGlmIChmaXJzdElGRE9mZnNldCA8IDB4MDAwMDAwMDgpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJOb3QgdmFsaWQgVElGRiBkYXRhISAoRmlyc3Qgb2Zmc2V0IGxlc3MgdGhhbiA4KVwiLCBmaWxlLmdldFVpbnQzMih0aWZmT2Zmc2V0ICsgNCwgIWJpZ0VuZCkpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRhZ3MgPSBDcm9wRVhJRi5yZWFkVGFncyhmaWxlLCB0aWZmT2Zmc2V0LCB0aWZmT2Zmc2V0ICsgZmlyc3RJRkRPZmZzZXQsIHRoaXMuVGlmZlRhZ3MsIGJpZ0VuZCk7XG5cbiAgICBpZiAodGFncy5FeGlmSUZEUG9pbnRlcikge1xuICAgICAgZXhpZkRhdGEgPSBDcm9wRVhJRi5yZWFkVGFncyhmaWxlLCB0aWZmT2Zmc2V0LCB0aWZmT2Zmc2V0ICsgdGFncy5FeGlmSUZEUG9pbnRlciwgdGhpcy5FeGlmVGFncywgYmlnRW5kKTtcbiAgICAgIGZvciAodGFnIGluIGV4aWZEYXRhKSB7XG4gICAgICAgIHN3aXRjaCAodGFnKSB7XG4gICAgICAgICAgY2FzZSBcIkxpZ2h0U291cmNlXCIgOlxuICAgICAgICAgIGNhc2UgXCJGbGFzaFwiIDpcbiAgICAgICAgICBjYXNlIFwiTWV0ZXJpbmdNb2RlXCIgOlxuICAgICAgICAgIGNhc2UgXCJFeHBvc3VyZVByb2dyYW1cIiA6XG4gICAgICAgICAgY2FzZSBcIlNlbnNpbmdNZXRob2RcIiA6XG4gICAgICAgICAgY2FzZSBcIlNjZW5lQ2FwdHVyZVR5cGVcIiA6XG4gICAgICAgICAgY2FzZSBcIlNjZW5lVHlwZVwiIDpcbiAgICAgICAgICBjYXNlIFwiQ3VzdG9tUmVuZGVyZWRcIiA6XG4gICAgICAgICAgY2FzZSBcIldoaXRlQmFsYW5jZVwiIDpcbiAgICAgICAgICBjYXNlIFwiR2FpbkNvbnRyb2xcIiA6XG4gICAgICAgICAgY2FzZSBcIkNvbnRyYXN0XCIgOlxuICAgICAgICAgIGNhc2UgXCJTYXR1cmF0aW9uXCIgOlxuICAgICAgICAgIGNhc2UgXCJTaGFycG5lc3NcIiA6XG4gICAgICAgICAgY2FzZSBcIlN1YmplY3REaXN0YW5jZVJhbmdlXCIgOlxuICAgICAgICAgIGNhc2UgXCJGaWxlU291cmNlXCIgOlxuICAgICAgICAgICAgZXhpZkRhdGFbdGFnXSA9IHRoaXMuU3RyaW5nVmFsdWVzW3RhZ11bZXhpZkRhdGFbdGFnXV07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgXCJFeGlmVmVyc2lvblwiIDpcbiAgICAgICAgICBjYXNlIFwiRmxhc2hwaXhWZXJzaW9uXCIgOlxuICAgICAgICAgICAgZXhpZkRhdGFbdGFnXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoZXhpZkRhdGFbdGFnXVswXSwgZXhpZkRhdGFbdGFnXVsxXSwgZXhpZkRhdGFbdGFnXVsyXSwgZXhpZkRhdGFbdGFnXVszXSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgXCJDb21wb25lbnRzQ29uZmlndXJhdGlvblwiIDpcbiAgICAgICAgICAgIGV4aWZEYXRhW3RhZ10gPVxuICAgICAgICAgICAgICB0aGlzLlN0cmluZ1ZhbHVlcy5Db21wb25lbnRzW2V4aWZEYXRhW3RhZ11bMF1dICtcbiAgICAgICAgICAgICAgdGhpcy5TdHJpbmdWYWx1ZXMuQ29tcG9uZW50c1tleGlmRGF0YVt0YWddWzFdXSArXG4gICAgICAgICAgICAgIHRoaXMuU3RyaW5nVmFsdWVzLkNvbXBvbmVudHNbZXhpZkRhdGFbdGFnXVsyXV0gK1xuICAgICAgICAgICAgICB0aGlzLlN0cmluZ1ZhbHVlcy5Db21wb25lbnRzW2V4aWZEYXRhW3RhZ11bM11dO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdGFnc1t0YWddID0gZXhpZkRhdGFbdGFnXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGFncy5HUFNJbmZvSUZEUG9pbnRlcikge1xuICAgICAgZ3BzRGF0YSA9IHRoaXMucmVhZFRhZ3MoZmlsZSwgdGlmZk9mZnNldCwgdGlmZk9mZnNldCArIHRhZ3MuR1BTSW5mb0lGRFBvaW50ZXIsIHRoaXMuR1BTVGFncywgYmlnRW5kKTtcbiAgICAgIGZvciAodGFnIGluIGdwc0RhdGEpIHtcbiAgICAgICAgc3dpdGNoICh0YWcpIHtcbiAgICAgICAgICBjYXNlIFwiR1BTVmVyc2lvbklEXCIgOlxuICAgICAgICAgICAgZ3BzRGF0YVt0YWddID0gZ3BzRGF0YVt0YWddWzBdICtcbiAgICAgICAgICAgICAgXCIuXCIgKyBncHNEYXRhW3RhZ11bMV0gK1xuICAgICAgICAgICAgICBcIi5cIiArIGdwc0RhdGFbdGFnXVsyXSArXG4gICAgICAgICAgICAgIFwiLlwiICsgZ3BzRGF0YVt0YWddWzNdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdGFnc1t0YWddID0gZ3BzRGF0YVt0YWddO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YWdzO1xuICB9XG5cbiAgc3RhdGljIGdldERhdGEoaW1nLCBjYWxsYmFjaykge1xuICAgIGlmICgoaW1nIGluc3RhbmNlb2YgSW1hZ2UgfHwgaW1nIGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudCkgJiYgIWltZy5jb21wbGV0ZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgaWYgKCF0aGlzLmltYWdlSGFzRGF0YShpbWcpKSB7XG4gICAgICBDcm9wRVhJRi5nZXRJbWFnZURhdGEoaW1nLCBjYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjay5jYWxsKGltZyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIHN0YXRpYyBnZXRUYWcoaW1nLCB0YWcpIHtcbiAgICBpZiAoIXRoaXMuaW1hZ2VIYXNEYXRhKGltZykpIHJldHVybjtcbiAgICByZXR1cm4gaW1nLmV4aWZkYXRhW3RhZ107XG4gIH07XG5cbiAgc3RhdGljIGdldEFsbFRhZ3MoaW1nKSB7XG4gICAgaWYgKCF0aGlzLmltYWdlSGFzRGF0YShpbWcpKSByZXR1cm4ge307XG4gICAgdmFyIGEsXG4gICAgICBkYXRhID0gaW1nLmV4aWZkYXRhLFxuICAgICAgdGFncyA9IHt9O1xuICAgIGZvciAoYSBpbiBkYXRhKSB7XG4gICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShhKSkge1xuICAgICAgICB0YWdzW2FdID0gZGF0YVthXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhZ3M7XG4gIH07XG5cbiAgc3RhdGljIHByZXR0eShpbWcpIHtcbiAgICBpZiAoIXRoaXMuaW1hZ2VIYXNEYXRhKGltZykpIHJldHVybiBcIlwiO1xuICAgIHZhciBhLFxuICAgICAgZGF0YSA9IGltZy5leGlmZGF0YSxcbiAgICAgIHN0clByZXR0eSA9IFwiXCI7XG4gICAgZm9yIChhIGluIGRhdGEpIHtcbiAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KGEpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YVthXSA9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgaWYgKGRhdGFbYV0gaW5zdGFuY2VvZiBOdW1iZXIpIHtcbiAgICAgICAgICAgIHN0clByZXR0eSArPSBhICsgXCIgOiBcIiArIGRhdGFbYV0gKyBcIiBbXCIgKyBkYXRhW2FdLm51bWVyYXRvciArIFwiL1wiICsgZGF0YVthXS5kZW5vbWluYXRvciArIFwiXVxcclxcblwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHJQcmV0dHkgKz0gYSArIFwiIDogW1wiICsgZGF0YVthXS5sZW5ndGggKyBcIiB2YWx1ZXNdXFxyXFxuXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0clByZXR0eSArPSBhICsgXCIgOiBcIiArIGRhdGFbYV0gKyBcIlxcclxcblwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdHJQcmV0dHk7XG4gIH1cblxuXG4gIHN0YXRpYyBmaW5kRVhJRmluSlBFRyhmaWxlKSB7XG4gICAgdmFyIGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGZpbGUpO1xuICAgIHZhciBtYXhPZmZzZXQgPSBkYXRhVmlldy5ieXRlTGVuZ3RoIC0gNDtcblxuICAgIGNvbnNvbGUuZGVidWcoJ2ZpbmRFWElGaW5KUEVHOiBHb3QgZmlsZSBvZiBsZW5ndGggJW8nLCBmaWxlLmJ5dGVMZW5ndGgpO1xuICAgIGlmIChkYXRhVmlldy5nZXRVaW50MTYoMCkgIT09IDB4ZmZkOCkge1xuICAgICAgY29uc29sZS53YXJuKCdOb3QgYSB2YWxpZCBKUEVHJyk7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIG5vdCBhIHZhbGlkIGpwZWdcbiAgICB9XG5cbiAgICB2YXIgb2Zmc2V0ID0gMjtcbiAgICB2YXIgbWFya2VyO1xuXG4gICAgZnVuY3Rpb24gcmVhZEJ5dGUoKSB7XG4gICAgICB2YXIgc29tZUJ5dGUgPSBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQpO1xuICAgICAgb2Zmc2V0Kys7XG4gICAgICByZXR1cm4gc29tZUJ5dGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZFdvcmQoKSB7XG4gICAgICB2YXIgc29tZVdvcmQgPSBkYXRhVmlldy5nZXRVaW50MTYob2Zmc2V0KTtcbiAgICAgIG9mZnNldCA9IG9mZnNldCArIDI7XG4gICAgICByZXR1cm4gc29tZVdvcmQ7XG4gICAgfVxuXG4gICAgd2hpbGUgKG9mZnNldCA8IG1heE9mZnNldCkge1xuICAgICAgdmFyIHNvbWVCeXRlID0gcmVhZEJ5dGUoKTtcbiAgICAgIGlmIChzb21lQnl0ZSAhPSAweEZGKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vdCBhIHZhbGlkIG1hcmtlciBhdCBvZmZzZXQgJyArIG9mZnNldCArIFwiLCBmb3VuZDogXCIgKyBzb21lQnl0ZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gbm90IGEgdmFsaWQgbWFya2VyLCBzb21ldGhpbmcgaXMgd3JvbmdcbiAgICAgIH1cbiAgICAgIG1hcmtlciA9IHJlYWRCeXRlKCk7XG4gICAgICBjb25zb2xlLmRlYnVnKCdNYXJrZXI9JW8nLCBtYXJrZXIpO1xuXG4gICAgICAvLyB3ZSBjb3VsZCBpbXBsZW1lbnQgaGFuZGxpbmcgZm9yIG90aGVyIG1hcmtlcnMgaGVyZSxcbiAgICAgIC8vIGJ1dCB3ZSdyZSBvbmx5IGxvb2tpbmcgZm9yIDB4RkZFMSBmb3IgRVhJRiBkYXRhXG5cbiAgICAgIHZhciBzZWdtZW50TGVuZ3RoID0gcmVhZFdvcmQoKSAtIDI7XG4gICAgICBzd2l0Y2ggKG1hcmtlcikge1xuICAgICAgICBjYXNlICcweEUxJzpcbiAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkRVhJRkRhdGEoZGF0YVZpZXcsIG9mZnNldC8qLCBzZWdtZW50TGVuZ3RoKi8pO1xuICAgICAgICBjYXNlICcweEUwJzogLy8gSkZJRlxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIG9mZnNldCArPSBzZWdtZW50TGVuZ3RoO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBmaW5kSVBUQ2luSlBFRyhmaWxlKSB7XG4gICAgdmFyIGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGZpbGUpO1xuXG4gICAgY29uc29sZS5kZWJ1ZygnR290IGZpbGUgb2YgbGVuZ3RoICcgKyBmaWxlLmJ5dGVMZW5ndGgpO1xuICAgIGlmICgoZGF0YVZpZXcuZ2V0VWludDgoMCkgIT0gMHhGRikgfHwgKGRhdGFWaWV3LmdldFVpbnQ4KDEpICE9IDB4RDgpKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ05vdCBhIHZhbGlkIEpQRUcnKTtcbiAgICAgIHJldHVybiBmYWxzZTsgLy8gbm90IGEgdmFsaWQganBlZ1xuICAgIH1cblxuICAgIHZhciBvZmZzZXQgPSAyLFxuICAgICAgbGVuZ3RoID0gZmlsZS5ieXRlTGVuZ3RoO1xuXG5cbiAgICB2YXIgaXNGaWVsZFNlZ21lbnRTdGFydCA9IGZ1bmN0aW9uIChkYXRhVmlldywgb2Zmc2V0KSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQpID09PSAweDM4ICYmXG4gICAgICAgIGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCArIDEpID09PSAweDQyICYmXG4gICAgICAgIGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCArIDIpID09PSAweDQ5ICYmXG4gICAgICAgIGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCArIDMpID09PSAweDREICYmXG4gICAgICAgIGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCArIDQpID09PSAweDA0ICYmXG4gICAgICAgIGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCArIDUpID09PSAweDA0XG4gICAgICApO1xuICAgIH07XG5cbiAgICB3aGlsZSAob2Zmc2V0IDwgbGVuZ3RoKSB7XG4gICAgICBpZiAoaXNGaWVsZFNlZ21lbnRTdGFydChkYXRhVmlldywgb2Zmc2V0KSkge1xuICAgICAgICAvLyBHZXQgdGhlIGxlbmd0aCBvZiB0aGUgbmFtZSBoZWFkZXIgKHdoaWNoIGlzIHBhZGRlZCB0byBhbiBldmVuIG51bWJlciBvZiBieXRlcylcbiAgICAgICAgdmFyIG5hbWVIZWFkZXJMZW5ndGggPSBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQgKyA3KTtcbiAgICAgICAgaWYgKG5hbWVIZWFkZXJMZW5ndGggJSAyICE9PSAwKSBuYW1lSGVhZGVyTGVuZ3RoICs9IDE7XG4gICAgICAgIC8vIENoZWNrIGZvciBwcmUgcGhvdG9zaG9wIDYgZm9ybWF0XG4gICAgICAgIGlmIChuYW1lSGVhZGVyTGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgLy8gQWx3YXlzIDRcbiAgICAgICAgICBuYW1lSGVhZGVyTGVuZ3RoID0gNDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdGFydE9mZnNldCA9IG9mZnNldCArIDggKyBuYW1lSGVhZGVyTGVuZ3RoO1xuICAgICAgICB2YXIgc2VjdGlvbkxlbmd0aCA9IGRhdGFWaWV3LmdldFVpbnQxNihvZmZzZXQgKyA2ICsgbmFtZUhlYWRlckxlbmd0aCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZElQVENEYXRhKGZpbGUsIHN0YXJ0T2Zmc2V0LCBzZWN0aW9uTGVuZ3RoKTtcbiAgICAgIH1cblxuICAgICAgLy8gTm90IHRoZSBtYXJrZXIsIGNvbnRpbnVlIHNlYXJjaGluZ1xuICAgICAgb2Zmc2V0Kys7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIHJlYWRGcm9tQmluYXJ5RmlsZShmaWxlKSB7XG4gICAgcmV0dXJuIENyb3BFWElGLmZpbmRFWElGaW5KUEVHKGZpbGUpO1xuICB9XG5cbiAgc3RhdGljIGltYWdlSGFzRGF0YShpbWcpIHtcbiAgICByZXR1cm4gISEoaW1nLmV4aWZkYXRhKTtcbiAgfVxuXG4gIHN0YXRpYyBiYXNlNjRUb0FycmF5QnVmZmVyKGJhc2U2NCwgY29udGVudFR5cGU/KSB7XG4gICAgY29udGVudFR5cGUgPSBjb250ZW50VHlwZSB8fCBiYXNlNjQubWF0Y2goL15kYXRhXFw6KFteXFw7XSspXFw7YmFzZTY0LC9taSlbMV0gfHwgJyc7IC8vIGUuZy4gJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsLi4uJyA9PiAnaW1hZ2UvanBlZydcbiAgICBiYXNlNjQgPSBiYXNlNjQucmVwbGFjZSgvXmRhdGFcXDooW15cXDtdKylcXDtiYXNlNjQsL2dtaSwgJycpO1xuICAgIHZhciBiaW5hcnkgPSBhdG9iKGJhc2U2NCk7XG4gICAgdmFyIGxlbiA9IGJpbmFyeS5sZW5ndGg7XG4gICAgdmFyIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihsZW4pO1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2aWV3W2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIHJldHVybiBidWZmZXI7XG4gIH1cbn0iXX0=