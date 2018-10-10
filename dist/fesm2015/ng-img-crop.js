import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, NgModule } from '@angular/core';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class CropPubSub {
    constructor() {
        this.events = {};
    }
    /**
     * @param {?} names
     * @param {?} handler
     * @return {?}
     */
    on(names, handler) {
        names.split(' ').forEach(name => {
            if (!this.events[name]) {
                this.events[name] = [];
            }
            this.events[name].push(handler);
        });
        return this;
    }
    ;
    /**
     * @param {?} name
     * @param {?} args
     * @return {?}
     */
    trigger(name, args) {
        /** @type {?} */
        const listeners = this.events[name];
        if (listeners) {
            listeners.forEach(handler => {
                handler.call(null, args);
            });
        }
        return this;
    }
    ;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * EXIF service is based on the exif-js library (https://github.com/jseidelin/exif-js)
 */
class CropEXIF {
    /**
     * @param {?} file
     * @param {?} startOffset
     * @param {?} sectionLength
     * @return {?}
     */
    static readIPTCData(file, startOffset, sectionLength) {
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
        var segmentStartPos = startOffset;
        while (segmentStartPos < startOffset + sectionLength) {
            if (dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos + 1) === 0x02) {
                segmentType = dataView.getUint8(segmentStartPos + 2);
                if (segmentType in CropEXIF.IptcFieldMap) {
                    dataSize = dataView.getInt16(segmentStartPos + 3);
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
    }
    /**
     * @param {?} file
     * @param {?} tiffStart
     * @param {?} dirStart
     * @param {?} strings
     * @param {?} bigEnd
     * @return {?}
     */
    static readTags(file, tiffStart, dirStart, strings, bigEnd) {
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
    }
    /**
     * @param {?} file
     * @param {?} entryOffset
     * @param {?} tiffStart
     * @param {?} dirStart
     * @param {?} bigEnd
     * @return {?}
     */
    static readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
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
    }
    /**
     * @param {?} element
     * @param {?} event
     * @param {?} handler
     * @return {?}
     */
    static addEvent(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        }
        else if (element.attachEvent) {
            element.attachEvent("on" + event, handler);
        }
    }
    /**
     * @param {?} url
     * @param {?} callback
     * @return {?}
     */
    static objectURLToBlob(url, callback) {
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
    }
    /**
     * @param {?} binFile
     * @param {?} img
     * @param {?=} callback
     * @return {?}
     */
    static handleBinaryFile(binFile, img, callback) {
        /** @type {?} */
        var data = CropEXIF.findEXIFinJPEG(binFile);
        /** @type {?} */
        var iptcdata = CropEXIF.findIPTCinJPEG(binFile);
        img.exifdata = data || {};
        img.iptcdata = iptcdata || {};
        if (callback) {
            callback.call(img);
        }
    }
    /**
     * @param {?} img
     * @param {?} callback
     * @return {?}
     */
    static getImageData(img, callback) {
        if (img.src) {
            if (/^data\:/i.test(img.src)) { // Data URI
                /** @type {?} */
                var arrayBuffer = CropEXIF.base64ToArrayBuffer(img.src);
                this.handleBinaryFile(arrayBuffer, img, callback);
            }
            else if (/^blob\:/i.test(img.src)) { // Object URL
                /** @type {?} */
                var fileReader = new FileReader();
                fileReader.onload = (e) => {
                    this.handleBinaryFile(e.target.result, img, callback);
                };
                CropEXIF.objectURLToBlob(img.src, function (blob) {
                    fileReader.readAsArrayBuffer(blob);
                });
            }
            else {
                /** @type {?} */
                var http = new XMLHttpRequest();
                /** @type {?} */
                const self = this;
                http.onload = function () {
                    if (this.status == 200 || this.status === 0) {
                        self.handleBinaryFile(http.response, img, callback);
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
            fileReader.onload = e => {
                console.debug('getImageData: Got file of length %o', e.target.result.byteLength);
                this.handleBinaryFile(e.target.result, img, callback);
            };
            fileReader.readAsArrayBuffer(img);
        }
    }
    /**
     * @param {?} buffer
     * @param {?} start
     * @param {?} length
     * @return {?}
     */
    static getStringFromDB(buffer, start, length) {
        /** @type {?} */
        var outstr = "";
        for (var n = start; n < start + length; n++) {
            outstr += String.fromCharCode(buffer.getUint8(n));
        }
        return outstr;
    }
    /**
     * @param {?} file
     * @param {?} start
     * @return {?}
     */
    static readEXIFData(file, start) {
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
        let tag;
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
    }
    /**
     * @param {?} img
     * @param {?} callback
     * @return {?}
     */
    static getData(img, callback) {
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
    }
    ;
    /**
     * @param {?} img
     * @param {?} tag
     * @return {?}
     */
    static getTag(img, tag) {
        if (!this.imageHasData(img))
            return;
        return img.exifdata[tag];
    }
    ;
    /**
     * @param {?} img
     * @return {?}
     */
    static getAllTags(img) {
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
    }
    ;
    /**
     * @param {?} img
     * @return {?}
     */
    static pretty(img) {
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
    }
    /**
     * @param {?} file
     * @return {?}
     */
    static findEXIFinJPEG(file) {
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
    }
    /**
     * @param {?} file
     * @return {?}
     */
    static findIPTCinJPEG(file) {
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
    }
    /**
     * @param {?} file
     * @return {?}
     */
    static readFromBinaryFile(file) {
        return CropEXIF.findEXIFinJPEG(file);
    }
    /**
     * @param {?} img
     * @return {?}
     */
    static imageHasData(img) {
        return !!(img.exifdata);
    }
    /**
     * @param {?} base64
     * @param {?=} contentType
     * @return {?}
     */
    static base64ToArrayBuffer(base64, contentType) {
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
    }
}
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class CropCanvas {
    /**
     * @param {?} ctx
     */
    constructor(ctx) {
        this.ctx = ctx;
        // Shape = Array of [x,y]; [0, 0] - center
        this.shapeArrowNW = [[-0.5, -2], [-3, -4.5], [-0.5, -7], [-7, -7], [-7, -0.5], [-4.5, -3], [-2, -0.5]];
        this.shapeArrowNE = [[0.5, -2], [3, -4.5], [0.5, -7], [7, -7], [7, -0.5], [4.5, -3], [2, -0.5]];
        this.shapeArrowSW = [[-0.5, 2], [-3, 4.5], [-0.5, 7], [-7, 7], [-7, 0.5], [-4.5, 3], [-2, 0.5]];
        this.shapeArrowSE = [[0.5, 2], [3, 4.5], [0.5, 7], [7, 7], [7, 0.5], [4.5, 3], [2, 0.5]];
        this.shapeArrowN = [[-1.5, -2.5], [-1.5, -6], [-5, -6], [0, -11], [5, -6], [1.5, -6], [1.5, -2.5]];
        this.shapeArrowW = [[-2.5, -1.5], [-6, -1.5], [-6, -5], [-11, 0], [-6, 5], [-6, 1.5], [-2.5, 1.5]];
        this.shapeArrowS = [[-1.5, 2.5], [-1.5, 6], [-5, 6], [0, 11], [5, 6], [1.5, 6], [1.5, 2.5]];
        this.shapeArrowE = [[2.5, -1.5], [6, -1.5], [6, -5], [11, 0], [6, 5], [6, 1.5], [2.5, 1.5]];
        // Colors
        this.colors = {
            areaOutline: '#fff',
            resizeBoxStroke: '#fff',
            resizeBoxFill: '#444',
            resizeBoxArrowFill: '#fff',
            resizeCircleStroke: '#fff',
            resizeCircleFill: '#444',
            moveIconFill: '#fff'
        };
    }
    /**
     * @param {?} point
     * @param {?} offset
     * @param {?} scale
     * @return {?}
     */
    calcPoint(point, offset, scale) {
        return [scale * point[0] + offset[0], scale * point[1] + offset[1]];
    }
    ;
    /**
     * @param {?} shape
     * @param {?} fillStyle
     * @param {?} centerCoords
     * @param {?} scale
     * @return {?}
     */
    drawFilledPolygon(shape, fillStyle, centerCoords, scale) {
        this.ctx.save();
        this.ctx.fillStyle = fillStyle;
        this.ctx.beginPath();
        /** @type {?} */
        var pc;
        /** @type {?} */
        var pc0 = this.calcPoint(shape[0], centerCoords, scale);
        this.ctx.moveTo(pc0[0], pc0[1]);
        for (var p in shape) {
            /** @type {?} */
            let pNum = parseInt(p, 10);
            if (pNum > 0) {
                pc = this.calcPoint(shape[pNum], centerCoords, scale);
                this.ctx.lineTo(pc[0], pc[1]);
            }
        }
        this.ctx.lineTo(pc0[0], pc0[1]);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.restore();
    }
    ;
    /**
     * @param {?} centerCoords
     * @param {?} scale
     * @return {?}
     */
    drawIconMove(centerCoords, scale) {
        this.drawFilledPolygon(this.shapeArrowN, this.colors.moveIconFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowW, this.colors.moveIconFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowS, this.colors.moveIconFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowE, this.colors.moveIconFill, centerCoords, scale);
    }
    /**
     * @param {?} centerCoords
     * @param {?} circleRadius
     * @param {?} scale
     * @return {?}
     */
    drawIconResizeCircle(centerCoords, circleRadius, scale) {
        /** @type {?} */
        var scaledCircleRadius = circleRadius * scale;
        this.ctx.save();
        this.ctx.strokeStyle = this.colors.resizeCircleStroke;
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = this.colors.resizeCircleFill;
        this.ctx.beginPath();
        this.ctx.arc(centerCoords[0], centerCoords[1], scaledCircleRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }
    /**
     * @param {?} centerCoords
     * @param {?} boxSize
     * @param {?} scale
     * @return {?}
     */
    drawIconResizeBoxBase(centerCoords, boxSize, scale) {
        /** @type {?} */
        var scaledBoxSize = boxSize * scale;
        this.ctx.save();
        this.ctx.strokeStyle = this.colors.resizeBoxStroke;
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = this.colors.resizeBoxFill;
        this.ctx.fillRect(centerCoords[0] - scaledBoxSize / 2, centerCoords[1] - scaledBoxSize / 2, scaledBoxSize, scaledBoxSize);
        this.ctx.strokeRect(centerCoords[0] - scaledBoxSize / 2, centerCoords[1] - scaledBoxSize / 2, scaledBoxSize, scaledBoxSize);
        this.ctx.restore();
    }
    /**
     * @param {?} centerCoords
     * @param {?} boxSize
     * @param {?} scale
     * @return {?}
     */
    drawIconResizeBoxNESW(centerCoords, boxSize, scale) {
        this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
        this.drawFilledPolygon(this.shapeArrowNE, this.colors.resizeBoxArrowFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowSW, this.colors.resizeBoxArrowFill, centerCoords, scale);
    }
    /**
     * @param {?} centerCoords
     * @param {?} boxSize
     * @param {?} scale
     * @return {?}
     */
    drawIconResizeBoxNWSE(centerCoords, boxSize, scale) {
        this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
        this.drawFilledPolygon(this.shapeArrowNW, this.colors.resizeBoxArrowFill, centerCoords, scale);
        this.drawFilledPolygon(this.shapeArrowSE, this.colors.resizeBoxArrowFill, centerCoords, scale);
    }
    /**
     * @param {?} image
     * @param {?} centerCoords
     * @param {?} size
     * @param {?} fnDrawClipPath
     * @return {?}
     */
    drawCropArea(image, centerCoords, size, fnDrawClipPath) {
        /** @type {?} */
        var xRatio = image.width / this.ctx.canvas.width;
        /** @type {?} */
        var yRatio = image.height / this.ctx.canvas.height;
        /** @type {?} */
        var xLeft = centerCoords[0] - size / 2;
        /** @type {?} */
        var yTop = centerCoords[1] - size / 2;
        this.ctx.save();
        this.ctx.strokeStyle = this.colors.areaOutline;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        fnDrawClipPath(this.ctx, centerCoords, size);
        this.ctx.stroke();
        this.ctx.clip();
        // draw part of original image
        if (size > 0) {
            this.ctx.drawImage(image, xLeft * xRatio, yTop * yRatio, size * xRatio, size * yRatio, xLeft, yTop, size, size);
        }
        this.ctx.beginPath();
        fnDrawClipPath(this.ctx, centerCoords, size);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.restore();
    }
    ;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @enum {string} */
const CropAreaType = {
    Square: 'square',
    Circle: 'circle',
};
/**
 * @abstract
 */
class CropArea {
    /**
     * @param {?} _ctx
     * @param {?} _events
     */
    constructor(_ctx, _events) {
        this._ctx = _ctx;
        this._events = _events;
        this._minSize = 80;
        this._image = new Image();
        this._x = 0;
        this._y = 0;
        this._size = 200;
        this._cropCanvas = new CropCanvas(_ctx);
    }
    /**
     * @return {?}
     */
    getImage() {
        return this._image;
    }
    /**
     * @param {?} image
     * @return {?}
     */
    setImage(image) {
        this._image = image;
    }
    ;
    /**
     * @return {?}
     */
    getX() {
        return this._x;
    }
    ;
    /**
     * @param {?} x
     * @return {?}
     */
    setX(x) {
        this._x = x;
        this._dontDragOutside();
    }
    ;
    /**
     * @return {?}
     */
    getY() {
        return this._y;
    }
    ;
    /**
     * @param {?} y
     * @return {?}
     */
    setY(y) {
        this._y = y;
        this._dontDragOutside();
    }
    ;
    /**
     * @return {?}
     */
    getSize() {
        return this._size;
    }
    ;
    /**
     * @param {?} size
     * @return {?}
     */
    setSize(size) {
        this._size = Math.max(this._minSize, size);
        this._dontDragOutside();
    }
    ;
    /**
     * @return {?}
     */
    getMinSize() {
        return this._minSize;
    }
    ;
    /**
     * @param {?} size
     * @return {?}
     */
    setMinSize(size) {
        this._minSize = size;
        this._size = Math.max(this._minSize, this._size);
        this._dontDragOutside();
    }
    ;
    /**
     * @return {?}
     */
    _dontDragOutside() {
        /** @type {?} */
        var h = this._ctx.canvas.height;
        /** @type {?} */
        var w = this._ctx.canvas.width;
        if (this._size > w) {
            this._size = w;
        }
        if (this._size > h) {
            this._size = h;
        }
        if (this._x < this._size / 2) {
            this._x = this._size / 2;
        }
        if (this._x > w - this._size / 2) {
            this._x = w - this._size / 2;
        }
        if (this._y < this._size / 2) {
            this._y = this._size / 2;
        }
        if (this._y > h - this._size / 2) {
            this._y = h - this._size / 2;
        }
    }
    ;
    /**
     * @return {?}
     */
    draw() {
        this._cropCanvas.drawCropArea(this._image, [this._x, this._y], this._size, this._drawArea);
    }
    ;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class CropAreaCircle extends CropArea {
    /**
     * @param {?} ctx
     * @param {?} events
     */
    constructor(ctx, events) {
        super(ctx, events);
        this._boxResizeBaseSize = 20;
        this._boxResizeNormalRatio = 0.9;
        this._boxResizeHoverRatio = 1.2;
        this._iconMoveNormalRatio = 0.9;
        this._iconMoveHoverRatio = 1.2;
        this._posDragStartX = 0;
        this._posDragStartY = 0;
        this._posResizeStartX = 0;
        this._posResizeStartY = 0;
        this._posResizeStartSize = 0;
        this._boxResizeIsHover = false;
        this._areaIsHover = false;
        this._boxResizeIsDragging = false;
        this._areaIsDragging = false;
        this._boxResizeNormalSize = this._boxResizeBaseSize * this._boxResizeNormalRatio;
        this._boxResizeHoverSize = this._boxResizeBaseSize * this._boxResizeHoverRatio;
    }
    /**
     * @param {?} angleDegrees
     * @return {?}
     */
    _calcCirclePerimeterCoords(angleDegrees) {
        /** @type {?} */
        var hSize = this._size / 2;
        /** @type {?} */
        var angleRadians = angleDegrees * (Math.PI / 180);
        /** @type {?} */
        var circlePerimeterX = this._x + hSize * Math.cos(angleRadians);
        /** @type {?} */
        var circlePerimeterY = this._y + hSize * Math.sin(angleRadians);
        return [circlePerimeterX, circlePerimeterY];
    }
    /**
     * @return {?}
     */
    _calcResizeIconCenterCoords() {
        return this._calcCirclePerimeterCoords(-45);
    }
    /**
     * @param {?} coord
     * @return {?}
     */
    _isCoordWithinArea(coord) {
        return Math.sqrt((coord[0] - this._x) * (coord[0] - this._x) + (coord[1] - this._y) * (coord[1] - this._y)) < this._size / 2;
    }
    ;
    /**
     * @param {?} coord
     * @return {?}
     */
    _isCoordWithinBoxResize(coord) {
        /** @type {?} */
        var resizeIconCenterCoords = this._calcResizeIconCenterCoords();
        /** @type {?} */
        var hSize = this._boxResizeHoverSize / 2;
        return (coord[0] > resizeIconCenterCoords[0] - hSize && coord[0] < resizeIconCenterCoords[0] + hSize &&
            coord[1] > resizeIconCenterCoords[1] - hSize && coord[1] < resizeIconCenterCoords[1] + hSize);
    }
    ;
    /**
     * @param {?} ctx
     * @param {?} centerCoords
     * @param {?} size
     * @return {?}
     */
    _drawArea(ctx, centerCoords, size) {
        ctx.arc(centerCoords[0], centerCoords[1], size / 2, 0, 2 * Math.PI);
    }
    ;
    /**
     * @return {?}
     */
    draw() {
        CropArea.prototype.draw.apply(this, arguments);
        // draw move icon
        this._cropCanvas.drawIconMove([this._x, this._y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);
        // draw resize cubes
        this._cropCanvas.drawIconResizeBoxNESW(this._calcResizeIconCenterCoords(), this._boxResizeBaseSize, this._boxResizeIsHover ? this._boxResizeHoverRatio : this._boxResizeNormalRatio);
    }
    ;
    /**
     * @param {?} mouseCurX
     * @param {?} mouseCurY
     * @return {?}
     */
    processMouseMove(mouseCurX, mouseCurY) {
        /** @type {?} */
        var cursor = 'default';
        /** @type {?} */
        var res = false;
        this._boxResizeIsHover = false;
        this._areaIsHover = false;
        if (this._areaIsDragging) {
            this._x = mouseCurX - this._posDragStartX;
            this._y = mouseCurY - this._posDragStartY;
            this._areaIsHover = true;
            cursor = 'move';
            res = true;
            this._events.trigger('area-move');
        }
        else if (this._boxResizeIsDragging) {
            cursor = 'nesw-resize';
            /** @type {?} */
            var iFR;
            /** @type {?} */
            var iFX;
            /** @type {?} */
            var iFY;
            iFX = mouseCurX - this._posResizeStartX;
            iFY = this._posResizeStartY - mouseCurY;
            if (iFX > iFY) {
                iFR = this._posResizeStartSize + iFY * 2;
            }
            else {
                iFR = this._posResizeStartSize + iFX * 2;
            }
            this._size = Math.max(this._minSize, iFR);
            this._boxResizeIsHover = true;
            res = true;
            this._events.trigger('area-resize');
        }
        else if (this._isCoordWithinBoxResize([mouseCurX, mouseCurY])) {
            cursor = 'nesw-resize';
            this._areaIsHover = false;
            this._boxResizeIsHover = true;
            res = true;
        }
        else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
            cursor = 'move';
            this._areaIsHover = true;
            res = true;
        }
        this._dontDragOutside();
        this._ctx.canvas.style.cursor = cursor;
        return res;
    }
    ;
    /**
     * @param {?} mouseDownX
     * @param {?} mouseDownY
     * @return {?}
     */
    processMouseDown(mouseDownX, mouseDownY) {
        if (this._isCoordWithinBoxResize([mouseDownX, mouseDownY])) {
            this._areaIsDragging = false;
            this._areaIsHover = false;
            this._boxResizeIsDragging = true;
            this._boxResizeIsHover = true;
            this._posResizeStartX = mouseDownX;
            this._posResizeStartY = mouseDownY;
            this._posResizeStartSize = this._size;
            this._events.trigger('area-resize-start');
        }
        else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
            this._areaIsDragging = true;
            this._areaIsHover = true;
            this._boxResizeIsDragging = false;
            this._boxResizeIsHover = false;
            this._posDragStartX = mouseDownX - this._x;
            this._posDragStartY = mouseDownY - this._y;
            this._events.trigger('area-move-start');
        }
    }
    ;
    /**
     * @return {?}
     */
    processMouseUp() {
        if (this._areaIsDragging) {
            this._areaIsDragging = false;
            this._events.trigger('area-move-end');
        }
        if (this._boxResizeIsDragging) {
            this._boxResizeIsDragging = false;
            this._events.trigger('area-resize-end');
        }
        this._areaIsHover = false;
        this._boxResizeIsHover = false;
        this._posDragStartX = 0;
        this._posDragStartY = 0;
    }
    ;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class CropAreaSquare extends CropArea {
    /**
     * @param {?} ctx
     * @param {?} events
     */
    constructor(ctx, events) {
        super(ctx, events);
        this._resizeCtrlBaseRadius = 10;
        this._resizeCtrlNormalRatio = 0.75;
        this._resizeCtrlHoverRatio = 1;
        this._iconMoveNormalRatio = 0.9;
        this._iconMoveHoverRatio = 1.2;
        this._posDragStartX = 0;
        this._posDragStartY = 0;
        this._posResizeStartX = 0;
        this._posResizeStartY = 0;
        this._posResizeStartSize = 0;
        this._resizeCtrlIsHover = -1;
        this._areaIsHover = false;
        this._resizeCtrlIsDragging = -1;
        this._areaIsDragging = false;
        this._resizeCtrlNormalRadius = this._resizeCtrlBaseRadius * this._resizeCtrlNormalRatio;
        this._resizeCtrlHoverRadius = this._resizeCtrlBaseRadius * this._resizeCtrlHoverRatio;
    }
    ;
    /**
     * @return {?}
     */
    _calcSquareCorners() {
        /** @type {?} */
        var hSize = this._size / 2;
        return [
            [this._x - hSize, this._y - hSize],
            [this._x + hSize, this._y - hSize],
            [this._x - hSize, this._y + hSize],
            [this._x + hSize, this._y + hSize]
        ];
    }
    /**
     * @return {?}
     */
    _calcSquareDimensions() {
        /** @type {?} */
        var hSize = this._size / 2;
        return {
            left: this._x - hSize,
            top: this._y - hSize,
            right: this._x + hSize,
            bottom: this._y + hSize
        };
    }
    /**
     * @param {?} coord
     * @return {?}
     */
    _isCoordWithinArea(coord) {
        /** @type {?} */
        var squareDimensions = this._calcSquareDimensions();
        return (coord[0] >= squareDimensions.left && coord[0] <= squareDimensions.right && coord[1] >= squareDimensions.top && coord[1] <= squareDimensions.bottom);
    }
    /**
     * @param {?} coord
     * @return {?}
     */
    _isCoordWithinResizeCtrl(coord) {
        /** @type {?} */
        var resizeIconsCenterCoords = this._calcSquareCorners();
        /** @type {?} */
        var res = -1;
        for (var i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
            /** @type {?} */
            var resizeIconCenterCoords = resizeIconsCenterCoords[i];
            if (coord[0] > resizeIconCenterCoords[0] - this._resizeCtrlHoverRadius && coord[0] < resizeIconCenterCoords[0] + this._resizeCtrlHoverRadius &&
                coord[1] > resizeIconCenterCoords[1] - this._resizeCtrlHoverRadius && coord[1] < resizeIconCenterCoords[1] + this._resizeCtrlHoverRadius) {
                res = i;
                break;
            }
        }
        return res;
    }
    /**
     * @param {?} ctx
     * @param {?} centerCoords
     * @param {?} size
     * @return {?}
     */
    _drawArea(ctx, centerCoords, size) {
        /** @type {?} */
        var hSize = size / 2;
        ctx.rect(centerCoords[0] - hSize, centerCoords[1] - hSize, size, size);
    }
    /**
     * @return {?}
     */
    draw() {
        CropArea.prototype.draw.apply(this, arguments);
        // draw move icon
        this._cropCanvas.drawIconMove([this._x, this._y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);
        /** @type {?} */
        var resizeIconsCenterCoords = this._calcSquareCorners();
        for (var i = 0, len = resizeIconsCenterCoords.length; i < len; i++) {
            /** @type {?} */
            var resizeIconCenterCoords = resizeIconsCenterCoords[i];
            this._cropCanvas.drawIconResizeCircle(resizeIconCenterCoords, this._resizeCtrlBaseRadius, this._resizeCtrlIsHover === i ? this._resizeCtrlHoverRatio : this._resizeCtrlNormalRatio);
        }
    }
    /**
     * @param {?} mouseCurX
     * @param {?} mouseCurY
     * @return {?}
     */
    processMouseMove(mouseCurX, mouseCurY) {
        /** @type {?} */
        var cursor = 'default';
        /** @type {?} */
        var res = false;
        this._resizeCtrlIsHover = -1;
        this._areaIsHover = false;
        if (this._areaIsDragging) {
            this._x = mouseCurX - this._posDragStartX;
            this._y = mouseCurY - this._posDragStartY;
            this._areaIsHover = true;
            cursor = 'move';
            res = true;
            this._events.trigger('area-move');
        }
        else if (this._resizeCtrlIsDragging > -1) {
            /** @type {?} */
            var xMulti;
            /** @type {?} */
            var yMulti;
            switch (this._resizeCtrlIsDragging) {
                case 0: // Top Left
                    // Top Left
                    xMulti = -1;
                    yMulti = -1;
                    cursor = 'nwse-resize';
                    break;
                case 1: // Top Right
                    // Top Right
                    xMulti = 1;
                    yMulti = -1;
                    cursor = 'nesw-resize';
                    break;
                case 2: // Bottom Left
                    // Bottom Left
                    xMulti = -1;
                    yMulti = 1;
                    cursor = 'nesw-resize';
                    break;
                case 3: // Bottom Right
                    // Bottom Right
                    xMulti = 1;
                    yMulti = 1;
                    cursor = 'nwse-resize';
                    break;
            }
            /** @type {?} */
            var iFX = (mouseCurX - this._posResizeStartX) * xMulti;
            /** @type {?} */
            var iFY = (mouseCurY - this._posResizeStartY) * yMulti;
            /** @type {?} */
            var iFR;
            if (iFX > iFY) {
                iFR = this._posResizeStartSize + iFY;
            }
            else {
                iFR = this._posResizeStartSize + iFX;
            }
            /** @type {?} */
            var wasSize = this._size;
            this._size = Math.max(this._minSize, iFR);
            /** @type {?} */
            var posModifier = (this._size - wasSize) / 2;
            this._x += posModifier * xMulti;
            this._y += posModifier * yMulti;
            this._resizeCtrlIsHover = this._resizeCtrlIsDragging;
            res = true;
            this._events.trigger('area-resize');
        }
        else {
            /** @type {?} */
            var hoveredResizeBox = this._isCoordWithinResizeCtrl([mouseCurX, mouseCurY]);
            if (hoveredResizeBox > -1) {
                switch (hoveredResizeBox) {
                    case 0:
                        cursor = 'nwse-resize';
                        break;
                    case 1:
                        cursor = 'nesw-resize';
                        break;
                    case 2:
                        cursor = 'nesw-resize';
                        break;
                    case 3:
                        cursor = 'nwse-resize';
                        break;
                }
                this._areaIsHover = false;
                this._resizeCtrlIsHover = hoveredResizeBox;
                res = true;
            }
            else if (this._isCoordWithinArea([mouseCurX, mouseCurY])) {
                cursor = 'move';
                this._areaIsHover = true;
                res = true;
            }
        }
        this._dontDragOutside();
        this._ctx.canvas.style.cursor = cursor;
        return res;
    }
    /**
     * @param {?} mouseDownX
     * @param {?} mouseDownY
     * @return {?}
     */
    processMouseDown(mouseDownX, mouseDownY) {
        /** @type {?} */
        var isWithinResizeCtrl = this._isCoordWithinResizeCtrl([mouseDownX, mouseDownY]);
        if (isWithinResizeCtrl > -1) {
            this._areaIsDragging = false;
            this._areaIsHover = false;
            this._resizeCtrlIsDragging = isWithinResizeCtrl;
            this._resizeCtrlIsHover = isWithinResizeCtrl;
            this._posResizeStartX = mouseDownX;
            this._posResizeStartY = mouseDownY;
            this._posResizeStartSize = this._size;
            this._events.trigger('area-resize-start');
        }
        else if (this._isCoordWithinArea([mouseDownX, mouseDownY])) {
            this._areaIsDragging = true;
            this._areaIsHover = true;
            this._resizeCtrlIsDragging = -1;
            this._resizeCtrlIsHover = -1;
            this._posDragStartX = mouseDownX - this._x;
            this._posDragStartY = mouseDownY - this._y;
            this._events.trigger('area-move-start');
        }
    }
    /**
     * @return {?}
     */
    processMouseUp() {
        if (this._areaIsDragging) {
            this._areaIsDragging = false;
            this._events.trigger('area-move-end');
        }
        if (this._resizeCtrlIsDragging > -1) {
            this._resizeCtrlIsDragging = -1;
            this._events.trigger('area-resize-end');
        }
        this._areaIsHover = false;
        this._resizeCtrlIsHover = -1;
        this._posDragStartX = 0;
        this._posDragStartY = 0;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class CropHost {
    /**
     * @param {?} elCanvas
     * @param {?} opts
     * @param {?} events
     */
    constructor(elCanvas, opts, events) {
        this.elCanvas = elCanvas;
        this.opts = opts;
        this.events = events;
        this.ctx = null;
        this.image = null;
        // Dimensions
        this.minCanvasDims = [100, 100];
        this.maxCanvasDims = [300, 300];
        this.resultImageSize = 200;
        this.resultImageFormat = 'image/png';
        this.element = elCanvas.parentElement;
        this.ctx = elCanvas.getContext('2d');
        this.cropArea = new CropAreaCircle(this.ctx, events);
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        elCanvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('touchmove', this.onMouseMove.bind(this));
        elCanvas.addEventListener('touchstart', this.onMouseDown.bind(this));
        document.addEventListener('touchend', this.onMouseUp.bind(this));
    }
    /**
     * @return {?}
     */
    destroy() {
        document.removeEventListener('mousemove', this.onMouseMove);
        this.elCanvas.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseMove);
        document.removeEventListener('touchmove', this.onMouseMove);
        this.elCanvas.removeEventListener('touchstart', this.onMouseDown);
        document.removeEventListener('touchend', this.onMouseMove);
        this.elCanvas.remove();
    }
    /**
     * @return {?}
     */
    drawScene() {
        // clear canvas
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        if (this.image !== null) {
            // draw source this.image
            this.ctx.drawImage(this.image, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.save();
            // and make it darker
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.restore();
            this.cropArea.draw();
        }
    }
    /**
     * @param {?=} cw
     * @param {?=} ch
     * @return {?}
     */
    resetCropHost(cw, ch) {
        if (this.image !== null) {
            this.cropArea.setImage(this.image);
            /** @type {?} */
            var imageWidth = this.image.width || cw;
            /** @type {?} */
            var imageHeight = this.image.height || ch;
            /** @type {?} */
            var imageDims = [imageWidth, imageHeight];
            /** @type {?} */
            var imageRatio = imageWidth / imageHeight;
            /** @type {?} */
            var canvasDims = imageDims;
            if (canvasDims[0] > this.maxCanvasDims[0]) {
                canvasDims[0] = this.maxCanvasDims[0];
                canvasDims[1] = canvasDims[0] / imageRatio;
            }
            else if (canvasDims[0] < this.minCanvasDims[0]) {
                canvasDims[0] = this.minCanvasDims[0];
                canvasDims[1] = canvasDims[0] / imageRatio;
            }
            if (canvasDims[1] > this.maxCanvasDims[1]) {
                canvasDims[1] = this.maxCanvasDims[1];
                canvasDims[0] = canvasDims[1] * imageRatio;
            }
            else if (canvasDims[1] < this.minCanvasDims[1]) {
                canvasDims[1] = this.minCanvasDims[1];
                canvasDims[0] = canvasDims[1] * imageRatio;
            }
            /** @type {?} */
            var w = Math.floor(canvasDims[0]);
            /** @type {?} */
            var h = Math.floor(canvasDims[1]);
            canvasDims[0] = w;
            canvasDims[1] = h;
            console.debug('canvas reset =' + w + 'x' + h);
            this.elCanvas.width = w;
            this.elCanvas.height = h;
            // Compensate CSS 50% centering of canvas inside host
            this.elCanvas.style.marginLeft = -w / 2 + 'px';
            this.elCanvas.style.marginTop = -h / 2 + 'px';
            // Center crop area by default
            this.cropArea.setX(this.ctx.canvas.width / 2);
            this.cropArea.setY(this.ctx.canvas.height / 2);
            this.cropArea.setSize(Math.min(200, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2));
        }
        else {
            this.elCanvas.width = 0;
            this.elCanvas.height = 0;
            this.elCanvas.style.marginLeft = 0;
            this.elCanvas.style.marginTop = 0;
        }
        this.drawScene();
        return canvasDims;
    }
    /**
     * Returns event.changedTouches directly if event is a TouchEvent.
     * If event is a jQuery event, return changedTouches of event.originalEvent
     * @param {?} event
     * @return {?}
     */
    static getChangedTouches(event) {
        return event.changedTouches ? event.changedTouches : event.originalEvent.changedTouches;
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onMouseMove(e) {
        if (this.image !== null) {
            /** @type {?} */
            var offset = CropHost.getElementOffset(this.ctx.canvas);
            /** @type {?} */
            var pageX;
            /** @type {?} */
            var pageY;
            if (e.type === 'touchmove') {
                pageX = CropHost.getChangedTouches(e)[0].pageX;
                pageY = CropHost.getChangedTouches(e)[0].pageY;
            }
            else {
                pageX = e.pageX;
                pageY = e.pageY;
            }
            this.cropArea.processMouseMove(pageX - offset.left, pageY - offset.top);
            this.drawScene();
        }
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.image !== null) {
            /** @type {?} */
            var offset = CropHost.getElementOffset(this.ctx.canvas);
            /** @type {?} */
            var pageX;
            /** @type {?} */
            var pageY;
            if (e.type === 'touchstart') {
                pageX = CropHost.getChangedTouches(e)[0].pageX;
                pageY = CropHost.getChangedTouches(e)[0].pageY;
            }
            else {
                pageX = e.pageX;
                pageY = e.pageY;
            }
            this.cropArea.processMouseDown(pageX - offset.left, pageY - offset.top);
            this.drawScene();
        }
    }
    /**
     * @param {?} e
     * @return {?}
     */
    onMouseUp(e) {
        if (this.image !== null) {
            /** @type {?} */
            var offset = CropHost.getElementOffset(this.ctx.canvas);
            /** @type {?} */
            var pageX;
            /** @type {?} */
            var pageY;
            if (e.type === 'touchend') {
                pageX = CropHost.getChangedTouches(e)[0].pageX;
                pageY = CropHost.getChangedTouches(e)[0].pageY;
            }
            else {
                pageX = e.pageX;
                pageY = e.pageY;
            }
            this.cropArea.processMouseUp(pageX - offset.left, pageY - offset.top);
            this.drawScene();
        }
    }
    /**
     * @return {?}
     */
    getResultImageDataURI() {
        /** @type {?} */
        var temp_canvas = /** @type {?} */ (document.createElement('CANVAS'));
        /** @type {?} */
        var temp_ctx = temp_canvas.getContext('2d');
        temp_canvas.width = this.resultImageSize;
        temp_canvas.height = this.resultImageSize;
        if (this.image !== null) {
            temp_ctx.drawImage(this.image, (this.cropArea.getX() - this.cropArea.getSize() / 2) * (this.image.width / this.ctx.canvas.width), (this.cropArea.getY() - this.cropArea.getSize() / 2) * (this.image.height / this.ctx.canvas.height), this.cropArea.getSize() * (this.image.width / this.ctx.canvas.width), this.cropArea.getSize() * (this.image.height / this.ctx.canvas.height), 0, 0, this.resultImageSize, this.resultImageSize);
        }
        if (this.resultImageQuality !== null) {
            return temp_canvas.toDataURL(this.resultImageFormat, this.resultImageQuality);
        }
        return temp_canvas.toDataURL(this.resultImageFormat);
    }
    /**
     * @return {?}
     */
    redraw() {
        this.drawScene();
    }
    /**
     * @param {?} imageSource
     * @return {?}
     */
    setNewImageSource(imageSource) {
        this.image = null;
        this.resetCropHost();
        this.events.trigger('image-updated');
        if (!!imageSource) {
            /** @type {?} */
            var newImage = new Image();
            if (imageSource.substring(0, 4).toLowerCase() === 'http') {
                newImage.crossOrigin = 'anonymous';
            }
            /** @type {?} */
            const self = this;
            newImage.onload = function () {
                self.events.trigger('load-done');
                CropEXIF.getData(newImage, () => {
                    /** @type {?} */
                    var orientation = CropEXIF.getTag(newImage, 'Orientation');
                    /** @type {?} */
                    let cw = newImage.width;
                    /** @type {?} */
                    let ch = newImage.height;
                    /** @type {?} */
                    let cx = 0;
                    /** @type {?} */
                    let cy = 0;
                    /** @type {?} */
                    let deg = 0;
                    /**
                     * @return {?}
                     */
                    function imageDone() {
                        console.debug('dims=' + cw + 'x' + ch);
                        /** @type {?} */
                        var canvasDims = self.resetCropHost(cw, ch);
                        self.setMaxDimensions(canvasDims[0], canvasDims[1]);
                        self.events.trigger('image-updated');
                        self.events.trigger('image-ready');
                    }
                    if ([3, 6, 8].indexOf(orientation) >= 0) {
                        /** @type {?} */
                        const canvas = document.createElement("canvas");
                        /** @type {?} */
                        const ctx = canvas.getContext("2d");
                        switch (orientation) {
                            case 3:
                                cx = -newImage.width;
                                cy = -newImage.height;
                                deg = 180;
                                break;
                            case 6:
                                cw = newImage.height;
                                ch = newImage.width;
                                cy = -newImage.height;
                                deg = 90;
                                break;
                            case 8:
                                cw = newImage.height;
                                ch = newImage.width;
                                cx = -newImage.width;
                                deg = 270;
                                break;
                        }
                        canvas.width = cw;
                        canvas.height = ch;
                        self.ctx.rotate(deg * Math.PI / 180);
                        self.ctx.drawImage(newImage, cx, cy);
                        self.image = new Image();
                        self.image.onload = function () {
                            imageDone();
                        };
                        self.image.src = canvas.toDataURL("image/png");
                    }
                    else {
                        self.image = newImage;
                        imageDone();
                    }
                });
            };
            newImage.onerror = error => {
                this.events.trigger('load-error', [error]);
            };
            this.events.trigger('load-start');
            newImage.src = imageSource;
        }
    }
    /**
     * @param {?} width
     * @param {?} height
     * @return {?}
     */
    setMaxDimensions(width, height) {
        console.debug('setMaxDimensions(' + width + ', ' + height + ')');
        if (this.image !== null) {
            /** @type {?} */
            const curWidth = this.ctx.canvas.width;
            /** @type {?} */
            const curHeight = this.ctx.canvas.height;
            /** @type {?} */
            const ratioNewCurWidth = this.ctx.canvas.width / curWidth;
            /** @type {?} */
            const ratioNewCurHeight = this.ctx.canvas.height / curHeight;
        }
        this.maxCanvasDims = [width, height];
        return this.resetCropHost(width, height);
    }
    /**
     * @param {?} size
     * @return {?}
     */
    setAreaMinSize(size) {
        size = parseInt(size, 10);
        if (!isNaN(size)) {
            this.cropArea.setMinSize(size);
            this.drawScene();
        }
    }
    /**
     * @param {?} size
     * @return {?}
     */
    setResultImageSize(size) {
        size = parseInt(size, 10);
        if (!isNaN(size)) {
            this.resultImageSize = size;
        }
    }
    /**
     * @param {?} format
     * @return {?}
     */
    setResultImageFormat(format) {
        this.resultImageFormat = format;
    }
    /**
     * @param {?} quality
     * @return {?}
     */
    setResultImageQuality(quality) {
        quality = parseFloat(quality);
        if (!isNaN(quality) && quality >= 0 && quality <= 1) {
            this.resultImageQuality = quality;
        }
    }
    /**
     * @param {?} type
     * @return {?}
     */
    setAreaType(type) {
        /** @type {?} */
        const curSize = this.cropArea.getSize();
        /** @type {?} */
        const curMinSize = this.cropArea.getMinSize();
        /** @type {?} */
        const curX = this.cropArea.getX();
        /** @type {?} */
        const curY = this.cropArea.getY();
        if (type === CropAreaType.Square) {
            this.cropArea = new CropAreaSquare(this.ctx, this.events);
        }
        else {
            this.cropArea = new CropAreaCircle(this.ctx, this.events);
        }
        this.cropArea.setMinSize(curMinSize);
        this.cropArea.setSize(curSize);
        this.cropArea.setX(curX);
        this.cropArea.setY(curY);
        // this.resetCropHost();
        if (this.image !== null) {
            this.cropArea.setImage(this.image);
        }
        this.drawScene();
    }
    /**
     * @return {?}
     */
    getAreaDetails() {
        return {
            x: this.cropArea.getX(),
            y: this.cropArea.getY(),
            size: this.cropArea.getSize(),
            image: { width: this.cropArea.getImage().width, height: this.cropArea.getImage().height },
            canvas: { width: this.ctx.canvas.width, height: this.ctx.canvas.height }
        };
    }
    /**
     * @param {?} elem
     * @return {?}
     */
    static getElementOffset(elem) {
        /** @type {?} */
        var box = elem.getBoundingClientRect();
        /** @type {?} */
        var body = document.body;
        /** @type {?} */
        var docElem = document.documentElement;
        /** @type {?} */
        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        /** @type {?} */
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
        /** @type {?} */
        var clientTop = docElem.clientTop || body.clientTop || 0;
        /** @type {?} */
        var clientLeft = docElem.clientLeft || body.clientLeft || 0;
        /** @type {?} */
        var top = box.top + scrollTop - clientTop;
        /** @type {?} */
        var left = box.left + scrollLeft - clientLeft;
        return { top: Math.round(top), left: Math.round(left) };
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class FcImgCropComponent {
    /**
     * @param {?} el
     * @param {?} ref
     */
    constructor(el, ref) {
        this.el = el;
        this.ref = ref;
        this.resultImageChange = new EventEmitter();
        this.areaDetailsChange = new EventEmitter();
        this.onChange = new EventEmitter();
        this.onLoadBegin = new EventEmitter();
        this.onLoadDone = new EventEmitter();
        this.onLoadError = new EventEmitter();
        this.onImageReady = new EventEmitter();
        this.events = new CropPubSub();
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        /** @type {?} */
        const events = this.events;
        /** @type {?} */
        let el = this.el.nativeElement.querySelector('canvas');
        this.cropHost = new CropHost(el, {}, events);
        /** @type {?} */
        const self = this;
        events
            .on('load-start', () => {
            self.onLoadBegin.emit({});
            self.ref.detectChanges();
        })
            .on('load-done', () => {
            self.onLoadDone.emit({});
            self.ref.detectChanges();
        })
            .on('image-ready', () => {
            if (self.onImageReady.emit({})) {
                self.cropHost.redraw();
                self.ref.detectChanges();
            }
        })
            .on('load-error', () => {
            self.onLoadError.emit({});
            self.ref.detectChanges();
        })
            .on('area-move area-resize', () => {
            if (!!self.changeOnFly) {
                self.updateResultImage();
                self.ref.detectChanges();
            }
        })
            .on('area-move-end area-resize-end image-updated', () => {
            self.updateResultImage();
            self.areaDetails = self.cropHost.getAreaDetails();
            self.areaDetailsChange.emit(self.areaDetails);
        });
    }
    /**
     * @return {?}
     */
    updateResultImage() {
        /** @type {?} */
        const resultImage = this.cropHost.getResultImageDataURI();
        if (this.storedResultImage !== resultImage) {
            this.storedResultImage = resultImage;
            this.resultImage = resultImage;
            if (this.resultImageChange.observers.length) {
                this.resultImageChange.emit(this.resultImage);
            }
            if (this.onChange.observers.length > 0) {
                this.onChange.emit({ $dataURI: this.resultImage });
            }
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.cropHost.destroy();
    }
    /**
     * Sync CropHost with Directive's options
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (this.cropHost) {
            if (changes["image"]) {
                this.cropHost.setNewImageSource(this.image);
            }
            if (changes["areaType"]) {
                this.cropHost.setAreaType(this.areaType);
                this.updateResultImage();
            }
            if (changes["areaMinSize"]) {
                this.cropHost.setAreaMinSize(this.areaMinSize);
                this.updateResultImage();
            }
            if (changes["resultImageSize"]) {
                this.cropHost.setResultImageSize(this.resultImageSize);
                this.updateResultImage();
            }
            if (changes["resultImageFormat"]) {
                this.cropHost.setResultImageFormat(this.resultImageFormat);
                this.updateResultImage();
            }
            if (changes["resultImageQuality"]) {
                this.cropHost.setResultImageQuality(this.resultImageQuality);
                this.updateResultImage();
            }
        }
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this.observer = new MutationObserver(mutations => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'clientWidth' || mutation.attributeName === 'clientHeight') {
                    this.cropHost.setMaxDimensions(this.el.nativeElement.clientWidth, this.el.nativeElement.clientHeight);
                    this.updateResultImage();
                }
            });
        });
        /** @type {?} */
        const config = { attributes: true, childList: true, characterData: true };
        this.observer.observe(this.el.nativeElement, config);
    }
}
FcImgCropComponent.decorators = [
    { type: Component, args: [{
                selector: 'fc-img-crop',
                template: '<canvas></canvas>',
                styles: [":host{width:100%;height:100%;display:block;position:relative;overflow:hidden}:host canvas{display:block;position:absolute;top:50%;left:50%;-webkit-tap-highlight-color:rgba(255,255,255,0)}"]
            }] }
];
/** @nocollapse */
FcImgCropComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
FcImgCropComponent.propDecorators = {
    image: [{ type: Input }],
    resultImage: [{ type: Input }],
    resultImageChange: [{ type: Output }],
    changeOnFly: [{ type: Input }],
    areaType: [{ type: Input }],
    areaMinSize: [{ type: Input }],
    areaDetails: [{ type: Input }],
    areaDetailsChange: [{ type: Output }],
    resultImageSize: [{ type: Input }],
    resultImageFormat: [{ type: Input }],
    resultImageQuality: [{ type: Input }],
    onChange: [{ type: Output }],
    onLoadBegin: [{ type: Output }],
    onLoadDone: [{ type: Output }],
    onLoadError: [{ type: Output }],
    onImageReady: [{ type: Output }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
class CropModule {
}
CropModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    FcImgCropComponent
                ],
                exports: [
                    FcImgCropComponent
                ]
            },] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

export { CropModule, FcImgCropComponent as ɵa };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctaW1nLWNyb3AuanMubWFwIiwic291cmNlcyI6WyJuZzovL25nLWltZy1jcm9wL3NyYy9hcHAvZmMtaW1nLWNyb3AvY2xhc3Nlcy9jcm9wLXB1YnN1Yi50cyIsIm5nOi8vbmctaW1nLWNyb3Avc3JjL2FwcC9mYy1pbWctY3JvcC9jbGFzc2VzL2Nyb3AtZXhpZi50cyIsIm5nOi8vbmctaW1nLWNyb3Avc3JjL2FwcC9mYy1pbWctY3JvcC9jbGFzc2VzL2Nyb3AtY2FudmFzLnRzIiwibmc6Ly9uZy1pbWctY3JvcC9zcmMvYXBwL2ZjLWltZy1jcm9wL2NsYXNzZXMvY3JvcC1hcmVhLnRzIiwibmc6Ly9uZy1pbWctY3JvcC9zcmMvYXBwL2ZjLWltZy1jcm9wL2NsYXNzZXMvY3JvcC1hcmVhLWNpcmNsZS50cyIsIm5nOi8vbmctaW1nLWNyb3Avc3JjL2FwcC9mYy1pbWctY3JvcC9jbGFzc2VzL2Nyb3AtYXJlYS1zcXVhcmUudHMiLCJuZzovL25nLWltZy1jcm9wL3NyYy9hcHAvZmMtaW1nLWNyb3AvY2xhc3Nlcy9jcm9wLWhvc3QudHMiLCJuZzovL25nLWltZy1jcm9wL3NyYy9hcHAvZmMtaW1nLWNyb3AvZmMtaW1nLWNyb3AuY29tcG9uZW50LnRzIiwibmc6Ly9uZy1pbWctY3JvcC9zcmMvYXBwL2ZjLWltZy1jcm9wL2ZjLWltZy1jcm9wLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQ3JvcFB1YlN1YiB7XG4gIHByaXZhdGUgZXZlbnRzID0ge307XG5cbiAgb24obmFtZXM6IHN0cmluZywgaGFuZGxlcjogRnVuY3Rpb24pIHtcbiAgICBuYW1lcy5zcGxpdCgnICcpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZXZlbnRzW25hbWVdKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzW25hbWVdID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLmV2ZW50c1tuYW1lXS5wdXNoKGhhbmRsZXIpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIFB1Ymxpc2hcbiAgdHJpZ2dlcihuYW1lOiBzdHJpbmcsIGFyZ3M6IGFueVtdKSB7XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5ldmVudHNbbmFtZV07XG4gICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgbGlzdGVuZXJzLmZvckVhY2goaGFuZGxlciA9PiB7XG4gICAgICAgIGhhbmRsZXIuY2FsbChudWxsLCBhcmdzKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbn0iLCIvKipcbiAqIEVYSUYgc2VydmljZSBpcyBiYXNlZCBvbiB0aGUgZXhpZi1qcyBsaWJyYXJ5IChodHRwczovL2dpdGh1Yi5jb20vanNlaWRlbGluL2V4aWYtanMpXG4gKi9cbmV4cG9ydCBjbGFzcyBDcm9wRVhJRiB7XG5cbiAgc3RhdGljIEV4aWZUYWdzID0ge1xuXG4gICAgLy8gdmVyc2lvbiB0YWdzXG4gICAgJzB4OTAwMCc6IFwiRXhpZlZlcnNpb25cIiwgICAgICAgICAgICAgLy8gRVhJRiB2ZXJzaW9uXG4gICAgJzB4QTAwMCc6IFwiRmxhc2hwaXhWZXJzaW9uXCIsICAgICAgICAgLy8gRmxhc2hwaXggZm9ybWF0IHZlcnNpb25cblxuICAgIC8vIGNvbG9yc3BhY2UgdGFnc1xuICAgICcweEEwMDEnOiBcIkNvbG9yU3BhY2VcIiwgICAgICAgICAgICAgIC8vIENvbG9yIHNwYWNlIGluZm9ybWF0aW9uIHRhZ1xuXG4gICAgLy8gaW1hZ2UgY29uZmlndXJhdGlvblxuICAgICcweEEwMDInOiBcIlBpeGVsWERpbWVuc2lvblwiLCAgICAgICAgIC8vIFZhbGlkIHdpZHRoIG9mIG1lYW5pbmdmdWwgaW1hZ2VcbiAgICAnMHhBMDAzJzogXCJQaXhlbFlEaW1lbnNpb25cIiwgICAgICAgICAvLyBWYWxpZCBoZWlnaHQgb2YgbWVhbmluZ2Z1bCBpbWFnZVxuICAgICcweDkxMDEnOiBcIkNvbXBvbmVudHNDb25maWd1cmF0aW9uXCIsIC8vIEluZm9ybWF0aW9uIGFib3V0IGNoYW5uZWxzXG4gICAgJzB4OTEwMic6IFwiQ29tcHJlc3NlZEJpdHNQZXJQaXhlbFwiLCAgLy8gQ29tcHJlc3NlZCBiaXRzIHBlciBwaXhlbFxuXG4gICAgLy8gdXNlciBpbmZvcm1hdGlvblxuICAgICcweDkyN0MnOiBcIk1ha2VyTm90ZVwiLCAgICAgICAgICAgICAgIC8vIEFueSBkZXNpcmVkIGluZm9ybWF0aW9uIHdyaXR0ZW4gYnkgdGhlIG1hbnVmYWN0dXJlclxuICAgICcweDkyODYnOiBcIlVzZXJDb21tZW50XCIsICAgICAgICAgICAgIC8vIENvbW1lbnRzIGJ5IHVzZXJcblxuICAgIC8vIHJlbGF0ZWQgZmlsZVxuICAgICcweEEwMDQnOiBcIlJlbGF0ZWRTb3VuZEZpbGVcIiwgICAgICAgIC8vIE5hbWUgb2YgcmVsYXRlZCBzb3VuZCBmaWxlXG5cbiAgICAvLyBkYXRlIGFuZCB0aW1lXG4gICAgJzB4OTAwMyc6IFwiRGF0ZVRpbWVPcmlnaW5hbFwiLCAgICAgICAgLy8gRGF0ZSBhbmQgdGltZSB3aGVuIHRoZSBvcmlnaW5hbCBpbWFnZSB3YXMgZ2VuZXJhdGVkXG4gICAgJzB4OTAwNCc6IFwiRGF0ZVRpbWVEaWdpdGl6ZWRcIiwgICAgICAgLy8gRGF0ZSBhbmQgdGltZSB3aGVuIHRoZSBpbWFnZSB3YXMgc3RvcmVkIGRpZ2l0YWxseVxuICAgICcweDkyOTAnOiBcIlN1YnNlY1RpbWVcIiwgICAgICAgICAgICAgIC8vIEZyYWN0aW9ucyBvZiBzZWNvbmRzIGZvciBEYXRlVGltZVxuICAgICcweDkyOTEnOiBcIlN1YnNlY1RpbWVPcmlnaW5hbFwiLCAgICAgIC8vIEZyYWN0aW9ucyBvZiBzZWNvbmRzIGZvciBEYXRlVGltZU9yaWdpbmFsXG4gICAgJzB4OTI5Mic6IFwiU3Vic2VjVGltZURpZ2l0aXplZFwiLCAgICAgLy8gRnJhY3Rpb25zIG9mIHNlY29uZHMgZm9yIERhdGVUaW1lRGlnaXRpemVkXG5cbiAgICAvLyBwaWN0dXJlLXRha2luZyBjb25kaXRpb25zXG4gICAgJzB4ODI5QSc6IFwiRXhwb3N1cmVUaW1lXCIsICAgICAgICAgICAgLy8gRXhwb3N1cmUgdGltZSAoaW4gc2Vjb25kcylcbiAgICAnMHg4MjlEJzogXCJGTnVtYmVyXCIsICAgICAgICAgICAgICAgICAvLyBGIG51bWJlclxuICAgICcweDg4MjInOiBcIkV4cG9zdXJlUHJvZ3JhbVwiLCAgICAgICAgIC8vIEV4cG9zdXJlIHByb2dyYW1cbiAgICAnMHg4ODI0JzogXCJTcGVjdHJhbFNlbnNpdGl2aXR5XCIsICAgICAvLyBTcGVjdHJhbCBzZW5zaXRpdml0eVxuICAgICcweDg4MjcnOiBcIklTT1NwZWVkUmF0aW5nc1wiLCAgICAgICAgIC8vIElTTyBzcGVlZCByYXRpbmdcbiAgICAnMHg4ODI4JzogXCJPRUNGXCIsICAgICAgICAgICAgICAgICAgICAvLyBPcHRvZWxlY3RyaWMgY29udmVyc2lvbiBmYWN0b3JcbiAgICAnMHg5MjAxJzogXCJTaHV0dGVyU3BlZWRWYWx1ZVwiLCAgICAgICAvLyBTaHV0dGVyIHNwZWVkXG4gICAgJzB4OTIwMic6IFwiQXBlcnR1cmVWYWx1ZVwiLCAgICAgICAgICAgLy8gTGVucyBhcGVydHVyZVxuICAgICcweDkyMDMnOiBcIkJyaWdodG5lc3NWYWx1ZVwiLCAgICAgICAgIC8vIFZhbHVlIG9mIGJyaWdodG5lc3NcbiAgICAnMHg5MjA0JzogXCJFeHBvc3VyZUJpYXNcIiwgICAgICAgICAgICAvLyBFeHBvc3VyZSBiaWFzXG4gICAgJzB4OTIwNSc6IFwiTWF4QXBlcnR1cmVWYWx1ZVwiLCAgICAgICAgLy8gU21hbGxlc3QgRiBudW1iZXIgb2YgbGVuc1xuICAgICcweDkyMDYnOiBcIlN1YmplY3REaXN0YW5jZVwiLCAgICAgICAgIC8vIERpc3RhbmNlIHRvIHN1YmplY3QgaW4gbWV0ZXJzXG4gICAgJzB4OTIwNyc6IFwiTWV0ZXJpbmdNb2RlXCIsICAgICAgICAgICAgLy8gTWV0ZXJpbmcgbW9kZVxuICAgICcweDkyMDgnOiBcIkxpZ2h0U291cmNlXCIsICAgICAgICAgICAgIC8vIEtpbmQgb2YgbGlnaHQgc291cmNlXG4gICAgJzB4OTIwOSc6IFwiRmxhc2hcIiwgICAgICAgICAgICAgICAgICAgLy8gRmxhc2ggc3RhdHVzXG4gICAgJzB4OTIxNCc6IFwiU3ViamVjdEFyZWFcIiwgICAgICAgICAgICAgLy8gTG9jYXRpb24gYW5kIGFyZWEgb2YgbWFpbiBzdWJqZWN0XG4gICAgJzB4OTIwQSc6IFwiRm9jYWxMZW5ndGhcIiwgICAgICAgICAgICAgLy8gRm9jYWwgbGVuZ3RoIG9mIHRoZSBsZW5zIGluIG1tXG4gICAgJzB4QTIwQic6IFwiRmxhc2hFbmVyZ3lcIiwgICAgICAgICAgICAgLy8gU3Ryb2JlIGVuZXJneSBpbiBCQ1BTXG4gICAgJzB4QTIwQyc6IFwiU3BhdGlhbEZyZXF1ZW5jeVJlc3BvbnNlXCIsICAgIC8vXG4gICAgJzB4QTIwRSc6IFwiRm9jYWxQbGFuZVhSZXNvbHV0aW9uXCIsICAgLy8gTnVtYmVyIG9mIHBpeGVscyBpbiB3aWR0aCBkaXJlY3Rpb24gcGVyIEZvY2FsUGxhbmVSZXNvbHV0aW9uVW5pdFxuICAgICcweEEyMEYnOiBcIkZvY2FsUGxhbmVZUmVzb2x1dGlvblwiLCAgIC8vIE51bWJlciBvZiBwaXhlbHMgaW4gaGVpZ2h0IGRpcmVjdGlvbiBwZXIgRm9jYWxQbGFuZVJlc29sdXRpb25Vbml0XG4gICAgJzB4QTIxMCc6IFwiRm9jYWxQbGFuZVJlc29sdXRpb25Vbml0XCIsICAgIC8vIFVuaXQgZm9yIG1lYXN1cmluZyBGb2NhbFBsYW5lWFJlc29sdXRpb24gYW5kIEZvY2FsUGxhbmVZUmVzb2x1dGlvblxuICAgICcweEEyMTQnOiBcIlN1YmplY3RMb2NhdGlvblwiLCAgICAgICAgIC8vIExvY2F0aW9uIG9mIHN1YmplY3QgaW4gaW1hZ2VcbiAgICAnMHhBMjE1JzogXCJFeHBvc3VyZUluZGV4XCIsICAgICAgICAgICAvLyBFeHBvc3VyZSBpbmRleCBzZWxlY3RlZCBvbiBjYW1lcmFcbiAgICAnMHhBMjE3JzogXCJTZW5zaW5nTWV0aG9kXCIsICAgICAgICAgICAvLyBJbWFnZSBzZW5zb3IgdHlwZVxuICAgICcweEEzMDAnOiBcIkZpbGVTb3VyY2VcIiwgICAgICAgICAgICAgIC8vIEltYWdlIHNvdXJjZSAoMyA9PSBEU0MpXG4gICAgJzB4QTMwMSc6IFwiU2NlbmVUeXBlXCIsICAgICAgICAgICAgICAgLy8gU2NlbmUgdHlwZSAoMSA9PSBkaXJlY3RseSBwaG90b2dyYXBoZWQpXG4gICAgJzB4QTMwMic6IFwiQ0ZBUGF0dGVyblwiLCAgICAgICAgICAgICAgLy8gQ29sb3IgZmlsdGVyIGFycmF5IGdlb21ldHJpYyBwYXR0ZXJuXG4gICAgJzB4QTQwMSc6IFwiQ3VzdG9tUmVuZGVyZWRcIiwgICAgICAgICAgLy8gU3BlY2lhbCBwcm9jZXNzaW5nXG4gICAgJzB4QTQwMic6IFwiRXhwb3N1cmVNb2RlXCIsICAgICAgICAgICAgLy8gRXhwb3N1cmUgbW9kZVxuICAgICcweEE0MDMnOiBcIldoaXRlQmFsYW5jZVwiLCAgICAgICAgICAgIC8vIDEgPSBhdXRvIHdoaXRlIGJhbGFuY2UsIDIgPSBtYW51YWxcbiAgICAnMHhBNDA0JzogXCJEaWdpdGFsWm9vbVJhdGlvblwiLCAgICAgICAvLyBEaWdpdGFsIHpvb20gcmF0aW9cbiAgICAnMHhBNDA1JzogXCJGb2NhbExlbmd0aEluMzVtbUZpbG1cIiwgICAvLyBFcXVpdmFsZW50IGZvYWNsIGxlbmd0aCBhc3N1bWluZyAzNW1tIGZpbG0gY2FtZXJhIChpbiBtbSlcbiAgICAnMHhBNDA2JzogXCJTY2VuZUNhcHR1cmVUeXBlXCIsICAgICAgICAvLyBUeXBlIG9mIHNjZW5lXG4gICAgJzB4QTQwNyc6IFwiR2FpbkNvbnRyb2xcIiwgICAgICAgICAgICAgLy8gRGVncmVlIG9mIG92ZXJhbGwgaW1hZ2UgZ2FpbiBhZGp1c3RtZW50XG4gICAgJzB4QTQwOCc6IFwiQ29udHJhc3RcIiwgICAgICAgICAgICAgICAgLy8gRGlyZWN0aW9uIG9mIGNvbnRyYXN0IHByb2Nlc3NpbmcgYXBwbGllZCBieSBjYW1lcmFcbiAgICAnMHhBNDA5JzogXCJTYXR1cmF0aW9uXCIsICAgICAgICAgICAgICAvLyBEaXJlY3Rpb24gb2Ygc2F0dXJhdGlvbiBwcm9jZXNzaW5nIGFwcGxpZWQgYnkgY2FtZXJhXG4gICAgJzB4QTQwQSc6IFwiU2hhcnBuZXNzXCIsICAgICAgICAgICAgICAgLy8gRGlyZWN0aW9uIG9mIHNoYXJwbmVzcyBwcm9jZXNzaW5nIGFwcGxpZWQgYnkgY2FtZXJhXG4gICAgJzB4QTQwQic6IFwiRGV2aWNlU2V0dGluZ0Rlc2NyaXB0aW9uXCIsICAgIC8vXG4gICAgJzB4QTQwQyc6IFwiU3ViamVjdERpc3RhbmNlUmFuZ2VcIiwgICAgLy8gRGlzdGFuY2UgdG8gc3ViamVjdFxuXG4gICAgLy8gb3RoZXIgdGFnc1xuICAgICcweEEwMDUnOiBcIkludGVyb3BlcmFiaWxpdHlJRkRQb2ludGVyXCIsXG4gICAgJzB4QTQyMCc6IFwiSW1hZ2VVbmlxdWVJRFwiICAgICAgICAgICAgLy8gSWRlbnRpZmllciBhc3NpZ25lZCB1bmlxdWVseSB0byBlYWNoIGltYWdlXG4gIH07XG5cbiAgc3RhdGljIFRpZmZUYWdzID0ge1xuICAgICcweDAxMDAnOiBcIkltYWdlV2lkdGhcIixcbiAgICAnMHgwMTAxJzogXCJJbWFnZUhlaWdodFwiLFxuICAgICcweDg3NjknOiBcIkV4aWZJRkRQb2ludGVyXCIsXG4gICAgJzB4ODgyNSc6IFwiR1BTSW5mb0lGRFBvaW50ZXJcIixcbiAgICAnMHhBMDA1JzogXCJJbnRlcm9wZXJhYmlsaXR5SUZEUG9pbnRlclwiLFxuICAgICcweDAxMDInOiBcIkJpdHNQZXJTYW1wbGVcIixcbiAgICAnMHgwMTAzJzogXCJDb21wcmVzc2lvblwiLFxuICAgICcweDAxMDYnOiBcIlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb25cIixcbiAgICAnMHgwMTEyJzogXCJPcmllbnRhdGlvblwiLFxuICAgICcweDAxMTUnOiBcIlNhbXBsZXNQZXJQaXhlbFwiLFxuICAgICcweDAxMUMnOiBcIlBsYW5hckNvbmZpZ3VyYXRpb25cIixcbiAgICAnMHgwMjEyJzogXCJZQ2JDclN1YlNhbXBsaW5nXCIsXG4gICAgJzB4MDIxMyc6IFwiWUNiQ3JQb3NpdGlvbmluZ1wiLFxuICAgICcweDAxMUEnOiBcIlhSZXNvbHV0aW9uXCIsXG4gICAgJzB4MDExQic6IFwiWVJlc29sdXRpb25cIixcbiAgICAnMHgwMTI4JzogXCJSZXNvbHV0aW9uVW5pdFwiLFxuICAgICcweDAxMTEnOiBcIlN0cmlwT2Zmc2V0c1wiLFxuICAgICcweDAxMTYnOiBcIlJvd3NQZXJTdHJpcFwiLFxuICAgICcweDAxMTcnOiBcIlN0cmlwQnl0ZUNvdW50c1wiLFxuICAgICcweDAyMDEnOiBcIkpQRUdJbnRlcmNoYW5nZUZvcm1hdFwiLFxuICAgICcweDAyMDInOiBcIkpQRUdJbnRlcmNoYW5nZUZvcm1hdExlbmd0aFwiLFxuICAgICcweDAxMkQnOiBcIlRyYW5zZmVyRnVuY3Rpb25cIixcbiAgICAnMHgwMTNFJzogXCJXaGl0ZVBvaW50XCIsXG4gICAgJzB4MDEzRic6IFwiUHJpbWFyeUNocm9tYXRpY2l0aWVzXCIsXG4gICAgJzB4MDIxMSc6IFwiWUNiQ3JDb2VmZmljaWVudHNcIixcbiAgICAnMHgwMjE0JzogXCJSZWZlcmVuY2VCbGFja1doaXRlXCIsXG4gICAgJzB4MDEzMic6IFwiRGF0ZVRpbWVcIixcbiAgICAnMHgwMTBFJzogXCJJbWFnZURlc2NyaXB0aW9uXCIsXG4gICAgJzB4MDEwRic6IFwiTWFrZVwiLFxuICAgICcweDAxMTAnOiBcIk1vZGVsXCIsXG4gICAgJzB4MDEzMSc6IFwiU29mdHdhcmVcIixcbiAgICAnMHgwMTNCJzogXCJBcnRpc3RcIixcbiAgICAnMHg4Mjk4JzogXCJDb3B5cmlnaHRcIlxuICB9O1xuXG4gIHN0YXRpYyBHUFNUYWdzID0ge1xuICAgICcweDAwMDAnOiBcIkdQU1ZlcnNpb25JRFwiLFxuICAgICcweDAwMDEnOiBcIkdQU0xhdGl0dWRlUmVmXCIsXG4gICAgJzB4MDAwMic6IFwiR1BTTGF0aXR1ZGVcIixcbiAgICAnMHgwMDAzJzogXCJHUFNMb25naXR1ZGVSZWZcIixcbiAgICAnMHgwMDA0JzogXCJHUFNMb25naXR1ZGVcIixcbiAgICAnMHgwMDA1JzogXCJHUFNBbHRpdHVkZVJlZlwiLFxuICAgICcweDAwMDYnOiBcIkdQU0FsdGl0dWRlXCIsXG4gICAgJzB4MDAwNyc6IFwiR1BTVGltZVN0YW1wXCIsXG4gICAgJzB4MDAwOCc6IFwiR1BTU2F0ZWxsaXRlc1wiLFxuICAgICcweDAwMDknOiBcIkdQU1N0YXR1c1wiLFxuICAgICcweDAwMEEnOiBcIkdQU01lYXN1cmVNb2RlXCIsXG4gICAgJzB4MDAwQic6IFwiR1BTRE9QXCIsXG4gICAgJzB4MDAwQyc6IFwiR1BTU3BlZWRSZWZcIixcbiAgICAnMHgwMDBEJzogXCJHUFNTcGVlZFwiLFxuICAgICcweDAwMEUnOiBcIkdQU1RyYWNrUmVmXCIsXG4gICAgJzB4MDAwRic6IFwiR1BTVHJhY2tcIixcbiAgICAnMHgwMDEwJzogXCJHUFNJbWdEaXJlY3Rpb25SZWZcIixcbiAgICAnMHgwMDExJzogXCJHUFNJbWdEaXJlY3Rpb25cIixcbiAgICAnMHgwMDEyJzogXCJHUFNNYXBEYXR1bVwiLFxuICAgICcweDAwMTMnOiBcIkdQU0Rlc3RMYXRpdHVkZVJlZlwiLFxuICAgICcweDAwMTQnOiBcIkdQU0Rlc3RMYXRpdHVkZVwiLFxuICAgICcweDAwMTUnOiBcIkdQU0Rlc3RMb25naXR1ZGVSZWZcIixcbiAgICAnMHgwMDE2JzogXCJHUFNEZXN0TG9uZ2l0dWRlXCIsXG4gICAgJzB4MDAxNyc6IFwiR1BTRGVzdEJlYXJpbmdSZWZcIixcbiAgICAnMHgwMDE4JzogXCJHUFNEZXN0QmVhcmluZ1wiLFxuICAgICcweDAwMTknOiBcIkdQU0Rlc3REaXN0YW5jZVJlZlwiLFxuICAgICcweDAwMUEnOiBcIkdQU0Rlc3REaXN0YW5jZVwiLFxuICAgICcweDAwMUInOiBcIkdQU1Byb2Nlc3NpbmdNZXRob2RcIixcbiAgICAnMHgwMDFDJzogXCJHUFNBcmVhSW5mb3JtYXRpb25cIixcbiAgICAnMHgwMDFEJzogXCJHUFNEYXRlU3RhbXBcIixcbiAgICAnMHgwMDFFJzogXCJHUFNEaWZmZXJlbnRpYWxcIlxuICB9O1xuXG4gIHN0YXRpYyBTdHJpbmdWYWx1ZXMgPSB7XG4gICAgRXhwb3N1cmVQcm9ncmFtOiB7XG4gICAgICAnMCc6IFwiTm90IGRlZmluZWRcIixcbiAgICAgICcxJzogXCJNYW51YWxcIixcbiAgICAgICcyJzogXCJOb3JtYWwgcHJvZ3JhbVwiLFxuICAgICAgJzMnOiBcIkFwZXJ0dXJlIHByaW9yaXR5XCIsXG4gICAgICAnNCc6IFwiU2h1dHRlciBwcmlvcml0eVwiLFxuICAgICAgJzUnOiBcIkNyZWF0aXZlIHByb2dyYW1cIixcbiAgICAgICc2JzogXCJBY3Rpb24gcHJvZ3JhbVwiLFxuICAgICAgJzcnOiBcIlBvcnRyYWl0IG1vZGVcIixcbiAgICAgICc4JzogXCJMYW5kc2NhcGUgbW9kZVwiXG4gICAgfSxcbiAgICBNZXRlcmluZ01vZGU6IHtcbiAgICAgICcwJzogXCJVbmtub3duXCIsXG4gICAgICAnMSc6IFwiQXZlcmFnZVwiLFxuICAgICAgJzInOiBcIkNlbnRlcldlaWdodGVkQXZlcmFnZVwiLFxuICAgICAgJzMnOiBcIlNwb3RcIixcbiAgICAgICc0JzogXCJNdWx0aVNwb3RcIixcbiAgICAgICc1JzogXCJQYXR0ZXJuXCIsXG4gICAgICAnNic6IFwiUGFydGlhbFwiLFxuICAgICAgJzI1NSc6IFwiT3RoZXJcIlxuICAgIH0sXG4gICAgTGlnaHRTb3VyY2U6IHtcbiAgICAgICcwJzogXCJVbmtub3duXCIsXG4gICAgICAnMSc6IFwiRGF5bGlnaHRcIixcbiAgICAgICcyJzogXCJGbHVvcmVzY2VudFwiLFxuICAgICAgJzMnOiBcIlR1bmdzdGVuIChpbmNhbmRlc2NlbnQgbGlnaHQpXCIsXG4gICAgICAnNCc6IFwiRmxhc2hcIixcbiAgICAgICc5JzogXCJGaW5lIHdlYXRoZXJcIixcbiAgICAgICcxMCc6IFwiQ2xvdWR5IHdlYXRoZXJcIixcbiAgICAgICcxMSc6IFwiU2hhZGVcIixcbiAgICAgICcxMic6IFwiRGF5bGlnaHQgZmx1b3Jlc2NlbnQgKEQgNTcwMCAtIDcxMDBLKVwiLFxuICAgICAgJzEzJzogXCJEYXkgd2hpdGUgZmx1b3Jlc2NlbnQgKE4gNDYwMCAtIDU0MDBLKVwiLFxuICAgICAgJzE0JzogXCJDb29sIHdoaXRlIGZsdW9yZXNjZW50IChXIDM5MDAgLSA0NTAwSylcIixcbiAgICAgICcxNSc6IFwiV2hpdGUgZmx1b3Jlc2NlbnQgKFdXIDMyMDAgLSAzNzAwSylcIixcbiAgICAgICcxNyc6IFwiU3RhbmRhcmQgbGlnaHQgQVwiLFxuICAgICAgJzE4JzogXCJTdGFuZGFyZCBsaWdodCBCXCIsXG4gICAgICAnMTknOiBcIlN0YW5kYXJkIGxpZ2h0IENcIixcbiAgICAgICcyMCc6IFwiRDU1XCIsXG4gICAgICAnMjEnOiBcIkQ2NVwiLFxuICAgICAgJzIyJzogXCJENzVcIixcbiAgICAgICcyMyc6IFwiRDUwXCIsXG4gICAgICAnMjQnOiBcIklTTyBzdHVkaW8gdHVuZ3N0ZW5cIixcbiAgICAgICcyNTUnOiBcIk90aGVyXCJcbiAgICB9LFxuICAgIEZsYXNoOiB7XG4gICAgICAnMHgwMDAwJzogXCJGbGFzaCBkaWQgbm90IGZpcmVcIixcbiAgICAgICcweDAwMDEnOiBcIkZsYXNoIGZpcmVkXCIsXG4gICAgICAnMHgwMDA1JzogXCJTdHJvYmUgcmV0dXJuIGxpZ2h0IG5vdCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDAwNyc6IFwiU3Ryb2JlIHJldHVybiBsaWdodCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDAwOSc6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZVwiLFxuICAgICAgJzB4MDAwRCc6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZSwgcmV0dXJuIGxpZ2h0IG5vdCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDAwRic6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZSwgcmV0dXJuIGxpZ2h0IGRldGVjdGVkXCIsXG4gICAgICAnMHgwMDEwJzogXCJGbGFzaCBkaWQgbm90IGZpcmUsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZVwiLFxuICAgICAgJzB4MDAxOCc6IFwiRmxhc2ggZGlkIG5vdCBmaXJlLCBhdXRvIG1vZGVcIixcbiAgICAgICcweDAwMTknOiBcIkZsYXNoIGZpcmVkLCBhdXRvIG1vZGVcIixcbiAgICAgICcweDAwMUQnOiBcIkZsYXNoIGZpcmVkLCBhdXRvIG1vZGUsIHJldHVybiBsaWdodCBub3QgZGV0ZWN0ZWRcIixcbiAgICAgICcweDAwMUYnOiBcIkZsYXNoIGZpcmVkLCBhdXRvIG1vZGUsIHJldHVybiBsaWdodCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDAyMCc6IFwiTm8gZmxhc2ggZnVuY3Rpb25cIixcbiAgICAgICcweDAwNDEnOiBcIkZsYXNoIGZpcmVkLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlXCIsXG4gICAgICAnMHgwMDQ1JzogXCJGbGFzaCBmaXJlZCwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZSwgcmV0dXJuIGxpZ2h0IG5vdCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDA0Nyc6IFwiRmxhc2ggZmlyZWQsIHJlZC1leWUgcmVkdWN0aW9uIG1vZGUsIHJldHVybiBsaWdodCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDA0OSc6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZSwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZVwiLFxuICAgICAgJzB4MDA0RCc6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZSwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZSwgcmV0dXJuIGxpZ2h0IG5vdCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDA0Ric6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZSwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZSwgcmV0dXJuIGxpZ2h0IGRldGVjdGVkXCIsXG4gICAgICAnMHgwMDU5JzogXCJGbGFzaCBmaXJlZCwgYXV0byBtb2RlLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlXCIsXG4gICAgICAnMHgwMDVEJzogXCJGbGFzaCBmaXJlZCwgYXV0byBtb2RlLCByZXR1cm4gbGlnaHQgbm90IGRldGVjdGVkLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlXCIsXG4gICAgICAnMHgwMDVGJzogXCJGbGFzaCBmaXJlZCwgYXV0byBtb2RlLCByZXR1cm4gbGlnaHQgZGV0ZWN0ZWQsIHJlZC1leWUgcmVkdWN0aW9uIG1vZGVcIlxuICAgIH0sXG4gICAgU2Vuc2luZ01ldGhvZDoge1xuICAgICAgJzEnOiBcIk5vdCBkZWZpbmVkXCIsXG4gICAgICAnMic6IFwiT25lLWNoaXAgY29sb3IgYXJlYSBzZW5zb3JcIixcbiAgICAgICczJzogXCJUd28tY2hpcCBjb2xvciBhcmVhIHNlbnNvclwiLFxuICAgICAgJzQnOiBcIlRocmVlLWNoaXAgY29sb3IgYXJlYSBzZW5zb3JcIixcbiAgICAgICc1JzogXCJDb2xvciBzZXF1ZW50aWFsIGFyZWEgc2Vuc29yXCIsXG4gICAgICAnNyc6IFwiVHJpbGluZWFyIHNlbnNvclwiLFxuICAgICAgJzgnOiBcIkNvbG9yIHNlcXVlbnRpYWwgbGluZWFyIHNlbnNvclwiXG4gICAgfSxcbiAgICBTY2VuZUNhcHR1cmVUeXBlOiB7XG4gICAgICAnMCc6IFwiU3RhbmRhcmRcIixcbiAgICAgICcxJzogXCJMYW5kc2NhcGVcIixcbiAgICAgICcyJzogXCJQb3J0cmFpdFwiLFxuICAgICAgJzMnOiBcIk5pZ2h0IHNjZW5lXCJcbiAgICB9LFxuICAgIFNjZW5lVHlwZToge1xuICAgICAgJzEnOiBcIkRpcmVjdGx5IHBob3RvZ3JhcGhlZFwiXG4gICAgfSxcbiAgICBDdXN0b21SZW5kZXJlZDoge1xuICAgICAgJzAnOiBcIk5vcm1hbCBwcm9jZXNzXCIsXG4gICAgICAnMSc6IFwiQ3VzdG9tIHByb2Nlc3NcIlxuICAgIH0sXG4gICAgV2hpdGVCYWxhbmNlOiB7XG4gICAgICAnMCc6IFwiQXV0byB3aGl0ZSBiYWxhbmNlXCIsXG4gICAgICAnMSc6IFwiTWFudWFsIHdoaXRlIGJhbGFuY2VcIlxuICAgIH0sXG4gICAgR2FpbkNvbnRyb2w6IHtcbiAgICAgICcwJzogXCJOb25lXCIsXG4gICAgICAnMSc6IFwiTG93IGdhaW4gdXBcIixcbiAgICAgICcyJzogXCJIaWdoIGdhaW4gdXBcIixcbiAgICAgICczJzogXCJMb3cgZ2FpbiBkb3duXCIsXG4gICAgICAnNCc6IFwiSGlnaCBnYWluIGRvd25cIlxuICAgIH0sXG4gICAgQ29udHJhc3Q6IHtcbiAgICAgICcwJzogXCJOb3JtYWxcIixcbiAgICAgICcxJzogXCJTb2Z0XCIsXG4gICAgICAnMic6IFwiSGFyZFwiXG4gICAgfSxcbiAgICBTYXR1cmF0aW9uOiB7XG4gICAgICAnMCc6IFwiTm9ybWFsXCIsXG4gICAgICAnMSc6IFwiTG93IHNhdHVyYXRpb25cIixcbiAgICAgICcyJzogXCJIaWdoIHNhdHVyYXRpb25cIlxuICAgIH0sXG4gICAgU2hhcnBuZXNzOiB7XG4gICAgICAnMCc6IFwiTm9ybWFsXCIsXG4gICAgICAnMSc6IFwiU29mdFwiLFxuICAgICAgJzInOiBcIkhhcmRcIlxuICAgIH0sXG4gICAgU3ViamVjdERpc3RhbmNlUmFuZ2U6IHtcbiAgICAgICcwJzogXCJVbmtub3duXCIsXG4gICAgICAnMSc6IFwiTWFjcm9cIixcbiAgICAgICcyJzogXCJDbG9zZSB2aWV3XCIsXG4gICAgICAnMyc6IFwiRGlzdGFudCB2aWV3XCJcbiAgICB9LFxuICAgIEZpbGVTb3VyY2U6IHtcbiAgICAgICczJzogXCJEU0NcIlxuICAgIH0sXG5cbiAgICBDb21wb25lbnRzOiB7XG4gICAgICAnMCc6IFwiXCIsXG4gICAgICAnMSc6IFwiWVwiLFxuICAgICAgJzInOiBcIkNiXCIsXG4gICAgICAnMyc6IFwiQ3JcIixcbiAgICAgICc0JzogXCJSXCIsXG4gICAgICAnNSc6IFwiR1wiLFxuICAgICAgJzYnOiBcIkJcIlxuICAgIH1cbiAgfTtcblxuICBzdGF0aWMgSXB0Y0ZpZWxkTWFwID0ge1xuICAgICcweDc4JzogJ2NhcHRpb24nLFxuICAgICcweDZFJzogJ2NyZWRpdCcsXG4gICAgJzB4MTknOiAna2V5d29yZHMnLFxuICAgICcweDM3JzogJ2RhdGVDcmVhdGVkJyxcbiAgICAnMHg1MCc6ICdieWxpbmUnLFxuICAgICcweDU1JzogJ2J5bGluZVRpdGxlJyxcbiAgICAnMHg3QSc6ICdjYXB0aW9uV3JpdGVyJyxcbiAgICAnMHg2OSc6ICdoZWFkbGluZScsXG4gICAgJzB4NzQnOiAnY29weXJpZ2h0JyxcbiAgICAnMHgwRic6ICdjYXRlZ29yeSdcbiAgfTtcblxuICBzdGF0aWMgcmVhZElQVENEYXRhKGZpbGUsIHN0YXJ0T2Zmc2V0LCBzZWN0aW9uTGVuZ3RoKSB7XG4gICAgdmFyIGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGZpbGUpO1xuICAgIHZhciBkYXRhID0ge307XG4gICAgdmFyIGZpZWxkVmFsdWUsIGZpZWxkTmFtZSwgZGF0YVNpemUsIHNlZ21lbnRUeXBlLCBzZWdtZW50U2l6ZTtcbiAgICB2YXIgc2VnbWVudFN0YXJ0UG9zID0gc3RhcnRPZmZzZXQ7XG4gICAgd2hpbGUgKHNlZ21lbnRTdGFydFBvcyA8IHN0YXJ0T2Zmc2V0ICsgc2VjdGlvbkxlbmd0aCkge1xuICAgICAgaWYgKGRhdGFWaWV3LmdldFVpbnQ4KHNlZ21lbnRTdGFydFBvcykgPT09IDB4MUMgJiYgZGF0YVZpZXcuZ2V0VWludDgoc2VnbWVudFN0YXJ0UG9zICsgMSkgPT09IDB4MDIpIHtcbiAgICAgICAgc2VnbWVudFR5cGUgPSBkYXRhVmlldy5nZXRVaW50OChzZWdtZW50U3RhcnRQb3MgKyAyKTtcbiAgICAgICAgaWYgKHNlZ21lbnRUeXBlIGluIENyb3BFWElGLklwdGNGaWVsZE1hcCkge1xuICAgICAgICAgIGRhdGFTaXplID0gZGF0YVZpZXcuZ2V0SW50MTYoc2VnbWVudFN0YXJ0UG9zICsgMyk7XG4gICAgICAgICAgc2VnbWVudFNpemUgPSBkYXRhU2l6ZSArIDU7XG4gICAgICAgICAgZmllbGROYW1lID0gQ3JvcEVYSUYuSXB0Y0ZpZWxkTWFwW3NlZ21lbnRUeXBlXTtcbiAgICAgICAgICBmaWVsZFZhbHVlID0gQ3JvcEVYSUYuZ2V0U3RyaW5nRnJvbURCKGRhdGFWaWV3LCBzZWdtZW50U3RhcnRQb3MgKyA1LCBkYXRhU2l6ZSk7XG4gICAgICAgICAgLy8gQ2hlY2sgaWYgd2UgYWxyZWFkeSBzdG9yZWQgYSB2YWx1ZSB3aXRoIHRoaXMgbmFtZVxuICAgICAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KGZpZWxkTmFtZSkpIHtcbiAgICAgICAgICAgIC8vIFZhbHVlIGFscmVhZHkgc3RvcmVkIHdpdGggdGhpcyBuYW1lLCBjcmVhdGUgbXVsdGl2YWx1ZSBmaWVsZFxuICAgICAgICAgICAgaWYgKGRhdGFbZmllbGROYW1lXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgIGRhdGFbZmllbGROYW1lXS5wdXNoKGZpZWxkVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGRhdGFbZmllbGROYW1lXSA9IFtkYXRhW2ZpZWxkTmFtZV0sIGZpZWxkVmFsdWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRhdGFbZmllbGROYW1lXSA9IGZpZWxkVmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIH1cbiAgICAgIHNlZ21lbnRTdGFydFBvcysrO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIHN0YXRpYyByZWFkVGFncyhmaWxlLCB0aWZmU3RhcnQsIGRpclN0YXJ0LCBzdHJpbmdzLCBiaWdFbmQpOiB7IFtrZXk6IHN0cmluZ106IGFueSB9IHtcbiAgICB2YXIgZW50cmllcyA9IGZpbGUuZ2V0VWludDE2KGRpclN0YXJ0LCAhYmlnRW5kKSxcbiAgICAgIHRhZ3MgPSB7fSxcbiAgICAgIGVudHJ5T2Zmc2V0LCB0YWcsXG4gICAgICBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGVudHJpZXM7IGkrKykge1xuICAgICAgZW50cnlPZmZzZXQgPSBkaXJTdGFydCArIGkgKiAxMiArIDI7XG4gICAgICB0YWcgPSBzdHJpbmdzW2ZpbGUuZ2V0VWludDE2KGVudHJ5T2Zmc2V0LCAhYmlnRW5kKV07XG4gICAgICBpZiAodGFnKSB7XG4gICAgICAgIHRhZ3NbdGFnXSA9IENyb3BFWElGLnJlYWRUYWdWYWx1ZShmaWxlLCBlbnRyeU9mZnNldCwgdGlmZlN0YXJ0LCBkaXJTdGFydCwgYmlnRW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUud2FybignVW5rbm93biB0YWc6ICcgKyBmaWxlLmdldFVpbnQxNihlbnRyeU9mZnNldCwgIWJpZ0VuZCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFncztcbiAgfVxuXG4gIHN0YXRpYyByZWFkVGFnVmFsdWUoZmlsZSwgZW50cnlPZmZzZXQsIHRpZmZTdGFydCwgZGlyU3RhcnQsIGJpZ0VuZCkge1xuICAgIHZhciB0eXBlID0gZmlsZS5nZXRVaW50MTYoZW50cnlPZmZzZXQgKyAyLCAhYmlnRW5kKSxcbiAgICAgIG51bVZhbHVlcyA9IGZpbGUuZ2V0VWludDMyKGVudHJ5T2Zmc2V0ICsgNCwgIWJpZ0VuZCksXG4gICAgICB2YWx1ZU9mZnNldCA9IGZpbGUuZ2V0VWludDMyKGVudHJ5T2Zmc2V0ICsgOCwgIWJpZ0VuZCkgKyB0aWZmU3RhcnQsXG4gICAgICBvZmZzZXQsXG4gICAgICB2YWxzLCB2YWwsIG4sXG4gICAgICBudW1lcmF0b3IsIGRlbm9taW5hdG9yO1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICcxJzogLy8gYnl0ZSwgOC1iaXQgdW5zaWduZWQgaW50XG4gICAgICBjYXNlICc3JzogLy8gdW5kZWZpbmVkLCA4LWJpdCBieXRlLCB2YWx1ZSBkZXBlbmRpbmcgb24gZmllbGRcbiAgICAgICAgaWYgKG51bVZhbHVlcyA9PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIGZpbGUuZ2V0VWludDgoZW50cnlPZmZzZXQgKyA4LCAhYmlnRW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvZmZzZXQgPSBudW1WYWx1ZXMgPiA0ID8gdmFsdWVPZmZzZXQgOiAoZW50cnlPZmZzZXQgKyA4KTtcbiAgICAgICAgICB2YWxzID0gW107XG4gICAgICAgICAgZm9yIChuID0gMDsgbiA8IG51bVZhbHVlczsgbisrKSB7XG4gICAgICAgICAgICB2YWxzW25dID0gZmlsZS5nZXRVaW50OChvZmZzZXQgKyBuKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHM7XG4gICAgICAgIH1cblxuICAgICAgY2FzZSAnMic6IC8vIGFzY2lpLCA4LWJpdCBieXRlXG4gICAgICAgIG9mZnNldCA9IG51bVZhbHVlcyA+IDQgPyB2YWx1ZU9mZnNldCA6IChlbnRyeU9mZnNldCArIDgpO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdHJpbmdGcm9tREIoZmlsZSwgb2Zmc2V0LCBudW1WYWx1ZXMgLSAxKTtcblxuICAgICAgY2FzZSAnMyc6IC8vIHNob3J0LCAxNiBiaXQgaW50XG4gICAgICAgIGlmIChudW1WYWx1ZXMgPT0gMSkge1xuICAgICAgICAgIHJldHVybiBmaWxlLmdldFVpbnQxNihlbnRyeU9mZnNldCArIDgsICFiaWdFbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9mZnNldCA9IG51bVZhbHVlcyA+IDIgPyB2YWx1ZU9mZnNldCA6IChlbnRyeU9mZnNldCArIDgpO1xuICAgICAgICAgIHZhbHMgPSBbXTtcbiAgICAgICAgICBmb3IgKG4gPSAwOyBuIDwgbnVtVmFsdWVzOyBuKyspIHtcbiAgICAgICAgICAgIHZhbHNbbl0gPSBmaWxlLmdldFVpbnQxNihvZmZzZXQgKyAyICogbiwgIWJpZ0VuZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB2YWxzO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgJzQnOiAvLyBsb25nLCAzMiBiaXQgaW50XG4gICAgICAgIGlmIChudW1WYWx1ZXMgPT0gMSkge1xuICAgICAgICAgIHJldHVybiBmaWxlLmdldFVpbnQzMihlbnRyeU9mZnNldCArIDgsICFiaWdFbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHMgPSBbXTtcbiAgICAgICAgICBmb3IgKG4gPSAwOyBuIDwgbnVtVmFsdWVzOyBuKyspIHtcbiAgICAgICAgICAgIHZhbHNbbl0gPSBmaWxlLmdldFVpbnQzMih2YWx1ZU9mZnNldCArIDQgKiBuLCAhYmlnRW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHM7XG4gICAgICAgIH1cblxuICAgICAgY2FzZSAnNSc6ICAgIC8vIHJhdGlvbmFsID0gdHdvIGxvbmcgdmFsdWVzLCBmaXJzdCBpcyBudW1lcmF0b3IsIHNlY29uZCBpcyBkZW5vbWluYXRvclxuICAgICAgICBpZiAobnVtVmFsdWVzID09IDEpIHtcbiAgICAgICAgICBudW1lcmF0b3IgPSBmaWxlLmdldFVpbnQzMih2YWx1ZU9mZnNldCwgIWJpZ0VuZCk7XG4gICAgICAgICAgZGVub21pbmF0b3IgPSBmaWxlLmdldFVpbnQzMih2YWx1ZU9mZnNldCArIDQsICFiaWdFbmQpO1xuICAgICAgICAgIHZhbCA9IG5ldyBOdW1iZXIobnVtZXJhdG9yIC8gZGVub21pbmF0b3IpO1xuICAgICAgICAgIHZhbC5udW1lcmF0b3IgPSBudW1lcmF0b3I7XG4gICAgICAgICAgdmFsLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG4gICAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWxzID0gW107XG4gICAgICAgICAgZm9yIChuID0gMDsgbiA8IG51bVZhbHVlczsgbisrKSB7XG4gICAgICAgICAgICBudW1lcmF0b3IgPSBmaWxlLmdldFVpbnQzMih2YWx1ZU9mZnNldCArIDggKiBuLCAhYmlnRW5kKTtcbiAgICAgICAgICAgIGRlbm9taW5hdG9yID0gZmlsZS5nZXRVaW50MzIodmFsdWVPZmZzZXQgKyA0ICsgOCAqIG4sICFiaWdFbmQpO1xuICAgICAgICAgICAgdmFsc1tuXSA9IG5ldyBOdW1iZXIobnVtZXJhdG9yIC8gZGVub21pbmF0b3IpO1xuICAgICAgICAgICAgdmFsc1tuXS5udW1lcmF0b3IgPSBudW1lcmF0b3I7XG4gICAgICAgICAgICB2YWxzW25dLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB2YWxzO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgJzknOiAvLyBzbG9uZywgMzIgYml0IHNpZ25lZCBpbnRcbiAgICAgICAgaWYgKG51bVZhbHVlcyA9PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIGZpbGUuZ2V0SW50MzIoZW50cnlPZmZzZXQgKyA4LCAhYmlnRW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWxzID0gW107XG4gICAgICAgICAgZm9yIChuID0gMDsgbiA8IG51bVZhbHVlczsgbisrKSB7XG4gICAgICAgICAgICB2YWxzW25dID0gZmlsZS5nZXRJbnQzMih2YWx1ZU9mZnNldCArIDQgKiBuLCAhYmlnRW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHM7XG4gICAgICAgIH1cblxuICAgICAgY2FzZSAnMTAnOiAvLyBzaWduZWQgcmF0aW9uYWwsIHR3byBzbG9uZ3MsIGZpcnN0IGlzIG51bWVyYXRvciwgc2Vjb25kIGlzIGRlbm9taW5hdG9yXG4gICAgICAgIGlmIChudW1WYWx1ZXMgPT0gMSkge1xuICAgICAgICAgIHJldHVybiBmaWxlLmdldEludDMyKHZhbHVlT2Zmc2V0LCAhYmlnRW5kKSAvIGZpbGUuZ2V0SW50MzIodmFsdWVPZmZzZXQgKyA0LCAhYmlnRW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWxzID0gW107XG4gICAgICAgICAgZm9yIChuID0gMDsgbiA8IG51bVZhbHVlczsgbisrKSB7XG4gICAgICAgICAgICB2YWxzW25dID0gZmlsZS5nZXRJbnQzMih2YWx1ZU9mZnNldCArIDggKiBuLCAhYmlnRW5kKSAvIGZpbGUuZ2V0SW50MzIodmFsdWVPZmZzZXQgKyA0ICsgOCAqIG4sICFiaWdFbmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdmFscztcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBhZGRFdmVudChlbGVtZW50LCBldmVudCwgaGFuZGxlcikge1xuICAgIGlmIChlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgZmFsc2UpO1xuICAgIH0gZWxzZSBpZiAoZWxlbWVudC5hdHRhY2hFdmVudCkge1xuICAgICAgZWxlbWVudC5hdHRhY2hFdmVudChcIm9uXCIgKyBldmVudCwgaGFuZGxlcik7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG9iamVjdFVSTFRvQmxvYih1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICBodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICBodHRwLnJlc3BvbnNlVHlwZSA9IFwiYmxvYlwiO1xuICAgIGh0dHAub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSAyMDAgfHwgdGhpcy5zdGF0dXMgPT09IDApIHtcbiAgICAgICAgY2FsbGJhY2sodGhpcy5yZXNwb25zZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBodHRwLnNlbmQoKTtcbiAgfVxuXG4gIHN0YXRpYyBoYW5kbGVCaW5hcnlGaWxlKGJpbkZpbGUsIGltZywgY2FsbGJhY2s/KSB7XG4gICAgdmFyIGRhdGEgPSBDcm9wRVhJRi5maW5kRVhJRmluSlBFRyhiaW5GaWxlKTtcbiAgICB2YXIgaXB0Y2RhdGEgPSBDcm9wRVhJRi5maW5kSVBUQ2luSlBFRyhiaW5GaWxlKTtcbiAgICBpbWcuZXhpZmRhdGEgPSBkYXRhIHx8IHt9O1xuICAgIGltZy5pcHRjZGF0YSA9IGlwdGNkYXRhIHx8IHt9O1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2suY2FsbChpbWcpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBnZXRJbWFnZURhdGEoaW1nLCBjYWxsYmFjaykge1xuICAgIGlmIChpbWcuc3JjKSB7XG4gICAgICBpZiAoL15kYXRhXFw6L2kudGVzdChpbWcuc3JjKSkgeyAvLyBEYXRhIFVSSVxuICAgICAgICB2YXIgYXJyYXlCdWZmZXIgPSBDcm9wRVhJRi5iYXNlNjRUb0FycmF5QnVmZmVyKGltZy5zcmMpO1xuICAgICAgICB0aGlzLmhhbmRsZUJpbmFyeUZpbGUoYXJyYXlCdWZmZXIsIGltZywgY2FsbGJhY2spO1xuXG4gICAgICB9IGVsc2UgaWYgKC9eYmxvYlxcOi9pLnRlc3QoaW1nLnNyYykpIHsgLy8gT2JqZWN0IFVSTFxuICAgICAgICB2YXIgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gKGUpID0+IHtcbiAgICAgICAgICB0aGlzLmhhbmRsZUJpbmFyeUZpbGUoZS50YXJnZXQucmVzdWx0LCBpbWcsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICAgICAgQ3JvcEVYSUYub2JqZWN0VVJMVG9CbG9iKGltZy5zcmMsIGZ1bmN0aW9uIChibG9iKSB7XG4gICAgICAgICAgZmlsZVJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgaHR0cC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IDIwMCB8fCB0aGlzLnN0YXR1cyA9PT0gMCkge1xuICAgICAgICAgICAgc2VsZi5oYW5kbGVCaW5hcnlGaWxlKGh0dHAucmVzcG9uc2UsIGltZywgY2FsbGJhY2spO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBcIkNvdWxkIG5vdCBsb2FkIGltYWdlXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGh0dHAgPSBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBodHRwLm9wZW4oXCJHRVRcIiwgaW1nLnNyYywgdHJ1ZSk7XG4gICAgICAgIGh0dHAucmVzcG9uc2VUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xuICAgICAgICBodHRwLnNlbmQobnVsbCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChGaWxlUmVhZGVyICYmIChpbWcgaW5zdGFuY2VvZiB3aW5kb3cuQmxvYiB8fCBpbWcgaW5zdGFuY2VvZiBGaWxlKSkge1xuICAgICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSBlID0+IHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnZ2V0SW1hZ2VEYXRhOiBHb3QgZmlsZSBvZiBsZW5ndGggJW8nLCBlLnRhcmdldC5yZXN1bHQuYnl0ZUxlbmd0aCk7XG4gICAgICAgIHRoaXMuaGFuZGxlQmluYXJ5RmlsZShlLnRhcmdldC5yZXN1bHQsIGltZywgY2FsbGJhY2spO1xuICAgICAgfTtcblxuICAgICAgZmlsZVJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihpbWcpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBnZXRTdHJpbmdGcm9tREIoYnVmZmVyLCBzdGFydCwgbGVuZ3RoKSB7XG4gICAgdmFyIG91dHN0ciA9IFwiXCI7XG4gICAgZm9yICh2YXIgbiA9IHN0YXJ0OyBuIDwgc3RhcnQgKyBsZW5ndGg7IG4rKykge1xuICAgICAgb3V0c3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmZmVyLmdldFVpbnQ4KG4pKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHN0cjtcbiAgfVxuXG4gIHN0YXRpYyByZWFkRVhJRkRhdGEoZmlsZSwgc3RhcnQpIHtcbiAgICBpZiAodGhpcy5nZXRTdHJpbmdGcm9tREIoZmlsZSwgc3RhcnQsIDQpICE9IFwiRXhpZlwiKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiTm90IHZhbGlkIEVYSUYgZGF0YSEgXCIgKyB0aGlzLmdldFN0cmluZ0Zyb21EQihmaWxlLCBzdGFydCwgNCkpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBiaWdFbmQsXG4gICAgICB0YWdzLFxuICAgICAgZXhpZkRhdGEsIGdwc0RhdGEsXG4gICAgICB0aWZmT2Zmc2V0ID0gc3RhcnQgKyA2O1xuICAgIGxldCB0YWc6IHN0cmluZztcblxuICAgIC8vIHRlc3QgZm9yIFRJRkYgdmFsaWRpdHkgYW5kIGVuZGlhbm5lc3NcbiAgICBpZiAoZmlsZS5nZXRVaW50MTYodGlmZk9mZnNldCkgPT0gMHg0OTQ5KSB7XG4gICAgICBiaWdFbmQgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGZpbGUuZ2V0VWludDE2KHRpZmZPZmZzZXQpID09IDB4NEQ0RCkge1xuICAgICAgYmlnRW5kID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihcIk5vdCB2YWxpZCBUSUZGIGRhdGEhIChubyAweDQ5NDkgb3IgMHg0RDREKVwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoZmlsZS5nZXRVaW50MTYodGlmZk9mZnNldCArIDIsICFiaWdFbmQpICE9IDB4MDAyQSkge1xuICAgICAgY29uc29sZS5lcnJvcihcIk5vdCB2YWxpZCBUSUZGIGRhdGEhIChubyAweDAwMkEpXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBmaXJzdElGRE9mZnNldCA9IGZpbGUuZ2V0VWludDMyKHRpZmZPZmZzZXQgKyA0LCAhYmlnRW5kKTtcblxuICAgIGlmIChmaXJzdElGRE9mZnNldCA8IDB4MDAwMDAwMDgpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJOb3QgdmFsaWQgVElGRiBkYXRhISAoRmlyc3Qgb2Zmc2V0IGxlc3MgdGhhbiA4KVwiLCBmaWxlLmdldFVpbnQzMih0aWZmT2Zmc2V0ICsgNCwgIWJpZ0VuZCkpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRhZ3MgPSBDcm9wRVhJRi5yZWFkVGFncyhmaWxlLCB0aWZmT2Zmc2V0LCB0aWZmT2Zmc2V0ICsgZmlyc3RJRkRPZmZzZXQsIHRoaXMuVGlmZlRhZ3MsIGJpZ0VuZCk7XG5cbiAgICBpZiAodGFncy5FeGlmSUZEUG9pbnRlcikge1xuICAgICAgZXhpZkRhdGEgPSBDcm9wRVhJRi5yZWFkVGFncyhmaWxlLCB0aWZmT2Zmc2V0LCB0aWZmT2Zmc2V0ICsgdGFncy5FeGlmSUZEUG9pbnRlciwgdGhpcy5FeGlmVGFncywgYmlnRW5kKTtcbiAgICAgIGZvciAodGFnIGluIGV4aWZEYXRhKSB7XG4gICAgICAgIHN3aXRjaCAodGFnKSB7XG4gICAgICAgICAgY2FzZSBcIkxpZ2h0U291cmNlXCIgOlxuICAgICAgICAgIGNhc2UgXCJGbGFzaFwiIDpcbiAgICAgICAgICBjYXNlIFwiTWV0ZXJpbmdNb2RlXCIgOlxuICAgICAgICAgIGNhc2UgXCJFeHBvc3VyZVByb2dyYW1cIiA6XG4gICAgICAgICAgY2FzZSBcIlNlbnNpbmdNZXRob2RcIiA6XG4gICAgICAgICAgY2FzZSBcIlNjZW5lQ2FwdHVyZVR5cGVcIiA6XG4gICAgICAgICAgY2FzZSBcIlNjZW5lVHlwZVwiIDpcbiAgICAgICAgICBjYXNlIFwiQ3VzdG9tUmVuZGVyZWRcIiA6XG4gICAgICAgICAgY2FzZSBcIldoaXRlQmFsYW5jZVwiIDpcbiAgICAgICAgICBjYXNlIFwiR2FpbkNvbnRyb2xcIiA6XG4gICAgICAgICAgY2FzZSBcIkNvbnRyYXN0XCIgOlxuICAgICAgICAgIGNhc2UgXCJTYXR1cmF0aW9uXCIgOlxuICAgICAgICAgIGNhc2UgXCJTaGFycG5lc3NcIiA6XG4gICAgICAgICAgY2FzZSBcIlN1YmplY3REaXN0YW5jZVJhbmdlXCIgOlxuICAgICAgICAgIGNhc2UgXCJGaWxlU291cmNlXCIgOlxuICAgICAgICAgICAgZXhpZkRhdGFbdGFnXSA9IHRoaXMuU3RyaW5nVmFsdWVzW3RhZ11bZXhpZkRhdGFbdGFnXV07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgXCJFeGlmVmVyc2lvblwiIDpcbiAgICAgICAgICBjYXNlIFwiRmxhc2hwaXhWZXJzaW9uXCIgOlxuICAgICAgICAgICAgZXhpZkRhdGFbdGFnXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoZXhpZkRhdGFbdGFnXVswXSwgZXhpZkRhdGFbdGFnXVsxXSwgZXhpZkRhdGFbdGFnXVsyXSwgZXhpZkRhdGFbdGFnXVszXSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgXCJDb21wb25lbnRzQ29uZmlndXJhdGlvblwiIDpcbiAgICAgICAgICAgIGV4aWZEYXRhW3RhZ10gPVxuICAgICAgICAgICAgICB0aGlzLlN0cmluZ1ZhbHVlcy5Db21wb25lbnRzW2V4aWZEYXRhW3RhZ11bMF1dICtcbiAgICAgICAgICAgICAgdGhpcy5TdHJpbmdWYWx1ZXMuQ29tcG9uZW50c1tleGlmRGF0YVt0YWddWzFdXSArXG4gICAgICAgICAgICAgIHRoaXMuU3RyaW5nVmFsdWVzLkNvbXBvbmVudHNbZXhpZkRhdGFbdGFnXVsyXV0gK1xuICAgICAgICAgICAgICB0aGlzLlN0cmluZ1ZhbHVlcy5Db21wb25lbnRzW2V4aWZEYXRhW3RhZ11bM11dO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdGFnc1t0YWddID0gZXhpZkRhdGFbdGFnXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGFncy5HUFNJbmZvSUZEUG9pbnRlcikge1xuICAgICAgZ3BzRGF0YSA9IHRoaXMucmVhZFRhZ3MoZmlsZSwgdGlmZk9mZnNldCwgdGlmZk9mZnNldCArIHRhZ3MuR1BTSW5mb0lGRFBvaW50ZXIsIHRoaXMuR1BTVGFncywgYmlnRW5kKTtcbiAgICAgIGZvciAodGFnIGluIGdwc0RhdGEpIHtcbiAgICAgICAgc3dpdGNoICh0YWcpIHtcbiAgICAgICAgICBjYXNlIFwiR1BTVmVyc2lvbklEXCIgOlxuICAgICAgICAgICAgZ3BzRGF0YVt0YWddID0gZ3BzRGF0YVt0YWddWzBdICtcbiAgICAgICAgICAgICAgXCIuXCIgKyBncHNEYXRhW3RhZ11bMV0gK1xuICAgICAgICAgICAgICBcIi5cIiArIGdwc0RhdGFbdGFnXVsyXSArXG4gICAgICAgICAgICAgIFwiLlwiICsgZ3BzRGF0YVt0YWddWzNdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdGFnc1t0YWddID0gZ3BzRGF0YVt0YWddO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YWdzO1xuICB9XG5cbiAgc3RhdGljIGdldERhdGEoaW1nLCBjYWxsYmFjaykge1xuICAgIGlmICgoaW1nIGluc3RhbmNlb2YgSW1hZ2UgfHwgaW1nIGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudCkgJiYgIWltZy5jb21wbGV0ZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgaWYgKCF0aGlzLmltYWdlSGFzRGF0YShpbWcpKSB7XG4gICAgICBDcm9wRVhJRi5nZXRJbWFnZURhdGEoaW1nLCBjYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjay5jYWxsKGltZyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIHN0YXRpYyBnZXRUYWcoaW1nLCB0YWcpIHtcbiAgICBpZiAoIXRoaXMuaW1hZ2VIYXNEYXRhKGltZykpIHJldHVybjtcbiAgICByZXR1cm4gaW1nLmV4aWZkYXRhW3RhZ107XG4gIH07XG5cbiAgc3RhdGljIGdldEFsbFRhZ3MoaW1nKSB7XG4gICAgaWYgKCF0aGlzLmltYWdlSGFzRGF0YShpbWcpKSByZXR1cm4ge307XG4gICAgdmFyIGEsXG4gICAgICBkYXRhID0gaW1nLmV4aWZkYXRhLFxuICAgICAgdGFncyA9IHt9O1xuICAgIGZvciAoYSBpbiBkYXRhKSB7XG4gICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShhKSkge1xuICAgICAgICB0YWdzW2FdID0gZGF0YVthXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhZ3M7XG4gIH07XG5cbiAgc3RhdGljIHByZXR0eShpbWcpIHtcbiAgICBpZiAoIXRoaXMuaW1hZ2VIYXNEYXRhKGltZykpIHJldHVybiBcIlwiO1xuICAgIHZhciBhLFxuICAgICAgZGF0YSA9IGltZy5leGlmZGF0YSxcbiAgICAgIHN0clByZXR0eSA9IFwiXCI7XG4gICAgZm9yIChhIGluIGRhdGEpIHtcbiAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KGEpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YVthXSA9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgaWYgKGRhdGFbYV0gaW5zdGFuY2VvZiBOdW1iZXIpIHtcbiAgICAgICAgICAgIHN0clByZXR0eSArPSBhICsgXCIgOiBcIiArIGRhdGFbYV0gKyBcIiBbXCIgKyBkYXRhW2FdLm51bWVyYXRvciArIFwiL1wiICsgZGF0YVthXS5kZW5vbWluYXRvciArIFwiXVxcclxcblwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHJQcmV0dHkgKz0gYSArIFwiIDogW1wiICsgZGF0YVthXS5sZW5ndGggKyBcIiB2YWx1ZXNdXFxyXFxuXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0clByZXR0eSArPSBhICsgXCIgOiBcIiArIGRhdGFbYV0gKyBcIlxcclxcblwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdHJQcmV0dHk7XG4gIH1cblxuXG4gIHN0YXRpYyBmaW5kRVhJRmluSlBFRyhmaWxlKSB7XG4gICAgdmFyIGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGZpbGUpO1xuICAgIHZhciBtYXhPZmZzZXQgPSBkYXRhVmlldy5ieXRlTGVuZ3RoIC0gNDtcblxuICAgIGNvbnNvbGUuZGVidWcoJ2ZpbmRFWElGaW5KUEVHOiBHb3QgZmlsZSBvZiBsZW5ndGggJW8nLCBmaWxlLmJ5dGVMZW5ndGgpO1xuICAgIGlmIChkYXRhVmlldy5nZXRVaW50MTYoMCkgIT09IDB4ZmZkOCkge1xuICAgICAgY29uc29sZS53YXJuKCdOb3QgYSB2YWxpZCBKUEVHJyk7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIG5vdCBhIHZhbGlkIGpwZWdcbiAgICB9XG5cbiAgICB2YXIgb2Zmc2V0ID0gMjtcbiAgICB2YXIgbWFya2VyO1xuXG4gICAgZnVuY3Rpb24gcmVhZEJ5dGUoKSB7XG4gICAgICB2YXIgc29tZUJ5dGUgPSBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQpO1xuICAgICAgb2Zmc2V0Kys7XG4gICAgICByZXR1cm4gc29tZUJ5dGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZFdvcmQoKSB7XG4gICAgICB2YXIgc29tZVdvcmQgPSBkYXRhVmlldy5nZXRVaW50MTYob2Zmc2V0KTtcbiAgICAgIG9mZnNldCA9IG9mZnNldCArIDI7XG4gICAgICByZXR1cm4gc29tZVdvcmQ7XG4gICAgfVxuXG4gICAgd2hpbGUgKG9mZnNldCA8IG1heE9mZnNldCkge1xuICAgICAgdmFyIHNvbWVCeXRlID0gcmVhZEJ5dGUoKTtcbiAgICAgIGlmIChzb21lQnl0ZSAhPSAweEZGKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vdCBhIHZhbGlkIG1hcmtlciBhdCBvZmZzZXQgJyArIG9mZnNldCArIFwiLCBmb3VuZDogXCIgKyBzb21lQnl0ZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gbm90IGEgdmFsaWQgbWFya2VyLCBzb21ldGhpbmcgaXMgd3JvbmdcbiAgICAgIH1cbiAgICAgIG1hcmtlciA9IHJlYWRCeXRlKCk7XG4gICAgICBjb25zb2xlLmRlYnVnKCdNYXJrZXI9JW8nLCBtYXJrZXIpO1xuXG4gICAgICAvLyB3ZSBjb3VsZCBpbXBsZW1lbnQgaGFuZGxpbmcgZm9yIG90aGVyIG1hcmtlcnMgaGVyZSxcbiAgICAgIC8vIGJ1dCB3ZSdyZSBvbmx5IGxvb2tpbmcgZm9yIDB4RkZFMSBmb3IgRVhJRiBkYXRhXG5cbiAgICAgIHZhciBzZWdtZW50TGVuZ3RoID0gcmVhZFdvcmQoKSAtIDI7XG4gICAgICBzd2l0Y2ggKG1hcmtlcikge1xuICAgICAgICBjYXNlICcweEUxJzpcbiAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkRVhJRkRhdGEoZGF0YVZpZXcsIG9mZnNldC8qLCBzZWdtZW50TGVuZ3RoKi8pO1xuICAgICAgICBjYXNlICcweEUwJzogLy8gSkZJRlxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIG9mZnNldCArPSBzZWdtZW50TGVuZ3RoO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBmaW5kSVBUQ2luSlBFRyhmaWxlKSB7XG4gICAgdmFyIGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGZpbGUpO1xuXG4gICAgY29uc29sZS5kZWJ1ZygnR290IGZpbGUgb2YgbGVuZ3RoICcgKyBmaWxlLmJ5dGVMZW5ndGgpO1xuICAgIGlmICgoZGF0YVZpZXcuZ2V0VWludDgoMCkgIT0gMHhGRikgfHwgKGRhdGFWaWV3LmdldFVpbnQ4KDEpICE9IDB4RDgpKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ05vdCBhIHZhbGlkIEpQRUcnKTtcbiAgICAgIHJldHVybiBmYWxzZTsgLy8gbm90IGEgdmFsaWQganBlZ1xuICAgIH1cblxuICAgIHZhciBvZmZzZXQgPSAyLFxuICAgICAgbGVuZ3RoID0gZmlsZS5ieXRlTGVuZ3RoO1xuXG5cbiAgICB2YXIgaXNGaWVsZFNlZ21lbnRTdGFydCA9IGZ1bmN0aW9uIChkYXRhVmlldywgb2Zmc2V0KSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQpID09PSAweDM4ICYmXG4gICAgICAgIGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCArIDEpID09PSAweDQyICYmXG4gICAgICAgIGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCArIDIpID09PSAweDQ5ICYmXG4gICAgICAgIGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCArIDMpID09PSAweDREICYmXG4gICAgICAgIGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCArIDQpID09PSAweDA0ICYmXG4gICAgICAgIGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCArIDUpID09PSAweDA0XG4gICAgICApO1xuICAgIH07XG5cbiAgICB3aGlsZSAob2Zmc2V0IDwgbGVuZ3RoKSB7XG4gICAgICBpZiAoaXNGaWVsZFNlZ21lbnRTdGFydChkYXRhVmlldywgb2Zmc2V0KSkge1xuICAgICAgICAvLyBHZXQgdGhlIGxlbmd0aCBvZiB0aGUgbmFtZSBoZWFkZXIgKHdoaWNoIGlzIHBhZGRlZCB0byBhbiBldmVuIG51bWJlciBvZiBieXRlcylcbiAgICAgICAgdmFyIG5hbWVIZWFkZXJMZW5ndGggPSBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQgKyA3KTtcbiAgICAgICAgaWYgKG5hbWVIZWFkZXJMZW5ndGggJSAyICE9PSAwKSBuYW1lSGVhZGVyTGVuZ3RoICs9IDE7XG4gICAgICAgIC8vIENoZWNrIGZvciBwcmUgcGhvdG9zaG9wIDYgZm9ybWF0XG4gICAgICAgIGlmIChuYW1lSGVhZGVyTGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgLy8gQWx3YXlzIDRcbiAgICAgICAgICBuYW1lSGVhZGVyTGVuZ3RoID0gNDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdGFydE9mZnNldCA9IG9mZnNldCArIDggKyBuYW1lSGVhZGVyTGVuZ3RoO1xuICAgICAgICB2YXIgc2VjdGlvbkxlbmd0aCA9IGRhdGFWaWV3LmdldFVpbnQxNihvZmZzZXQgKyA2ICsgbmFtZUhlYWRlckxlbmd0aCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZElQVENEYXRhKGZpbGUsIHN0YXJ0T2Zmc2V0LCBzZWN0aW9uTGVuZ3RoKTtcbiAgICAgIH1cblxuICAgICAgLy8gTm90IHRoZSBtYXJrZXIsIGNvbnRpbnVlIHNlYXJjaGluZ1xuICAgICAgb2Zmc2V0Kys7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIHJlYWRGcm9tQmluYXJ5RmlsZShmaWxlKSB7XG4gICAgcmV0dXJuIENyb3BFWElGLmZpbmRFWElGaW5KUEVHKGZpbGUpO1xuICB9XG5cbiAgc3RhdGljIGltYWdlSGFzRGF0YShpbWcpIHtcbiAgICByZXR1cm4gISEoaW1nLmV4aWZkYXRhKTtcbiAgfVxuXG4gIHN0YXRpYyBiYXNlNjRUb0FycmF5QnVmZmVyKGJhc2U2NCwgY29udGVudFR5cGU/KSB7XG4gICAgY29udGVudFR5cGUgPSBjb250ZW50VHlwZSB8fCBiYXNlNjQubWF0Y2goL15kYXRhXFw6KFteXFw7XSspXFw7YmFzZTY0LC9taSlbMV0gfHwgJyc7IC8vIGUuZy4gJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsLi4uJyA9PiAnaW1hZ2UvanBlZydcbiAgICBiYXNlNjQgPSBiYXNlNjQucmVwbGFjZSgvXmRhdGFcXDooW15cXDtdKylcXDtiYXNlNjQsL2dtaSwgJycpO1xuICAgIHZhciBiaW5hcnkgPSBhdG9iKGJhc2U2NCk7XG4gICAgdmFyIGxlbiA9IGJpbmFyeS5sZW5ndGg7XG4gICAgdmFyIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihsZW4pO1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2aWV3W2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gICAgfVxuICAgIHJldHVybiBidWZmZXI7XG4gIH1cbn0iLCJleHBvcnQgY2xhc3MgQ3JvcENhbnZhcyB7XG4gICAgLy8gU2hhcGUgPSBBcnJheSBvZiBbeCx5XTsgWzAsIDBdIC0gY2VudGVyXG4gICAgc2hhcGVBcnJvd05XID0gW1stMC41LCAtMl0sIFstMywgLTQuNV0sIFstMC41LCAtN10sIFstNywgLTddLCBbLTcsIC0wLjVdLCBbLTQuNSwgLTNdLCBbLTIsIC0wLjVdXTtcbiAgICBzaGFwZUFycm93TkUgPSBbWzAuNSwgLTJdLCBbMywgLTQuNV0sIFswLjUsIC03XSwgWzcsIC03XSwgWzcsIC0wLjVdLCBbNC41LCAtM10sIFsyLCAtMC41XV07XG4gICAgc2hhcGVBcnJvd1NXID0gW1stMC41LCAyXSwgWy0zLCA0LjVdLCBbLTAuNSwgN10sIFstNywgN10sIFstNywgMC41XSwgWy00LjUsIDNdLCBbLTIsIDAuNV1dO1xuICAgIHNoYXBlQXJyb3dTRSA9IFtbMC41LCAyXSwgWzMsIDQuNV0sIFswLjUsIDddLCBbNywgN10sIFs3LCAwLjVdLCBbNC41LCAzXSwgWzIsIDAuNV1dO1xuICAgIHNoYXBlQXJyb3dOID0gW1stMS41LCAtMi41XSwgWy0xLjUsIC02XSwgWy01LCAtNl0sIFswLCAtMTFdLCBbNSwgLTZdLCBbMS41LCAtNl0sIFsxLjUsIC0yLjVdXTtcbiAgICBzaGFwZUFycm93VyA9IFtbLTIuNSwgLTEuNV0sIFstNiwgLTEuNV0sIFstNiwgLTVdLCBbLTExLCAwXSwgWy02LCA1XSwgWy02LCAxLjVdLCBbLTIuNSwgMS41XV07XG4gICAgc2hhcGVBcnJvd1MgPSBbWy0xLjUsIDIuNV0sIFstMS41LCA2XSwgWy01LCA2XSwgWzAsIDExXSwgWzUsIDZdLCBbMS41LCA2XSwgWzEuNSwgMi41XV07XG4gICAgc2hhcGVBcnJvd0UgPSBbWzIuNSwgLTEuNV0sIFs2LCAtMS41XSwgWzYsIC01XSwgWzExLCAwXSwgWzYsIDVdLCBbNiwgMS41XSwgWzIuNSwgMS41XV07XG5cbiAgICAvLyBDb2xvcnNcbiAgICBjb2xvcnMgPSB7XG4gICAgICAgIGFyZWFPdXRsaW5lOiAnI2ZmZicsXG4gICAgICAgIHJlc2l6ZUJveFN0cm9rZTogJyNmZmYnLFxuICAgICAgICByZXNpemVCb3hGaWxsOiAnIzQ0NCcsXG4gICAgICAgIHJlc2l6ZUJveEFycm93RmlsbDogJyNmZmYnLFxuICAgICAgICByZXNpemVDaXJjbGVTdHJva2U6ICcjZmZmJyxcbiAgICAgICAgcmVzaXplQ2lyY2xlRmlsbDogJyM0NDQnLFxuICAgICAgICBtb3ZlSWNvbkZpbGw6ICcjZmZmJ1xuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGN0eCkge31cblxuICAgIC8vIENhbGN1bGF0ZSBQb2ludFxuICAgIGNhbGNQb2ludChwb2ludCwgb2Zmc2V0LCBzY2FsZSkge1xuICAgICAgICByZXR1cm4gW3NjYWxlICogcG9pbnRbMF0gKyBvZmZzZXRbMF0sIHNjYWxlICogcG9pbnRbMV0gKyBvZmZzZXRbMV1dO1xuICAgIH07XG5cbiAgICAvLyBEcmF3IEZpbGxlZCBQb2x5Z29uXG4gICAgcHJpdmF0ZSBkcmF3RmlsbGVkUG9seWdvbihzaGFwZSwgZmlsbFN0eWxlLCBjZW50ZXJDb29yZHMsIHNjYWxlKSB7XG4gICAgICAgIHRoaXMuY3R4LnNhdmUoKTtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gZmlsbFN0eWxlO1xuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgdmFyIHBjLCBwYzAgPSB0aGlzLmNhbGNQb2ludChzaGFwZVswXSwgY2VudGVyQ29vcmRzLCBzY2FsZSk7XG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhwYzBbMF0sIHBjMFsxXSk7XG5cbiAgICAgICAgZm9yICh2YXIgcCBpbiBzaGFwZSkge1xuICAgICAgICAgICAgbGV0IHBOdW0gPSBwYXJzZUludChwLCAxMCk7XG4gICAgICAgICAgICBpZiAocE51bSA+IDApIHtcbiAgICAgICAgICAgICAgICBwYyA9IHRoaXMuY2FsY1BvaW50KHNoYXBlW3BOdW1dLCBjZW50ZXJDb29yZHMsIHNjYWxlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5saW5lVG8ocGNbMF0sIHBjWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyhwYzBbMF0sIHBjMFsxXSk7XG4gICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcbiAgICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcbiAgICB9O1xuXG4gICAgLyogSWNvbnMgKi9cblxuICAgIGRyYXdJY29uTW92ZShjZW50ZXJDb29yZHMsIHNjYWxlKSB7XG4gICAgICAgIHRoaXMuZHJhd0ZpbGxlZFBvbHlnb24odGhpcy5zaGFwZUFycm93TiwgdGhpcy5jb2xvcnMubW92ZUljb25GaWxsLCBjZW50ZXJDb29yZHMsIHNjYWxlKTtcbiAgICAgICAgdGhpcy5kcmF3RmlsbGVkUG9seWdvbih0aGlzLnNoYXBlQXJyb3dXLCB0aGlzLmNvbG9ycy5tb3ZlSWNvbkZpbGwsIGNlbnRlckNvb3Jkcywgc2NhbGUpO1xuICAgICAgICB0aGlzLmRyYXdGaWxsZWRQb2x5Z29uKHRoaXMuc2hhcGVBcnJvd1MsIHRoaXMuY29sb3JzLm1vdmVJY29uRmlsbCwgY2VudGVyQ29vcmRzLCBzY2FsZSk7XG4gICAgICAgIHRoaXMuZHJhd0ZpbGxlZFBvbHlnb24odGhpcy5zaGFwZUFycm93RSwgdGhpcy5jb2xvcnMubW92ZUljb25GaWxsLCBjZW50ZXJDb29yZHMsIHNjYWxlKTtcbiAgICB9XG5cbiAgICBkcmF3SWNvblJlc2l6ZUNpcmNsZShjZW50ZXJDb29yZHMsIGNpcmNsZVJhZGl1cywgc2NhbGUpIHtcbiAgICAgICAgdmFyIHNjYWxlZENpcmNsZVJhZGl1cyA9IGNpcmNsZVJhZGl1cyAqIHNjYWxlO1xuICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5jb2xvcnMucmVzaXplQ2lyY2xlU3Ryb2tlO1xuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSAyO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9ycy5yZXNpemVDaXJjbGVGaWxsO1xuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5jdHguYXJjKGNlbnRlckNvb3Jkc1swXSwgY2VudGVyQ29vcmRzWzFdLCBzY2FsZWRDaXJjbGVSYWRpdXMsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgdGhpcy5jdHguZmlsbCgpO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgdGhpcy5jdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcbiAgICB9XG5cbiAgICBkcmF3SWNvblJlc2l6ZUJveEJhc2UgKGNlbnRlckNvb3JkcywgYm94U2l6ZSwgc2NhbGUpIHtcbiAgICAgICAgdmFyIHNjYWxlZEJveFNpemUgPSBib3hTaXplICogc2NhbGU7XG4gICAgICAgIHRoaXMuY3R4LnNhdmUoKTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLmNvbG9ycy5yZXNpemVCb3hTdHJva2U7XG4gICAgICAgIHRoaXMuY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3JzLnJlc2l6ZUJveEZpbGw7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KGNlbnRlckNvb3Jkc1swXSAtIHNjYWxlZEJveFNpemUgLyAyLCBjZW50ZXJDb29yZHNbMV0gLSBzY2FsZWRCb3hTaXplIC8gMiwgc2NhbGVkQm94U2l6ZSwgc2NhbGVkQm94U2l6ZSk7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVJlY3QoY2VudGVyQ29vcmRzWzBdIC0gc2NhbGVkQm94U2l6ZSAvIDIsIGNlbnRlckNvb3Jkc1sxXSAtIHNjYWxlZEJveFNpemUgLyAyLCBzY2FsZWRCb3hTaXplLCBzY2FsZWRCb3hTaXplKTtcbiAgICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xuICAgIH1cbiAgICBkcmF3SWNvblJlc2l6ZUJveE5FU1coY2VudGVyQ29vcmRzLCBib3hTaXplLCBzY2FsZSkge1xuICAgICAgICB0aGlzLmRyYXdJY29uUmVzaXplQm94QmFzZShjZW50ZXJDb29yZHMsIGJveFNpemUsIHNjYWxlKTtcbiAgICAgICAgdGhpcy5kcmF3RmlsbGVkUG9seWdvbih0aGlzLnNoYXBlQXJyb3dORSwgdGhpcy5jb2xvcnMucmVzaXplQm94QXJyb3dGaWxsLCBjZW50ZXJDb29yZHMsIHNjYWxlKTtcbiAgICAgICAgdGhpcy5kcmF3RmlsbGVkUG9seWdvbih0aGlzLnNoYXBlQXJyb3dTVywgdGhpcy5jb2xvcnMucmVzaXplQm94QXJyb3dGaWxsLCBjZW50ZXJDb29yZHMsIHNjYWxlKTtcbiAgICB9XG4gICAgZHJhd0ljb25SZXNpemVCb3hOV1NFKGNlbnRlckNvb3JkcywgYm94U2l6ZSwgc2NhbGUpIHtcbiAgICAgICAgdGhpcy5kcmF3SWNvblJlc2l6ZUJveEJhc2UoY2VudGVyQ29vcmRzLCBib3hTaXplLCBzY2FsZSk7XG4gICAgICAgIHRoaXMuZHJhd0ZpbGxlZFBvbHlnb24odGhpcy5zaGFwZUFycm93TlcsIHRoaXMuY29sb3JzLnJlc2l6ZUJveEFycm93RmlsbCwgY2VudGVyQ29vcmRzLCBzY2FsZSk7XG4gICAgICAgIHRoaXMuZHJhd0ZpbGxlZFBvbHlnb24odGhpcy5zaGFwZUFycm93U0UsIHRoaXMuY29sb3JzLnJlc2l6ZUJveEFycm93RmlsbCwgY2VudGVyQ29vcmRzLCBzY2FsZSk7XG4gICAgfVxuXG4gICAgLyogQ3JvcCBBcmVhICovXG5cbiAgICBkcmF3Q3JvcEFyZWEoaW1hZ2UsIGNlbnRlckNvb3Jkcywgc2l6ZSwgZm5EcmF3Q2xpcFBhdGgpIHtcbiAgICAgICAgdmFyIHhSYXRpbyA9IGltYWdlLndpZHRoIC8gdGhpcy5jdHguY2FudmFzLndpZHRoLFxuICAgICAgICAgICAgeVJhdGlvID0gaW1hZ2UuaGVpZ2h0IC8gdGhpcy5jdHguY2FudmFzLmhlaWdodCxcbiAgICAgICAgICAgIHhMZWZ0ID0gY2VudGVyQ29vcmRzWzBdIC0gc2l6ZSAvIDIsXG4gICAgICAgICAgICB5VG9wID0gY2VudGVyQ29vcmRzWzFdIC0gc2l6ZSAvIDI7XG5cbiAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuY29sb3JzLmFyZWFPdXRsaW5lO1xuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSAyO1xuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgZm5EcmF3Q2xpcFBhdGgodGhpcy5jdHgsIGNlbnRlckNvb3Jkcywgc2l6ZSk7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgICAgICB0aGlzLmN0eC5jbGlwKCk7XG5cbiAgICAgICAgLy8gZHJhdyBwYXJ0IG9mIG9yaWdpbmFsIGltYWdlXG4gICAgICAgIGlmIChzaXplID4gMCkge1xuICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKGltYWdlLCB4TGVmdCAqIHhSYXRpbywgeVRvcCAqIHlSYXRpbywgc2l6ZSAqIHhSYXRpbywgc2l6ZSAqIHlSYXRpbywgeExlZnQsIHlUb3AsIHNpemUsIHNpemUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGZuRHJhd0NsaXBQYXRoKHRoaXMuY3R4LCBjZW50ZXJDb29yZHMsIHNpemUpO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgdGhpcy5jdHguY2xpcCgpO1xuXG4gICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcbiAgICB9O1xufSIsImltcG9ydCB7Q3JvcENhbnZhc30gZnJvbSBcIi4vY3JvcC1jYW52YXNcIjtcblxuZXhwb3J0IGVudW0gQ3JvcEFyZWFUeXBlIHtcbiAgU3F1YXJlID0gJ3NxdWFyZScsXG4gIENpcmNsZSA9ICdjaXJjbGUnXG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDcm9wQXJlYSB7XG4gIHByb3RlY3RlZCBfbWluU2l6ZSA9IDgwO1xuICBwcm90ZWN0ZWQgX2Nyb3BDYW52YXM6IENyb3BDYW52YXM7XG4gIHByb3RlY3RlZCBfaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgcHJvdGVjdGVkIF94ID0gMDtcbiAgcHJvdGVjdGVkIF95ID0gMDtcbiAgcHJvdGVjdGVkIF9zaXplID0gMjAwO1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfY3R4LCBwcm90ZWN0ZWQgX2V2ZW50cykge1xuICAgIHRoaXMuX2Nyb3BDYW52YXMgPSBuZXcgQ3JvcENhbnZhcyhfY3R4KTtcbiAgfVxuXG4gIGdldEltYWdlKCkge1xuICAgIHJldHVybiB0aGlzLl9pbWFnZTtcbiAgfVxuXG4gIHNldEltYWdlKGltYWdlKSB7XG4gICAgdGhpcy5faW1hZ2UgPSBpbWFnZTtcbiAgfTtcblxuICBnZXRYKCkge1xuICAgIHJldHVybiB0aGlzLl94O1xuICB9O1xuXG4gIHNldFgoeCkge1xuICAgIHRoaXMuX3ggPSB4O1xuICAgIHRoaXMuX2RvbnREcmFnT3V0c2lkZSgpO1xuICB9O1xuXG4gIGdldFkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3k7XG4gIH07XG5cbiAgc2V0WSh5KSB7XG4gICAgdGhpcy5feSA9IHk7XG4gICAgdGhpcy5fZG9udERyYWdPdXRzaWRlKCk7XG4gIH07XG5cbiAgZ2V0U2l6ZSgpIDogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fc2l6ZTtcbiAgfTtcblxuICBzZXRTaXplKHNpemUpIHtcbiAgICB0aGlzLl9zaXplID0gTWF0aC5tYXgodGhpcy5fbWluU2l6ZSwgc2l6ZSk7XG4gICAgdGhpcy5fZG9udERyYWdPdXRzaWRlKCk7XG4gIH07XG5cbiAgZ2V0TWluU2l6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWluU2l6ZTtcbiAgfTtcblxuICBzZXRNaW5TaXplKHNpemUpIHtcbiAgICB0aGlzLl9taW5TaXplID0gc2l6ZTtcbiAgICB0aGlzLl9zaXplID0gTWF0aC5tYXgodGhpcy5fbWluU2l6ZSwgdGhpcy5fc2l6ZSk7XG4gICAgdGhpcy5fZG9udERyYWdPdXRzaWRlKCk7XG4gIH07XG5cbiAgX2RvbnREcmFnT3V0c2lkZSgpIHtcbiAgICB2YXIgaCA9IHRoaXMuX2N0eC5jYW52YXMuaGVpZ2h0LFxuICAgICAgdyA9IHRoaXMuX2N0eC5jYW52YXMud2lkdGg7XG4gICAgaWYgKHRoaXMuX3NpemUgPiB3KSB7XG4gICAgICB0aGlzLl9zaXplID0gdztcbiAgICB9XG4gICAgaWYgKHRoaXMuX3NpemUgPiBoKSB7XG4gICAgICB0aGlzLl9zaXplID0gaDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3ggPCB0aGlzLl9zaXplIC8gMikge1xuICAgICAgdGhpcy5feCA9IHRoaXMuX3NpemUgLyAyO1xuICAgIH1cbiAgICBpZiAodGhpcy5feCA+IHcgLSB0aGlzLl9zaXplIC8gMikge1xuICAgICAgdGhpcy5feCA9IHcgLSB0aGlzLl9zaXplIC8gMjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3kgPCB0aGlzLl9zaXplIC8gMikge1xuICAgICAgdGhpcy5feSA9IHRoaXMuX3NpemUgLyAyO1xuICAgIH1cbiAgICBpZiAodGhpcy5feSA+IGggLSB0aGlzLl9zaXplIC8gMikge1xuICAgICAgdGhpcy5feSA9IGggLSB0aGlzLl9zaXplIC8gMjtcbiAgICB9XG4gIH07XG5cbiAgYWJzdHJhY3QgX2RyYXdBcmVhKGN0eCwgY2VudGVyQ29vcmRzLCBzaXplKTtcblxuICBkcmF3KCkge1xuICAgIHRoaXMuX2Nyb3BDYW52YXMuZHJhd0Nyb3BBcmVhKHRoaXMuX2ltYWdlLCBbdGhpcy5feCwgdGhpcy5feV0sIHRoaXMuX3NpemUsIHRoaXMuX2RyYXdBcmVhKTtcbiAgfTtcblxuICBhYnN0cmFjdCBwcm9jZXNzTW91c2VNb3ZlKG1vdXNlQ3VyWDogbnVtYmVyLCBtb3VzZUN1clk6IG51bWJlcik7XG5cbiAgYWJzdHJhY3QgcHJvY2Vzc01vdXNlRG93bihtb3VzZURvd25YOiBudW1iZXIsIG1vdXNlRG93blk6IG51bWJlcik7XG5cbiAgYWJzdHJhY3QgcHJvY2Vzc01vdXNlVXAobW91c2VEb3duWDogbnVtYmVyLCBtb3VzZURvd25ZOiBudW1iZXIpO1xufSIsImltcG9ydCB7Q3JvcEFyZWF9IGZyb20gXCIuL2Nyb3AtYXJlYVwiO1xuXG5leHBvcnQgY2xhc3MgQ3JvcEFyZWFDaXJjbGUgZXh0ZW5kcyBDcm9wQXJlYSB7XG4gIF9ib3hSZXNpemVCYXNlU2l6ZSA9IDIwO1xuICBfYm94UmVzaXplTm9ybWFsUmF0aW8gPSAwLjk7XG4gIF9ib3hSZXNpemVIb3ZlclJhdGlvID0gMS4yO1xuICBfaWNvbk1vdmVOb3JtYWxSYXRpbyA9IDAuOTtcbiAgX2ljb25Nb3ZlSG92ZXJSYXRpbyA9IDEuMjtcblxuICBfcG9zRHJhZ1N0YXJ0WCA9IDA7XG4gIF9wb3NEcmFnU3RhcnRZID0gMDtcbiAgX3Bvc1Jlc2l6ZVN0YXJ0WCA9IDA7XG4gIF9wb3NSZXNpemVTdGFydFkgPSAwO1xuICBfcG9zUmVzaXplU3RhcnRTaXplID0gMDtcblxuICBfYm94UmVzaXplSXNIb3ZlciA9IGZhbHNlO1xuICBfYXJlYUlzSG92ZXIgPSBmYWxzZTtcbiAgX2JveFJlc2l6ZUlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgX2FyZWFJc0RyYWdnaW5nID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSBfYm94UmVzaXplTm9ybWFsU2l6ZTogbnVtYmVyO1xuICBwcml2YXRlIF9ib3hSZXNpemVIb3ZlclNpemU6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihjdHgsIGV2ZW50cykge1xuICAgIHN1cGVyKGN0eCwgZXZlbnRzKTtcblxuICAgIHRoaXMuX2JveFJlc2l6ZU5vcm1hbFNpemUgPSB0aGlzLl9ib3hSZXNpemVCYXNlU2l6ZSAqIHRoaXMuX2JveFJlc2l6ZU5vcm1hbFJhdGlvO1xuICAgIHRoaXMuX2JveFJlc2l6ZUhvdmVyU2l6ZSA9IHRoaXMuX2JveFJlc2l6ZUJhc2VTaXplICogdGhpcy5fYm94UmVzaXplSG92ZXJSYXRpbztcbiAgfVxuXG4gIF9jYWxjQ2lyY2xlUGVyaW1ldGVyQ29vcmRzKGFuZ2xlRGVncmVlcykge1xuICAgIHZhciBoU2l6ZSA9IHRoaXMuX3NpemUgLyAyO1xuICAgIHZhciBhbmdsZVJhZGlhbnMgPSBhbmdsZURlZ3JlZXMgKiAoTWF0aC5QSSAvIDE4MCksXG4gICAgICBjaXJjbGVQZXJpbWV0ZXJYID0gdGhpcy5feCArIGhTaXplICogTWF0aC5jb3MoYW5nbGVSYWRpYW5zKSxcbiAgICAgIGNpcmNsZVBlcmltZXRlclkgPSB0aGlzLl95ICsgaFNpemUgKiBNYXRoLnNpbihhbmdsZVJhZGlhbnMpO1xuICAgIHJldHVybiBbY2lyY2xlUGVyaW1ldGVyWCwgY2lyY2xlUGVyaW1ldGVyWV07XG4gIH1cblxuICBfY2FsY1Jlc2l6ZUljb25DZW50ZXJDb29yZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NhbGNDaXJjbGVQZXJpbWV0ZXJDb29yZHMoLTQ1KTtcbiAgfVxuXG4gIF9pc0Nvb3JkV2l0aGluQXJlYShjb29yZCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoKGNvb3JkWzBdIC0gdGhpcy5feCkgKiAoY29vcmRbMF0gLSB0aGlzLl94KSArIChjb29yZFsxXSAtIHRoaXMuX3kpICogKGNvb3JkWzFdIC0gdGhpcy5feSkpIDwgdGhpcy5fc2l6ZSAvIDI7XG4gIH07XG5cbiAgX2lzQ29vcmRXaXRoaW5Cb3hSZXNpemUoY29vcmQpIHtcbiAgICB2YXIgcmVzaXplSWNvbkNlbnRlckNvb3JkcyA9IHRoaXMuX2NhbGNSZXNpemVJY29uQ2VudGVyQ29vcmRzKCk7XG4gICAgdmFyIGhTaXplID0gdGhpcy5fYm94UmVzaXplSG92ZXJTaXplIC8gMjtcbiAgICByZXR1cm4gKGNvb3JkWzBdID4gcmVzaXplSWNvbkNlbnRlckNvb3Jkc1swXSAtIGhTaXplICYmIGNvb3JkWzBdIDwgcmVzaXplSWNvbkNlbnRlckNvb3Jkc1swXSArIGhTaXplICYmXG4gICAgICBjb29yZFsxXSA+IHJlc2l6ZUljb25DZW50ZXJDb29yZHNbMV0gLSBoU2l6ZSAmJiBjb29yZFsxXSA8IHJlc2l6ZUljb25DZW50ZXJDb29yZHNbMV0gKyBoU2l6ZSk7XG4gIH07XG5cbiAgX2RyYXdBcmVhKGN0eCwgY2VudGVyQ29vcmRzLCBzaXplKSB7XG4gICAgY3R4LmFyYyhjZW50ZXJDb29yZHNbMF0sIGNlbnRlckNvb3Jkc1sxXSwgc2l6ZSAvIDIsIDAsIDIgKiBNYXRoLlBJKTtcbiAgfTtcblxuICBkcmF3KCkge1xuICAgIENyb3BBcmVhLnByb3RvdHlwZS5kcmF3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAvLyBkcmF3IG1vdmUgaWNvblxuICAgIHRoaXMuX2Nyb3BDYW52YXMuZHJhd0ljb25Nb3ZlKFt0aGlzLl94LCB0aGlzLl95XSwgdGhpcy5fYXJlYUlzSG92ZXIgPyB0aGlzLl9pY29uTW92ZUhvdmVyUmF0aW8gOiB0aGlzLl9pY29uTW92ZU5vcm1hbFJhdGlvKTtcblxuICAgIC8vIGRyYXcgcmVzaXplIGN1YmVzXG4gICAgdGhpcy5fY3JvcENhbnZhcy5kcmF3SWNvblJlc2l6ZUJveE5FU1codGhpcy5fY2FsY1Jlc2l6ZUljb25DZW50ZXJDb29yZHMoKSwgdGhpcy5fYm94UmVzaXplQmFzZVNpemUsIHRoaXMuX2JveFJlc2l6ZUlzSG92ZXIgPyB0aGlzLl9ib3hSZXNpemVIb3ZlclJhdGlvIDogdGhpcy5fYm94UmVzaXplTm9ybWFsUmF0aW8pO1xuICB9O1xuXG4gIHByb2Nlc3NNb3VzZU1vdmUobW91c2VDdXJYLCBtb3VzZUN1clkpIHtcbiAgICB2YXIgY3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgIHZhciByZXMgPSBmYWxzZTtcblxuICAgIHRoaXMuX2JveFJlc2l6ZUlzSG92ZXIgPSBmYWxzZTtcbiAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuX2FyZWFJc0RyYWdnaW5nKSB7XG4gICAgICB0aGlzLl94ID0gbW91c2VDdXJYIC0gdGhpcy5fcG9zRHJhZ1N0YXJ0WDtcbiAgICAgIHRoaXMuX3kgPSBtb3VzZUN1clkgLSB0aGlzLl9wb3NEcmFnU3RhcnRZO1xuICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSB0cnVlO1xuICAgICAgY3Vyc29yID0gJ21vdmUnO1xuICAgICAgcmVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2V2ZW50cy50cmlnZ2VyKCdhcmVhLW1vdmUnKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2JveFJlc2l6ZUlzRHJhZ2dpbmcpIHtcbiAgICAgIGN1cnNvciA9ICduZXN3LXJlc2l6ZSc7XG4gICAgICB2YXIgaUZSLCBpRlgsIGlGWTtcbiAgICAgIGlGWCA9IG1vdXNlQ3VyWCAtIHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WDtcbiAgICAgIGlGWSA9IHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WSAtIG1vdXNlQ3VyWTtcbiAgICAgIGlmIChpRlggPiBpRlkpIHtcbiAgICAgICAgaUZSID0gdGhpcy5fcG9zUmVzaXplU3RhcnRTaXplICsgaUZZICogMjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlGUiA9IHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0U2l6ZSArIGlGWCAqIDI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NpemUgPSBNYXRoLm1heCh0aGlzLl9taW5TaXplLCBpRlIpO1xuICAgICAgdGhpcy5fYm94UmVzaXplSXNIb3ZlciA9IHRydWU7XG4gICAgICByZXMgPSB0cnVlO1xuICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtcmVzaXplJyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9pc0Nvb3JkV2l0aGluQm94UmVzaXplKFttb3VzZUN1clgsIG1vdXNlQ3VyWV0pKSB7XG4gICAgICBjdXJzb3IgPSAnbmVzdy1yZXNpemUnO1xuICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2JveFJlc2l6ZUlzSG92ZXIgPSB0cnVlO1xuICAgICAgcmVzID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2lzQ29vcmRXaXRoaW5BcmVhKFttb3VzZUN1clgsIG1vdXNlQ3VyWV0pKSB7XG4gICAgICBjdXJzb3IgPSAnbW92ZSc7XG4gICAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IHRydWU7XG4gICAgICByZXMgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuX2RvbnREcmFnT3V0c2lkZSgpO1xuICAgIHRoaXMuX2N0eC5jYW52YXMuc3R5bGUuY3Vyc29yID0gY3Vyc29yO1xuXG4gICAgcmV0dXJuIHJlcztcbiAgfTtcblxuICBwcm9jZXNzTW91c2VEb3duKG1vdXNlRG93blg6IG51bWJlciwgbW91c2VEb3duWTogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuX2lzQ29vcmRXaXRoaW5Cb3hSZXNpemUoW21vdXNlRG93blgsIG1vdXNlRG93blldKSkge1xuICAgICAgdGhpcy5fYXJlYUlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gZmFsc2U7XG4gICAgICB0aGlzLl9ib3hSZXNpemVJc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2JveFJlc2l6ZUlzSG92ZXIgPSB0cnVlO1xuICAgICAgdGhpcy5fcG9zUmVzaXplU3RhcnRYID0gbW91c2VEb3duWDtcbiAgICAgIHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WSA9IG1vdXNlRG93blk7XG4gICAgICB0aGlzLl9wb3NSZXNpemVTdGFydFNpemUgPSB0aGlzLl9zaXplO1xuICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtcmVzaXplLXN0YXJ0Jyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9pc0Nvb3JkV2l0aGluQXJlYShbbW91c2VEb3duWCwgbW91c2VEb3duWV0pKSB7XG4gICAgICB0aGlzLl9hcmVhSXNEcmFnZ2luZyA9IHRydWU7XG4gICAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IHRydWU7XG4gICAgICB0aGlzLl9ib3hSZXNpemVJc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLl9ib3hSZXNpemVJc0hvdmVyID0gZmFsc2U7XG4gICAgICB0aGlzLl9wb3NEcmFnU3RhcnRYID0gbW91c2VEb3duWCAtIHRoaXMuX3g7XG4gICAgICB0aGlzLl9wb3NEcmFnU3RhcnRZID0gbW91c2VEb3duWSAtIHRoaXMuX3k7XG4gICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1tb3ZlLXN0YXJ0Jyk7XG4gICAgfVxuICB9O1xuXG4gIHByb2Nlc3NNb3VzZVVwKC8qbW91c2VVcFgsIG1vdXNlVXBZKi8pIHtcbiAgICBpZiAodGhpcy5fYXJlYUlzRHJhZ2dpbmcpIHtcbiAgICAgIHRoaXMuX2FyZWFJc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1tb3ZlLWVuZCcpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fYm94UmVzaXplSXNEcmFnZ2luZykge1xuICAgICAgdGhpcy5fYm94UmVzaXplSXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtcmVzaXplLWVuZCcpO1xuICAgIH1cbiAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IGZhbHNlO1xuICAgIHRoaXMuX2JveFJlc2l6ZUlzSG92ZXIgPSBmYWxzZTtcblxuICAgIHRoaXMuX3Bvc0RyYWdTdGFydFggPSAwO1xuICAgIHRoaXMuX3Bvc0RyYWdTdGFydFkgPSAwO1xuICB9O1xuXG59IiwiaW1wb3J0IHtDcm9wQXJlYX0gZnJvbSBcIi4vY3JvcC1hcmVhXCI7XG5cbmV4cG9ydCBjbGFzcyBDcm9wQXJlYVNxdWFyZSBleHRlbmRzIENyb3BBcmVhIHtcbiAgICBfcmVzaXplQ3RybEJhc2VSYWRpdXMgPSAxMDtcbiAgICBfcmVzaXplQ3RybE5vcm1hbFJhdGlvID0gMC43NTtcbiAgICBfcmVzaXplQ3RybEhvdmVyUmF0aW8gPSAxO1xuICAgIF9pY29uTW92ZU5vcm1hbFJhdGlvID0gMC45O1xuICAgIF9pY29uTW92ZUhvdmVyUmF0aW8gPSAxLjI7XG5cbiAgICBfcG9zRHJhZ1N0YXJ0WCA9IDA7XG4gICAgX3Bvc0RyYWdTdGFydFkgPSAwO1xuICAgIF9wb3NSZXNpemVTdGFydFggPSAwO1xuICAgIF9wb3NSZXNpemVTdGFydFkgPSAwO1xuICAgIF9wb3NSZXNpemVTdGFydFNpemUgPSAwO1xuXG4gICAgX3Jlc2l6ZUN0cmxJc0hvdmVyID0gLTE7XG4gICAgX2FyZWFJc0hvdmVyID0gZmFsc2U7XG4gICAgX3Jlc2l6ZUN0cmxJc0RyYWdnaW5nID0gLTE7XG4gICAgX2FyZWFJc0RyYWdnaW5nID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIF9yZXNpemVDdHJsTm9ybWFsUmFkaXVzOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfcmVzaXplQ3RybEhvdmVyUmFkaXVzOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihjdHgsIGV2ZW50cykge1xuICAgICAgICBzdXBlcihjdHgsIGV2ZW50cyk7XG5cbiAgICAgICAgdGhpcy5fcmVzaXplQ3RybE5vcm1hbFJhZGl1cyA9IHRoaXMuX3Jlc2l6ZUN0cmxCYXNlUmFkaXVzICogdGhpcy5fcmVzaXplQ3RybE5vcm1hbFJhdGlvO1xuICAgICAgICB0aGlzLl9yZXNpemVDdHJsSG92ZXJSYWRpdXMgPSB0aGlzLl9yZXNpemVDdHJsQmFzZVJhZGl1cyAqIHRoaXMuX3Jlc2l6ZUN0cmxIb3ZlclJhdGlvO1xuICAgIH07XG5cbiAgICBfY2FsY1NxdWFyZUNvcm5lcnMoKSB7XG4gICAgICAgIHZhciBoU2l6ZSA9IHRoaXMuX3NpemUgLyAyO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgW3RoaXMuX3ggLSBoU2l6ZSwgdGhpcy5feSAtIGhTaXplXSxcbiAgICAgICAgICAgIFt0aGlzLl94ICsgaFNpemUsIHRoaXMuX3kgLSBoU2l6ZV0sXG4gICAgICAgICAgICBbdGhpcy5feCAtIGhTaXplLCB0aGlzLl95ICsgaFNpemVdLFxuICAgICAgICAgICAgW3RoaXMuX3ggKyBoU2l6ZSwgdGhpcy5feSArIGhTaXplXVxuICAgICAgICBdO1xuICAgIH1cblxuICAgIF9jYWxjU3F1YXJlRGltZW5zaW9ucygpIHtcbiAgICAgICAgdmFyIGhTaXplID0gdGhpcy5fc2l6ZSAvIDI7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiB0aGlzLl94IC0gaFNpemUsXG4gICAgICAgICAgICB0b3A6IHRoaXMuX3kgLSBoU2l6ZSxcbiAgICAgICAgICAgIHJpZ2h0OiB0aGlzLl94ICsgaFNpemUsXG4gICAgICAgICAgICBib3R0b206IHRoaXMuX3kgKyBoU2l6ZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9pc0Nvb3JkV2l0aGluQXJlYShjb29yZCkge1xuICAgICAgICB2YXIgc3F1YXJlRGltZW5zaW9ucyA9IHRoaXMuX2NhbGNTcXVhcmVEaW1lbnNpb25zKCk7XG4gICAgICAgIHJldHVybiAoY29vcmRbMF0gPj0gc3F1YXJlRGltZW5zaW9ucy5sZWZ0ICYmIGNvb3JkWzBdIDw9IHNxdWFyZURpbWVuc2lvbnMucmlnaHQgJiYgY29vcmRbMV0gPj0gc3F1YXJlRGltZW5zaW9ucy50b3AgJiYgY29vcmRbMV0gPD0gc3F1YXJlRGltZW5zaW9ucy5ib3R0b20pO1xuICAgIH1cblxuICAgIF9pc0Nvb3JkV2l0aGluUmVzaXplQ3RybChjb29yZCkge1xuICAgICAgICB2YXIgcmVzaXplSWNvbnNDZW50ZXJDb29yZHMgPSB0aGlzLl9jYWxjU3F1YXJlQ29ybmVycygpO1xuICAgICAgICB2YXIgcmVzID0gLTE7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSByZXNpemVJY29uc0NlbnRlckNvb3Jkcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdmFyIHJlc2l6ZUljb25DZW50ZXJDb29yZHMgPSByZXNpemVJY29uc0NlbnRlckNvb3Jkc1tpXTtcbiAgICAgICAgICAgIGlmIChjb29yZFswXSA+IHJlc2l6ZUljb25DZW50ZXJDb29yZHNbMF0gLSB0aGlzLl9yZXNpemVDdHJsSG92ZXJSYWRpdXMgJiYgY29vcmRbMF0gPCByZXNpemVJY29uQ2VudGVyQ29vcmRzWzBdICsgdGhpcy5fcmVzaXplQ3RybEhvdmVyUmFkaXVzICYmXG4gICAgICAgICAgICAgICAgY29vcmRbMV0gPiByZXNpemVJY29uQ2VudGVyQ29vcmRzWzFdIC0gdGhpcy5fcmVzaXplQ3RybEhvdmVyUmFkaXVzICYmIGNvb3JkWzFdIDwgcmVzaXplSWNvbkNlbnRlckNvb3Jkc1sxXSArIHRoaXMuX3Jlc2l6ZUN0cmxIb3ZlclJhZGl1cykge1xuICAgICAgICAgICAgICAgIHJlcyA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBfZHJhd0FyZWEoY3R4LCBjZW50ZXJDb29yZHMsIHNpemUpIHtcbiAgICAgICAgdmFyIGhTaXplID0gc2l6ZSAvIDI7XG4gICAgICAgIGN0eC5yZWN0KGNlbnRlckNvb3Jkc1swXSAtIGhTaXplLCBjZW50ZXJDb29yZHNbMV0gLSBoU2l6ZSwgc2l6ZSwgc2l6ZSk7XG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgQ3JvcEFyZWEucHJvdG90eXBlLmRyYXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgICAgICAvLyBkcmF3IG1vdmUgaWNvblxuICAgICAgICB0aGlzLl9jcm9wQ2FudmFzLmRyYXdJY29uTW92ZShbdGhpcy5feCwgdGhpcy5feV0sIHRoaXMuX2FyZWFJc0hvdmVyID8gdGhpcy5faWNvbk1vdmVIb3ZlclJhdGlvIDogdGhpcy5faWNvbk1vdmVOb3JtYWxSYXRpbyk7XG5cbiAgICAgICAgLy8gZHJhdyByZXNpemUgY3ViZXNcbiAgICAgICAgdmFyIHJlc2l6ZUljb25zQ2VudGVyQ29vcmRzID0gdGhpcy5fY2FsY1NxdWFyZUNvcm5lcnMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHJlc2l6ZUljb25zQ2VudGVyQ29vcmRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcmVzaXplSWNvbkNlbnRlckNvb3JkcyA9IHJlc2l6ZUljb25zQ2VudGVyQ29vcmRzW2ldO1xuICAgICAgICAgICAgdGhpcy5fY3JvcENhbnZhcy5kcmF3SWNvblJlc2l6ZUNpcmNsZShyZXNpemVJY29uQ2VudGVyQ29vcmRzLCB0aGlzLl9yZXNpemVDdHJsQmFzZVJhZGl1cywgdGhpcy5fcmVzaXplQ3RybElzSG92ZXIgPT09IGkgPyB0aGlzLl9yZXNpemVDdHJsSG92ZXJSYXRpbyA6IHRoaXMuX3Jlc2l6ZUN0cmxOb3JtYWxSYXRpbyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm9jZXNzTW91c2VNb3ZlKG1vdXNlQ3VyWCwgbW91c2VDdXJZKSB7XG4gICAgICAgIHZhciBjdXJzb3IgPSAnZGVmYXVsdCc7XG4gICAgICAgIHZhciByZXMgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLl9yZXNpemVDdHJsSXNIb3ZlciA9IC0xO1xuICAgICAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IGZhbHNlO1xuXG4gICAgICAgIGlmICh0aGlzLl9hcmVhSXNEcmFnZ2luZykge1xuICAgICAgICAgICAgdGhpcy5feCA9IG1vdXNlQ3VyWCAtIHRoaXMuX3Bvc0RyYWdTdGFydFg7XG4gICAgICAgICAgICB0aGlzLl95ID0gbW91c2VDdXJZIC0gdGhpcy5fcG9zRHJhZ1N0YXJ0WTtcbiAgICAgICAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gdHJ1ZTtcbiAgICAgICAgICAgIGN1cnNvciA9ICdtb3ZlJztcbiAgICAgICAgICAgIHJlcyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1tb3ZlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcmVzaXplQ3RybElzRHJhZ2dpbmcgPiAtMSkge1xuICAgICAgICAgICAgdmFyIHhNdWx0aSwgeU11bHRpO1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLl9yZXNpemVDdHJsSXNEcmFnZ2luZykge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogLy8gVG9wIExlZnRcbiAgICAgICAgICAgICAgICAgICAgeE11bHRpID0gLTE7XG4gICAgICAgICAgICAgICAgICAgIHlNdWx0aSA9IC0xO1xuICAgICAgICAgICAgICAgICAgICBjdXJzb3IgPSAnbndzZS1yZXNpemUnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE6IC8vIFRvcCBSaWdodFxuICAgICAgICAgICAgICAgICAgICB4TXVsdGkgPSAxO1xuICAgICAgICAgICAgICAgICAgICB5TXVsdGkgPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gJ25lc3ctcmVzaXplJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAyOiAvLyBCb3R0b20gTGVmdFxuICAgICAgICAgICAgICAgICAgICB4TXVsdGkgPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgeU11bHRpID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gJ25lc3ctcmVzaXplJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAzOiAvLyBCb3R0b20gUmlnaHRcbiAgICAgICAgICAgICAgICAgICAgeE11bHRpID0gMTtcbiAgICAgICAgICAgICAgICAgICAgeU11bHRpID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gJ253c2UtcmVzaXplJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaUZYID0gKG1vdXNlQ3VyWCAtIHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WCkgKiB4TXVsdGk7XG4gICAgICAgICAgICB2YXIgaUZZID0gKG1vdXNlQ3VyWSAtIHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WSkgKiB5TXVsdGk7XG4gICAgICAgICAgICB2YXIgaUZSO1xuICAgICAgICAgICAgaWYgKGlGWCA+IGlGWSkge1xuICAgICAgICAgICAgICAgIGlGUiA9IHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0U2l6ZSArIGlGWTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaUZSID0gdGhpcy5fcG9zUmVzaXplU3RhcnRTaXplICsgaUZYO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHdhc1NpemUgPSB0aGlzLl9zaXplO1xuICAgICAgICAgICAgdGhpcy5fc2l6ZSA9IE1hdGgubWF4KHRoaXMuX21pblNpemUsIGlGUik7XG4gICAgICAgICAgICB2YXIgcG9zTW9kaWZpZXIgPSAodGhpcy5fc2l6ZSAtIHdhc1NpemUpIC8gMjtcbiAgICAgICAgICAgIHRoaXMuX3ggKz0gcG9zTW9kaWZpZXIgKiB4TXVsdGk7XG4gICAgICAgICAgICB0aGlzLl95ICs9IHBvc01vZGlmaWVyICogeU11bHRpO1xuICAgICAgICAgICAgdGhpcy5fcmVzaXplQ3RybElzSG92ZXIgPSB0aGlzLl9yZXNpemVDdHJsSXNEcmFnZ2luZztcbiAgICAgICAgICAgIHJlcyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1yZXNpemUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBob3ZlcmVkUmVzaXplQm94ID0gdGhpcy5faXNDb29yZFdpdGhpblJlc2l6ZUN0cmwoW21vdXNlQ3VyWCwgbW91c2VDdXJZXSk7XG4gICAgICAgICAgICBpZiAoaG92ZXJlZFJlc2l6ZUJveCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChob3ZlcmVkUmVzaXplQm94KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvciA9ICdud3NlLXJlc2l6ZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gJ25lc3ctcmVzaXplJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3IgPSAnbmVzdy1yZXNpemUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvciA9ICdud3NlLXJlc2l6ZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNpemVDdHJsSXNIb3ZlciA9IGhvdmVyZWRSZXNpemVCb3g7XG4gICAgICAgICAgICAgICAgcmVzID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNDb29yZFdpdGhpbkFyZWEoW21vdXNlQ3VyWCwgbW91c2VDdXJZXSkpIHtcbiAgICAgICAgICAgICAgICBjdXJzb3IgPSAnbW92ZSc7XG4gICAgICAgICAgICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJlcyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9kb250RHJhZ091dHNpZGUoKTtcbiAgICAgICAgdGhpcy5fY3R4LmNhbnZhcy5zdHlsZS5jdXJzb3IgPSBjdXJzb3I7XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBwcm9jZXNzTW91c2VEb3duKG1vdXNlRG93blgsIG1vdXNlRG93blkpIHtcbiAgICAgICAgdmFyIGlzV2l0aGluUmVzaXplQ3RybCA9IHRoaXMuX2lzQ29vcmRXaXRoaW5SZXNpemVDdHJsKFttb3VzZURvd25YLCBtb3VzZURvd25ZXSk7XG4gICAgICAgIGlmIChpc1dpdGhpblJlc2l6ZUN0cmwgPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5fYXJlYUlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9yZXNpemVDdHJsSXNEcmFnZ2luZyA9IGlzV2l0aGluUmVzaXplQ3RybDtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZUN0cmxJc0hvdmVyID0gaXNXaXRoaW5SZXNpemVDdHJsO1xuICAgICAgICAgICAgdGhpcy5fcG9zUmVzaXplU3RhcnRYID0gbW91c2VEb3duWDtcbiAgICAgICAgICAgIHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WSA9IG1vdXNlRG93blk7XG4gICAgICAgICAgICB0aGlzLl9wb3NSZXNpemVTdGFydFNpemUgPSB0aGlzLl9zaXplO1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtcmVzaXplLXN0YXJ0Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNDb29yZFdpdGhpbkFyZWEoW21vdXNlRG93blgsIG1vdXNlRG93blldKSkge1xuICAgICAgICAgICAgdGhpcy5fYXJlYUlzRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fcmVzaXplQ3RybElzRHJhZ2dpbmcgPSAtMTtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZUN0cmxJc0hvdmVyID0gLTE7XG4gICAgICAgICAgICB0aGlzLl9wb3NEcmFnU3RhcnRYID0gbW91c2VEb3duWCAtIHRoaXMuX3g7XG4gICAgICAgICAgICB0aGlzLl9wb3NEcmFnU3RhcnRZID0gbW91c2VEb3duWSAtIHRoaXMuX3k7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1tb3ZlLXN0YXJ0Jyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm9jZXNzTW91c2VVcCgvKm1vdXNlVXBYLCBtb3VzZVVwWSovKSB7XG4gICAgICAgIGlmICh0aGlzLl9hcmVhSXNEcmFnZ2luZykge1xuICAgICAgICAgICAgdGhpcy5fYXJlYUlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cy50cmlnZ2VyKCdhcmVhLW1vdmUtZW5kJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3Jlc2l6ZUN0cmxJc0RyYWdnaW5nID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZUN0cmxJc0RyYWdnaW5nID0gLTE7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1yZXNpemUtZW5kJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcmVzaXplQ3RybElzSG92ZXIgPSAtMTtcblxuICAgICAgICB0aGlzLl9wb3NEcmFnU3RhcnRYID0gMDtcbiAgICAgICAgdGhpcy5fcG9zRHJhZ1N0YXJ0WSA9IDA7XG4gICAgfVxufSIsImltcG9ydCB7Q3JvcEVYSUZ9IGZyb20gXCIuL2Nyb3AtZXhpZlwiO1xuaW1wb3J0IHtDcm9wQXJlYUNpcmNsZX0gZnJvbSBcIi4vY3JvcC1hcmVhLWNpcmNsZVwiO1xuaW1wb3J0IHtDcm9wQXJlYVNxdWFyZX0gZnJvbSBcIi4vY3JvcC1hcmVhLXNxdWFyZVwiO1xuaW1wb3J0IHtDcm9wQXJlYVR5cGUsIENyb3BBcmVhfSBmcm9tIFwiLi9jcm9wLWFyZWFcIjtcbmltcG9ydCB7Q3JvcEFyZWFEZXRhaWxzfSBmcm9tIFwiLi4vZmMtaW1nLWNyb3AuY29tcG9uZW50XCI7XG5cbmV4cG9ydCBjbGFzcyBDcm9wSG9zdCB7XG5cbiAgY3R4ID0gbnVsbDtcbiAgaW1hZ2UgPSBudWxsO1xuXG4gIGNyb3BBcmVhOiBDcm9wQXJlYTtcblxuICAvLyBEaW1lbnNpb25zXG4gIG1pbkNhbnZhc0RpbXMgPSBbMTAwLCAxMDBdO1xuICBtYXhDYW52YXNEaW1zID0gWzMwMCwgMzAwXTtcblxuICByZXN1bHRJbWFnZVNpemUgPSAyMDA7XG4gIHJlc3VsdEltYWdlRm9ybWF0ID0gJ2ltYWdlL3BuZyc7XG5cbiAgcmVzdWx0SW1hZ2VRdWFsaXR5O1xuXG4gIHByaXZhdGUgZWxlbWVudDogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxDYW52YXMsIHByaXZhdGUgb3B0cywgcHJpdmF0ZSBldmVudHMpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbENhbnZhcy5wYXJlbnRFbGVtZW50O1xuXG4gICAgdGhpcy5jdHggPSBlbENhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgdGhpcy5jcm9wQXJlYSA9IG5ldyBDcm9wQXJlYUNpcmNsZSh0aGlzLmN0eCwgZXZlbnRzKTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgZWxDYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlVXAuYmluZCh0aGlzKSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICAgIGVsQ2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLm9uTW91c2VEb3duLmJpbmQodGhpcykpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vbk1vdXNlVXAuYmluZCh0aGlzKSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpO1xuICAgIHRoaXMuZWxDYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlRG93bik7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZU1vdmUpO1xuXG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSk7XG4gICAgdGhpcy5lbENhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vbk1vdXNlRG93bik7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9uTW91c2VNb3ZlKTtcblxuICAgIHRoaXMuZWxDYW52YXMucmVtb3ZlKCk7XG4gIH1cblxuICBkcmF3U2NlbmUoKSB7XG4gICAgLy8gY2xlYXIgY2FudmFzXG4gICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY3R4LmNhbnZhcy53aWR0aCwgdGhpcy5jdHguY2FudmFzLmhlaWdodCk7XG5cbiAgICBpZiAodGhpcy5pbWFnZSAhPT0gbnVsbCkge1xuICAgICAgLy8gZHJhdyBzb3VyY2UgdGhpcy5pbWFnZVxuICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKHRoaXMuaW1hZ2UsIDAsIDAsIHRoaXMuY3R4LmNhbnZhcy53aWR0aCwgdGhpcy5jdHguY2FudmFzLmhlaWdodCk7XG4gICAgICB0aGlzLmN0eC5zYXZlKCk7XG5cbiAgICAgIC8vIGFuZCBtYWtlIGl0IGRhcmtlclxuICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwgMCwgMCwgMC42NSknO1xuICAgICAgdGhpcy5jdHguZmlsbFJlY3QoMCwgMCwgdGhpcy5jdHguY2FudmFzLndpZHRoLCB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgdGhpcy5jdHgucmVzdG9yZSgpO1xuXG4gICAgICB0aGlzLmNyb3BBcmVhLmRyYXcoKTtcbiAgICB9XG4gIH1cblxuICByZXNldENyb3BIb3N0KGN3PywgY2g/KSB7XG4gICAgaWYgKHRoaXMuaW1hZ2UgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuY3JvcEFyZWEuc2V0SW1hZ2UodGhpcy5pbWFnZSk7XG4gICAgICB2YXIgaW1hZ2VXaWR0aCA9IHRoaXMuaW1hZ2Uud2lkdGggfHwgY3c7XG4gICAgICB2YXIgaW1hZ2VIZWlnaHQgPSB0aGlzLmltYWdlLmhlaWdodCB8fCBjaDtcbiAgICAgIHZhciBpbWFnZURpbXMgPSBbaW1hZ2VXaWR0aCwgaW1hZ2VIZWlnaHRdO1xuXG4gICAgICAvLyBDb21wdXRlIGNhbnZhcyBkaW1lbnNpb25zIHRvIGZpdCBmdWxsIGRpc3BsYXkgaW50byBob3N0XG4gICAgICB2YXIgaW1hZ2VSYXRpbyA9IGltYWdlV2lkdGggLyBpbWFnZUhlaWdodDtcbiAgICAgIHZhciBjYW52YXNEaW1zID0gaW1hZ2VEaW1zO1xuICAgICAgaWYgKGNhbnZhc0RpbXNbMF0gPiB0aGlzLm1heENhbnZhc0RpbXNbMF0pIHtcbiAgICAgICAgY2FudmFzRGltc1swXSA9IHRoaXMubWF4Q2FudmFzRGltc1swXTtcbiAgICAgICAgY2FudmFzRGltc1sxXSA9IGNhbnZhc0RpbXNbMF0gLyBpbWFnZVJhdGlvO1xuICAgICAgfSBlbHNlIGlmIChjYW52YXNEaW1zWzBdIDwgdGhpcy5taW5DYW52YXNEaW1zWzBdKSB7XG4gICAgICAgIGNhbnZhc0RpbXNbMF0gPSB0aGlzLm1pbkNhbnZhc0RpbXNbMF07XG4gICAgICAgIGNhbnZhc0RpbXNbMV0gPSBjYW52YXNEaW1zWzBdIC8gaW1hZ2VSYXRpbztcbiAgICAgIH1cbiAgICAgIGlmIChjYW52YXNEaW1zWzFdID4gdGhpcy5tYXhDYW52YXNEaW1zWzFdKSB7XG4gICAgICAgIGNhbnZhc0RpbXNbMV0gPSB0aGlzLm1heENhbnZhc0RpbXNbMV07XG4gICAgICAgIGNhbnZhc0RpbXNbMF0gPSBjYW52YXNEaW1zWzFdICogaW1hZ2VSYXRpbztcbiAgICAgIH0gZWxzZSBpZiAoY2FudmFzRGltc1sxXSA8IHRoaXMubWluQ2FudmFzRGltc1sxXSkge1xuICAgICAgICBjYW52YXNEaW1zWzFdID0gdGhpcy5taW5DYW52YXNEaW1zWzFdO1xuICAgICAgICBjYW52YXNEaW1zWzBdID0gY2FudmFzRGltc1sxXSAqIGltYWdlUmF0aW87XG4gICAgICB9XG4gICAgICB2YXIgdyA9IE1hdGguZmxvb3IoY2FudmFzRGltc1swXSk7XG4gICAgICB2YXIgaCA9IE1hdGguZmxvb3IoY2FudmFzRGltc1sxXSk7XG4gICAgICBjYW52YXNEaW1zWzBdID0gdztcbiAgICAgIGNhbnZhc0RpbXNbMV0gPSBoO1xuICAgICAgY29uc29sZS5kZWJ1ZygnY2FudmFzIHJlc2V0ID0nICsgdyArICd4JyArIGgpO1xuICAgICAgdGhpcy5lbENhbnZhcy53aWR0aCA9IHc7XG4gICAgICB0aGlzLmVsQ2FudmFzLmhlaWdodCA9IGg7XG5cbiAgICAgIC8vIENvbXBlbnNhdGUgQ1NTIDUwJSBjZW50ZXJpbmcgb2YgY2FudmFzIGluc2lkZSBob3N0XG4gICAgICB0aGlzLmVsQ2FudmFzLnN0eWxlLm1hcmdpbkxlZnQgPSAtdyAvIDIgKyAncHgnO1xuICAgICAgdGhpcy5lbENhbnZhcy5zdHlsZS5tYXJnaW5Ub3AgPSAtaCAvIDIgKyAncHgnO1xuXG4gICAgICAvLyBDZW50ZXIgY3JvcCBhcmVhIGJ5IGRlZmF1bHRcbiAgICAgIHRoaXMuY3JvcEFyZWEuc2V0WCh0aGlzLmN0eC5jYW52YXMud2lkdGggLyAyKTtcbiAgICAgIHRoaXMuY3JvcEFyZWEuc2V0WSh0aGlzLmN0eC5jYW52YXMuaGVpZ2h0IC8gMik7XG5cbiAgICAgIHRoaXMuY3JvcEFyZWEuc2V0U2l6ZShNYXRoLm1pbigyMDAsIHRoaXMuY3R4LmNhbnZhcy53aWR0aCAvIDIsIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQgLyAyKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZWxDYW52YXMud2lkdGggPSAwO1xuICAgICAgdGhpcy5lbENhbnZhcy5oZWlnaHQgPSAwO1xuICAgICAgdGhpcy5lbENhbnZhcy5zdHlsZS5tYXJnaW5MZWZ0ID0gMDtcbiAgICAgIHRoaXMuZWxDYW52YXMuc3R5bGUubWFyZ2luVG9wID0gMDtcbiAgICB9XG5cbiAgICB0aGlzLmRyYXdTY2VuZSgpO1xuXG4gICAgcmV0dXJuIGNhbnZhc0RpbXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBldmVudC5jaGFuZ2VkVG91Y2hlcyBkaXJlY3RseSBpZiBldmVudCBpcyBhIFRvdWNoRXZlbnQuXG4gICAqIElmIGV2ZW50IGlzIGEgalF1ZXJ5IGV2ZW50LCByZXR1cm4gY2hhbmdlZFRvdWNoZXMgb2YgZXZlbnQub3JpZ2luYWxFdmVudFxuICAgKi9cbiAgc3RhdGljIGdldENoYW5nZWRUb3VjaGVzKGV2ZW50KSB7XG4gICAgcmV0dXJuIGV2ZW50LmNoYW5nZWRUb3VjaGVzID8gZXZlbnQuY2hhbmdlZFRvdWNoZXMgOiBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzO1xuICB9XG5cbiAgb25Nb3VzZU1vdmUoZSkge1xuICAgIGlmICh0aGlzLmltYWdlICE9PSBudWxsKSB7XG4gICAgICB2YXIgb2Zmc2V0ID0gQ3JvcEhvc3QuZ2V0RWxlbWVudE9mZnNldCh0aGlzLmN0eC5jYW52YXMpLFxuICAgICAgICBwYWdlWCwgcGFnZVk7XG4gICAgICBpZiAoZS50eXBlID09PSAndG91Y2htb3ZlJykge1xuICAgICAgICBwYWdlWCA9IENyb3BIb3N0LmdldENoYW5nZWRUb3VjaGVzKGUpWzBdLnBhZ2VYO1xuICAgICAgICBwYWdlWSA9IENyb3BIb3N0LmdldENoYW5nZWRUb3VjaGVzKGUpWzBdLnBhZ2VZO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFnZVggPSBlLnBhZ2VYO1xuICAgICAgICBwYWdlWSA9IGUucGFnZVk7XG4gICAgICB9XG4gICAgICB0aGlzLmNyb3BBcmVhLnByb2Nlc3NNb3VzZU1vdmUocGFnZVggLSBvZmZzZXQubGVmdCwgcGFnZVkgLSBvZmZzZXQudG9wKTtcbiAgICAgIHRoaXMuZHJhd1NjZW5lKCk7XG4gICAgfVxuICB9XG5cbiAgb25Nb3VzZURvd24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGlmICh0aGlzLmltYWdlICE9PSBudWxsKSB7XG4gICAgICB2YXIgb2Zmc2V0ID0gQ3JvcEhvc3QuZ2V0RWxlbWVudE9mZnNldCh0aGlzLmN0eC5jYW52YXMpLFxuICAgICAgICBwYWdlWCwgcGFnZVk7XG4gICAgICBpZiAoZS50eXBlID09PSAndG91Y2hzdGFydCcpIHtcbiAgICAgICAgcGFnZVggPSBDcm9wSG9zdC5nZXRDaGFuZ2VkVG91Y2hlcyhlKVswXS5wYWdlWDtcbiAgICAgICAgcGFnZVkgPSBDcm9wSG9zdC5nZXRDaGFuZ2VkVG91Y2hlcyhlKVswXS5wYWdlWTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhZ2VYID0gZS5wYWdlWDtcbiAgICAgICAgcGFnZVkgPSBlLnBhZ2VZO1xuICAgICAgfVxuICAgICAgdGhpcy5jcm9wQXJlYS5wcm9jZXNzTW91c2VEb3duKHBhZ2VYIC0gb2Zmc2V0LmxlZnQsIHBhZ2VZIC0gb2Zmc2V0LnRvcCk7XG4gICAgICB0aGlzLmRyYXdTY2VuZSgpO1xuICAgIH1cbiAgfVxuXG4gIG9uTW91c2VVcChlKSB7XG4gICAgaWYgKHRoaXMuaW1hZ2UgIT09IG51bGwpIHtcbiAgICAgIHZhciBvZmZzZXQgPSBDcm9wSG9zdC5nZXRFbGVtZW50T2Zmc2V0KHRoaXMuY3R4LmNhbnZhcyksXG4gICAgICAgIHBhZ2VYLCBwYWdlWTtcbiAgICAgIGlmIChlLnR5cGUgPT09ICd0b3VjaGVuZCcpIHtcbiAgICAgICAgcGFnZVggPSBDcm9wSG9zdC5nZXRDaGFuZ2VkVG91Y2hlcyhlKVswXS5wYWdlWDtcbiAgICAgICAgcGFnZVkgPSBDcm9wSG9zdC5nZXRDaGFuZ2VkVG91Y2hlcyhlKVswXS5wYWdlWTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhZ2VYID0gZS5wYWdlWDtcbiAgICAgICAgcGFnZVkgPSBlLnBhZ2VZO1xuICAgICAgfVxuICAgICAgdGhpcy5jcm9wQXJlYS5wcm9jZXNzTW91c2VVcChwYWdlWCAtIG9mZnNldC5sZWZ0LCBwYWdlWSAtIG9mZnNldC50b3ApO1xuICAgICAgdGhpcy5kcmF3U2NlbmUoKTtcbiAgICB9XG4gIH1cblxuICBnZXRSZXN1bHRJbWFnZURhdGFVUkkoKSB7XG4gICAgdmFyIHRlbXBfY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0NBTlZBUycpO1xuICAgIHZhciB0ZW1wX2N0eCA9IHRlbXBfY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgdGVtcF9jYW52YXMud2lkdGggPSB0aGlzLnJlc3VsdEltYWdlU2l6ZTtcbiAgICB0ZW1wX2NhbnZhcy5oZWlnaHQgPSB0aGlzLnJlc3VsdEltYWdlU2l6ZTtcbiAgICBpZiAodGhpcy5pbWFnZSAhPT0gbnVsbCkge1xuICAgICAgdGVtcF9jdHguZHJhd0ltYWdlKHRoaXMuaW1hZ2UsXG4gICAgICAgICh0aGlzLmNyb3BBcmVhLmdldFgoKSAtIHRoaXMuY3JvcEFyZWEuZ2V0U2l6ZSgpIC8gMikgKiAodGhpcy5pbWFnZS53aWR0aCAvIHRoaXMuY3R4LmNhbnZhcy53aWR0aCksXG4gICAgICAgICh0aGlzLmNyb3BBcmVhLmdldFkoKSAtIHRoaXMuY3JvcEFyZWEuZ2V0U2l6ZSgpIC8gMikgKiAodGhpcy5pbWFnZS5oZWlnaHQgLyB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0KSxcbiAgICAgICAgdGhpcy5jcm9wQXJlYS5nZXRTaXplKCkgKiAodGhpcy5pbWFnZS53aWR0aCAvIHRoaXMuY3R4LmNhbnZhcy53aWR0aCksXG4gICAgICAgIHRoaXMuY3JvcEFyZWEuZ2V0U2l6ZSgpICogKHRoaXMuaW1hZ2UuaGVpZ2h0IC8gdGhpcy5jdHguY2FudmFzLmhlaWdodCksXG4gICAgICAgIDAsIDAsIHRoaXMucmVzdWx0SW1hZ2VTaXplLCB0aGlzLnJlc3VsdEltYWdlU2l6ZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnJlc3VsdEltYWdlUXVhbGl0eSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRlbXBfY2FudmFzLnRvRGF0YVVSTCh0aGlzLnJlc3VsdEltYWdlRm9ybWF0LCB0aGlzLnJlc3VsdEltYWdlUXVhbGl0eSk7XG4gICAgfVxuICAgIHJldHVybiB0ZW1wX2NhbnZhcy50b0RhdGFVUkwodGhpcy5yZXN1bHRJbWFnZUZvcm1hdCk7XG4gIH1cblxuICByZWRyYXcoKSB7XG4gICAgdGhpcy5kcmF3U2NlbmUoKTtcbiAgfVxuXG4gIHNldE5ld0ltYWdlU291cmNlKGltYWdlU291cmNlKSB7XG4gICAgdGhpcy5pbWFnZSA9IG51bGw7XG4gICAgdGhpcy5yZXNldENyb3BIb3N0KCk7XG4gICAgdGhpcy5ldmVudHMudHJpZ2dlcignaW1hZ2UtdXBkYXRlZCcpO1xuICAgIGlmICghIWltYWdlU291cmNlKSB7XG4gICAgICB2YXIgbmV3SW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIGlmIChpbWFnZVNvdXJjZS5zdWJzdHJpbmcoMCwgNCkudG9Mb3dlckNhc2UoKSA9PT0gJ2h0dHAnKSB7XG4gICAgICAgIG5ld0ltYWdlLmNyb3NzT3JpZ2luID0gJ2Fub255bW91cyc7XG4gICAgICB9XG4gICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgIG5ld0ltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5ldmVudHMudHJpZ2dlcignbG9hZC1kb25lJyk7XG5cbiAgICAgICAgQ3JvcEVYSUYuZ2V0RGF0YShuZXdJbWFnZSwgKCkgPT4ge1xuICAgICAgICAgIHZhciBvcmllbnRhdGlvbiA9IENyb3BFWElGLmdldFRhZyhuZXdJbWFnZSwgJ09yaWVudGF0aW9uJyk7XG4gICAgICAgICAgbGV0IGN3ID0gbmV3SW1hZ2Uud2lkdGgsIGNoID0gbmV3SW1hZ2UuaGVpZ2h0LCBjeCA9IDAsIGN5ID0gMCwgZGVnID0gMDtcblxuICAgICAgICAgIGZ1bmN0aW9uIGltYWdlRG9uZSgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ2RpbXM9JyArIGN3ICsgJ3gnICsgY2gpO1xuICAgICAgICAgICAgdmFyIGNhbnZhc0RpbXMgPSBzZWxmLnJlc2V0Q3JvcEhvc3QoY3csIGNoKTtcbiAgICAgICAgICAgIHNlbGYuc2V0TWF4RGltZW5zaW9ucyhjYW52YXNEaW1zWzBdLCBjYW52YXNEaW1zWzFdKTtcbiAgICAgICAgICAgIHNlbGYuZXZlbnRzLnRyaWdnZXIoJ2ltYWdlLXVwZGF0ZWQnKTtcbiAgICAgICAgICAgIHNlbGYuZXZlbnRzLnRyaWdnZXIoJ2ltYWdlLXJlYWR5Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFszLCA2LCA4XS5pbmRleE9mKG9yaWVudGF0aW9uKSA+PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgICAgIHN3aXRjaCAob3JpZW50YXRpb24pIHtcbiAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIGN4ID0gLW5ld0ltYWdlLndpZHRoO1xuICAgICAgICAgICAgICAgIGN5ID0gLW5ld0ltYWdlLmhlaWdodDtcbiAgICAgICAgICAgICAgICBkZWcgPSAxODA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgICAgICBjdyA9IG5ld0ltYWdlLmhlaWdodDtcbiAgICAgICAgICAgICAgICBjaCA9IG5ld0ltYWdlLndpZHRoO1xuICAgICAgICAgICAgICAgIGN5ID0gLW5ld0ltYWdlLmhlaWdodDtcbiAgICAgICAgICAgICAgICBkZWcgPSA5MDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICAgIGN3ID0gbmV3SW1hZ2UuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIGNoID0gbmV3SW1hZ2Uud2lkdGg7XG4gICAgICAgICAgICAgICAgY3ggPSAtbmV3SW1hZ2Uud2lkdGg7XG4gICAgICAgICAgICAgICAgZGVnID0gMjcwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gY3c7XG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gY2g7XG4gICAgICAgICAgICBzZWxmLmN0eC5yb3RhdGUoZGVnICogTWF0aC5QSSAvIDE4MCk7XG4gICAgICAgICAgICBzZWxmLmN0eC5kcmF3SW1hZ2UobmV3SW1hZ2UsIGN4LCBjeSk7XG5cbiAgICAgICAgICAgIHNlbGYuaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIHNlbGYuaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBpbWFnZURvbmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZWxmLmltYWdlLnNyYyA9IGNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYuaW1hZ2UgPSBuZXdJbWFnZTtcbiAgICAgICAgICAgIGltYWdlRG9uZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgbmV3SW1hZ2Uub25lcnJvciA9IGVycm9yID0+IHtcbiAgICAgICAgdGhpcy5ldmVudHMudHJpZ2dlcignbG9hZC1lcnJvcicsIFtlcnJvcl0pO1xuICAgICAgfTtcbiAgICAgIHRoaXMuZXZlbnRzLnRyaWdnZXIoJ2xvYWQtc3RhcnQnKTtcbiAgICAgIG5ld0ltYWdlLnNyYyA9IGltYWdlU291cmNlO1xuICAgIH1cbiAgfVxuXG4gIHNldE1heERpbWVuc2lvbnMod2lkdGgsIGhlaWdodCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ3NldE1heERpbWVuc2lvbnMoJyArIHdpZHRoICsgJywgJyArIGhlaWdodCArICcpJyk7XG4gICAgaWYgKHRoaXMuaW1hZ2UgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGN1cldpZHRoID0gdGhpcy5jdHguY2FudmFzLndpZHRoLFxuICAgICAgICBjdXJIZWlnaHQgPSB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0O1xuXG4gICAgICBjb25zdCByYXRpb05ld0N1cldpZHRoID0gdGhpcy5jdHguY2FudmFzLndpZHRoIC8gY3VyV2lkdGgsXG4gICAgICAgIHJhdGlvTmV3Q3VySGVpZ2h0ID0gdGhpcy5jdHguY2FudmFzLmhlaWdodCAvIGN1ckhlaWdodCxcbiAgICAgICAgcmF0aW9NaW4gPSBNYXRoLm1pbihyYXRpb05ld0N1cldpZHRoLCByYXRpb05ld0N1ckhlaWdodCk7XG4gICAgfVxuICAgIHRoaXMubWF4Q2FudmFzRGltcyA9IFt3aWR0aCwgaGVpZ2h0XTtcbiAgICByZXR1cm4gdGhpcy5yZXNldENyb3BIb3N0KHdpZHRoLCBoZWlnaHQpO1xuICB9XG5cbiAgc2V0QXJlYU1pblNpemUoc2l6ZSkge1xuICAgIHNpemUgPSBwYXJzZUludChzaXplLCAxMCk7XG4gICAgaWYgKCFpc05hTihzaXplKSkge1xuICAgICAgdGhpcy5jcm9wQXJlYS5zZXRNaW5TaXplKHNpemUpO1xuICAgICAgdGhpcy5kcmF3U2NlbmUoKTtcbiAgICB9XG4gIH1cblxuICBzZXRSZXN1bHRJbWFnZVNpemUoc2l6ZSkge1xuICAgIHNpemUgPSBwYXJzZUludChzaXplLCAxMCk7XG4gICAgaWYgKCFpc05hTihzaXplKSkge1xuICAgICAgdGhpcy5yZXN1bHRJbWFnZVNpemUgPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIHNldFJlc3VsdEltYWdlRm9ybWF0KGZvcm1hdCkge1xuICAgIHRoaXMucmVzdWx0SW1hZ2VGb3JtYXQgPSBmb3JtYXQ7XG4gIH1cblxuICBzZXRSZXN1bHRJbWFnZVF1YWxpdHkocXVhbGl0eSkge1xuICAgIHF1YWxpdHkgPSBwYXJzZUZsb2F0KHF1YWxpdHkpO1xuICAgIGlmICghaXNOYU4ocXVhbGl0eSkgJiYgcXVhbGl0eSA+PSAwICYmIHF1YWxpdHkgPD0gMSkge1xuICAgICAgdGhpcy5yZXN1bHRJbWFnZVF1YWxpdHkgPSBxdWFsaXR5O1xuICAgIH1cbiAgfVxuXG4gIHNldEFyZWFUeXBlKHR5cGU6IENyb3BBcmVhVHlwZSkge1xuICAgIGNvbnN0IGN1clNpemUgPSB0aGlzLmNyb3BBcmVhLmdldFNpemUoKSxcbiAgICAgIGN1ck1pblNpemUgPSB0aGlzLmNyb3BBcmVhLmdldE1pblNpemUoKSxcbiAgICAgIGN1clggPSB0aGlzLmNyb3BBcmVhLmdldFgoKSxcbiAgICAgIGN1clkgPSB0aGlzLmNyb3BBcmVhLmdldFkoKTtcblxuICAgIGlmICh0eXBlID09PSBDcm9wQXJlYVR5cGUuU3F1YXJlKSB7XG4gICAgICB0aGlzLmNyb3BBcmVhID0gbmV3IENyb3BBcmVhU3F1YXJlKHRoaXMuY3R4LCB0aGlzLmV2ZW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3JvcEFyZWEgPSBuZXcgQ3JvcEFyZWFDaXJjbGUodGhpcy5jdHgsIHRoaXMuZXZlbnRzKTtcbiAgICB9XG4gICAgdGhpcy5jcm9wQXJlYS5zZXRNaW5TaXplKGN1ck1pblNpemUpO1xuICAgIHRoaXMuY3JvcEFyZWEuc2V0U2l6ZShjdXJTaXplKTtcbiAgICB0aGlzLmNyb3BBcmVhLnNldFgoY3VyWCk7XG4gICAgdGhpcy5jcm9wQXJlYS5zZXRZKGN1clkpO1xuXG4gICAgLy8gdGhpcy5yZXNldENyb3BIb3N0KCk7XG4gICAgaWYgKHRoaXMuaW1hZ2UgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuY3JvcEFyZWEuc2V0SW1hZ2UodGhpcy5pbWFnZSk7XG4gICAgfVxuICAgIHRoaXMuZHJhd1NjZW5lKCk7XG4gIH1cblxuICBnZXRBcmVhRGV0YWlscygpIDogQ3JvcEFyZWFEZXRhaWxzIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogdGhpcy5jcm9wQXJlYS5nZXRYKCksXG4gICAgICB5OiB0aGlzLmNyb3BBcmVhLmdldFkoKSxcbiAgICAgIHNpemU6IHRoaXMuY3JvcEFyZWEuZ2V0U2l6ZSgpLFxuICAgICAgaW1hZ2U6IHt3aWR0aDogdGhpcy5jcm9wQXJlYS5nZXRJbWFnZSgpLndpZHRoLCBoZWlnaHQ6IHRoaXMuY3JvcEFyZWEuZ2V0SW1hZ2UoKS5oZWlnaHR9LFxuICAgICAgY2FudmFzOiB7d2lkdGg6IHRoaXMuY3R4LmNhbnZhcy53aWR0aCwgaGVpZ2h0OiB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0fVxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZ2V0RWxlbWVudE9mZnNldChlbGVtKSB7XG4gICAgdmFyIGJveCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gICAgdmFyIGRvY0VsZW0gPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgICB2YXIgc2Nyb2xsVG9wID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY0VsZW0uc2Nyb2xsVG9wIHx8IGJvZHkuc2Nyb2xsVG9wO1xuICAgIHZhciBzY3JvbGxMZWZ0ID0gd2luZG93LnBhZ2VYT2Zmc2V0IHx8IGRvY0VsZW0uc2Nyb2xsTGVmdCB8fCBib2R5LnNjcm9sbExlZnQ7XG5cbiAgICB2YXIgY2xpZW50VG9wID0gZG9jRWxlbS5jbGllbnRUb3AgfHwgYm9keS5jbGllbnRUb3AgfHwgMDtcbiAgICB2YXIgY2xpZW50TGVmdCA9IGRvY0VsZW0uY2xpZW50TGVmdCB8fCBib2R5LmNsaWVudExlZnQgfHwgMDtcblxuICAgIHZhciB0b3AgPSBib3gudG9wICsgc2Nyb2xsVG9wIC0gY2xpZW50VG9wO1xuICAgIHZhciBsZWZ0ID0gYm94LmxlZnQgKyBzY3JvbGxMZWZ0IC0gY2xpZW50TGVmdDtcblxuICAgIHJldHVybiB7dG9wOiBNYXRoLnJvdW5kKHRvcCksIGxlZnQ6IE1hdGgucm91bmQobGVmdCl9O1xuICB9XG59IiwiaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCwgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBTaW1wbGVDaGFuZ2VzLCBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q3JvcFB1YlN1Yn0gZnJvbSBcIi4vY2xhc3Nlcy9jcm9wLXB1YnN1YlwiO1xuaW1wb3J0IHtDcm9wSG9zdH0gZnJvbSBcIi4vY2xhc3Nlcy9jcm9wLWhvc3RcIjtcbmltcG9ydCB7Q3JvcEFyZWFUeXBlfSBmcm9tIFwiLi9jbGFzc2VzL2Nyb3AtYXJlYVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIENyb3BBcmVhRGV0YWlscyB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xuICBzaXplOiBudW1iZXI7XG4gIGltYWdlOiB7IHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyIH07XG4gIGNhbnZhczogeyB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciB9O1xufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdmYy1pbWctY3JvcCcsXG4gIHRlbXBsYXRlOiAnPGNhbnZhcz48L2NhbnZhcz4nLFxuICBzdHlsZVVybHM6IFsnZmMtaW1nLWNyb3AuY29tcG9uZW50LnNjc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBGY0ltZ0Nyb3BDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMsIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcblxuICBASW5wdXQoKSBpbWFnZTtcblxuICBASW5wdXQoKSByZXN1bHRJbWFnZTtcbiAgQE91dHB1dCgpIHJlc3VsdEltYWdlQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIEBJbnB1dCgpIGNoYW5nZU9uRmx5O1xuICBASW5wdXQoKSBhcmVhVHlwZTogQ3JvcEFyZWFUeXBlO1xuICBASW5wdXQoKSBhcmVhTWluU2l6ZTtcblxuICBASW5wdXQoKSBhcmVhRGV0YWlsczogQ3JvcEFyZWFEZXRhaWxzO1xuICBAT3V0cHV0KCkgYXJlYURldGFpbHNDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPENyb3BBcmVhRGV0YWlscz4oKTtcblxuICBASW5wdXQoKSByZXN1bHRJbWFnZVNpemU7XG4gIEBJbnB1dCgpIHJlc3VsdEltYWdlRm9ybWF0OiBzdHJpbmc7XG4gIEBJbnB1dCgpIHJlc3VsdEltYWdlUXVhbGl0eTtcblxuICBAT3V0cHV0KCkgb25DaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBvbkxvYWRCZWdpbiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIG9uTG9hZERvbmUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBvbkxvYWRFcnJvciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIG9uSW1hZ2VSZWFkeSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBwcml2YXRlIGV2ZW50cyA9IG5ldyBDcm9wUHViU3ViKCk7XG4gIHByaXZhdGUgY3JvcEhvc3Q6IENyb3BIb3N0O1xuICBwcml2YXRlIG9ic2VydmVyOiBNdXRhdGlvbk9ic2VydmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWw6IEVsZW1lbnRSZWYsIHByaXZhdGUgcmVmOiBDaGFuZ2VEZXRlY3RvclJlZikge1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgY29uc3QgZXZlbnRzID0gdGhpcy5ldmVudHM7XG5cbiAgICAvLyBJbml0IENyb3AgSG9zdFxuICAgIGxldCBlbCA9IHRoaXMuZWwubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKTtcbiAgICB0aGlzLmNyb3BIb3N0ID0gbmV3IENyb3BIb3N0KGVsLCB7fSwgZXZlbnRzKTtcblxuICAgIC8vIFNldHVwIENyb3BIb3N0IEV2ZW50IEhhbmRsZXJzXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgZXZlbnRzXG4gICAgICAub24oJ2xvYWQtc3RhcnQnLCAoKSA9PiB7XG4gICAgICAgIHNlbGYub25Mb2FkQmVnaW4uZW1pdCh7fSk7XG4gICAgICAgIHNlbGYucmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgIH0pXG4gICAgICAub24oJ2xvYWQtZG9uZScsICgpID0+IHtcbiAgICAgICAgc2VsZi5vbkxvYWREb25lLmVtaXQoe30pO1xuICAgICAgICBzZWxmLnJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICB9KVxuICAgICAgLm9uKCdpbWFnZS1yZWFkeScsICgpID0+IHtcbiAgICAgICAgaWYgKHNlbGYub25JbWFnZVJlYWR5LmVtaXQoe30pKSB7XG4gICAgICAgICAgc2VsZi5jcm9wSG9zdC5yZWRyYXcoKTtcbiAgICAgICAgICBzZWxmLnJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAub24oJ2xvYWQtZXJyb3InLCAoKSA9PiB7XG4gICAgICAgIHNlbGYub25Mb2FkRXJyb3IuZW1pdCh7fSk7XG4gICAgICAgIHNlbGYucmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgIH0pXG4gICAgICAub24oJ2FyZWEtbW92ZSBhcmVhLXJlc2l6ZScsICgpID0+IHtcbiAgICAgICAgaWYgKCEhc2VsZi5jaGFuZ2VPbkZseSkge1xuICAgICAgICAgIHNlbGYudXBkYXRlUmVzdWx0SW1hZ2UoKTtcbiAgICAgICAgICBzZWxmLnJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAub24oJ2FyZWEtbW92ZS1lbmQgYXJlYS1yZXNpemUtZW5kIGltYWdlLXVwZGF0ZWQnLCAoKSA9PiB7XG4gICAgICAgIHNlbGYudXBkYXRlUmVzdWx0SW1hZ2UoKTtcbiAgICAgICAgc2VsZi5hcmVhRGV0YWlscyA9IHNlbGYuY3JvcEhvc3QuZ2V0QXJlYURldGFpbHMoKTtcbiAgICAgICAgc2VsZi5hcmVhRGV0YWlsc0NoYW5nZS5lbWl0KHNlbGYuYXJlYURldGFpbHMpO1xuICAgICAgfSk7XG4gIH1cblxuICAvLyBTdG9yZSBSZXN1bHQgSW1hZ2UgdG8gY2hlY2sgaWYgaXQncyBjaGFuZ2VkXG4gIHN0b3JlZFJlc3VsdEltYWdlO1xuXG4gIHVwZGF0ZVJlc3VsdEltYWdlKCkge1xuICAgIGNvbnN0IHJlc3VsdEltYWdlID0gdGhpcy5jcm9wSG9zdC5nZXRSZXN1bHRJbWFnZURhdGFVUkkoKTtcbiAgICBpZiAodGhpcy5zdG9yZWRSZXN1bHRJbWFnZSAhPT0gcmVzdWx0SW1hZ2UpIHtcbiAgICAgIHRoaXMuc3RvcmVkUmVzdWx0SW1hZ2UgPSByZXN1bHRJbWFnZTtcbiAgICAgIHRoaXMucmVzdWx0SW1hZ2UgPSByZXN1bHRJbWFnZTtcbiAgICAgIGlmICh0aGlzLnJlc3VsdEltYWdlQ2hhbmdlLm9ic2VydmVycy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5yZXN1bHRJbWFnZUNoYW5nZS5lbWl0KHRoaXMucmVzdWx0SW1hZ2UpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub25DaGFuZ2Uub2JzZXJ2ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5vbkNoYW5nZS5lbWl0KHskZGF0YVVSSTogdGhpcy5yZXN1bHRJbWFnZX0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuY3JvcEhvc3QuZGVzdHJveSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN5bmMgQ3JvcEhvc3Qgd2l0aCBEaXJlY3RpdmUncyBvcHRpb25zXG4gICAqL1xuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY3JvcEhvc3QpIHtcbiAgICAgIGlmIChjaGFuZ2VzLmltYWdlKSB7XG4gICAgICAgIHRoaXMuY3JvcEhvc3Quc2V0TmV3SW1hZ2VTb3VyY2UodGhpcy5pbWFnZSk7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlcy5hcmVhVHlwZSkge1xuICAgICAgICB0aGlzLmNyb3BIb3N0LnNldEFyZWFUeXBlKHRoaXMuYXJlYVR5cGUpO1xuICAgICAgICB0aGlzLnVwZGF0ZVJlc3VsdEltYWdlKCk7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlcy5hcmVhTWluU2l6ZSkge1xuICAgICAgICB0aGlzLmNyb3BIb3N0LnNldEFyZWFNaW5TaXplKHRoaXMuYXJlYU1pblNpemUpO1xuICAgICAgICB0aGlzLnVwZGF0ZVJlc3VsdEltYWdlKCk7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlcy5yZXN1bHRJbWFnZVNpemUpIHtcbiAgICAgICAgdGhpcy5jcm9wSG9zdC5zZXRSZXN1bHRJbWFnZVNpemUodGhpcy5yZXN1bHRJbWFnZVNpemUpO1xuICAgICAgICB0aGlzLnVwZGF0ZVJlc3VsdEltYWdlKCk7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlcy5yZXN1bHRJbWFnZUZvcm1hdCkge1xuICAgICAgICB0aGlzLmNyb3BIb3N0LnNldFJlc3VsdEltYWdlRm9ybWF0KHRoaXMucmVzdWx0SW1hZ2VGb3JtYXQpO1xuICAgICAgICB0aGlzLnVwZGF0ZVJlc3VsdEltYWdlKCk7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlcy5yZXN1bHRJbWFnZVF1YWxpdHkpIHtcbiAgICAgICAgdGhpcy5jcm9wSG9zdC5zZXRSZXN1bHRJbWFnZVF1YWxpdHkodGhpcy5yZXN1bHRJbWFnZVF1YWxpdHkpO1xuICAgICAgICB0aGlzLnVwZGF0ZVJlc3VsdEltYWdlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihtdXRhdGlvbnMgPT4ge1xuICAgICAgbXV0YXRpb25zLmZvckVhY2goKG11dGF0aW9uOiBNdXRhdGlvblJlY29yZCkgPT4ge1xuICAgICAgICBpZiAobXV0YXRpb24uYXR0cmlidXRlTmFtZSA9PT0gJ2NsaWVudFdpZHRoJyB8fCBtdXRhdGlvbi5hdHRyaWJ1dGVOYW1lID09PSAnY2xpZW50SGVpZ2h0Jykge1xuICAgICAgICAgIHRoaXMuY3JvcEhvc3Quc2V0TWF4RGltZW5zaW9ucyh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuY2xpZW50V2lkdGgsIHRoaXMuZWwubmF0aXZlRWxlbWVudC5jbGllbnRIZWlnaHQpO1xuICAgICAgICAgIHRoaXMudXBkYXRlUmVzdWx0SW1hZ2UoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29uc3QgY29uZmlnID0ge2F0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogdHJ1ZX07XG4gICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKHRoaXMuZWwubmF0aXZlRWxlbWVudCwgY29uZmlnKTtcbiAgfVxufSIsImltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0ZjSW1nQ3JvcENvbXBvbmVudH0gZnJvbSBcIi4vZmMtaW1nLWNyb3AuY29tcG9uZW50XCI7XG5cbkBOZ01vZHVsZSh7XG4gICAgZGVjbGFyYXRpb25zOiBbXG4gICAgICAgIEZjSW1nQ3JvcENvbXBvbmVudFxuICAgIF0sXG4gICAgZXhwb3J0czogW1xuICAgICAgICBGY0ltZ0Nyb3BDb21wb25lbnRcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIENyb3BNb2R1bGUge1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOztzQkFDbUIsRUFBRTs7Ozs7OztJQUVuQixFQUFFLENBQUMsS0FBYSxFQUFFLE9BQWlCO1FBQ2pDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUk7WUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ3hCO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDakMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLENBQUM7S0FDYjs7Ozs7OztJQUdELE9BQU8sQ0FBQyxJQUFZLEVBQUUsSUFBVzs7UUFDL0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxJQUFJLFNBQVMsRUFBRTtZQUNiLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTztnQkFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDMUIsQ0FBQyxDQUFDO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQztLQUNiOztDQUNGOzs7Ozs7Ozs7QUNwQkQ7Ozs7Ozs7SUEyU0UsT0FBTyxZQUFZLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxhQUFhOztRQUNsRCxJQUFJLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7UUFDbEMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDOztRQUNkLElBQUksVUFBVSxDQUFnRDs7UUFBOUQsSUFBZ0IsU0FBUyxDQUFxQzs7UUFBOUQsSUFBMkIsUUFBUSxDQUEyQjs7UUFBOUQsSUFBcUMsV0FBVyxDQUFjOztRQUM5RCxJQUFJLGVBQWUsR0FBRyxXQUFXLENBQUM7UUFDbEMsT0FBTyxlQUFlLEdBQUcsV0FBVyxHQUFHLGFBQWEsRUFBRTtZQUNwRCxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLEtBQUssSUFBSSxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDbEcsV0FBVyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLFdBQVcsSUFBSSxRQUFRLENBQUMsWUFBWSxFQUFFO29CQUN4QyxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBRWxELFNBQVMsR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUMvQyxVQUFVLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsZUFBZSxHQUFHLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQzs7b0JBRS9FLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsRUFBRTs7d0JBRWxDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEtBQUssRUFBRTs0QkFDcEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzt5QkFDbEM7NkJBQ0k7NEJBQ0gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO3lCQUNqRDtxQkFDRjt5QkFDSTt3QkFDSCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsVUFBVSxDQUFDO3FCQUM5QjtpQkFDRjthQUVGO1lBQ0QsZUFBZSxFQUFFLENBQUM7U0FDbkI7UUFDRCxPQUFPLElBQUksQ0FBQztLQUNiOzs7Ozs7Ozs7SUFFRCxPQUFPLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTTs7UUFDeEQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FHM0M7O1FBSEosSUFDRSxJQUFJLEdBQUcsRUFBRSxDQUVQOztRQUhKLElBRUUsV0FBVyxDQUNUOztRQUhKLElBRWUsR0FBRyxDQUNkOztRQUhKLElBR0UsQ0FBQyxDQUFDO1FBRUosS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUIsV0FBVyxHQUFHLFFBQVEsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNwQyxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNwRCxJQUFJLEdBQUcsRUFBRTtnQkFDUCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDbkY7aUJBQU07Z0JBQ0wsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ3RFO1NBQ0Y7UUFDRCxPQUFPLElBQUksQ0FBQztLQUNiOzs7Ozs7Ozs7SUFFRCxPQUFPLFlBQVksQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTTs7UUFDaEUsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBSzFCOztRQUx6QixJQUNFLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FJN0I7O1FBTHpCLElBRUUsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FHM0M7O1FBTHpCLElBR0UsTUFBTSxDQUVpQjs7UUFMekIsSUFJRSxJQUFJLENBQ21COztRQUx6QixJQUlRLEdBQUcsQ0FDYzs7UUFMekIsSUFJYSxDQUFDLENBQ1c7O1FBTHpCLElBS0UsU0FBUyxDQUFjOztRQUx6QixJQUthLFdBQVcsQ0FBQztRQUV6QixRQUFRLElBQUk7WUFDVixLQUFLLEdBQUcsQ0FBQztZQUNULEtBQUssR0FBRzs7Z0JBQ04sSUFBSSxTQUFTLElBQUksQ0FBQyxFQUFFO29CQUNsQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNoRDtxQkFBTTtvQkFDTCxNQUFNLEdBQUcsU0FBUyxHQUFHLENBQUMsR0FBRyxXQUFXLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUN6RCxJQUFJLEdBQUcsRUFBRSxDQUFDO29CQUNWLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUM5QixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQ3JDO29CQUNELE9BQU8sSUFBSSxDQUFDO2lCQUNiO1lBRUgsS0FBSyxHQUFHOztnQkFDTixNQUFNLEdBQUcsU0FBUyxHQUFHLENBQUMsR0FBRyxXQUFXLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN6RCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFM0QsS0FBSyxHQUFHOztnQkFDTixJQUFJLFNBQVMsSUFBSSxDQUFDLEVBQUU7b0JBQ2xCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ2pEO3FCQUFNO29CQUNMLE1BQU0sR0FBRyxTQUFTLEdBQUcsQ0FBQyxHQUFHLFdBQVcsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3pELElBQUksR0FBRyxFQUFFLENBQUM7b0JBQ1YsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQzlCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ25EO29CQUNELE9BQU8sSUFBSSxDQUFDO2lCQUNiO1lBRUgsS0FBSyxHQUFHOztnQkFDTixJQUFJLFNBQVMsSUFBSSxDQUFDLEVBQUU7b0JBQ2xCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ2pEO3FCQUFNO29CQUNMLElBQUksR0FBRyxFQUFFLENBQUM7b0JBQ1YsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQzlCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3hEO29CQUNELE9BQU8sSUFBSSxDQUFDO2lCQUNiO1lBRUgsS0FBSyxHQUFHOztnQkFDTixJQUFJLFNBQVMsSUFBSSxDQUFDLEVBQUU7b0JBQ2xCLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNqRCxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3ZELEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUM7b0JBQzFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO29CQUMxQixHQUFHLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztvQkFDOUIsT0FBTyxHQUFHLENBQUM7aUJBQ1o7cUJBQU07b0JBQ0wsSUFBSSxHQUFHLEVBQUUsQ0FBQztvQkFDVixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDOUIsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDekQsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQy9ELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUM7d0JBQzlDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO3dCQUM5QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztxQkFDbkM7b0JBQ0QsT0FBTyxJQUFJLENBQUM7aUJBQ2I7WUFFSCxLQUFLLEdBQUc7O2dCQUNOLElBQUksU0FBUyxJQUFJLENBQUMsRUFBRTtvQkFDbEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDaEQ7cUJBQU07b0JBQ0wsSUFBSSxHQUFHLEVBQUUsQ0FBQztvQkFDVixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDOUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDdkQ7b0JBQ0QsT0FBTyxJQUFJLENBQUM7aUJBQ2I7WUFFSCxLQUFLLElBQUk7O2dCQUNQLElBQUksU0FBUyxJQUFJLENBQUMsRUFBRTtvQkFDbEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUN0RjtxQkFBTTtvQkFDTCxJQUFJLEdBQUcsRUFBRSxDQUFDO29CQUNWLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUM5QixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3pHO29CQUNELE9BQU8sSUFBSSxDQUFDO2lCQUNiO1NBQ0o7S0FDRjs7Ozs7OztJQUVELE9BQU8sUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTztRQUNyQyxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtZQUM1QixPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNqRDthQUFNLElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRTtZQUM5QixPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDNUM7S0FDRjs7Ozs7O0lBRUQsT0FBTyxlQUFlLENBQUMsR0FBRyxFQUFFLFFBQVE7O1FBQ2xDLElBQUksSUFBSSxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDO1lBQ3ZCLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzNDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDekI7U0FDRixDQUFDO1FBQ0YsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2I7Ozs7Ozs7SUFFRCxPQUFPLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsUUFBUzs7UUFDN0MsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7UUFDNUMsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoRCxHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDMUIsR0FBRyxDQUFDLFFBQVEsR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDO1FBQzlCLElBQUksUUFBUSxFQUFFO1lBQ1osUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNwQjtLQUNGOzs7Ozs7SUFFRCxPQUFPLFlBQVksQ0FBQyxHQUFHLEVBQUUsUUFBUTtRQUMvQixJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDWCxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFOztnQkFDNUIsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDeEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFFbkQ7aUJBQU0sSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTs7Z0JBQ25DLElBQUksVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ2xDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUNwQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2lCQUN2RCxDQUFDO2dCQUNGLFFBQVEsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxVQUFVLElBQUk7b0JBQzlDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDcEMsQ0FBQyxDQUFDO2FBQ0o7aUJBQU07O2dCQUNMLElBQUksSUFBSSxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7O2dCQUNoQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUc7b0JBQ1osSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTt3QkFDM0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO3FCQUNyRDt5QkFBTTt3QkFDTCxNQUFNLHNCQUFzQixDQUFDO3FCQUM5QjtvQkFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDO2lCQUNiLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLFlBQVksR0FBRyxhQUFhLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDakI7U0FDRjthQUFNLElBQUksVUFBVSxLQUFLLEdBQUcsWUFBWSxNQUFNLENBQUMsSUFBSSxJQUFJLEdBQUcsWUFBWSxJQUFJLENBQUMsRUFBRTs7WUFDNUUsSUFBSSxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUNsQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQ25CLE9BQU8sQ0FBQyxLQUFLLENBQUMscUNBQXFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2pGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDdkQsQ0FBQztZQUVGLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNuQztLQUNGOzs7Ozs7O0lBRUQsT0FBTyxlQUFlLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNOztRQUMxQyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0MsTUFBTSxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ25EO1FBQ0QsT0FBTyxNQUFNLENBQUM7S0FDZjs7Ozs7O0lBRUQsT0FBTyxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUs7UUFDN0IsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksTUFBTSxFQUFFO1lBQ2xELE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUUsT0FBTyxLQUFLLENBQUM7U0FDZDs7UUFFRCxJQUFJLE1BQU0sQ0FHZTs7UUFIekIsSUFDRSxJQUFJLENBRW1COztRQUh6QixJQUVFLFFBQVEsQ0FDZTs7UUFIekIsSUFFWSxPQUFPLENBQ007O1FBSHpCLElBR0UsVUFBVSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7O1FBQ3pCLElBQUksR0FBRyxDQUFTOztRQUdoQixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksTUFBTSxFQUFFO1lBQ3hDLE1BQU0sR0FBRyxLQUFLLENBQUM7U0FDaEI7YUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksTUFBTSxFQUFFO1lBQy9DLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDZjthQUFNO1lBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1lBQzVELE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sRUFBRTtZQUNyRCxPQUFPLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7WUFDbEQsT0FBTyxLQUFLLENBQUM7U0FDZDs7UUFFRCxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU3RCxJQUFJLGNBQWMsR0FBRyxVQUFVLEVBQUU7WUFDL0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxpREFBaUQsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzFHLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxJQUFJLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFVBQVUsR0FBRyxjQUFjLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUUvRixJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDdkIsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3hHLEtBQUssR0FBRyxJQUFJLFFBQVEsRUFBRTtnQkFDcEIsUUFBUSxHQUFHO29CQUNULEtBQUssYUFBYSxDQUFFO29CQUNwQixLQUFLLE9BQU8sQ0FBRTtvQkFDZCxLQUFLLGNBQWMsQ0FBRTtvQkFDckIsS0FBSyxpQkFBaUIsQ0FBRTtvQkFDeEIsS0FBSyxlQUFlLENBQUU7b0JBQ3RCLEtBQUssa0JBQWtCLENBQUU7b0JBQ3pCLEtBQUssV0FBVyxDQUFFO29CQUNsQixLQUFLLGdCQUFnQixDQUFFO29CQUN2QixLQUFLLGNBQWMsQ0FBRTtvQkFDckIsS0FBSyxhQUFhLENBQUU7b0JBQ3BCLEtBQUssVUFBVSxDQUFFO29CQUNqQixLQUFLLFlBQVksQ0FBRTtvQkFDbkIsS0FBSyxXQUFXLENBQUU7b0JBQ2xCLEtBQUssc0JBQXNCLENBQUU7b0JBQzdCLEtBQUssWUFBWTt3QkFDZixRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDdEQsTUFBTTtvQkFFUixLQUFLLGFBQWEsQ0FBRTtvQkFDcEIsS0FBSyxpQkFBaUI7d0JBQ3BCLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUM1RyxNQUFNO29CQUVSLEtBQUsseUJBQXlCO3dCQUM1QixRQUFRLENBQUMsR0FBRyxDQUFDOzRCQUNYLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDOUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUM5QyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQzlDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNqRCxNQUFNO2lCQUNUO2dCQUNELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDM0I7U0FDRjtRQUVELElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQzFCLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3JHLEtBQUssR0FBRyxJQUFJLE9BQU8sRUFBRTtnQkFDbkIsUUFBUSxHQUFHO29CQUNULEtBQUssY0FBYzt3QkFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQzVCLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNyQixHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDckIsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDeEIsTUFBTTtpQkFDVDtnQkFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzFCO1NBQ0Y7UUFFRCxPQUFPLElBQUksQ0FBQztLQUNiOzs7Ozs7SUFFRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLEVBQUUsUUFBUTtRQUMxQixJQUFJLENBQUMsR0FBRyxZQUFZLEtBQUssSUFBSSxHQUFHLFlBQVksZ0JBQWdCLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRTdGLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzNCLFFBQVEsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3RDO2FBQU07WUFDTCxJQUFJLFFBQVEsRUFBRTtnQkFDWixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3BCO1NBQ0Y7UUFDRCxPQUFPLElBQUksQ0FBQztLQUNiOzs7Ozs7O0lBRUQsT0FBTyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUc7UUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDO1lBQUUsT0FBTztRQUNwQyxPQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDMUI7Ozs7OztJQUVELE9BQU8sVUFBVSxDQUFDLEdBQUc7UUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUM7O1FBQ3ZDLElBQUksQ0FBQyxDQUVPOztRQUZaLElBQ0UsSUFBSSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQ1Q7O1FBRlosSUFFRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ1osS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFO1lBQ2QsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMxQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ25CO1NBQ0Y7UUFDRCxPQUFPLElBQUksQ0FBQztLQUNiOzs7Ozs7SUFFRCxPQUFPLE1BQU0sQ0FBQyxHQUFHO1FBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUM7O1FBQ3ZDLElBQUksQ0FBQyxDQUVZOztRQUZqQixJQUNFLElBQUksR0FBRyxHQUFHLENBQUMsUUFBUSxDQUNKOztRQUZqQixJQUVFLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDakIsS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFO1lBQ2QsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMxQixJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsRUFBRTtvQkFDOUIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksTUFBTSxFQUFFO3dCQUM3QixTQUFTLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO3FCQUNuRzt5QkFBTTt3QkFDTCxTQUFTLElBQUksQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQztxQkFDM0Q7aUJBQ0Y7cUJBQU07b0JBQ0wsU0FBUyxJQUFJLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztpQkFDM0M7YUFDRjtTQUNGO1FBQ0QsT0FBTyxTQUFTLENBQUM7S0FDbEI7Ozs7O0lBR0QsT0FBTyxjQUFjLENBQUMsSUFBSTs7UUFDeEIsSUFBSSxRQUFRLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7O1FBQ2xDLElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBRXhDLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3hFLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLEVBQUU7WUFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2pDLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7O1FBRUQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDOztRQUNmLElBQUksTUFBTSxDQUFDOzs7O1FBRVg7O1lBQ0UsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QyxNQUFNLEVBQUUsQ0FBQztZQUNULE9BQU8sUUFBUSxDQUFDO1NBQ2pCOzs7O1FBRUQ7O1lBQ0UsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQyxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUNwQixPQUFPLFFBQVEsQ0FBQztTQUNqQjtRQUVELE9BQU8sTUFBTSxHQUFHLFNBQVMsRUFBRTs7WUFDekIsSUFBSSxRQUFRLEdBQUcsUUFBUSxFQUFFLENBQUM7WUFDMUIsSUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO2dCQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLCtCQUErQixHQUFHLE1BQU0sR0FBRyxXQUFXLEdBQUcsUUFBUSxDQUFDLENBQUM7Z0JBQ2pGLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxNQUFNLEdBQUcsUUFBUSxFQUFFLENBQUM7WUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7O1lBS25DLElBQUksYUFBYSxHQUFHLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNuQyxRQUFRLE1BQU07Z0JBQ1osS0FBSyxNQUFNO29CQUNULE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFvQixDQUFDO2dCQUNoRSxLQUFLLE1BQU0sQ0FBQztnQkFDWjtvQkFDRSxNQUFNLElBQUksYUFBYSxDQUFDO2FBQzNCO1NBQ0Y7S0FDRjs7Ozs7SUFFRCxPQUFPLGNBQWMsQ0FBQyxJQUFJOztRQUN4QixJQUFJLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsQyxPQUFPLENBQUMsS0FBSyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLE1BQU0sUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRTtZQUNwRSxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDakMsT0FBTyxLQUFLLENBQUM7U0FDZDs7UUFFRCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQ2E7O1FBRDNCLElBQ0UsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7O1FBRzNCLElBQUksbUJBQW1CLEdBQUcsVUFBVSxRQUFRLEVBQUUsTUFBTTtZQUNsRCxRQUNFLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSTtnQkFDbEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSTtnQkFDdEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSTtnQkFDdEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSTtnQkFDdEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSTtnQkFDdEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUN0QztTQUNILENBQUM7UUFFRixPQUFPLE1BQU0sR0FBRyxNQUFNLEVBQUU7WUFDdEIsSUFBSSxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7O2dCQUV6QyxJQUFJLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLGdCQUFnQixHQUFHLENBQUMsS0FBSyxDQUFDO29CQUFFLGdCQUFnQixJQUFJLENBQUMsQ0FBQzs7Z0JBRXRELElBQUksZ0JBQWdCLEtBQUssQ0FBQyxFQUFFOztvQkFFMUIsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO2lCQUN0Qjs7Z0JBRUQsSUFBSSxXQUFXLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQzs7Z0JBQ2hELElBQUksYUFBYSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUV0RSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQzthQUM1RDs7WUFHRCxNQUFNLEVBQUUsQ0FBQztTQUNWO0tBQ0Y7Ozs7O0lBRUQsT0FBTyxrQkFBa0IsQ0FBQyxJQUFJO1FBQzVCLE9BQU8sUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN0Qzs7Ozs7SUFFRCxPQUFPLFlBQVksQ0FBQyxHQUFHO1FBQ3JCLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN6Qjs7Ozs7O0lBRUQsT0FBTyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsV0FBWTtRQUM3QyxXQUFXLEdBQUcsV0FBVyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakYsTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsNkJBQTZCLEVBQUUsRUFBRSxDQUFDLENBQUM7O1FBQzNELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7UUFDMUIsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQzs7UUFDeEIsSUFBSSxNQUFNLEdBQUcsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7O1FBQ2xDLElBQUksSUFBSSxHQUFHLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEM7UUFDRCxPQUFPLE1BQU0sQ0FBQztLQUNmOztvQkEzd0JpQjs7SUFHaEIsUUFBUSxFQUFFLGFBQWE7O0lBQ3ZCLFFBQVEsRUFBRSxpQkFBaUI7OztJQUczQixRQUFRLEVBQUUsWUFBWTs7O0lBR3RCLFFBQVEsRUFBRSxpQkFBaUI7O0lBQzNCLFFBQVEsRUFBRSxpQkFBaUI7O0lBQzNCLFFBQVEsRUFBRSx5QkFBeUI7O0lBQ25DLFFBQVEsRUFBRSx3QkFBd0I7OztJQUdsQyxRQUFRLEVBQUUsV0FBVzs7SUFDckIsUUFBUSxFQUFFLGFBQWE7OztJQUd2QixRQUFRLEVBQUUsa0JBQWtCOzs7SUFHNUIsUUFBUSxFQUFFLGtCQUFrQjs7SUFDNUIsUUFBUSxFQUFFLG1CQUFtQjs7SUFDN0IsUUFBUSxFQUFFLFlBQVk7O0lBQ3RCLFFBQVEsRUFBRSxvQkFBb0I7O0lBQzlCLFFBQVEsRUFBRSxxQkFBcUI7OztJQUcvQixRQUFRLEVBQUUsY0FBYzs7SUFDeEIsUUFBUSxFQUFFLFNBQVM7O0lBQ25CLFFBQVEsRUFBRSxpQkFBaUI7O0lBQzNCLFFBQVEsRUFBRSxxQkFBcUI7O0lBQy9CLFFBQVEsRUFBRSxpQkFBaUI7O0lBQzNCLFFBQVEsRUFBRSxNQUFNOztJQUNoQixRQUFRLEVBQUUsbUJBQW1COztJQUM3QixRQUFRLEVBQUUsZUFBZTs7SUFDekIsUUFBUSxFQUFFLGlCQUFpQjs7SUFDM0IsUUFBUSxFQUFFLGNBQWM7O0lBQ3hCLFFBQVEsRUFBRSxrQkFBa0I7O0lBQzVCLFFBQVEsRUFBRSxpQkFBaUI7O0lBQzNCLFFBQVEsRUFBRSxjQUFjOztJQUN4QixRQUFRLEVBQUUsYUFBYTs7SUFDdkIsUUFBUSxFQUFFLE9BQU87O0lBQ2pCLFFBQVEsRUFBRSxhQUFhOztJQUN2QixRQUFRLEVBQUUsYUFBYTs7SUFDdkIsUUFBUSxFQUFFLGFBQWE7O0lBQ3ZCLFFBQVEsRUFBRSwwQkFBMEI7O0lBQ3BDLFFBQVEsRUFBRSx1QkFBdUI7O0lBQ2pDLFFBQVEsRUFBRSx1QkFBdUI7O0lBQ2pDLFFBQVEsRUFBRSwwQkFBMEI7O0lBQ3BDLFFBQVEsRUFBRSxpQkFBaUI7O0lBQzNCLFFBQVEsRUFBRSxlQUFlOztJQUN6QixRQUFRLEVBQUUsZUFBZTs7SUFDekIsUUFBUSxFQUFFLFlBQVk7O0lBQ3RCLFFBQVEsRUFBRSxXQUFXOztJQUNyQixRQUFRLEVBQUUsWUFBWTs7SUFDdEIsUUFBUSxFQUFFLGdCQUFnQjs7SUFDMUIsUUFBUSxFQUFFLGNBQWM7O0lBQ3hCLFFBQVEsRUFBRSxjQUFjOztJQUN4QixRQUFRLEVBQUUsbUJBQW1COztJQUM3QixRQUFRLEVBQUUsdUJBQXVCOztJQUNqQyxRQUFRLEVBQUUsa0JBQWtCOztJQUM1QixRQUFRLEVBQUUsYUFBYTs7SUFDdkIsUUFBUSxFQUFFLFVBQVU7O0lBQ3BCLFFBQVEsRUFBRSxZQUFZOztJQUN0QixRQUFRLEVBQUUsV0FBVzs7SUFDckIsUUFBUSxFQUFFLDBCQUEwQjs7SUFDcEMsUUFBUSxFQUFFLHNCQUFzQjs7O0lBR2hDLFFBQVEsRUFBRSw0QkFBNEI7SUFDdEMsUUFBUSxFQUFFLGVBQWU7Q0FDMUI7b0JBRWlCO0lBQ2hCLFFBQVEsRUFBRSxZQUFZO0lBQ3RCLFFBQVEsRUFBRSxhQUFhO0lBQ3ZCLFFBQVEsRUFBRSxnQkFBZ0I7SUFDMUIsUUFBUSxFQUFFLG1CQUFtQjtJQUM3QixRQUFRLEVBQUUsNEJBQTRCO0lBQ3RDLFFBQVEsRUFBRSxlQUFlO0lBQ3pCLFFBQVEsRUFBRSxhQUFhO0lBQ3ZCLFFBQVEsRUFBRSwyQkFBMkI7SUFDckMsUUFBUSxFQUFFLGFBQWE7SUFDdkIsUUFBUSxFQUFFLGlCQUFpQjtJQUMzQixRQUFRLEVBQUUscUJBQXFCO0lBQy9CLFFBQVEsRUFBRSxrQkFBa0I7SUFDNUIsUUFBUSxFQUFFLGtCQUFrQjtJQUM1QixRQUFRLEVBQUUsYUFBYTtJQUN2QixRQUFRLEVBQUUsYUFBYTtJQUN2QixRQUFRLEVBQUUsZ0JBQWdCO0lBQzFCLFFBQVEsRUFBRSxjQUFjO0lBQ3hCLFFBQVEsRUFBRSxjQUFjO0lBQ3hCLFFBQVEsRUFBRSxpQkFBaUI7SUFDM0IsUUFBUSxFQUFFLHVCQUF1QjtJQUNqQyxRQUFRLEVBQUUsNkJBQTZCO0lBQ3ZDLFFBQVEsRUFBRSxrQkFBa0I7SUFDNUIsUUFBUSxFQUFFLFlBQVk7SUFDdEIsUUFBUSxFQUFFLHVCQUF1QjtJQUNqQyxRQUFRLEVBQUUsbUJBQW1CO0lBQzdCLFFBQVEsRUFBRSxxQkFBcUI7SUFDL0IsUUFBUSxFQUFFLFVBQVU7SUFDcEIsUUFBUSxFQUFFLGtCQUFrQjtJQUM1QixRQUFRLEVBQUUsTUFBTTtJQUNoQixRQUFRLEVBQUUsT0FBTztJQUNqQixRQUFRLEVBQUUsVUFBVTtJQUNwQixRQUFRLEVBQUUsUUFBUTtJQUNsQixRQUFRLEVBQUUsV0FBVztDQUN0QjttQkFFZ0I7SUFDZixRQUFRLEVBQUUsY0FBYztJQUN4QixRQUFRLEVBQUUsZ0JBQWdCO0lBQzFCLFFBQVEsRUFBRSxhQUFhO0lBQ3ZCLFFBQVEsRUFBRSxpQkFBaUI7SUFDM0IsUUFBUSxFQUFFLGNBQWM7SUFDeEIsUUFBUSxFQUFFLGdCQUFnQjtJQUMxQixRQUFRLEVBQUUsYUFBYTtJQUN2QixRQUFRLEVBQUUsY0FBYztJQUN4QixRQUFRLEVBQUUsZUFBZTtJQUN6QixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsZ0JBQWdCO0lBQzFCLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLFFBQVEsRUFBRSxhQUFhO0lBQ3ZCLFFBQVEsRUFBRSxVQUFVO0lBQ3BCLFFBQVEsRUFBRSxhQUFhO0lBQ3ZCLFFBQVEsRUFBRSxVQUFVO0lBQ3BCLFFBQVEsRUFBRSxvQkFBb0I7SUFDOUIsUUFBUSxFQUFFLGlCQUFpQjtJQUMzQixRQUFRLEVBQUUsYUFBYTtJQUN2QixRQUFRLEVBQUUsb0JBQW9CO0lBQzlCLFFBQVEsRUFBRSxpQkFBaUI7SUFDM0IsUUFBUSxFQUFFLHFCQUFxQjtJQUMvQixRQUFRLEVBQUUsa0JBQWtCO0lBQzVCLFFBQVEsRUFBRSxtQkFBbUI7SUFDN0IsUUFBUSxFQUFFLGdCQUFnQjtJQUMxQixRQUFRLEVBQUUsb0JBQW9CO0lBQzlCLFFBQVEsRUFBRSxpQkFBaUI7SUFDM0IsUUFBUSxFQUFFLHFCQUFxQjtJQUMvQixRQUFRLEVBQUUsb0JBQW9CO0lBQzlCLFFBQVEsRUFBRSxjQUFjO0lBQ3hCLFFBQVEsRUFBRSxpQkFBaUI7Q0FDNUI7d0JBRXFCO0lBQ3BCLGVBQWUsRUFBRTtRQUNmLEdBQUcsRUFBRSxhQUFhO1FBQ2xCLEdBQUcsRUFBRSxRQUFRO1FBQ2IsR0FBRyxFQUFFLGdCQUFnQjtRQUNyQixHQUFHLEVBQUUsbUJBQW1CO1FBQ3hCLEdBQUcsRUFBRSxrQkFBa0I7UUFDdkIsR0FBRyxFQUFFLGtCQUFrQjtRQUN2QixHQUFHLEVBQUUsZ0JBQWdCO1FBQ3JCLEdBQUcsRUFBRSxlQUFlO1FBQ3BCLEdBQUcsRUFBRSxnQkFBZ0I7S0FDdEI7SUFDRCxZQUFZLEVBQUU7UUFDWixHQUFHLEVBQUUsU0FBUztRQUNkLEdBQUcsRUFBRSxTQUFTO1FBQ2QsR0FBRyxFQUFFLHVCQUF1QjtRQUM1QixHQUFHLEVBQUUsTUFBTTtRQUNYLEdBQUcsRUFBRSxXQUFXO1FBQ2hCLEdBQUcsRUFBRSxTQUFTO1FBQ2QsR0FBRyxFQUFFLFNBQVM7UUFDZCxLQUFLLEVBQUUsT0FBTztLQUNmO0lBQ0QsV0FBVyxFQUFFO1FBQ1gsR0FBRyxFQUFFLFNBQVM7UUFDZCxHQUFHLEVBQUUsVUFBVTtRQUNmLEdBQUcsRUFBRSxhQUFhO1FBQ2xCLEdBQUcsRUFBRSwrQkFBK0I7UUFDcEMsR0FBRyxFQUFFLE9BQU87UUFDWixHQUFHLEVBQUUsY0FBYztRQUNuQixJQUFJLEVBQUUsZ0JBQWdCO1FBQ3RCLElBQUksRUFBRSxPQUFPO1FBQ2IsSUFBSSxFQUFFLHVDQUF1QztRQUM3QyxJQUFJLEVBQUUsd0NBQXdDO1FBQzlDLElBQUksRUFBRSx5Q0FBeUM7UUFDL0MsSUFBSSxFQUFFLHFDQUFxQztRQUMzQyxJQUFJLEVBQUUsa0JBQWtCO1FBQ3hCLElBQUksRUFBRSxrQkFBa0I7UUFDeEIsSUFBSSxFQUFFLGtCQUFrQjtRQUN4QixJQUFJLEVBQUUsS0FBSztRQUNYLElBQUksRUFBRSxLQUFLO1FBQ1gsSUFBSSxFQUFFLEtBQUs7UUFDWCxJQUFJLEVBQUUsS0FBSztRQUNYLElBQUksRUFBRSxxQkFBcUI7UUFDM0IsS0FBSyxFQUFFLE9BQU87S0FDZjtJQUNELEtBQUssRUFBRTtRQUNMLFFBQVEsRUFBRSxvQkFBb0I7UUFDOUIsUUFBUSxFQUFFLGFBQWE7UUFDdkIsUUFBUSxFQUFFLGtDQUFrQztRQUM1QyxRQUFRLEVBQUUsOEJBQThCO1FBQ3hDLFFBQVEsRUFBRSxvQ0FBb0M7UUFDOUMsUUFBUSxFQUFFLCtEQUErRDtRQUN6RSxRQUFRLEVBQUUsMkRBQTJEO1FBQ3JFLFFBQVEsRUFBRSwyQ0FBMkM7UUFDckQsUUFBUSxFQUFFLCtCQUErQjtRQUN6QyxRQUFRLEVBQUUsd0JBQXdCO1FBQ2xDLFFBQVEsRUFBRSxtREFBbUQ7UUFDN0QsUUFBUSxFQUFFLCtDQUErQztRQUN6RCxRQUFRLEVBQUUsbUJBQW1CO1FBQzdCLFFBQVEsRUFBRSxxQ0FBcUM7UUFDL0MsUUFBUSxFQUFFLGdFQUFnRTtRQUMxRSxRQUFRLEVBQUUsNERBQTREO1FBQ3RFLFFBQVEsRUFBRSw0REFBNEQ7UUFDdEUsUUFBUSxFQUFFLHVGQUF1RjtRQUNqRyxRQUFRLEVBQUUsbUZBQW1GO1FBQzdGLFFBQVEsRUFBRSxnREFBZ0Q7UUFDMUQsUUFBUSxFQUFFLDJFQUEyRTtRQUNyRixRQUFRLEVBQUUsdUVBQXVFO0tBQ2xGO0lBQ0QsYUFBYSxFQUFFO1FBQ2IsR0FBRyxFQUFFLGFBQWE7UUFDbEIsR0FBRyxFQUFFLDRCQUE0QjtRQUNqQyxHQUFHLEVBQUUsNEJBQTRCO1FBQ2pDLEdBQUcsRUFBRSw4QkFBOEI7UUFDbkMsR0FBRyxFQUFFLDhCQUE4QjtRQUNuQyxHQUFHLEVBQUUsa0JBQWtCO1FBQ3ZCLEdBQUcsRUFBRSxnQ0FBZ0M7S0FDdEM7SUFDRCxnQkFBZ0IsRUFBRTtRQUNoQixHQUFHLEVBQUUsVUFBVTtRQUNmLEdBQUcsRUFBRSxXQUFXO1FBQ2hCLEdBQUcsRUFBRSxVQUFVO1FBQ2YsR0FBRyxFQUFFLGFBQWE7S0FDbkI7SUFDRCxTQUFTLEVBQUU7UUFDVCxHQUFHLEVBQUUsdUJBQXVCO0tBQzdCO0lBQ0QsY0FBYyxFQUFFO1FBQ2QsR0FBRyxFQUFFLGdCQUFnQjtRQUNyQixHQUFHLEVBQUUsZ0JBQWdCO0tBQ3RCO0lBQ0QsWUFBWSxFQUFFO1FBQ1osR0FBRyxFQUFFLG9CQUFvQjtRQUN6QixHQUFHLEVBQUUsc0JBQXNCO0tBQzVCO0lBQ0QsV0FBVyxFQUFFO1FBQ1gsR0FBRyxFQUFFLE1BQU07UUFDWCxHQUFHLEVBQUUsYUFBYTtRQUNsQixHQUFHLEVBQUUsY0FBYztRQUNuQixHQUFHLEVBQUUsZUFBZTtRQUNwQixHQUFHLEVBQUUsZ0JBQWdCO0tBQ3RCO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsR0FBRyxFQUFFLFFBQVE7UUFDYixHQUFHLEVBQUUsTUFBTTtRQUNYLEdBQUcsRUFBRSxNQUFNO0tBQ1o7SUFDRCxVQUFVLEVBQUU7UUFDVixHQUFHLEVBQUUsUUFBUTtRQUNiLEdBQUcsRUFBRSxnQkFBZ0I7UUFDckIsR0FBRyxFQUFFLGlCQUFpQjtLQUN2QjtJQUNELFNBQVMsRUFBRTtRQUNULEdBQUcsRUFBRSxRQUFRO1FBQ2IsR0FBRyxFQUFFLE1BQU07UUFDWCxHQUFHLEVBQUUsTUFBTTtLQUNaO0lBQ0Qsb0JBQW9CLEVBQUU7UUFDcEIsR0FBRyxFQUFFLFNBQVM7UUFDZCxHQUFHLEVBQUUsT0FBTztRQUNaLEdBQUcsRUFBRSxZQUFZO1FBQ2pCLEdBQUcsRUFBRSxjQUFjO0tBQ3BCO0lBQ0QsVUFBVSxFQUFFO1FBQ1YsR0FBRyxFQUFFLEtBQUs7S0FDWDtJQUVELFVBQVUsRUFBRTtRQUNWLEdBQUcsRUFBRSxFQUFFO1FBQ1AsR0FBRyxFQUFFLEdBQUc7UUFDUixHQUFHLEVBQUUsSUFBSTtRQUNULEdBQUcsRUFBRSxJQUFJO1FBQ1QsR0FBRyxFQUFFLEdBQUc7UUFDUixHQUFHLEVBQUUsR0FBRztRQUNSLEdBQUcsRUFBRSxHQUFHO0tBQ1Q7Q0FDRjt3QkFFcUI7SUFDcEIsTUFBTSxFQUFFLFNBQVM7SUFDakIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsTUFBTSxFQUFFLFVBQVU7SUFDbEIsTUFBTSxFQUFFLGFBQWE7SUFDckIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsTUFBTSxFQUFFLGFBQWE7SUFDckIsTUFBTSxFQUFFLGVBQWU7SUFDdkIsTUFBTSxFQUFFLFVBQVU7SUFDbEIsTUFBTSxFQUFFLFdBQVc7SUFDbkIsTUFBTSxFQUFFLFVBQVU7Q0FDbkI7Ozs7OztBQzVTSDs7OztJQXNCSSxZQUFvQixHQUFHO1FBQUgsUUFBRyxHQUFILEdBQUcsQ0FBQTs7NEJBcEJSLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUNsRixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQzNFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDM0UsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzsyQkFDckUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzJCQUMvRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7MkJBQy9FLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7MkJBQ3hFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7O3NCQUc3RTtZQUNMLFdBQVcsRUFBRSxNQUFNO1lBQ25CLGVBQWUsRUFBRSxNQUFNO1lBQ3ZCLGFBQWEsRUFBRSxNQUFNO1lBQ3JCLGtCQUFrQixFQUFFLE1BQU07WUFDMUIsa0JBQWtCLEVBQUUsTUFBTTtZQUMxQixnQkFBZ0IsRUFBRSxNQUFNO1lBQ3hCLFlBQVksRUFBRSxNQUFNO1NBQ3ZCO0tBRTBCOzs7Ozs7O0lBRzNCLFNBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUs7UUFDMUIsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdkU7Ozs7Ozs7OztJQUdPLGlCQUFpQixDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUs7UUFDM0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7UUFDckIsSUFBSSxFQUFFLENBQXNEOztRQUE1RCxJQUFRLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWhDLEtBQUssSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFOztZQUNqQixJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNCLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTtnQkFDVixFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakM7U0FDSjtRQUVELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7Ozs7Ozs7SUFLdkIsWUFBWSxDQUFDLFlBQVksRUFBRSxLQUFLO1FBQzVCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4RixJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hGLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztLQUMzRjs7Ozs7OztJQUVELG9CQUFvQixDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsS0FBSzs7UUFDbEQsSUFBSSxrQkFBa0IsR0FBRyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzlDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztRQUN0RCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0Qjs7Ozs7OztJQUVELHFCQUFxQixDQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsS0FBSzs7UUFDL0MsSUFBSSxhQUFhLEdBQUcsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDO1FBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztRQUMvQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxHQUFHLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxHQUFHLENBQUMsRUFBRSxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDMUgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLGFBQWEsR0FBRyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLGFBQWEsR0FBRyxDQUFDLEVBQUUsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzVILElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdEI7Ozs7Ozs7SUFDRCxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLEtBQUs7UUFDOUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0YsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDbEc7Ozs7Ozs7SUFDRCxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFLEtBQUs7UUFDOUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0YsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDbEc7Ozs7Ozs7O0lBSUQsWUFBWSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLGNBQWM7O1FBQ2xELElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUdWOztRQUh0QyxJQUNJLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FFWjs7UUFIdEMsSUFFSSxLQUFLLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQ0E7O1FBSHRDLElBR0ksSUFBSSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDL0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDckIsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7UUFHaEIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO1lBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxNQUFNLEVBQUUsSUFBSSxHQUFHLE1BQU0sRUFBRSxJQUFJLEdBQUcsTUFBTSxFQUFFLElBQUksR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDbkg7UUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3JCLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0Qjs7Q0FDSjs7Ozs7O0FDM0hEOztJQUdFLFFBQVMsUUFBUTtJQUNqQixRQUFTLFFBQVE7Ozs7O0FBR25COzs7OztJQVFFLFlBQXNCLElBQUksRUFBWSxPQUFPO1FBQXZCLFNBQUksR0FBSixJQUFJLENBQUE7UUFBWSxZQUFPLEdBQVAsT0FBTyxDQUFBO3dCQVB4QixFQUFFO3NCQUVKLElBQUksS0FBSyxFQUFFO2tCQUNmLENBQUM7a0JBQ0QsQ0FBQztxQkFDRSxHQUFHO1FBR25CLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDekM7Ozs7SUFFRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0tBQ3BCOzs7OztJQUVELFFBQVEsQ0FBQyxLQUFLO1FBQ1osSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7S0FDckI7Ozs7O0lBRUQsSUFBSTtRQUNGLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztLQUNoQjs7Ozs7O0lBRUQsSUFBSSxDQUFDLENBQUM7UUFDSixJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3pCOzs7OztJQUVELElBQUk7UUFDRixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7S0FDaEI7Ozs7OztJQUVELElBQUksQ0FBQyxDQUFDO1FBQ0osSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztLQUN6Qjs7Ozs7SUFFRCxPQUFPO1FBQ0wsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0tBQ25COzs7Ozs7SUFFRCxPQUFPLENBQUMsSUFBSTtRQUNWLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3pCOzs7OztJQUVELFVBQVU7UUFDUixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7S0FDdEI7Ozs7OztJQUVELFVBQVUsQ0FBQyxJQUFJO1FBQ2IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3pCOzs7OztJQUVELGdCQUFnQjs7UUFDZCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQ0Y7O1FBRDdCLElBQ0UsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUM3QixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQ2hCO1FBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtZQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztTQUNoQjtRQUNELElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtZQUM1QixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQzFCO1FBQ0QsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtZQUNoQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztTQUM5QjtRQUNELElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtZQUM1QixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQzFCO1FBQ0QsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtZQUNoQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztTQUM5QjtLQUNGOzs7OztJQUlELElBQUk7UUFDRixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDNUY7O0NBT0Y7Ozs7OztBQ2xHRCxvQkFFNEIsU0FBUSxRQUFROzs7OztJQXFCMUMsWUFBWSxHQUFHLEVBQUUsTUFBTTtRQUNyQixLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2tDQXJCQSxFQUFFO3FDQUNDLEdBQUc7b0NBQ0osR0FBRztvQ0FDSCxHQUFHO21DQUNKLEdBQUc7OEJBRVIsQ0FBQzs4QkFDRCxDQUFDO2dDQUNDLENBQUM7Z0NBQ0QsQ0FBQzttQ0FDRSxDQUFDO2lDQUVILEtBQUs7NEJBQ1YsS0FBSztvQ0FDRyxLQUFLOytCQUNWLEtBQUs7UUFRckIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUM7UUFDakYsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUM7S0FDaEY7Ozs7O0lBRUQsMEJBQTBCLENBQUMsWUFBWTs7UUFDckMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7O1FBQzNCLElBQUksWUFBWSxHQUFHLFlBQVksSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUVhOztRQUY5RCxJQUNFLGdCQUFnQixHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQ0M7O1FBRjlELElBRUUsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM5RCxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztLQUM3Qzs7OztJQUVELDJCQUEyQjtRQUN6QixPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzdDOzs7OztJQUVELGtCQUFrQixDQUFDLEtBQUs7UUFDdEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztLQUM5SDs7Ozs7O0lBRUQsdUJBQXVCLENBQUMsS0FBSzs7UUFDM0IsSUFBSSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQzs7UUFDaEUsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQztRQUN6QyxRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUs7WUFDbEcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxFQUFFO0tBQ2pHOzs7Ozs7OztJQUVELFNBQVMsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLElBQUk7UUFDL0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDckU7Ozs7O0lBRUQsSUFBSTtRQUNGLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7O1FBRy9DLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7O1FBRzVILElBQUksQ0FBQyxXQUFXLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDdEw7Ozs7Ozs7SUFFRCxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsU0FBUzs7UUFDbkMsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDOztRQUN2QixJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUM7UUFFaEIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUUxQixJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDeEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUMxQyxJQUFJLENBQUMsRUFBRSxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQzFDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDaEIsR0FBRyxHQUFHLElBQUksQ0FBQztZQUNYLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ25DO2FBQU0sSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDcEMsTUFBTSxHQUFHLGFBQWEsQ0FBQzs7WUFDdkIsSUFBSSxHQUFHLENBQVc7O1lBQWxCLElBQVMsR0FBRyxDQUFNOztZQUFsQixJQUFjLEdBQUcsQ0FBQztZQUNsQixHQUFHLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztZQUN4QyxHQUFHLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztZQUN4QyxJQUFJLEdBQUcsR0FBRyxHQUFHLEVBQUU7Z0JBQ2IsR0FBRyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2FBQzFDO2lCQUFNO2dCQUNMLEdBQUcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQzthQUMxQztZQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDOUIsR0FBRyxHQUFHLElBQUksQ0FBQztZQUNYLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQ3JDO2FBQU0sSUFBSSxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsRUFBRTtZQUMvRCxNQUFNLEdBQUcsYUFBYSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDOUIsR0FBRyxHQUFHLElBQUksQ0FBQztTQUNaO2FBQU0sSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsRUFBRTtZQUMxRCxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ2hCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLEdBQUcsR0FBRyxJQUFJLENBQUM7U0FDWjtRQUVELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXZDLE9BQU8sR0FBRyxDQUFDO0tBQ1o7Ozs7Ozs7SUFFRCxnQkFBZ0IsQ0FBQyxVQUFrQixFQUFFLFVBQWtCO1FBQ3JELElBQUksSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUU7WUFDMUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7WUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDMUIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztZQUNqQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1lBQzlCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUM7WUFDbkMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztZQUNuQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUN0QyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQzNDO2FBQU0sSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsRUFBRTtZQUM1RCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztZQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFDL0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMzQyxJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDekM7S0FDRjs7Ozs7SUFFRCxjQUFjO1FBQ1osSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1lBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDN0IsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQztZQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQ3pDO1FBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUUvQixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztLQUN6Qjs7Q0FFRjs7Ozs7O0FDdEpELG9CQUU0QixTQUFRLFFBQVE7Ozs7O0lBcUJ4QyxZQUFZLEdBQUcsRUFBRSxNQUFNO1FBQ25CLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7cUNBckJDLEVBQUU7c0NBQ0QsSUFBSTtxQ0FDTCxDQUFDO29DQUNGLEdBQUc7bUNBQ0osR0FBRzs4QkFFUixDQUFDOzhCQUNELENBQUM7Z0NBQ0MsQ0FBQztnQ0FDRCxDQUFDO21DQUNFLENBQUM7a0NBRUYsQ0FBQyxDQUFDOzRCQUNSLEtBQUs7cUNBQ0ksQ0FBQyxDQUFDOytCQUNSLEtBQUs7UUFRbkIsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUM7UUFDeEYsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUM7S0FDekY7Ozs7O0lBRUQsa0JBQWtCOztRQUNkLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLE9BQU87WUFDSCxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO1lBQ2xDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUM7WUFDbEMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztZQUNsQyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO1NBQ3JDLENBQUM7S0FDTDs7OztJQUVELHFCQUFxQjs7UUFDakIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDM0IsT0FBTztZQUNILElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUs7WUFDckIsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSztZQUNwQixLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLO1lBQ3RCLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUs7U0FDMUIsQ0FBQztLQUNMOzs7OztJQUVELGtCQUFrQixDQUFDLEtBQUs7O1FBQ3BCLElBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDcEQsUUFBUSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksZ0JBQWdCLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksZ0JBQWdCLENBQUMsTUFBTSxFQUFFO0tBQy9KOzs7OztJQUVELHdCQUF3QixDQUFDLEtBQUs7O1FBQzFCLElBQUksdUJBQXVCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7O1FBQ3hELElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFOztZQUNoRSxJQUFJLHNCQUFzQixHQUFHLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hELElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLHNCQUFzQjtnQkFDeEksS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixFQUFFO2dCQUMxSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUNSLE1BQU07YUFDVDtTQUNKO1FBQ0QsT0FBTyxHQUFHLENBQUM7S0FDZDs7Ozs7OztJQUVELFNBQVMsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLElBQUk7O1FBQzdCLElBQUksS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7UUFDckIsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQzFFOzs7O0lBRUQsSUFBSTtRQUNBLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7O1FBRy9DLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7O1FBRzVILElBQUksdUJBQXVCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDeEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLHVCQUF1QixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFOztZQUNoRSxJQUFJLHNCQUFzQixHQUFHLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQ3ZMO0tBQ0o7Ozs7OztJQUVELGdCQUFnQixDQUFDLFNBQVMsRUFBRSxTQUFTOztRQUNqQyxJQUFJLE1BQU0sR0FBRyxTQUFTLENBQUM7O1FBQ3ZCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQztRQUVoQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFFMUIsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxFQUFFLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDMUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUMxQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztZQUN6QixNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ2hCLEdBQUcsR0FBRyxJQUFJLENBQUM7WUFDWCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNyQzthQUFNLElBQUksSUFBSSxDQUFDLHFCQUFxQixHQUFHLENBQUMsQ0FBQyxFQUFFOztZQUN4QyxJQUFJLE1BQU0sQ0FBUzs7WUFBbkIsSUFBWSxNQUFNLENBQUM7WUFDbkIsUUFBUSxJQUFJLENBQUMscUJBQXFCO2dCQUM5QixLQUFLLENBQUM7O29CQUNGLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDWixNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ1osTUFBTSxHQUFHLGFBQWEsQ0FBQztvQkFDdkIsTUFBTTtnQkFDVixLQUFLLENBQUM7O29CQUNGLE1BQU0sR0FBRyxDQUFDLENBQUM7b0JBQ1gsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNaLE1BQU0sR0FBRyxhQUFhLENBQUM7b0JBQ3ZCLE1BQU07Z0JBQ1YsS0FBSyxDQUFDOztvQkFDRixNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ1osTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDWCxNQUFNLEdBQUcsYUFBYSxDQUFDO29CQUN2QixNQUFNO2dCQUNWLEtBQUssQ0FBQzs7b0JBQ0YsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDWCxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUNYLE1BQU0sR0FBRyxhQUFhLENBQUM7b0JBQ3ZCLE1BQU07YUFDYjs7WUFDRCxJQUFJLEdBQUcsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLElBQUksTUFBTSxDQUFDOztZQUN2RCxJQUFJLEdBQUcsR0FBRyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLElBQUksTUFBTSxDQUFDOztZQUN2RCxJQUFJLEdBQUcsQ0FBQztZQUNSLElBQUksR0FBRyxHQUFHLEdBQUcsRUFBRTtnQkFDWCxHQUFHLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQzthQUN4QztpQkFBTTtnQkFDSCxHQUFHLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQzthQUN4Qzs7WUFDRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDOztZQUMxQyxJQUFJLFdBQVcsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxJQUFJLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsRUFBRSxJQUFJLFdBQVcsR0FBRyxNQUFNLENBQUM7WUFDaEMsSUFBSSxDQUFDLEVBQUUsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUM7WUFDckQsR0FBRyxHQUFHLElBQUksQ0FBQztZQUNYLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQ3ZDO2FBQU07O1lBQ0gsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUM3RSxJQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUN2QixRQUFRLGdCQUFnQjtvQkFDcEIsS0FBSyxDQUFDO3dCQUNGLE1BQU0sR0FBRyxhQUFhLENBQUM7d0JBQ3ZCLE1BQU07b0JBQ1YsS0FBSyxDQUFDO3dCQUNGLE1BQU0sR0FBRyxhQUFhLENBQUM7d0JBQ3ZCLE1BQU07b0JBQ1YsS0FBSyxDQUFDO3dCQUNGLE1BQU0sR0FBRyxhQUFhLENBQUM7d0JBQ3ZCLE1BQU07b0JBQ1YsS0FBSyxDQUFDO3dCQUNGLE1BQU0sR0FBRyxhQUFhLENBQUM7d0JBQ3ZCLE1BQU07aUJBQ2I7Z0JBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxnQkFBZ0IsQ0FBQztnQkFDM0MsR0FBRyxHQUFHLElBQUksQ0FBQzthQUNkO2lCQUFNLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3hELE1BQU0sR0FBRyxNQUFNLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixHQUFHLEdBQUcsSUFBSSxDQUFDO2FBQ2Q7U0FDSjtRQUVELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXZDLE9BQU8sR0FBRyxDQUFDO0tBQ2Q7Ozs7OztJQUVELGdCQUFnQixDQUFDLFVBQVUsRUFBRSxVQUFVOztRQUNuQyxJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLElBQUksa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7WUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDMUIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGtCQUFrQixDQUFDO1lBQ2hELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQztZQUM3QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDO1lBQ25DLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUM7WUFDbkMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDdEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUM3QzthQUFNLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUU7WUFDMUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFDNUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDekIsSUFBSSxDQUFDLHFCQUFxQixHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDM0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUMzQztLQUNKOzs7O0lBRUQsY0FBYztRQUNWLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUN0QixJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztZQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUN6QztRQUNELElBQUksSUFBSSxDQUFDLHFCQUFxQixHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQ2pDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQzNDO1FBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO0tBQzNCO0NBQ0o7Ozs7OztBQ3BORDs7Ozs7O0lBd0JFLFlBQW9CLFFBQVEsRUFBVSxJQUFJLEVBQVUsTUFBTTtRQUF0QyxhQUFRLEdBQVIsUUFBUSxDQUFBO1FBQVUsU0FBSSxHQUFKLElBQUksQ0FBQTtRQUFVLFdBQU0sR0FBTixNQUFNLENBQUE7bUJBaEJwRCxJQUFJO3FCQUNGLElBQUk7OzZCQUtJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQzs2QkFDVixDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7K0JBRVIsR0FBRztpQ0FDRCxXQUFXO1FBTzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQztRQUV0QyxJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFckMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXJELFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNwRSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDcEUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWhFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNwRSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ2xFOzs7O0lBRUQsT0FBTztRQUNMLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNqRSxRQUFRLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUUxRCxRQUFRLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbEUsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFM0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUN4Qjs7OztJQUVELFNBQVM7O1FBRVAsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFeEUsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRTs7WUFFdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDOztZQUdoQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQztZQUMzQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUV2RSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRW5CLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDdEI7S0FDRjs7Ozs7O0lBRUQsYUFBYSxDQUFDLEVBQUcsRUFBRSxFQUFHO1FBQ3BCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDOztZQUNuQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7O1lBQ3hDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQzs7WUFDMUMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7O1lBRzFDLElBQUksVUFBVSxHQUFHLFVBQVUsR0FBRyxXQUFXLENBQUM7O1lBQzFDLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQztZQUMzQixJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN6QyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUM7YUFDNUM7aUJBQU0sSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDaEQsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDO2FBQzVDO1lBQ0QsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDekMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDO2FBQzVDO2lCQUFNLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hELFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQzthQUM1Qzs7WUFDRCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztZQUNsQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEIsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLGdCQUFnQixHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzs7WUFHekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDL0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7O1lBRzlDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM3RjthQUFNO1lBQ0wsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7U0FDbkM7UUFFRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFakIsT0FBTyxVQUFVLENBQUM7S0FDbkI7Ozs7Ozs7SUFNRCxPQUFPLGlCQUFpQixDQUFDLEtBQUs7UUFDNUIsT0FBTyxLQUFLLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUM7S0FDekY7Ozs7O0lBRUQsV0FBVyxDQUFDLENBQUM7UUFDWCxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFOztZQUN2QixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FDeEM7O1lBRGYsSUFDRSxLQUFLLENBQVE7O1lBRGYsSUFDUyxLQUFLLENBQUM7WUFDZixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssV0FBVyxFQUFFO2dCQUMxQixLQUFLLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDL0MsS0FBSyxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7YUFDaEQ7aUJBQU07Z0JBQ0wsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQ2hCLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO2FBQ2pCO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUNsQjtLQUNGOzs7OztJQUVELFdBQVcsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNwQixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFOztZQUN2QixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FDeEM7O1lBRGYsSUFDRSxLQUFLLENBQVE7O1lBRGYsSUFDUyxLQUFLLENBQUM7WUFDZixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssWUFBWSxFQUFFO2dCQUMzQixLQUFLLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDL0MsS0FBSyxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7YUFDaEQ7aUJBQU07Z0JBQ0wsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQ2hCLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO2FBQ2pCO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUNsQjtLQUNGOzs7OztJQUVELFNBQVMsQ0FBQyxDQUFDO1FBQ1QsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRTs7WUFDdkIsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQ3hDOztZQURmLElBQ0UsS0FBSyxDQUFROztZQURmLElBQ1MsS0FBSyxDQUFDO1lBQ2YsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTtnQkFDekIsS0FBSyxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQy9DLEtBQUssR0FBRyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2FBQ2hEO2lCQUFNO2dCQUNMLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUNoQixLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQzthQUNqQjtZQUNELElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ2xCO0tBQ0Y7Ozs7SUFFRCxxQkFBcUI7O1FBQ25CLElBQUksV0FBVyxxQkFBc0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBQzs7UUFDdEUsSUFBSSxRQUFRLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QyxXQUFXLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDekMsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzFDLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDdkIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUMzQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQ2pHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFDbkcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFDcEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFDdEUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUNyRDtRQUNELElBQUksSUFBSSxDQUFDLGtCQUFrQixLQUFLLElBQUksRUFBRTtZQUNwQyxPQUFPLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQy9FO1FBQ0QsT0FBTyxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3REOzs7O0lBRUQsTUFBTTtRQUNKLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUNsQjs7Ozs7SUFFRCxpQkFBaUIsQ0FBQyxXQUFXO1FBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUU7O1lBQ2pCLElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7WUFDM0IsSUFBSSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxNQUFNLEVBQUU7Z0JBQ3hELFFBQVEsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO2FBQ3BDOztZQUNELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztZQUNsQixRQUFRLENBQUMsTUFBTSxHQUFHO2dCQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFFakMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7O29CQUN6QixJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQzs7b0JBQzNELElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQWdEOztvQkFBdkUsSUFBeUIsRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQTBCOztvQkFBdkUsSUFBK0MsRUFBRSxHQUFHLENBQUMsQ0FBa0I7O29CQUF2RSxJQUF1RCxFQUFFLEdBQUcsQ0FBQyxDQUFVOztvQkFBdkUsSUFBK0QsR0FBRyxHQUFHLENBQUMsQ0FBQzs7OztvQkFFdkU7d0JBQ0UsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQzs7d0JBQ3ZDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUM1QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNwRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzt3QkFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7cUJBQ3BDO29CQUVELElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7O3dCQUN2QyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDOzt3QkFDaEQsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDcEMsUUFBUSxXQUFXOzRCQUNqQixLQUFLLENBQUM7Z0NBQ0osRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztnQ0FDckIsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQ0FDdEIsR0FBRyxHQUFHLEdBQUcsQ0FBQztnQ0FDVixNQUFNOzRCQUNSLEtBQUssQ0FBQztnQ0FDSixFQUFFLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQ0FDckIsRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0NBQ3BCLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0NBQ3RCLEdBQUcsR0FBRyxFQUFFLENBQUM7Z0NBQ1QsTUFBTTs0QkFDUixLQUFLLENBQUM7Z0NBQ0osRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0NBQ3JCLEVBQUUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO2dDQUNwQixFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2dDQUNyQixHQUFHLEdBQUcsR0FBRyxDQUFDO2dDQUNWLE1BQU07eUJBQ1Q7d0JBQ0QsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7d0JBQ2xCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO3dCQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQzt3QkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzt3QkFFckMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO3dCQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRzs0QkFDbEIsU0FBUyxFQUFFLENBQUM7eUJBQ2IsQ0FBQzt3QkFDRixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO3FCQUNoRDt5QkFBTTt3QkFDTCxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQzt3QkFDdEIsU0FBUyxFQUFFLENBQUM7cUJBQ2I7aUJBQ0YsQ0FBQyxDQUFDO2FBQ0osQ0FBQztZQUNGLFFBQVEsQ0FBQyxPQUFPLEdBQUcsS0FBSztnQkFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUM1QyxDQUFDO1lBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbEMsUUFBUSxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUM7U0FDNUI7S0FDRjs7Ozs7O0lBRUQsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLE1BQU07UUFDNUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNqRSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFOztZQUN2QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQ0Q7O1lBRHJDLE1BQ0UsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQzs7WUFFckMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUVFOztZQUYzRCxNQUNFLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQ0c7U0FDNUQ7UUFDRCxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDMUM7Ozs7O0lBRUQsY0FBYyxDQUFDLElBQUk7UUFDakIsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDbEI7S0FDRjs7Ozs7SUFFRCxrQkFBa0IsQ0FBQyxJQUFJO1FBQ3JCLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDaEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7U0FDN0I7S0FDRjs7Ozs7SUFFRCxvQkFBb0IsQ0FBQyxNQUFNO1FBQ3pCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUM7S0FDakM7Ozs7O0lBRUQscUJBQXFCLENBQUMsT0FBTztRQUMzQixPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxPQUFPLElBQUksQ0FBQyxFQUFFO1lBQ25ELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUM7U0FDbkM7S0FDRjs7Ozs7SUFFRCxXQUFXLENBQUMsSUFBa0I7O1FBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBR1Q7O1FBSDlCLE1BQ0UsVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBRVg7O1FBSDlCLE1BRUUsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQ0M7O1FBSDlCLE1BR0UsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFOUIsSUFBSSxJQUFJLEtBQUssWUFBWSxDQUFDLE1BQU0sRUFBRTtZQUNoQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNEO2FBQU07WUFDTCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzNEO1FBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O1FBR3pCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3BDO1FBQ0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBQ2xCOzs7O0lBRUQsY0FBYztRQUNaLE9BQU87WUFDTCxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7WUFDdkIsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO1lBQ3ZCLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUM3QixLQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFDO1lBQ3ZGLE1BQU0sRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBQztTQUN2RSxDQUFDO0tBQ0g7Ozs7O0lBRUQsT0FBTyxnQkFBZ0IsQ0FBQyxJQUFJOztRQUMxQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQzs7UUFFdkMsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQzs7UUFDekIsSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQzs7UUFFdkMsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUM7O1FBQzFFLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxXQUFXLElBQUksT0FBTyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDOztRQUU3RSxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDOztRQUN6RCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDOztRQUU1RCxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLFNBQVMsR0FBRyxTQUFTLENBQUM7O1FBQzFDLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUU5QyxPQUFPLEVBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQztLQUN2RDtDQUNGOzs7Ozs7QUM5V0Q7Ozs7O0lBeURFLFlBQW9CLEVBQWMsRUFBVSxHQUFzQjtRQUE5QyxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQVUsUUFBRyxHQUFILEdBQUcsQ0FBbUI7aUNBdkJwQyxJQUFJLFlBQVksRUFBRTtpQ0FPbEIsSUFBSSxZQUFZLEVBQW1CO3dCQU01QyxJQUFJLFlBQVksRUFBRTsyQkFDZixJQUFJLFlBQVksRUFBRTswQkFDbkIsSUFBSSxZQUFZLEVBQUU7MkJBQ2pCLElBQUksWUFBWSxFQUFFOzRCQUNqQixJQUFJLFlBQVksRUFBRTtzQkFFMUIsSUFBSSxVQUFVLEVBQUU7S0FLaEM7Ozs7SUFFRCxRQUFROztRQUNOLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O1FBRzNCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7O1FBRzdDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUNsQixNQUFNO2FBQ0gsRUFBRSxDQUFDLFlBQVksRUFBRTtZQUNoQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQzFCLENBQUM7YUFDRCxFQUFFLENBQUMsV0FBVyxFQUFFO1lBQ2YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUMxQixDQUFDO2FBQ0QsRUFBRSxDQUFDLGFBQWEsRUFBRTtZQUNqQixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO2FBQzFCO1NBQ0YsQ0FBQzthQUNELEVBQUUsQ0FBQyxZQUFZLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUMxQixDQUFDO2FBQ0QsRUFBRSxDQUFDLHVCQUF1QixFQUFFO1lBQzNCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO2FBQzFCO1NBQ0YsQ0FBQzthQUNELEVBQUUsQ0FBQyw2Q0FBNkMsRUFBRTtZQUNqRCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDbEQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDL0MsQ0FBQyxDQUFDO0tBQ047Ozs7SUFLRCxpQkFBaUI7O1FBQ2YsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzFELElBQUksSUFBSSxDQUFDLGlCQUFpQixLQUFLLFdBQVcsRUFBRTtZQUMxQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsV0FBVyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1lBQy9CLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7Z0JBQzNDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQy9DO1lBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFDLENBQUMsQ0FBQzthQUNsRDtTQUNGO0tBQ0Y7Ozs7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN6Qjs7Ozs7O0lBS0QsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQixJQUFJLE9BQU8sV0FBUTtnQkFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDN0M7WUFDRCxJQUFJLE9BQU8sY0FBVztnQkFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzthQUMxQjtZQUNELElBQUksT0FBTyxpQkFBYztnQkFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzthQUMxQjtZQUNELElBQUksT0FBTyxxQkFBa0I7Z0JBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzthQUMxQjtZQUNELElBQUksT0FBTyx1QkFBb0I7Z0JBQzdCLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2FBQzFCO1lBQ0QsSUFBSSxPQUFPLHdCQUFxQjtnQkFDOUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7YUFDMUI7U0FDRjtLQUNGOzs7O0lBRUQsZUFBZTtRQUNiLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxTQUFTO1lBQzVDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUF3QjtnQkFDekMsSUFBSSxRQUFRLENBQUMsYUFBYSxLQUFLLGFBQWEsSUFBSSxRQUFRLENBQUMsYUFBYSxLQUFLLGNBQWMsRUFBRTtvQkFDekYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3RHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2lCQUMxQjthQUNGLENBQUMsQ0FBQztTQUNKLENBQUMsQ0FBQzs7UUFDSCxNQUFNLE1BQU0sR0FBRyxFQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFDLENBQUM7UUFDeEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDdEQ7OztZQTVJRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFFBQVEsRUFBRSxtQkFBbUI7O2FBRTlCOzs7O1lBekJDLFVBQVU7WUFGSyxpQkFBaUI7OztvQkE4Qi9CLEtBQUs7MEJBRUwsS0FBSztnQ0FDTCxNQUFNOzBCQUVOLEtBQUs7dUJBQ0wsS0FBSzswQkFDTCxLQUFLOzBCQUVMLEtBQUs7Z0NBQ0wsTUFBTTs4QkFFTixLQUFLO2dDQUNMLEtBQUs7aUNBQ0wsS0FBSzt1QkFFTCxNQUFNOzBCQUNOLE1BQU07eUJBQ04sTUFBTTswQkFDTixNQUFNOzJCQUNOLE1BQU07Ozs7Ozs7QUNuRFQ7OztZQUlDLFFBQVEsU0FBQztnQkFDTixZQUFZLEVBQUU7b0JBQ1Ysa0JBQWtCO2lCQUNyQjtnQkFDRCxPQUFPLEVBQUU7b0JBQ0wsa0JBQWtCO2lCQUNyQjthQUNKOzs7Ozs7Ozs7Ozs7Ozs7In0=