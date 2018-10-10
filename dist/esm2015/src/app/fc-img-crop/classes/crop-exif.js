/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * EXIF service is based on the exif-js library (https://github.com/jseidelin/exif-js)
 */
export class CropEXIF {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JvcC1leGlmLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctaW1nLWNyb3AvIiwic291cmNlcyI6WyJzcmMvYXBwL2ZjLWltZy1jcm9wL2NsYXNzZXMvY3JvcC1leGlmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFHQSxNQUFNOzs7Ozs7O0lBMlNKLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxhQUFhOztRQUNsRCxJQUFJLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7UUFDbEMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDOztRQUNkLElBQUksVUFBVSxDQUFnRDs7UUFBOUQsSUFBZ0IsU0FBUyxDQUFxQzs7UUFBOUQsSUFBMkIsUUFBUSxDQUEyQjs7UUFBOUQsSUFBcUMsV0FBVyxDQUFjOztRQUE5RCxJQUFrRCxXQUFXLENBQUM7O1FBQzlELElBQUksZUFBZSxHQUFHLFdBQVcsQ0FBQztRQUNsQyxPQUFPLGVBQWUsR0FBRyxXQUFXLEdBQUcsYUFBYSxFQUFFO1lBQ3BELElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsS0FBSyxJQUFJLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUNsRyxXQUFXLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELElBQUksV0FBVyxJQUFJLFFBQVEsQ0FBQyxZQUFZLEVBQUU7b0JBQ3hDLFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDbEQsV0FBVyxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUM7b0JBQzNCLFNBQVMsR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUMvQyxVQUFVLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxRQUFR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LFVBQVUsRUFBRTtRQUNWLEdBQUcsRUFBRSxLQUFLO0tBQ1g7SUFFRCxVQUFVLEVBQUU7UUFDVixHQUFHLEVBQUUsRUFBRTtRQUNQLEdBQUcsRUFBRSxHQUFHO1FBQ1IsR0FBRyxFQUFFLElBQUk7UUFDVCxHQUFHLEVBQUUsSUFBSTtRQUNULEdBQUcsRUFBRSxHQUFHO1FBQ1IsR0FBRyxFQUFFLEdBQUc7UUFDUixHQUFHLEVBQUUsR0FBRztLQUNUO0NBQ0Y7d0JBRXFCO0lBQ3BCLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxVQUFVO0lBQ2xCLE1BQU0sRUFBRSxhQUFhO0lBQ3JCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxhQUFhO0lBQ3JCLE1BQU0sRUFBRSxlQUFlO0lBQ3ZCLE1BQU0sRUFBRSxVQUFVO0lBQ2xCLE1BQU0sRUFBRSxXQUFXO0lBQ25CLE1BQU0sRUFBRSxVQUFVO0NBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBFWElGIHNlcnZpY2UgaXMgYmFzZWQgb24gdGhlIGV4aWYtanMgbGlicmFyeSAoaHR0cHM6Ly9naXRodWIuY29tL2pzZWlkZWxpbi9leGlmLWpzKVxuICovXG5leHBvcnQgY2xhc3MgQ3JvcEVYSUYge1xuXG4gIHN0YXRpYyBFeGlmVGFncyA9IHtcblxuICAgIC8vIHZlcnNpb24gdGFnc1xuICAgICcweDkwMDAnOiBcIkV4aWZWZXJzaW9uXCIsICAgICAgICAgICAgIC8vIEVYSUYgdmVyc2lvblxuICAgICcweEEwMDAnOiBcIkZsYXNocGl4VmVyc2lvblwiLCAgICAgICAgIC8vIEZsYXNocGl4IGZvcm1hdCB2ZXJzaW9uXG5cbiAgICAvLyBjb2xvcnNwYWNlIHRhZ3NcbiAgICAnMHhBMDAxJzogXCJDb2xvclNwYWNlXCIsICAgICAgICAgICAgICAvLyBDb2xvciBzcGFjZSBpbmZvcm1hdGlvbiB0YWdcblxuICAgIC8vIGltYWdlIGNvbmZpZ3VyYXRpb25cbiAgICAnMHhBMDAyJzogXCJQaXhlbFhEaW1lbnNpb25cIiwgICAgICAgICAvLyBWYWxpZCB3aWR0aCBvZiBtZWFuaW5nZnVsIGltYWdlXG4gICAgJzB4QTAwMyc6IFwiUGl4ZWxZRGltZW5zaW9uXCIsICAgICAgICAgLy8gVmFsaWQgaGVpZ2h0IG9mIG1lYW5pbmdmdWwgaW1hZ2VcbiAgICAnMHg5MTAxJzogXCJDb21wb25lbnRzQ29uZmlndXJhdGlvblwiLCAvLyBJbmZvcm1hdGlvbiBhYm91dCBjaGFubmVsc1xuICAgICcweDkxMDInOiBcIkNvbXByZXNzZWRCaXRzUGVyUGl4ZWxcIiwgIC8vIENvbXByZXNzZWQgYml0cyBwZXIgcGl4ZWxcblxuICAgIC8vIHVzZXIgaW5mb3JtYXRpb25cbiAgICAnMHg5MjdDJzogXCJNYWtlck5vdGVcIiwgICAgICAgICAgICAgICAvLyBBbnkgZGVzaXJlZCBpbmZvcm1hdGlvbiB3cml0dGVuIGJ5IHRoZSBtYW51ZmFjdHVyZXJcbiAgICAnMHg5Mjg2JzogXCJVc2VyQ29tbWVudFwiLCAgICAgICAgICAgICAvLyBDb21tZW50cyBieSB1c2VyXG5cbiAgICAvLyByZWxhdGVkIGZpbGVcbiAgICAnMHhBMDA0JzogXCJSZWxhdGVkU291bmRGaWxlXCIsICAgICAgICAvLyBOYW1lIG9mIHJlbGF0ZWQgc291bmQgZmlsZVxuXG4gICAgLy8gZGF0ZSBhbmQgdGltZVxuICAgICcweDkwMDMnOiBcIkRhdGVUaW1lT3JpZ2luYWxcIiwgICAgICAgIC8vIERhdGUgYW5kIHRpbWUgd2hlbiB0aGUgb3JpZ2luYWwgaW1hZ2Ugd2FzIGdlbmVyYXRlZFxuICAgICcweDkwMDQnOiBcIkRhdGVUaW1lRGlnaXRpemVkXCIsICAgICAgIC8vIERhdGUgYW5kIHRpbWUgd2hlbiB0aGUgaW1hZ2Ugd2FzIHN0b3JlZCBkaWdpdGFsbHlcbiAgICAnMHg5MjkwJzogXCJTdWJzZWNUaW1lXCIsICAgICAgICAgICAgICAvLyBGcmFjdGlvbnMgb2Ygc2Vjb25kcyBmb3IgRGF0ZVRpbWVcbiAgICAnMHg5MjkxJzogXCJTdWJzZWNUaW1lT3JpZ2luYWxcIiwgICAgICAvLyBGcmFjdGlvbnMgb2Ygc2Vjb25kcyBmb3IgRGF0ZVRpbWVPcmlnaW5hbFxuICAgICcweDkyOTInOiBcIlN1YnNlY1RpbWVEaWdpdGl6ZWRcIiwgICAgIC8vIEZyYWN0aW9ucyBvZiBzZWNvbmRzIGZvciBEYXRlVGltZURpZ2l0aXplZFxuXG4gICAgLy8gcGljdHVyZS10YWtpbmcgY29uZGl0aW9uc1xuICAgICcweDgyOUEnOiBcIkV4cG9zdXJlVGltZVwiLCAgICAgICAgICAgIC8vIEV4cG9zdXJlIHRpbWUgKGluIHNlY29uZHMpXG4gICAgJzB4ODI5RCc6IFwiRk51bWJlclwiLCAgICAgICAgICAgICAgICAgLy8gRiBudW1iZXJcbiAgICAnMHg4ODIyJzogXCJFeHBvc3VyZVByb2dyYW1cIiwgICAgICAgICAvLyBFeHBvc3VyZSBwcm9ncmFtXG4gICAgJzB4ODgyNCc6IFwiU3BlY3RyYWxTZW5zaXRpdml0eVwiLCAgICAgLy8gU3BlY3RyYWwgc2Vuc2l0aXZpdHlcbiAgICAnMHg4ODI3JzogXCJJU09TcGVlZFJhdGluZ3NcIiwgICAgICAgICAvLyBJU08gc3BlZWQgcmF0aW5nXG4gICAgJzB4ODgyOCc6IFwiT0VDRlwiLCAgICAgICAgICAgICAgICAgICAgLy8gT3B0b2VsZWN0cmljIGNvbnZlcnNpb24gZmFjdG9yXG4gICAgJzB4OTIwMSc6IFwiU2h1dHRlclNwZWVkVmFsdWVcIiwgICAgICAgLy8gU2h1dHRlciBzcGVlZFxuICAgICcweDkyMDInOiBcIkFwZXJ0dXJlVmFsdWVcIiwgICAgICAgICAgIC8vIExlbnMgYXBlcnR1cmVcbiAgICAnMHg5MjAzJzogXCJCcmlnaHRuZXNzVmFsdWVcIiwgICAgICAgICAvLyBWYWx1ZSBvZiBicmlnaHRuZXNzXG4gICAgJzB4OTIwNCc6IFwiRXhwb3N1cmVCaWFzXCIsICAgICAgICAgICAgLy8gRXhwb3N1cmUgYmlhc1xuICAgICcweDkyMDUnOiBcIk1heEFwZXJ0dXJlVmFsdWVcIiwgICAgICAgIC8vIFNtYWxsZXN0IEYgbnVtYmVyIG9mIGxlbnNcbiAgICAnMHg5MjA2JzogXCJTdWJqZWN0RGlzdGFuY2VcIiwgICAgICAgICAvLyBEaXN0YW5jZSB0byBzdWJqZWN0IGluIG1ldGVyc1xuICAgICcweDkyMDcnOiBcIk1ldGVyaW5nTW9kZVwiLCAgICAgICAgICAgIC8vIE1ldGVyaW5nIG1vZGVcbiAgICAnMHg5MjA4JzogXCJMaWdodFNvdXJjZVwiLCAgICAgICAgICAgICAvLyBLaW5kIG9mIGxpZ2h0IHNvdXJjZVxuICAgICcweDkyMDknOiBcIkZsYXNoXCIsICAgICAgICAgICAgICAgICAgIC8vIEZsYXNoIHN0YXR1c1xuICAgICcweDkyMTQnOiBcIlN1YmplY3RBcmVhXCIsICAgICAgICAgICAgIC8vIExvY2F0aW9uIGFuZCBhcmVhIG9mIG1haW4gc3ViamVjdFxuICAgICcweDkyMEEnOiBcIkZvY2FsTGVuZ3RoXCIsICAgICAgICAgICAgIC8vIEZvY2FsIGxlbmd0aCBvZiB0aGUgbGVucyBpbiBtbVxuICAgICcweEEyMEInOiBcIkZsYXNoRW5lcmd5XCIsICAgICAgICAgICAgIC8vIFN0cm9iZSBlbmVyZ3kgaW4gQkNQU1xuICAgICcweEEyMEMnOiBcIlNwYXRpYWxGcmVxdWVuY3lSZXNwb25zZVwiLCAgICAvL1xuICAgICcweEEyMEUnOiBcIkZvY2FsUGxhbmVYUmVzb2x1dGlvblwiLCAgIC8vIE51bWJlciBvZiBwaXhlbHMgaW4gd2lkdGggZGlyZWN0aW9uIHBlciBGb2NhbFBsYW5lUmVzb2x1dGlvblVuaXRcbiAgICAnMHhBMjBGJzogXCJGb2NhbFBsYW5lWVJlc29sdXRpb25cIiwgICAvLyBOdW1iZXIgb2YgcGl4ZWxzIGluIGhlaWdodCBkaXJlY3Rpb24gcGVyIEZvY2FsUGxhbmVSZXNvbHV0aW9uVW5pdFxuICAgICcweEEyMTAnOiBcIkZvY2FsUGxhbmVSZXNvbHV0aW9uVW5pdFwiLCAgICAvLyBVbml0IGZvciBtZWFzdXJpbmcgRm9jYWxQbGFuZVhSZXNvbHV0aW9uIGFuZCBGb2NhbFBsYW5lWVJlc29sdXRpb25cbiAgICAnMHhBMjE0JzogXCJTdWJqZWN0TG9jYXRpb25cIiwgICAgICAgICAvLyBMb2NhdGlvbiBvZiBzdWJqZWN0IGluIGltYWdlXG4gICAgJzB4QTIxNSc6IFwiRXhwb3N1cmVJbmRleFwiLCAgICAgICAgICAgLy8gRXhwb3N1cmUgaW5kZXggc2VsZWN0ZWQgb24gY2FtZXJhXG4gICAgJzB4QTIxNyc6IFwiU2Vuc2luZ01ldGhvZFwiLCAgICAgICAgICAgLy8gSW1hZ2Ugc2Vuc29yIHR5cGVcbiAgICAnMHhBMzAwJzogXCJGaWxlU291cmNlXCIsICAgICAgICAgICAgICAvLyBJbWFnZSBzb3VyY2UgKDMgPT0gRFNDKVxuICAgICcweEEzMDEnOiBcIlNjZW5lVHlwZVwiLCAgICAgICAgICAgICAgIC8vIFNjZW5lIHR5cGUgKDEgPT0gZGlyZWN0bHkgcGhvdG9ncmFwaGVkKVxuICAgICcweEEzMDInOiBcIkNGQVBhdHRlcm5cIiwgICAgICAgICAgICAgIC8vIENvbG9yIGZpbHRlciBhcnJheSBnZW9tZXRyaWMgcGF0dGVyblxuICAgICcweEE0MDEnOiBcIkN1c3RvbVJlbmRlcmVkXCIsICAgICAgICAgIC8vIFNwZWNpYWwgcHJvY2Vzc2luZ1xuICAgICcweEE0MDInOiBcIkV4cG9zdXJlTW9kZVwiLCAgICAgICAgICAgIC8vIEV4cG9zdXJlIG1vZGVcbiAgICAnMHhBNDAzJzogXCJXaGl0ZUJhbGFuY2VcIiwgICAgICAgICAgICAvLyAxID0gYXV0byB3aGl0ZSBiYWxhbmNlLCAyID0gbWFudWFsXG4gICAgJzB4QTQwNCc6IFwiRGlnaXRhbFpvb21SYXRpb25cIiwgICAgICAgLy8gRGlnaXRhbCB6b29tIHJhdGlvXG4gICAgJzB4QTQwNSc6IFwiRm9jYWxMZW5ndGhJbjM1bW1GaWxtXCIsICAgLy8gRXF1aXZhbGVudCBmb2FjbCBsZW5ndGggYXNzdW1pbmcgMzVtbSBmaWxtIGNhbWVyYSAoaW4gbW0pXG4gICAgJzB4QTQwNic6IFwiU2NlbmVDYXB0dXJlVHlwZVwiLCAgICAgICAgLy8gVHlwZSBvZiBzY2VuZVxuICAgICcweEE0MDcnOiBcIkdhaW5Db250cm9sXCIsICAgICAgICAgICAgIC8vIERlZ3JlZSBvZiBvdmVyYWxsIGltYWdlIGdhaW4gYWRqdXN0bWVudFxuICAgICcweEE0MDgnOiBcIkNvbnRyYXN0XCIsICAgICAgICAgICAgICAgIC8vIERpcmVjdGlvbiBvZiBjb250cmFzdCBwcm9jZXNzaW5nIGFwcGxpZWQgYnkgY2FtZXJhXG4gICAgJzB4QTQwOSc6IFwiU2F0dXJhdGlvblwiLCAgICAgICAgICAgICAgLy8gRGlyZWN0aW9uIG9mIHNhdHVyYXRpb24gcHJvY2Vzc2luZyBhcHBsaWVkIGJ5IGNhbWVyYVxuICAgICcweEE0MEEnOiBcIlNoYXJwbmVzc1wiLCAgICAgICAgICAgICAgIC8vIERpcmVjdGlvbiBvZiBzaGFycG5lc3MgcHJvY2Vzc2luZyBhcHBsaWVkIGJ5IGNhbWVyYVxuICAgICcweEE0MEInOiBcIkRldmljZVNldHRpbmdEZXNjcmlwdGlvblwiLCAgICAvL1xuICAgICcweEE0MEMnOiBcIlN1YmplY3REaXN0YW5jZVJhbmdlXCIsICAgIC8vIERpc3RhbmNlIHRvIHN1YmplY3RcblxuICAgIC8vIG90aGVyIHRhZ3NcbiAgICAnMHhBMDA1JzogXCJJbnRlcm9wZXJhYmlsaXR5SUZEUG9pbnRlclwiLFxuICAgICcweEE0MjAnOiBcIkltYWdlVW5pcXVlSURcIiAgICAgICAgICAgIC8vIElkZW50aWZpZXIgYXNzaWduZWQgdW5pcXVlbHkgdG8gZWFjaCBpbWFnZVxuICB9O1xuXG4gIHN0YXRpYyBUaWZmVGFncyA9IHtcbiAgICAnMHgwMTAwJzogXCJJbWFnZVdpZHRoXCIsXG4gICAgJzB4MDEwMSc6IFwiSW1hZ2VIZWlnaHRcIixcbiAgICAnMHg4NzY5JzogXCJFeGlmSUZEUG9pbnRlclwiLFxuICAgICcweDg4MjUnOiBcIkdQU0luZm9JRkRQb2ludGVyXCIsXG4gICAgJzB4QTAwNSc6IFwiSW50ZXJvcGVyYWJpbGl0eUlGRFBvaW50ZXJcIixcbiAgICAnMHgwMTAyJzogXCJCaXRzUGVyU2FtcGxlXCIsXG4gICAgJzB4MDEwMyc6IFwiQ29tcHJlc3Npb25cIixcbiAgICAnMHgwMTA2JzogXCJQaG90b21ldHJpY0ludGVycHJldGF0aW9uXCIsXG4gICAgJzB4MDExMic6IFwiT3JpZW50YXRpb25cIixcbiAgICAnMHgwMTE1JzogXCJTYW1wbGVzUGVyUGl4ZWxcIixcbiAgICAnMHgwMTFDJzogXCJQbGFuYXJDb25maWd1cmF0aW9uXCIsXG4gICAgJzB4MDIxMic6IFwiWUNiQ3JTdWJTYW1wbGluZ1wiLFxuICAgICcweDAyMTMnOiBcIllDYkNyUG9zaXRpb25pbmdcIixcbiAgICAnMHgwMTFBJzogXCJYUmVzb2x1dGlvblwiLFxuICAgICcweDAxMUInOiBcIllSZXNvbHV0aW9uXCIsXG4gICAgJzB4MDEyOCc6IFwiUmVzb2x1dGlvblVuaXRcIixcbiAgICAnMHgwMTExJzogXCJTdHJpcE9mZnNldHNcIixcbiAgICAnMHgwMTE2JzogXCJSb3dzUGVyU3RyaXBcIixcbiAgICAnMHgwMTE3JzogXCJTdHJpcEJ5dGVDb3VudHNcIixcbiAgICAnMHgwMjAxJzogXCJKUEVHSW50ZXJjaGFuZ2VGb3JtYXRcIixcbiAgICAnMHgwMjAyJzogXCJKUEVHSW50ZXJjaGFuZ2VGb3JtYXRMZW5ndGhcIixcbiAgICAnMHgwMTJEJzogXCJUcmFuc2ZlckZ1bmN0aW9uXCIsXG4gICAgJzB4MDEzRSc6IFwiV2hpdGVQb2ludFwiLFxuICAgICcweDAxM0YnOiBcIlByaW1hcnlDaHJvbWF0aWNpdGllc1wiLFxuICAgICcweDAyMTEnOiBcIllDYkNyQ29lZmZpY2llbnRzXCIsXG4gICAgJzB4MDIxNCc6IFwiUmVmZXJlbmNlQmxhY2tXaGl0ZVwiLFxuICAgICcweDAxMzInOiBcIkRhdGVUaW1lXCIsXG4gICAgJzB4MDEwRSc6IFwiSW1hZ2VEZXNjcmlwdGlvblwiLFxuICAgICcweDAxMEYnOiBcIk1ha2VcIixcbiAgICAnMHgwMTEwJzogXCJNb2RlbFwiLFxuICAgICcweDAxMzEnOiBcIlNvZnR3YXJlXCIsXG4gICAgJzB4MDEzQic6IFwiQXJ0aXN0XCIsXG4gICAgJzB4ODI5OCc6IFwiQ29weXJpZ2h0XCJcbiAgfTtcblxuICBzdGF0aWMgR1BTVGFncyA9IHtcbiAgICAnMHgwMDAwJzogXCJHUFNWZXJzaW9uSURcIixcbiAgICAnMHgwMDAxJzogXCJHUFNMYXRpdHVkZVJlZlwiLFxuICAgICcweDAwMDInOiBcIkdQU0xhdGl0dWRlXCIsXG4gICAgJzB4MDAwMyc6IFwiR1BTTG9uZ2l0dWRlUmVmXCIsXG4gICAgJzB4MDAwNCc6IFwiR1BTTG9uZ2l0dWRlXCIsXG4gICAgJzB4MDAwNSc6IFwiR1BTQWx0aXR1ZGVSZWZcIixcbiAgICAnMHgwMDA2JzogXCJHUFNBbHRpdHVkZVwiLFxuICAgICcweDAwMDcnOiBcIkdQU1RpbWVTdGFtcFwiLFxuICAgICcweDAwMDgnOiBcIkdQU1NhdGVsbGl0ZXNcIixcbiAgICAnMHgwMDA5JzogXCJHUFNTdGF0dXNcIixcbiAgICAnMHgwMDBBJzogXCJHUFNNZWFzdXJlTW9kZVwiLFxuICAgICcweDAwMEInOiBcIkdQU0RPUFwiLFxuICAgICcweDAwMEMnOiBcIkdQU1NwZWVkUmVmXCIsXG4gICAgJzB4MDAwRCc6IFwiR1BTU3BlZWRcIixcbiAgICAnMHgwMDBFJzogXCJHUFNUcmFja1JlZlwiLFxuICAgICcweDAwMEYnOiBcIkdQU1RyYWNrXCIsXG4gICAgJzB4MDAxMCc6IFwiR1BTSW1nRGlyZWN0aW9uUmVmXCIsXG4gICAgJzB4MDAxMSc6IFwiR1BTSW1nRGlyZWN0aW9uXCIsXG4gICAgJzB4MDAxMic6IFwiR1BTTWFwRGF0dW1cIixcbiAgICAnMHgwMDEzJzogXCJHUFNEZXN0TGF0aXR1ZGVSZWZcIixcbiAgICAnMHgwMDE0JzogXCJHUFNEZXN0TGF0aXR1ZGVcIixcbiAgICAnMHgwMDE1JzogXCJHUFNEZXN0TG9uZ2l0dWRlUmVmXCIsXG4gICAgJzB4MDAxNic6IFwiR1BTRGVzdExvbmdpdHVkZVwiLFxuICAgICcweDAwMTcnOiBcIkdQU0Rlc3RCZWFyaW5nUmVmXCIsXG4gICAgJzB4MDAxOCc6IFwiR1BTRGVzdEJlYXJpbmdcIixcbiAgICAnMHgwMDE5JzogXCJHUFNEZXN0RGlzdGFuY2VSZWZcIixcbiAgICAnMHgwMDFBJzogXCJHUFNEZXN0RGlzdGFuY2VcIixcbiAgICAnMHgwMDFCJzogXCJHUFNQcm9jZXNzaW5nTWV0aG9kXCIsXG4gICAgJzB4MDAxQyc6IFwiR1BTQXJlYUluZm9ybWF0aW9uXCIsXG4gICAgJzB4MDAxRCc6IFwiR1BTRGF0ZVN0YW1wXCIsXG4gICAgJzB4MDAxRSc6IFwiR1BTRGlmZmVyZW50aWFsXCJcbiAgfTtcblxuICBzdGF0aWMgU3RyaW5nVmFsdWVzID0ge1xuICAgIEV4cG9zdXJlUHJvZ3JhbToge1xuICAgICAgJzAnOiBcIk5vdCBkZWZpbmVkXCIsXG4gICAgICAnMSc6IFwiTWFudWFsXCIsXG4gICAgICAnMic6IFwiTm9ybWFsIHByb2dyYW1cIixcbiAgICAgICczJzogXCJBcGVydHVyZSBwcmlvcml0eVwiLFxuICAgICAgJzQnOiBcIlNodXR0ZXIgcHJpb3JpdHlcIixcbiAgICAgICc1JzogXCJDcmVhdGl2ZSBwcm9ncmFtXCIsXG4gICAgICAnNic6IFwiQWN0aW9uIHByb2dyYW1cIixcbiAgICAgICc3JzogXCJQb3J0cmFpdCBtb2RlXCIsXG4gICAgICAnOCc6IFwiTGFuZHNjYXBlIG1vZGVcIlxuICAgIH0sXG4gICAgTWV0ZXJpbmdNb2RlOiB7XG4gICAgICAnMCc6IFwiVW5rbm93blwiLFxuICAgICAgJzEnOiBcIkF2ZXJhZ2VcIixcbiAgICAgICcyJzogXCJDZW50ZXJXZWlnaHRlZEF2ZXJhZ2VcIixcbiAgICAgICczJzogXCJTcG90XCIsXG4gICAgICAnNCc6IFwiTXVsdGlTcG90XCIsXG4gICAgICAnNSc6IFwiUGF0dGVyblwiLFxuICAgICAgJzYnOiBcIlBhcnRpYWxcIixcbiAgICAgICcyNTUnOiBcIk90aGVyXCJcbiAgICB9LFxuICAgIExpZ2h0U291cmNlOiB7XG4gICAgICAnMCc6IFwiVW5rbm93blwiLFxuICAgICAgJzEnOiBcIkRheWxpZ2h0XCIsXG4gICAgICAnMic6IFwiRmx1b3Jlc2NlbnRcIixcbiAgICAgICczJzogXCJUdW5nc3RlbiAoaW5jYW5kZXNjZW50IGxpZ2h0KVwiLFxuICAgICAgJzQnOiBcIkZsYXNoXCIsXG4gICAgICAnOSc6IFwiRmluZSB3ZWF0aGVyXCIsXG4gICAgICAnMTAnOiBcIkNsb3VkeSB3ZWF0aGVyXCIsXG4gICAgICAnMTEnOiBcIlNoYWRlXCIsXG4gICAgICAnMTInOiBcIkRheWxpZ2h0IGZsdW9yZXNjZW50IChEIDU3MDAgLSA3MTAwSylcIixcbiAgICAgICcxMyc6IFwiRGF5IHdoaXRlIGZsdW9yZXNjZW50IChOIDQ2MDAgLSA1NDAwSylcIixcbiAgICAgICcxNCc6IFwiQ29vbCB3aGl0ZSBmbHVvcmVzY2VudCAoVyAzOTAwIC0gNDUwMEspXCIsXG4gICAgICAnMTUnOiBcIldoaXRlIGZsdW9yZXNjZW50IChXVyAzMjAwIC0gMzcwMEspXCIsXG4gICAgICAnMTcnOiBcIlN0YW5kYXJkIGxpZ2h0IEFcIixcbiAgICAgICcxOCc6IFwiU3RhbmRhcmQgbGlnaHQgQlwiLFxuICAgICAgJzE5JzogXCJTdGFuZGFyZCBsaWdodCBDXCIsXG4gICAgICAnMjAnOiBcIkQ1NVwiLFxuICAgICAgJzIxJzogXCJENjVcIixcbiAgICAgICcyMic6IFwiRDc1XCIsXG4gICAgICAnMjMnOiBcIkQ1MFwiLFxuICAgICAgJzI0JzogXCJJU08gc3R1ZGlvIHR1bmdzdGVuXCIsXG4gICAgICAnMjU1JzogXCJPdGhlclwiXG4gICAgfSxcbiAgICBGbGFzaDoge1xuICAgICAgJzB4MDAwMCc6IFwiRmxhc2ggZGlkIG5vdCBmaXJlXCIsXG4gICAgICAnMHgwMDAxJzogXCJGbGFzaCBmaXJlZFwiLFxuICAgICAgJzB4MDAwNSc6IFwiU3Ryb2JlIHJldHVybiBsaWdodCBub3QgZGV0ZWN0ZWRcIixcbiAgICAgICcweDAwMDcnOiBcIlN0cm9iZSByZXR1cm4gbGlnaHQgZGV0ZWN0ZWRcIixcbiAgICAgICcweDAwMDknOiBcIkZsYXNoIGZpcmVkLCBjb21wdWxzb3J5IGZsYXNoIG1vZGVcIixcbiAgICAgICcweDAwMEQnOiBcIkZsYXNoIGZpcmVkLCBjb21wdWxzb3J5IGZsYXNoIG1vZGUsIHJldHVybiBsaWdodCBub3QgZGV0ZWN0ZWRcIixcbiAgICAgICcweDAwMEYnOiBcIkZsYXNoIGZpcmVkLCBjb21wdWxzb3J5IGZsYXNoIG1vZGUsIHJldHVybiBsaWdodCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDAxMCc6IFwiRmxhc2ggZGlkIG5vdCBmaXJlLCBjb21wdWxzb3J5IGZsYXNoIG1vZGVcIixcbiAgICAgICcweDAwMTgnOiBcIkZsYXNoIGRpZCBub3QgZmlyZSwgYXV0byBtb2RlXCIsXG4gICAgICAnMHgwMDE5JzogXCJGbGFzaCBmaXJlZCwgYXV0byBtb2RlXCIsXG4gICAgICAnMHgwMDFEJzogXCJGbGFzaCBmaXJlZCwgYXV0byBtb2RlLCByZXR1cm4gbGlnaHQgbm90IGRldGVjdGVkXCIsXG4gICAgICAnMHgwMDFGJzogXCJGbGFzaCBmaXJlZCwgYXV0byBtb2RlLCByZXR1cm4gbGlnaHQgZGV0ZWN0ZWRcIixcbiAgICAgICcweDAwMjAnOiBcIk5vIGZsYXNoIGZ1bmN0aW9uXCIsXG4gICAgICAnMHgwMDQxJzogXCJGbGFzaCBmaXJlZCwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZVwiLFxuICAgICAgJzB4MDA0NSc6IFwiRmxhc2ggZmlyZWQsIHJlZC1leWUgcmVkdWN0aW9uIG1vZGUsIHJldHVybiBsaWdodCBub3QgZGV0ZWN0ZWRcIixcbiAgICAgICcweDAwNDcnOiBcIkZsYXNoIGZpcmVkLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlLCByZXR1cm4gbGlnaHQgZGV0ZWN0ZWRcIixcbiAgICAgICcweDAwNDknOiBcIkZsYXNoIGZpcmVkLCBjb21wdWxzb3J5IGZsYXNoIG1vZGUsIHJlZC1leWUgcmVkdWN0aW9uIG1vZGVcIixcbiAgICAgICcweDAwNEQnOiBcIkZsYXNoIGZpcmVkLCBjb21wdWxzb3J5IGZsYXNoIG1vZGUsIHJlZC1leWUgcmVkdWN0aW9uIG1vZGUsIHJldHVybiBsaWdodCBub3QgZGV0ZWN0ZWRcIixcbiAgICAgICcweDAwNEYnOiBcIkZsYXNoIGZpcmVkLCBjb21wdWxzb3J5IGZsYXNoIG1vZGUsIHJlZC1leWUgcmVkdWN0aW9uIG1vZGUsIHJldHVybiBsaWdodCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDA1OSc6IFwiRmxhc2ggZmlyZWQsIGF1dG8gbW9kZSwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZVwiLFxuICAgICAgJzB4MDA1RCc6IFwiRmxhc2ggZmlyZWQsIGF1dG8gbW9kZSwgcmV0dXJuIGxpZ2h0IG5vdCBkZXRlY3RlZCwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZVwiLFxuICAgICAgJzB4MDA1Ric6IFwiRmxhc2ggZmlyZWQsIGF1dG8gbW9kZSwgcmV0dXJuIGxpZ2h0IGRldGVjdGVkLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlXCJcbiAgICB9LFxuICAgIFNlbnNpbmdNZXRob2Q6IHtcbiAgICAgICcxJzogXCJOb3QgZGVmaW5lZFwiLFxuICAgICAgJzInOiBcIk9uZS1jaGlwIGNvbG9yIGFyZWEgc2Vuc29yXCIsXG4gICAgICAnMyc6IFwiVHdvLWNoaXAgY29sb3IgYXJlYSBzZW5zb3JcIixcbiAgICAgICc0JzogXCJUaHJlZS1jaGlwIGNvbG9yIGFyZWEgc2Vuc29yXCIsXG4gICAgICAnNSc6IFwiQ29sb3Igc2VxdWVudGlhbCBhcmVhIHNlbnNvclwiLFxuICAgICAgJzcnOiBcIlRyaWxpbmVhciBzZW5zb3JcIixcbiAgICAgICc4JzogXCJDb2xvciBzZXF1ZW50aWFsIGxpbmVhciBzZW5zb3JcIlxuICAgIH0sXG4gICAgU2NlbmVDYXB0dXJlVHlwZToge1xuICAgICAgJzAnOiBcIlN0YW5kYXJkXCIsXG4gICAgICAnMSc6IFwiTGFuZHNjYXBlXCIsXG4gICAgICAnMic6IFwiUG9ydHJhaXRcIixcbiAgICAgICczJzogXCJOaWdodCBzY2VuZVwiXG4gICAgfSxcbiAgICBTY2VuZVR5cGU6IHtcbiAgICAgICcxJzogXCJEaXJlY3RseSBwaG90b2dyYXBoZWRcIlxuICAgIH0sXG4gICAgQ3VzdG9tUmVuZGVyZWQ6IHtcbiAgICAgICcwJzogXCJOb3JtYWwgcHJvY2Vzc1wiLFxuICAgICAgJzEnOiBcIkN1c3RvbSBwcm9jZXNzXCJcbiAgICB9LFxuICAgIFdoaXRlQmFsYW5jZToge1xuICAgICAgJzAnOiBcIkF1dG8gd2hpdGUgYmFsYW5jZVwiLFxuICAgICAgJzEnOiBcIk1hbnVhbCB3aGl0ZSBiYWxhbmNlXCJcbiAgICB9LFxuICAgIEdhaW5Db250cm9sOiB7XG4gICAgICAnMCc6IFwiTm9uZVwiLFxuICAgICAgJzEnOiBcIkxvdyBnYWluIHVwXCIsXG4gICAgICAnMic6IFwiSGlnaCBnYWluIHVwXCIsXG4gICAgICAnMyc6IFwiTG93IGdhaW4gZG93blwiLFxuICAgICAgJzQnOiBcIkhpZ2ggZ2FpbiBkb3duXCJcbiAgICB9LFxuICAgIENvbnRyYXN0OiB7XG4gICAgICAnMCc6IFwiTm9ybWFsXCIsXG4gICAgICAnMSc6IFwiU29mdFwiLFxuICAgICAgJzInOiBcIkhhcmRcIlxuICAgIH0sXG4gICAgU2F0dXJhdGlvbjoge1xuICAgICAgJzAnOiBcIk5vcm1hbFwiLFxuICAgICAgJzEnOiBcIkxvdyBzYXR1cmF0aW9uXCIsXG4gICAgICAnMic6IFwiSGlnaCBzYXR1cmF0aW9uXCJcbiAgICB9LFxuICAgIFNoYXJwbmVzczoge1xuICAgICAgJzAnOiBcIk5vcm1hbFwiLFxuICAgICAgJzEnOiBcIlNvZnRcIixcbiAgICAgICcyJzogXCJIYXJkXCJcbiAgICB9LFxuICAgIFN1YmplY3REaXN0YW5jZVJhbmdlOiB7XG4gICAgICAnMCc6IFwiVW5rbm93blwiLFxuICAgICAgJzEnOiBcIk1hY3JvXCIsXG4gICAgICAnMic6IFwiQ2xvc2Ugdmlld1wiLFxuICAgICAgJzMnOiBcIkRpc3RhbnQgdmlld1wiXG4gICAgfSxcbiAgICBGaWxlU291cmNlOiB7XG4gICAgICAnMyc6IFwiRFNDXCJcbiAgICB9LFxuXG4gICAgQ29tcG9uZW50czoge1xuICAgICAgJzAnOiBcIlwiLFxuICAgICAgJzEnOiBcIllcIixcbiAgICAgICcyJzogXCJDYlwiLFxuICAgICAgJzMnOiBcIkNyXCIsXG4gICAgICAnNCc6IFwiUlwiLFxuICAgICAgJzUnOiBcIkdcIixcbiAgICAgICc2JzogXCJCXCJcbiAgICB9XG4gIH07XG5cbiAgc3RhdGljIElwdGNGaWVsZE1hcCA9IHtcbiAgICAnMHg3OCc6ICdjYXB0aW9uJyxcbiAgICAnMHg2RSc6ICdjcmVkaXQnLFxuICAgICcweDE5JzogJ2tleXdvcmRzJyxcbiAgICAnMHgzNyc6ICdkYXRlQ3JlYXRlZCcsXG4gICAgJzB4NTAnOiAnYnlsaW5lJyxcbiAgICAnMHg1NSc6ICdieWxpbmVUaXRsZScsXG4gICAgJzB4N0EnOiAnY2FwdGlvbldyaXRlcicsXG4gICAgJzB4NjknOiAnaGVhZGxpbmUnLFxuICAgICcweDc0JzogJ2NvcHlyaWdodCcsXG4gICAgJzB4MEYnOiAnY2F0ZWdvcnknXG4gIH07XG5cbiAgc3RhdGljIHJlYWRJUFRDRGF0YShmaWxlLCBzdGFydE9mZnNldCwgc2VjdGlvbkxlbmd0aCkge1xuICAgIHZhciBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhmaWxlKTtcbiAgICB2YXIgZGF0YSA9IHt9O1xuICAgIHZhciBmaWVsZFZhbHVlLCBmaWVsZE5hbWUsIGRhdGFTaXplLCBzZWdtZW50VHlwZSwgc2VnbWVudFNpemU7XG4gICAgdmFyIHNlZ21lbnRTdGFydFBvcyA9IHN0YXJ0T2Zmc2V0O1xuICAgIHdoaWxlIChzZWdtZW50U3RhcnRQb3MgPCBzdGFydE9mZnNldCArIHNlY3Rpb25MZW5ndGgpIHtcbiAgICAgIGlmIChkYXRhVmlldy5nZXRVaW50OChzZWdtZW50U3RhcnRQb3MpID09PSAweDFDICYmIGRhdGFWaWV3LmdldFVpbnQ4KHNlZ21lbnRTdGFydFBvcyArIDEpID09PSAweDAyKSB7XG4gICAgICAgIHNlZ21lbnRUeXBlID0gZGF0YVZpZXcuZ2V0VWludDgoc2VnbWVudFN0YXJ0UG9zICsgMik7XG4gICAgICAgIGlmIChzZWdtZW50VHlwZSBpbiBDcm9wRVhJRi5JcHRjRmllbGRNYXApIHtcbiAgICAgICAgICBkYXRhU2l6ZSA9IGRhdGFWaWV3LmdldEludDE2KHNlZ21lbnRTdGFydFBvcyArIDMpO1xuICAgICAgICAgIHNlZ21lbnRTaXplID0gZGF0YVNpemUgKyA1O1xuICAgICAgICAgIGZpZWxkTmFtZSA9IENyb3BFWElGLklwdGNGaWVsZE1hcFtzZWdtZW50VHlwZV07XG4gICAgICAgICAgZmllbGRWYWx1ZSA9IENyb3BFWElGLmdldFN0cmluZ0Zyb21EQihkYXRhVmlldywgc2VnbWVudFN0YXJ0UG9zICsgNSwgZGF0YVNpemUpO1xuICAgICAgICAgIC8vIENoZWNrIGlmIHdlIGFscmVhZHkgc3RvcmVkIGEgdmFsdWUgd2l0aCB0aGlzIG5hbWVcbiAgICAgICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShmaWVsZE5hbWUpKSB7XG4gICAgICAgICAgICAvLyBWYWx1ZSBhbHJlYWR5IHN0b3JlZCB3aXRoIHRoaXMgbmFtZSwgY3JlYXRlIG11bHRpdmFsdWUgZmllbGRcbiAgICAgICAgICAgIGlmIChkYXRhW2ZpZWxkTmFtZV0gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICBkYXRhW2ZpZWxkTmFtZV0ucHVzaChmaWVsZFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBkYXRhW2ZpZWxkTmFtZV0gPSBbZGF0YVtmaWVsZE5hbWVdLCBmaWVsZFZhbHVlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkYXRhW2ZpZWxkTmFtZV0gPSBmaWVsZFZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgICBzZWdtZW50U3RhcnRQb3MrKztcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBzdGF0aWMgcmVhZFRhZ3MoZmlsZSwgdGlmZlN0YXJ0LCBkaXJTdGFydCwgc3RyaW5ncywgYmlnRW5kKTogeyBba2V5OiBzdHJpbmddOiBhbnkgfSB7XG4gICAgdmFyIGVudHJpZXMgPSBmaWxlLmdldFVpbnQxNihkaXJTdGFydCwgIWJpZ0VuZCksXG4gICAgICB0YWdzID0ge30sXG4gICAgICBlbnRyeU9mZnNldCwgdGFnLFxuICAgICAgaTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBlbnRyaWVzOyBpKyspIHtcbiAgICAgIGVudHJ5T2Zmc2V0ID0gZGlyU3RhcnQgKyBpICogMTIgKyAyO1xuICAgICAgdGFnID0gc3RyaW5nc1tmaWxlLmdldFVpbnQxNihlbnRyeU9mZnNldCwgIWJpZ0VuZCldO1xuICAgICAgaWYgKHRhZykge1xuICAgICAgICB0YWdzW3RhZ10gPSBDcm9wRVhJRi5yZWFkVGFnVmFsdWUoZmlsZSwgZW50cnlPZmZzZXQsIHRpZmZTdGFydCwgZGlyU3RhcnQsIGJpZ0VuZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLndhcm4oJ1Vua25vd24gdGFnOiAnICsgZmlsZS5nZXRVaW50MTYoZW50cnlPZmZzZXQsICFiaWdFbmQpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhZ3M7XG4gIH1cblxuICBzdGF0aWMgcmVhZFRhZ1ZhbHVlKGZpbGUsIGVudHJ5T2Zmc2V0LCB0aWZmU3RhcnQsIGRpclN0YXJ0LCBiaWdFbmQpIHtcbiAgICB2YXIgdHlwZSA9IGZpbGUuZ2V0VWludDE2KGVudHJ5T2Zmc2V0ICsgMiwgIWJpZ0VuZCksXG4gICAgICBudW1WYWx1ZXMgPSBmaWxlLmdldFVpbnQzMihlbnRyeU9mZnNldCArIDQsICFiaWdFbmQpLFxuICAgICAgdmFsdWVPZmZzZXQgPSBmaWxlLmdldFVpbnQzMihlbnRyeU9mZnNldCArIDgsICFiaWdFbmQpICsgdGlmZlN0YXJ0LFxuICAgICAgb2Zmc2V0LFxuICAgICAgdmFscywgdmFsLCBuLFxuICAgICAgbnVtZXJhdG9yLCBkZW5vbWluYXRvcjtcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnMSc6IC8vIGJ5dGUsIDgtYml0IHVuc2lnbmVkIGludFxuICAgICAgY2FzZSAnNyc6IC8vIHVuZGVmaW5lZCwgOC1iaXQgYnl0ZSwgdmFsdWUgZGVwZW5kaW5nIG9uIGZpZWxkXG4gICAgICAgIGlmIChudW1WYWx1ZXMgPT0gMSkge1xuICAgICAgICAgIHJldHVybiBmaWxlLmdldFVpbnQ4KGVudHJ5T2Zmc2V0ICsgOCwgIWJpZ0VuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2Zmc2V0ID0gbnVtVmFsdWVzID4gNCA/IHZhbHVlT2Zmc2V0IDogKGVudHJ5T2Zmc2V0ICsgOCk7XG4gICAgICAgICAgdmFscyA9IFtdO1xuICAgICAgICAgIGZvciAobiA9IDA7IG4gPCBudW1WYWx1ZXM7IG4rKykge1xuICAgICAgICAgICAgdmFsc1tuXSA9IGZpbGUuZ2V0VWludDgob2Zmc2V0ICsgbik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB2YWxzO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgJzInOiAvLyBhc2NpaSwgOC1iaXQgYnl0ZVxuICAgICAgICBvZmZzZXQgPSBudW1WYWx1ZXMgPiA0ID8gdmFsdWVPZmZzZXQgOiAoZW50cnlPZmZzZXQgKyA4KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RyaW5nRnJvbURCKGZpbGUsIG9mZnNldCwgbnVtVmFsdWVzIC0gMSk7XG5cbiAgICAgIGNhc2UgJzMnOiAvLyBzaG9ydCwgMTYgYml0IGludFxuICAgICAgICBpZiAobnVtVmFsdWVzID09IDEpIHtcbiAgICAgICAgICByZXR1cm4gZmlsZS5nZXRVaW50MTYoZW50cnlPZmZzZXQgKyA4LCAhYmlnRW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvZmZzZXQgPSBudW1WYWx1ZXMgPiAyID8gdmFsdWVPZmZzZXQgOiAoZW50cnlPZmZzZXQgKyA4KTtcbiAgICAgICAgICB2YWxzID0gW107XG4gICAgICAgICAgZm9yIChuID0gMDsgbiA8IG51bVZhbHVlczsgbisrKSB7XG4gICAgICAgICAgICB2YWxzW25dID0gZmlsZS5nZXRVaW50MTYob2Zmc2V0ICsgMiAqIG4sICFiaWdFbmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdmFscztcbiAgICAgICAgfVxuXG4gICAgICBjYXNlICc0JzogLy8gbG9uZywgMzIgYml0IGludFxuICAgICAgICBpZiAobnVtVmFsdWVzID09IDEpIHtcbiAgICAgICAgICByZXR1cm4gZmlsZS5nZXRVaW50MzIoZW50cnlPZmZzZXQgKyA4LCAhYmlnRW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWxzID0gW107XG4gICAgICAgICAgZm9yIChuID0gMDsgbiA8IG51bVZhbHVlczsgbisrKSB7XG4gICAgICAgICAgICB2YWxzW25dID0gZmlsZS5nZXRVaW50MzIodmFsdWVPZmZzZXQgKyA0ICogbiwgIWJpZ0VuZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB2YWxzO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgJzUnOiAgICAvLyByYXRpb25hbCA9IHR3byBsb25nIHZhbHVlcywgZmlyc3QgaXMgbnVtZXJhdG9yLCBzZWNvbmQgaXMgZGVub21pbmF0b3JcbiAgICAgICAgaWYgKG51bVZhbHVlcyA9PSAxKSB7XG4gICAgICAgICAgbnVtZXJhdG9yID0gZmlsZS5nZXRVaW50MzIodmFsdWVPZmZzZXQsICFiaWdFbmQpO1xuICAgICAgICAgIGRlbm9taW5hdG9yID0gZmlsZS5nZXRVaW50MzIodmFsdWVPZmZzZXQgKyA0LCAhYmlnRW5kKTtcbiAgICAgICAgICB2YWwgPSBuZXcgTnVtYmVyKG51bWVyYXRvciAvIGRlbm9taW5hdG9yKTtcbiAgICAgICAgICB2YWwubnVtZXJhdG9yID0gbnVtZXJhdG9yO1xuICAgICAgICAgIHZhbC5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuICAgICAgICAgIHJldHVybiB2YWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFscyA9IFtdO1xuICAgICAgICAgIGZvciAobiA9IDA7IG4gPCBudW1WYWx1ZXM7IG4rKykge1xuICAgICAgICAgICAgbnVtZXJhdG9yID0gZmlsZS5nZXRVaW50MzIodmFsdWVPZmZzZXQgKyA4ICogbiwgIWJpZ0VuZCk7XG4gICAgICAgICAgICBkZW5vbWluYXRvciA9IGZpbGUuZ2V0VWludDMyKHZhbHVlT2Zmc2V0ICsgNCArIDggKiBuLCAhYmlnRW5kKTtcbiAgICAgICAgICAgIHZhbHNbbl0gPSBuZXcgTnVtYmVyKG51bWVyYXRvciAvIGRlbm9taW5hdG9yKTtcbiAgICAgICAgICAgIHZhbHNbbl0ubnVtZXJhdG9yID0gbnVtZXJhdG9yO1xuICAgICAgICAgICAgdmFsc1tuXS5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdmFscztcbiAgICAgICAgfVxuXG4gICAgICBjYXNlICc5JzogLy8gc2xvbmcsIDMyIGJpdCBzaWduZWQgaW50XG4gICAgICAgIGlmIChudW1WYWx1ZXMgPT0gMSkge1xuICAgICAgICAgIHJldHVybiBmaWxlLmdldEludDMyKGVudHJ5T2Zmc2V0ICsgOCwgIWJpZ0VuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFscyA9IFtdO1xuICAgICAgICAgIGZvciAobiA9IDA7IG4gPCBudW1WYWx1ZXM7IG4rKykge1xuICAgICAgICAgICAgdmFsc1tuXSA9IGZpbGUuZ2V0SW50MzIodmFsdWVPZmZzZXQgKyA0ICogbiwgIWJpZ0VuZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB2YWxzO1xuICAgICAgICB9XG5cbiAgICAgIGNhc2UgJzEwJzogLy8gc2lnbmVkIHJhdGlvbmFsLCB0d28gc2xvbmdzLCBmaXJzdCBpcyBudW1lcmF0b3IsIHNlY29uZCBpcyBkZW5vbWluYXRvclxuICAgICAgICBpZiAobnVtVmFsdWVzID09IDEpIHtcbiAgICAgICAgICByZXR1cm4gZmlsZS5nZXRJbnQzMih2YWx1ZU9mZnNldCwgIWJpZ0VuZCkgLyBmaWxlLmdldEludDMyKHZhbHVlT2Zmc2V0ICsgNCwgIWJpZ0VuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFscyA9IFtdO1xuICAgICAgICAgIGZvciAobiA9IDA7IG4gPCBudW1WYWx1ZXM7IG4rKykge1xuICAgICAgICAgICAgdmFsc1tuXSA9IGZpbGUuZ2V0SW50MzIodmFsdWVPZmZzZXQgKyA4ICogbiwgIWJpZ0VuZCkgLyBmaWxlLmdldEludDMyKHZhbHVlT2Zmc2V0ICsgNCArIDggKiBuLCAhYmlnRW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHM7XG4gICAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdGF0aWMgYWRkRXZlbnQoZWxlbWVudCwgZXZlbnQsIGhhbmRsZXIpIHtcbiAgICBpZiAoZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQuYXR0YWNoRXZlbnQpIHtcbiAgICAgIGVsZW1lbnQuYXR0YWNoRXZlbnQoXCJvblwiICsgZXZlbnQsIGhhbmRsZXIpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBvYmplY3RVUkxUb0Jsb2IodXJsLCBjYWxsYmFjaykge1xuICAgIHZhciBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgaHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgaHR0cC5yZXNwb25zZVR5cGUgPSBcImJsb2JcIjtcbiAgICBodHRwLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAodGhpcy5zdGF0dXMgPT0gMjAwIHx8IHRoaXMuc3RhdHVzID09PSAwKSB7XG4gICAgICAgIGNhbGxiYWNrKHRoaXMucmVzcG9uc2UpO1xuICAgICAgfVxuICAgIH07XG4gICAgaHR0cC5zZW5kKCk7XG4gIH1cblxuICBzdGF0aWMgaGFuZGxlQmluYXJ5RmlsZShiaW5GaWxlLCBpbWcsIGNhbGxiYWNrPykge1xuICAgIHZhciBkYXRhID0gQ3JvcEVYSUYuZmluZEVYSUZpbkpQRUcoYmluRmlsZSk7XG4gICAgdmFyIGlwdGNkYXRhID0gQ3JvcEVYSUYuZmluZElQVENpbkpQRUcoYmluRmlsZSk7XG4gICAgaW1nLmV4aWZkYXRhID0gZGF0YSB8fCB7fTtcbiAgICBpbWcuaXB0Y2RhdGEgPSBpcHRjZGF0YSB8fCB7fTtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwoaW1nKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZ2V0SW1hZ2VEYXRhKGltZywgY2FsbGJhY2spIHtcbiAgICBpZiAoaW1nLnNyYykge1xuICAgICAgaWYgKC9eZGF0YVxcOi9pLnRlc3QoaW1nLnNyYykpIHsgLy8gRGF0YSBVUklcbiAgICAgICAgdmFyIGFycmF5QnVmZmVyID0gQ3JvcEVYSUYuYmFzZTY0VG9BcnJheUJ1ZmZlcihpbWcuc3JjKTtcbiAgICAgICAgdGhpcy5oYW5kbGVCaW5hcnlGaWxlKGFycmF5QnVmZmVyLCBpbWcsIGNhbGxiYWNrKTtcblxuICAgICAgfSBlbHNlIGlmICgvXmJsb2JcXDovaS50ZXN0KGltZy5zcmMpKSB7IC8vIE9iamVjdCBVUkxcbiAgICAgICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IChlKSA9PiB7XG4gICAgICAgICAgdGhpcy5oYW5kbGVCaW5hcnlGaWxlKGUudGFyZ2V0LnJlc3VsdCwgaW1nLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgICAgIENyb3BFWElGLm9iamVjdFVSTFRvQmxvYihpbWcuc3JjLCBmdW5jdGlvbiAoYmxvYikge1xuICAgICAgICAgIGZpbGVSZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYik7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIGh0dHAub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PSAyMDAgfHwgdGhpcy5zdGF0dXMgPT09IDApIHtcbiAgICAgICAgICAgIHNlbGYuaGFuZGxlQmluYXJ5RmlsZShodHRwLnJlc3BvbnNlLCBpbWcsIGNhbGxiYWNrKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgbG9hZCBpbWFnZVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBodHRwID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgaHR0cC5vcGVuKFwiR0VUXCIsIGltZy5zcmMsIHRydWUpO1xuICAgICAgICBodHRwLnJlc3BvbnNlVHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcbiAgICAgICAgaHR0cC5zZW5kKG51bGwpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoRmlsZVJlYWRlciAmJiAoaW1nIGluc3RhbmNlb2Ygd2luZG93LkJsb2IgfHwgaW1nIGluc3RhbmNlb2YgRmlsZSkpIHtcbiAgICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gZSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ2dldEltYWdlRGF0YTogR290IGZpbGUgb2YgbGVuZ3RoICVvJywgZS50YXJnZXQucmVzdWx0LmJ5dGVMZW5ndGgpO1xuICAgICAgICB0aGlzLmhhbmRsZUJpbmFyeUZpbGUoZS50YXJnZXQucmVzdWx0LCBpbWcsIGNhbGxiYWNrKTtcbiAgICAgIH07XG5cbiAgICAgIGZpbGVSZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoaW1nKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZ2V0U3RyaW5nRnJvbURCKGJ1ZmZlciwgc3RhcnQsIGxlbmd0aCkge1xuICAgIHZhciBvdXRzdHIgPSBcIlwiO1xuICAgIGZvciAodmFyIG4gPSBzdGFydDsgbiA8IHN0YXJ0ICsgbGVuZ3RoOyBuKyspIHtcbiAgICAgIG91dHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZmZlci5nZXRVaW50OChuKSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRzdHI7XG4gIH1cblxuICBzdGF0aWMgcmVhZEVYSUZEYXRhKGZpbGUsIHN0YXJ0KSB7XG4gICAgaWYgKHRoaXMuZ2V0U3RyaW5nRnJvbURCKGZpbGUsIHN0YXJ0LCA0KSAhPSBcIkV4aWZcIikge1xuICAgICAgY29uc29sZS5lcnJvcihcIk5vdCB2YWxpZCBFWElGIGRhdGEhIFwiICsgdGhpcy5nZXRTdHJpbmdGcm9tREIoZmlsZSwgc3RhcnQsIDQpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgYmlnRW5kLFxuICAgICAgdGFncyxcbiAgICAgIGV4aWZEYXRhLCBncHNEYXRhLFxuICAgICAgdGlmZk9mZnNldCA9IHN0YXJ0ICsgNjtcbiAgICBsZXQgdGFnOiBzdHJpbmc7XG5cbiAgICAvLyB0ZXN0IGZvciBUSUZGIHZhbGlkaXR5IGFuZCBlbmRpYW5uZXNzXG4gICAgaWYgKGZpbGUuZ2V0VWludDE2KHRpZmZPZmZzZXQpID09IDB4NDk0OSkge1xuICAgICAgYmlnRW5kID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChmaWxlLmdldFVpbnQxNih0aWZmT2Zmc2V0KSA9PSAweDRENEQpIHtcbiAgICAgIGJpZ0VuZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJOb3QgdmFsaWQgVElGRiBkYXRhISAobm8gMHg0OTQ5IG9yIDB4NEQ0RClcIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGZpbGUuZ2V0VWludDE2KHRpZmZPZmZzZXQgKyAyLCAhYmlnRW5kKSAhPSAweDAwMkEpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJOb3QgdmFsaWQgVElGRiBkYXRhISAobm8gMHgwMDJBKVwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgZmlyc3RJRkRPZmZzZXQgPSBmaWxlLmdldFVpbnQzMih0aWZmT2Zmc2V0ICsgNCwgIWJpZ0VuZCk7XG5cbiAgICBpZiAoZmlyc3RJRkRPZmZzZXQgPCAweDAwMDAwMDA4KSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiTm90IHZhbGlkIFRJRkYgZGF0YSEgKEZpcnN0IG9mZnNldCBsZXNzIHRoYW4gOClcIiwgZmlsZS5nZXRVaW50MzIodGlmZk9mZnNldCArIDQsICFiaWdFbmQpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0YWdzID0gQ3JvcEVYSUYucmVhZFRhZ3MoZmlsZSwgdGlmZk9mZnNldCwgdGlmZk9mZnNldCArIGZpcnN0SUZET2Zmc2V0LCB0aGlzLlRpZmZUYWdzLCBiaWdFbmQpO1xuXG4gICAgaWYgKHRhZ3MuRXhpZklGRFBvaW50ZXIpIHtcbiAgICAgIGV4aWZEYXRhID0gQ3JvcEVYSUYucmVhZFRhZ3MoZmlsZSwgdGlmZk9mZnNldCwgdGlmZk9mZnNldCArIHRhZ3MuRXhpZklGRFBvaW50ZXIsIHRoaXMuRXhpZlRhZ3MsIGJpZ0VuZCk7XG4gICAgICBmb3IgKHRhZyBpbiBleGlmRGF0YSkge1xuICAgICAgICBzd2l0Y2ggKHRhZykge1xuICAgICAgICAgIGNhc2UgXCJMaWdodFNvdXJjZVwiIDpcbiAgICAgICAgICBjYXNlIFwiRmxhc2hcIiA6XG4gICAgICAgICAgY2FzZSBcIk1ldGVyaW5nTW9kZVwiIDpcbiAgICAgICAgICBjYXNlIFwiRXhwb3N1cmVQcm9ncmFtXCIgOlxuICAgICAgICAgIGNhc2UgXCJTZW5zaW5nTWV0aG9kXCIgOlxuICAgICAgICAgIGNhc2UgXCJTY2VuZUNhcHR1cmVUeXBlXCIgOlxuICAgICAgICAgIGNhc2UgXCJTY2VuZVR5cGVcIiA6XG4gICAgICAgICAgY2FzZSBcIkN1c3RvbVJlbmRlcmVkXCIgOlxuICAgICAgICAgIGNhc2UgXCJXaGl0ZUJhbGFuY2VcIiA6XG4gICAgICAgICAgY2FzZSBcIkdhaW5Db250cm9sXCIgOlxuICAgICAgICAgIGNhc2UgXCJDb250cmFzdFwiIDpcbiAgICAgICAgICBjYXNlIFwiU2F0dXJhdGlvblwiIDpcbiAgICAgICAgICBjYXNlIFwiU2hhcnBuZXNzXCIgOlxuICAgICAgICAgIGNhc2UgXCJTdWJqZWN0RGlzdGFuY2VSYW5nZVwiIDpcbiAgICAgICAgICBjYXNlIFwiRmlsZVNvdXJjZVwiIDpcbiAgICAgICAgICAgIGV4aWZEYXRhW3RhZ10gPSB0aGlzLlN0cmluZ1ZhbHVlc1t0YWddW2V4aWZEYXRhW3RhZ11dO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIFwiRXhpZlZlcnNpb25cIiA6XG4gICAgICAgICAgY2FzZSBcIkZsYXNocGl4VmVyc2lvblwiIDpcbiAgICAgICAgICAgIGV4aWZEYXRhW3RhZ10gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGV4aWZEYXRhW3RhZ11bMF0sIGV4aWZEYXRhW3RhZ11bMV0sIGV4aWZEYXRhW3RhZ11bMl0sIGV4aWZEYXRhW3RhZ11bM10pO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIFwiQ29tcG9uZW50c0NvbmZpZ3VyYXRpb25cIiA6XG4gICAgICAgICAgICBleGlmRGF0YVt0YWddID1cbiAgICAgICAgICAgICAgdGhpcy5TdHJpbmdWYWx1ZXMuQ29tcG9uZW50c1tleGlmRGF0YVt0YWddWzBdXSArXG4gICAgICAgICAgICAgIHRoaXMuU3RyaW5nVmFsdWVzLkNvbXBvbmVudHNbZXhpZkRhdGFbdGFnXVsxXV0gK1xuICAgICAgICAgICAgICB0aGlzLlN0cmluZ1ZhbHVlcy5Db21wb25lbnRzW2V4aWZEYXRhW3RhZ11bMl1dICtcbiAgICAgICAgICAgICAgdGhpcy5TdHJpbmdWYWx1ZXMuQ29tcG9uZW50c1tleGlmRGF0YVt0YWddWzNdXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHRhZ3NbdGFnXSA9IGV4aWZEYXRhW3RhZ107XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRhZ3MuR1BTSW5mb0lGRFBvaW50ZXIpIHtcbiAgICAgIGdwc0RhdGEgPSB0aGlzLnJlYWRUYWdzKGZpbGUsIHRpZmZPZmZzZXQsIHRpZmZPZmZzZXQgKyB0YWdzLkdQU0luZm9JRkRQb2ludGVyLCB0aGlzLkdQU1RhZ3MsIGJpZ0VuZCk7XG4gICAgICBmb3IgKHRhZyBpbiBncHNEYXRhKSB7XG4gICAgICAgIHN3aXRjaCAodGFnKSB7XG4gICAgICAgICAgY2FzZSBcIkdQU1ZlcnNpb25JRFwiIDpcbiAgICAgICAgICAgIGdwc0RhdGFbdGFnXSA9IGdwc0RhdGFbdGFnXVswXSArXG4gICAgICAgICAgICAgIFwiLlwiICsgZ3BzRGF0YVt0YWddWzFdICtcbiAgICAgICAgICAgICAgXCIuXCIgKyBncHNEYXRhW3RhZ11bMl0gK1xuICAgICAgICAgICAgICBcIi5cIiArIGdwc0RhdGFbdGFnXVszXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHRhZ3NbdGFnXSA9IGdwc0RhdGFbdGFnXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFncztcbiAgfVxuXG4gIHN0YXRpYyBnZXREYXRhKGltZywgY2FsbGJhY2spIHtcbiAgICBpZiAoKGltZyBpbnN0YW5jZW9mIEltYWdlIHx8IGltZyBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQpICYmICFpbWcuY29tcGxldGUpIHJldHVybiBmYWxzZTtcblxuICAgIGlmICghdGhpcy5pbWFnZUhhc0RhdGEoaW1nKSkge1xuICAgICAgQ3JvcEVYSUYuZ2V0SW1hZ2VEYXRhKGltZywgY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbChpbWcpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBzdGF0aWMgZ2V0VGFnKGltZywgdGFnKSB7XG4gICAgaWYgKCF0aGlzLmltYWdlSGFzRGF0YShpbWcpKSByZXR1cm47XG4gICAgcmV0dXJuIGltZy5leGlmZGF0YVt0YWddO1xuICB9O1xuXG4gIHN0YXRpYyBnZXRBbGxUYWdzKGltZykge1xuICAgIGlmICghdGhpcy5pbWFnZUhhc0RhdGEoaW1nKSkgcmV0dXJuIHt9O1xuICAgIHZhciBhLFxuICAgICAgZGF0YSA9IGltZy5leGlmZGF0YSxcbiAgICAgIHRhZ3MgPSB7fTtcbiAgICBmb3IgKGEgaW4gZGF0YSkge1xuICAgICAgaWYgKGRhdGEuaGFzT3duUHJvcGVydHkoYSkpIHtcbiAgICAgICAgdGFnc1thXSA9IGRhdGFbYV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YWdzO1xuICB9O1xuXG4gIHN0YXRpYyBwcmV0dHkoaW1nKSB7XG4gICAgaWYgKCF0aGlzLmltYWdlSGFzRGF0YShpbWcpKSByZXR1cm4gXCJcIjtcbiAgICB2YXIgYSxcbiAgICAgIGRhdGEgPSBpbWcuZXhpZmRhdGEsXG4gICAgICBzdHJQcmV0dHkgPSBcIlwiO1xuICAgIGZvciAoYSBpbiBkYXRhKSB7XG4gICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShhKSkge1xuICAgICAgICBpZiAodHlwZW9mIGRhdGFbYV0gPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgIGlmIChkYXRhW2FdIGluc3RhbmNlb2YgTnVtYmVyKSB7XG4gICAgICAgICAgICBzdHJQcmV0dHkgKz0gYSArIFwiIDogXCIgKyBkYXRhW2FdICsgXCIgW1wiICsgZGF0YVthXS5udW1lcmF0b3IgKyBcIi9cIiArIGRhdGFbYV0uZGVub21pbmF0b3IgKyBcIl1cXHJcXG5cIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RyUHJldHR5ICs9IGEgKyBcIiA6IFtcIiArIGRhdGFbYV0ubGVuZ3RoICsgXCIgdmFsdWVzXVxcclxcblwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHJQcmV0dHkgKz0gYSArIFwiIDogXCIgKyBkYXRhW2FdICsgXCJcXHJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3RyUHJldHR5O1xuICB9XG5cblxuICBzdGF0aWMgZmluZEVYSUZpbkpQRUcoZmlsZSkge1xuICAgIHZhciBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhmaWxlKTtcbiAgICB2YXIgbWF4T2Zmc2V0ID0gZGF0YVZpZXcuYnl0ZUxlbmd0aCAtIDQ7XG5cbiAgICBjb25zb2xlLmRlYnVnKCdmaW5kRVhJRmluSlBFRzogR290IGZpbGUgb2YgbGVuZ3RoICVvJywgZmlsZS5ieXRlTGVuZ3RoKTtcbiAgICBpZiAoZGF0YVZpZXcuZ2V0VWludDE2KDApICE9PSAweGZmZDgpIHtcbiAgICAgIGNvbnNvbGUud2FybignTm90IGEgdmFsaWQgSlBFRycpO1xuICAgICAgcmV0dXJuIGZhbHNlOyAvLyBub3QgYSB2YWxpZCBqcGVnXG4gICAgfVxuXG4gICAgdmFyIG9mZnNldCA9IDI7XG4gICAgdmFyIG1hcmtlcjtcblxuICAgIGZ1bmN0aW9uIHJlYWRCeXRlKCkge1xuICAgICAgdmFyIHNvbWVCeXRlID0gZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0KTtcbiAgICAgIG9mZnNldCsrO1xuICAgICAgcmV0dXJuIHNvbWVCeXRlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRXb3JkKCkge1xuICAgICAgdmFyIHNvbWVXb3JkID0gZGF0YVZpZXcuZ2V0VWludDE2KG9mZnNldCk7XG4gICAgICBvZmZzZXQgPSBvZmZzZXQgKyAyO1xuICAgICAgcmV0dXJuIHNvbWVXb3JkO1xuICAgIH1cblxuICAgIHdoaWxlIChvZmZzZXQgPCBtYXhPZmZzZXQpIHtcbiAgICAgIHZhciBzb21lQnl0ZSA9IHJlYWRCeXRlKCk7XG4gICAgICBpZiAoc29tZUJ5dGUgIT0gMHhGRikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdOb3QgYSB2YWxpZCBtYXJrZXIgYXQgb2Zmc2V0ICcgKyBvZmZzZXQgKyBcIiwgZm91bmQ6IFwiICsgc29tZUJ5dGUpO1xuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIG5vdCBhIHZhbGlkIG1hcmtlciwgc29tZXRoaW5nIGlzIHdyb25nXG4gICAgICB9XG4gICAgICBtYXJrZXIgPSByZWFkQnl0ZSgpO1xuICAgICAgY29uc29sZS5kZWJ1ZygnTWFya2VyPSVvJywgbWFya2VyKTtcblxuICAgICAgLy8gd2UgY291bGQgaW1wbGVtZW50IGhhbmRsaW5nIGZvciBvdGhlciBtYXJrZXJzIGhlcmUsXG4gICAgICAvLyBidXQgd2UncmUgb25seSBsb29raW5nIGZvciAweEZGRTEgZm9yIEVYSUYgZGF0YVxuXG4gICAgICB2YXIgc2VnbWVudExlbmd0aCA9IHJlYWRXb3JkKCkgLSAyO1xuICAgICAgc3dpdGNoIChtYXJrZXIpIHtcbiAgICAgICAgY2FzZSAnMHhFMSc6XG4gICAgICAgICAgcmV0dXJuIHRoaXMucmVhZEVYSUZEYXRhKGRhdGFWaWV3LCBvZmZzZXQvKiwgc2VnbWVudExlbmd0aCovKTtcbiAgICAgICAgY2FzZSAnMHhFMCc6IC8vIEpGSUZcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBvZmZzZXQgKz0gc2VnbWVudExlbmd0aDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZmluZElQVENpbkpQRUcoZmlsZSkge1xuICAgIHZhciBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhmaWxlKTtcblxuICAgIGNvbnNvbGUuZGVidWcoJ0dvdCBmaWxlIG9mIGxlbmd0aCAnICsgZmlsZS5ieXRlTGVuZ3RoKTtcbiAgICBpZiAoKGRhdGFWaWV3LmdldFVpbnQ4KDApICE9IDB4RkYpIHx8IChkYXRhVmlldy5nZXRVaW50OCgxKSAhPSAweEQ4KSkge1xuICAgICAgY29uc29sZS53YXJuKCdOb3QgYSB2YWxpZCBKUEVHJyk7XG4gICAgICByZXR1cm4gZmFsc2U7IC8vIG5vdCBhIHZhbGlkIGpwZWdcbiAgICB9XG5cbiAgICB2YXIgb2Zmc2V0ID0gMixcbiAgICAgIGxlbmd0aCA9IGZpbGUuYnl0ZUxlbmd0aDtcblxuXG4gICAgdmFyIGlzRmllbGRTZWdtZW50U3RhcnQgPSBmdW5jdGlvbiAoZGF0YVZpZXcsIG9mZnNldCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0KSA9PT0gMHgzOCAmJlxuICAgICAgICBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQgKyAxKSA9PT0gMHg0MiAmJlxuICAgICAgICBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQgKyAyKSA9PT0gMHg0OSAmJlxuICAgICAgICBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQgKyAzKSA9PT0gMHg0RCAmJlxuICAgICAgICBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQgKyA0KSA9PT0gMHgwNCAmJlxuICAgICAgICBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQgKyA1KSA9PT0gMHgwNFxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgd2hpbGUgKG9mZnNldCA8IGxlbmd0aCkge1xuICAgICAgaWYgKGlzRmllbGRTZWdtZW50U3RhcnQoZGF0YVZpZXcsIG9mZnNldCkpIHtcbiAgICAgICAgLy8gR2V0IHRoZSBsZW5ndGggb2YgdGhlIG5hbWUgaGVhZGVyICh3aGljaCBpcyBwYWRkZWQgdG8gYW4gZXZlbiBudW1iZXIgb2YgYnl0ZXMpXG4gICAgICAgIHZhciBuYW1lSGVhZGVyTGVuZ3RoID0gZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0ICsgNyk7XG4gICAgICAgIGlmIChuYW1lSGVhZGVyTGVuZ3RoICUgMiAhPT0gMCkgbmFtZUhlYWRlckxlbmd0aCArPSAxO1xuICAgICAgICAvLyBDaGVjayBmb3IgcHJlIHBob3Rvc2hvcCA2IGZvcm1hdFxuICAgICAgICBpZiAobmFtZUhlYWRlckxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIC8vIEFsd2F5cyA0XG4gICAgICAgICAgbmFtZUhlYWRlckxlbmd0aCA9IDQ7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3RhcnRPZmZzZXQgPSBvZmZzZXQgKyA4ICsgbmFtZUhlYWRlckxlbmd0aDtcbiAgICAgICAgdmFyIHNlY3Rpb25MZW5ndGggPSBkYXRhVmlldy5nZXRVaW50MTYob2Zmc2V0ICsgNiArIG5hbWVIZWFkZXJMZW5ndGgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnJlYWRJUFRDRGF0YShmaWxlLCBzdGFydE9mZnNldCwgc2VjdGlvbkxlbmd0aCk7XG4gICAgICB9XG5cbiAgICAgIC8vIE5vdCB0aGUgbWFya2VyLCBjb250aW51ZSBzZWFyY2hpbmdcbiAgICAgIG9mZnNldCsrO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyByZWFkRnJvbUJpbmFyeUZpbGUoZmlsZSkge1xuICAgIHJldHVybiBDcm9wRVhJRi5maW5kRVhJRmluSlBFRyhmaWxlKTtcbiAgfVxuXG4gIHN0YXRpYyBpbWFnZUhhc0RhdGEoaW1nKSB7XG4gICAgcmV0dXJuICEhKGltZy5leGlmZGF0YSk7XG4gIH1cblxuICBzdGF0aWMgYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQsIGNvbnRlbnRUeXBlPykge1xuICAgIGNvbnRlbnRUeXBlID0gY29udGVudFR5cGUgfHwgYmFzZTY0Lm1hdGNoKC9eZGF0YVxcOihbXlxcO10rKVxcO2Jhc2U2NCwvbWkpWzFdIHx8ICcnOyAvLyBlLmcuICdkYXRhOmltYWdlL2pwZWc7YmFzZTY0LC4uLicgPT4gJ2ltYWdlL2pwZWcnXG4gICAgYmFzZTY0ID0gYmFzZTY0LnJlcGxhY2UoL15kYXRhXFw6KFteXFw7XSspXFw7YmFzZTY0LC9nbWksICcnKTtcbiAgICB2YXIgYmluYXJ5ID0gYXRvYihiYXNlNjQpO1xuICAgIHZhciBsZW4gPSBiaW5hcnkubGVuZ3RoO1xuICAgIHZhciBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIobGVuKTtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdmlld1tpXSA9IGJpbmFyeS5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICByZXR1cm4gYnVmZmVyO1xuICB9XG59Il19