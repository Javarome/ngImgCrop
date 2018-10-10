(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
    typeof define === 'function' && define.amd ? define('ng-img-crop', ['exports', '@angular/core'], factory) :
    (factory((global['ng-img-crop'] = {}),global.ng.core));
}(this, (function (exports,core) { 'use strict';

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    var CropPubSub = /** @class */ (function () {
        function CropPubSub() {
            this.events = {};
        }
        /**
         * @param {?} names
         * @param {?} handler
         * @return {?}
         */
        CropPubSub.prototype.on = /**
         * @param {?} names
         * @param {?} handler
         * @return {?}
         */
            function (names, handler) {
                var _this = this;
                names.split(' ').forEach(function (name) {
                    if (!_this.events[name]) {
                        _this.events[name] = [];
                    }
                    _this.events[name].push(handler);
                });
                return this;
            };
        // Publish
        /**
         * @param {?} name
         * @param {?} args
         * @return {?}
         */
        CropPubSub.prototype.trigger = /**
         * @param {?} name
         * @param {?} args
         * @return {?}
         */
            function (name, args) {
                /** @type {?} */
                var listeners = this.events[name];
                if (listeners) {
                    listeners.forEach(function (handler) {
                        handler.call(null, args);
                    });
                }
                return this;
            };
        return CropPubSub;
    }());

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

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (b.hasOwnProperty(p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    var CropCanvas = /** @class */ (function () {
        function CropCanvas(ctx) {
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
        // Calculate Point
        /**
         * @param {?} point
         * @param {?} offset
         * @param {?} scale
         * @return {?}
         */
        CropCanvas.prototype.calcPoint = /**
         * @param {?} point
         * @param {?} offset
         * @param {?} scale
         * @return {?}
         */
            function (point, offset, scale) {
                return [scale * point[0] + offset[0], scale * point[1] + offset[1]];
            };
        /**
         * @param {?} shape
         * @param {?} fillStyle
         * @param {?} centerCoords
         * @param {?} scale
         * @return {?}
         */
        CropCanvas.prototype.drawFilledPolygon = /**
         * @param {?} shape
         * @param {?} fillStyle
         * @param {?} centerCoords
         * @param {?} scale
         * @return {?}
         */
            function (shape, fillStyle, centerCoords, scale) {
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
                    var pNum = parseInt(p, 10);
                    if (pNum > 0) {
                        pc = this.calcPoint(shape[pNum], centerCoords, scale);
                        this.ctx.lineTo(pc[0], pc[1]);
                    }
                }
                this.ctx.lineTo(pc0[0], pc0[1]);
                this.ctx.fill();
                this.ctx.closePath();
                this.ctx.restore();
            };
        /* Icons */
        /**
         * @param {?} centerCoords
         * @param {?} scale
         * @return {?}
         */
        CropCanvas.prototype.drawIconMove = /**
         * @param {?} centerCoords
         * @param {?} scale
         * @return {?}
         */
            function (centerCoords, scale) {
                this.drawFilledPolygon(this.shapeArrowN, this.colors.moveIconFill, centerCoords, scale);
                this.drawFilledPolygon(this.shapeArrowW, this.colors.moveIconFill, centerCoords, scale);
                this.drawFilledPolygon(this.shapeArrowS, this.colors.moveIconFill, centerCoords, scale);
                this.drawFilledPolygon(this.shapeArrowE, this.colors.moveIconFill, centerCoords, scale);
            };
        /**
         * @param {?} centerCoords
         * @param {?} circleRadius
         * @param {?} scale
         * @return {?}
         */
        CropCanvas.prototype.drawIconResizeCircle = /**
         * @param {?} centerCoords
         * @param {?} circleRadius
         * @param {?} scale
         * @return {?}
         */
            function (centerCoords, circleRadius, scale) {
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
            };
        /**
         * @param {?} centerCoords
         * @param {?} boxSize
         * @param {?} scale
         * @return {?}
         */
        CropCanvas.prototype.drawIconResizeBoxBase = /**
         * @param {?} centerCoords
         * @param {?} boxSize
         * @param {?} scale
         * @return {?}
         */
            function (centerCoords, boxSize, scale) {
                /** @type {?} */
                var scaledBoxSize = boxSize * scale;
                this.ctx.save();
                this.ctx.strokeStyle = this.colors.resizeBoxStroke;
                this.ctx.lineWidth = 2;
                this.ctx.fillStyle = this.colors.resizeBoxFill;
                this.ctx.fillRect(centerCoords[0] - scaledBoxSize / 2, centerCoords[1] - scaledBoxSize / 2, scaledBoxSize, scaledBoxSize);
                this.ctx.strokeRect(centerCoords[0] - scaledBoxSize / 2, centerCoords[1] - scaledBoxSize / 2, scaledBoxSize, scaledBoxSize);
                this.ctx.restore();
            };
        /**
         * @param {?} centerCoords
         * @param {?} boxSize
         * @param {?} scale
         * @return {?}
         */
        CropCanvas.prototype.drawIconResizeBoxNESW = /**
         * @param {?} centerCoords
         * @param {?} boxSize
         * @param {?} scale
         * @return {?}
         */
            function (centerCoords, boxSize, scale) {
                this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
                this.drawFilledPolygon(this.shapeArrowNE, this.colors.resizeBoxArrowFill, centerCoords, scale);
                this.drawFilledPolygon(this.shapeArrowSW, this.colors.resizeBoxArrowFill, centerCoords, scale);
            };
        /**
         * @param {?} centerCoords
         * @param {?} boxSize
         * @param {?} scale
         * @return {?}
         */
        CropCanvas.prototype.drawIconResizeBoxNWSE = /**
         * @param {?} centerCoords
         * @param {?} boxSize
         * @param {?} scale
         * @return {?}
         */
            function (centerCoords, boxSize, scale) {
                this.drawIconResizeBoxBase(centerCoords, boxSize, scale);
                this.drawFilledPolygon(this.shapeArrowNW, this.colors.resizeBoxArrowFill, centerCoords, scale);
                this.drawFilledPolygon(this.shapeArrowSE, this.colors.resizeBoxArrowFill, centerCoords, scale);
            };
        /* Crop Area */
        /**
         * @param {?} image
         * @param {?} centerCoords
         * @param {?} size
         * @param {?} fnDrawClipPath
         * @return {?}
         */
        CropCanvas.prototype.drawCropArea = /**
         * @param {?} image
         * @param {?} centerCoords
         * @param {?} size
         * @param {?} fnDrawClipPath
         * @return {?}
         */
            function (image, centerCoords, size, fnDrawClipPath) {
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
            };
        return CropCanvas;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    /** @enum {string} */
    var CropAreaType = {
        Square: 'square',
        Circle: 'circle',
    };
    /**
     * @abstract
     */
    var /**
     * @abstract
     */ CropArea = /** @class */ (function () {
        function CropArea(_ctx, _events) {
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
        CropArea.prototype.getImage = /**
         * @return {?}
         */
            function () {
                return this._image;
            };
        /**
         * @param {?} image
         * @return {?}
         */
        CropArea.prototype.setImage = /**
         * @param {?} image
         * @return {?}
         */
            function (image) {
                this._image = image;
            };
        /**
         * @return {?}
         */
        CropArea.prototype.getX = /**
         * @return {?}
         */
            function () {
                return this._x;
            };
        /**
         * @param {?} x
         * @return {?}
         */
        CropArea.prototype.setX = /**
         * @param {?} x
         * @return {?}
         */
            function (x) {
                this._x = x;
                this._dontDragOutside();
            };
        /**
         * @return {?}
         */
        CropArea.prototype.getY = /**
         * @return {?}
         */
            function () {
                return this._y;
            };
        /**
         * @param {?} y
         * @return {?}
         */
        CropArea.prototype.setY = /**
         * @param {?} y
         * @return {?}
         */
            function (y) {
                this._y = y;
                this._dontDragOutside();
            };
        /**
         * @return {?}
         */
        CropArea.prototype.getSize = /**
         * @return {?}
         */
            function () {
                return this._size;
            };
        /**
         * @param {?} size
         * @return {?}
         */
        CropArea.prototype.setSize = /**
         * @param {?} size
         * @return {?}
         */
            function (size) {
                this._size = Math.max(this._minSize, size);
                this._dontDragOutside();
            };
        /**
         * @return {?}
         */
        CropArea.prototype.getMinSize = /**
         * @return {?}
         */
            function () {
                return this._minSize;
            };
        /**
         * @param {?} size
         * @return {?}
         */
        CropArea.prototype.setMinSize = /**
         * @param {?} size
         * @return {?}
         */
            function (size) {
                this._minSize = size;
                this._size = Math.max(this._minSize, this._size);
                this._dontDragOutside();
            };
        /**
         * @return {?}
         */
        CropArea.prototype._dontDragOutside = /**
         * @return {?}
         */
            function () {
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
            };
        /**
         * @return {?}
         */
        CropArea.prototype.draw = /**
         * @return {?}
         */
            function () {
                this._cropCanvas.drawCropArea(this._image, [this._x, this._y], this._size, this._drawArea);
            };
        return CropArea;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    var CropAreaCircle = /** @class */ (function (_super) {
        __extends(CropAreaCircle, _super);
        function CropAreaCircle(ctx, events) {
            var _this = _super.call(this, ctx, events) || this;
            _this._boxResizeBaseSize = 20;
            _this._boxResizeNormalRatio = 0.9;
            _this._boxResizeHoverRatio = 1.2;
            _this._iconMoveNormalRatio = 0.9;
            _this._iconMoveHoverRatio = 1.2;
            _this._posDragStartX = 0;
            _this._posDragStartY = 0;
            _this._posResizeStartX = 0;
            _this._posResizeStartY = 0;
            _this._posResizeStartSize = 0;
            _this._boxResizeIsHover = false;
            _this._areaIsHover = false;
            _this._boxResizeIsDragging = false;
            _this._areaIsDragging = false;
            _this._boxResizeNormalSize = _this._boxResizeBaseSize * _this._boxResizeNormalRatio;
            _this._boxResizeHoverSize = _this._boxResizeBaseSize * _this._boxResizeHoverRatio;
            return _this;
        }
        /**
         * @param {?} angleDegrees
         * @return {?}
         */
        CropAreaCircle.prototype._calcCirclePerimeterCoords = /**
         * @param {?} angleDegrees
         * @return {?}
         */
            function (angleDegrees) {
                /** @type {?} */
                var hSize = this._size / 2;
                /** @type {?} */
                var angleRadians = angleDegrees * (Math.PI / 180);
                /** @type {?} */
                var circlePerimeterX = this._x + hSize * Math.cos(angleRadians);
                /** @type {?} */
                var circlePerimeterY = this._y + hSize * Math.sin(angleRadians);
                return [circlePerimeterX, circlePerimeterY];
            };
        /**
         * @return {?}
         */
        CropAreaCircle.prototype._calcResizeIconCenterCoords = /**
         * @return {?}
         */
            function () {
                return this._calcCirclePerimeterCoords(-45);
            };
        /**
         * @param {?} coord
         * @return {?}
         */
        CropAreaCircle.prototype._isCoordWithinArea = /**
         * @param {?} coord
         * @return {?}
         */
            function (coord) {
                return Math.sqrt((coord[0] - this._x) * (coord[0] - this._x) + (coord[1] - this._y) * (coord[1] - this._y)) < this._size / 2;
            };
        /**
         * @param {?} coord
         * @return {?}
         */
        CropAreaCircle.prototype._isCoordWithinBoxResize = /**
         * @param {?} coord
         * @return {?}
         */
            function (coord) {
                /** @type {?} */
                var resizeIconCenterCoords = this._calcResizeIconCenterCoords();
                /** @type {?} */
                var hSize = this._boxResizeHoverSize / 2;
                return (coord[0] > resizeIconCenterCoords[0] - hSize && coord[0] < resizeIconCenterCoords[0] + hSize &&
                    coord[1] > resizeIconCenterCoords[1] - hSize && coord[1] < resizeIconCenterCoords[1] + hSize);
            };
        /**
         * @param {?} ctx
         * @param {?} centerCoords
         * @param {?} size
         * @return {?}
         */
        CropAreaCircle.prototype._drawArea = /**
         * @param {?} ctx
         * @param {?} centerCoords
         * @param {?} size
         * @return {?}
         */
            function (ctx, centerCoords, size) {
                ctx.arc(centerCoords[0], centerCoords[1], size / 2, 0, 2 * Math.PI);
            };
        /**
         * @return {?}
         */
        CropAreaCircle.prototype.draw = /**
         * @return {?}
         */
            function () {
                CropArea.prototype.draw.apply(this, arguments);
                // draw move icon
                this._cropCanvas.drawIconMove([this._x, this._y], this._areaIsHover ? this._iconMoveHoverRatio : this._iconMoveNormalRatio);
                // draw resize cubes
                this._cropCanvas.drawIconResizeBoxNESW(this._calcResizeIconCenterCoords(), this._boxResizeBaseSize, this._boxResizeIsHover ? this._boxResizeHoverRatio : this._boxResizeNormalRatio);
            };
        /**
         * @param {?} mouseCurX
         * @param {?} mouseCurY
         * @return {?}
         */
        CropAreaCircle.prototype.processMouseMove = /**
         * @param {?} mouseCurX
         * @param {?} mouseCurY
         * @return {?}
         */
            function (mouseCurX, mouseCurY) {
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
            };
        /**
         * @param {?} mouseDownX
         * @param {?} mouseDownY
         * @return {?}
         */
        CropAreaCircle.prototype.processMouseDown = /**
         * @param {?} mouseDownX
         * @param {?} mouseDownY
         * @return {?}
         */
            function (mouseDownX, mouseDownY) {
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
            };
        /**
         * @return {?}
         */
        CropAreaCircle.prototype.processMouseUp = /**
         * @return {?}
         */
            function () {
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
            };
        return CropAreaCircle;
    }(CropArea));

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    var CropAreaSquare = /** @class */ (function (_super) {
        __extends(CropAreaSquare, _super);
        function CropAreaSquare(ctx, events) {
            var _this = _super.call(this, ctx, events) || this;
            _this._resizeCtrlBaseRadius = 10;
            _this._resizeCtrlNormalRatio = 0.75;
            _this._resizeCtrlHoverRatio = 1;
            _this._iconMoveNormalRatio = 0.9;
            _this._iconMoveHoverRatio = 1.2;
            _this._posDragStartX = 0;
            _this._posDragStartY = 0;
            _this._posResizeStartX = 0;
            _this._posResizeStartY = 0;
            _this._posResizeStartSize = 0;
            _this._resizeCtrlIsHover = -1;
            _this._areaIsHover = false;
            _this._resizeCtrlIsDragging = -1;
            _this._areaIsDragging = false;
            _this._resizeCtrlNormalRadius = _this._resizeCtrlBaseRadius * _this._resizeCtrlNormalRatio;
            _this._resizeCtrlHoverRadius = _this._resizeCtrlBaseRadius * _this._resizeCtrlHoverRatio;
            return _this;
        }
        /**
         * @return {?}
         */
        CropAreaSquare.prototype._calcSquareCorners = /**
         * @return {?}
         */
            function () {
                /** @type {?} */
                var hSize = this._size / 2;
                return [
                    [this._x - hSize, this._y - hSize],
                    [this._x + hSize, this._y - hSize],
                    [this._x - hSize, this._y + hSize],
                    [this._x + hSize, this._y + hSize]
                ];
            };
        /**
         * @return {?}
         */
        CropAreaSquare.prototype._calcSquareDimensions = /**
         * @return {?}
         */
            function () {
                /** @type {?} */
                var hSize = this._size / 2;
                return {
                    left: this._x - hSize,
                    top: this._y - hSize,
                    right: this._x + hSize,
                    bottom: this._y + hSize
                };
            };
        /**
         * @param {?} coord
         * @return {?}
         */
        CropAreaSquare.prototype._isCoordWithinArea = /**
         * @param {?} coord
         * @return {?}
         */
            function (coord) {
                /** @type {?} */
                var squareDimensions = this._calcSquareDimensions();
                return (coord[0] >= squareDimensions.left && coord[0] <= squareDimensions.right && coord[1] >= squareDimensions.top && coord[1] <= squareDimensions.bottom);
            };
        /**
         * @param {?} coord
         * @return {?}
         */
        CropAreaSquare.prototype._isCoordWithinResizeCtrl = /**
         * @param {?} coord
         * @return {?}
         */
            function (coord) {
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
            };
        /**
         * @param {?} ctx
         * @param {?} centerCoords
         * @param {?} size
         * @return {?}
         */
        CropAreaSquare.prototype._drawArea = /**
         * @param {?} ctx
         * @param {?} centerCoords
         * @param {?} size
         * @return {?}
         */
            function (ctx, centerCoords, size) {
                /** @type {?} */
                var hSize = size / 2;
                ctx.rect(centerCoords[0] - hSize, centerCoords[1] - hSize, size, size);
            };
        /**
         * @return {?}
         */
        CropAreaSquare.prototype.draw = /**
         * @return {?}
         */
            function () {
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
            };
        /**
         * @param {?} mouseCurX
         * @param {?} mouseCurY
         * @return {?}
         */
        CropAreaSquare.prototype.processMouseMove = /**
         * @param {?} mouseCurX
         * @param {?} mouseCurY
         * @return {?}
         */
            function (mouseCurX, mouseCurY) {
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
            };
        /**
         * @param {?} mouseDownX
         * @param {?} mouseDownY
         * @return {?}
         */
        CropAreaSquare.prototype.processMouseDown = /**
         * @param {?} mouseDownX
         * @param {?} mouseDownY
         * @return {?}
         */
            function (mouseDownX, mouseDownY) {
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
            };
        /**
         * @return {?}
         */
        CropAreaSquare.prototype.processMouseUp = /**
         * @return {?}
         */
            function () {
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
            };
        return CropAreaSquare;
    }(CropArea));

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    var CropHost = /** @class */ (function () {
        function CropHost(elCanvas, opts, events) {
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
        CropHost.prototype.destroy = /**
         * @return {?}
         */
            function () {
                document.removeEventListener('mousemove', this.onMouseMove);
                this.elCanvas.removeEventListener('mousedown', this.onMouseDown);
                document.removeEventListener('mouseup', this.onMouseMove);
                document.removeEventListener('touchmove', this.onMouseMove);
                this.elCanvas.removeEventListener('touchstart', this.onMouseDown);
                document.removeEventListener('touchend', this.onMouseMove);
                this.elCanvas.remove();
            };
        /**
         * @return {?}
         */
        CropHost.prototype.drawScene = /**
         * @return {?}
         */
            function () {
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
            };
        /**
         * @param {?=} cw
         * @param {?=} ch
         * @return {?}
         */
        CropHost.prototype.resetCropHost = /**
         * @param {?=} cw
         * @param {?=} ch
         * @return {?}
         */
            function (cw, ch) {
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
            };
        /**
         * Returns event.changedTouches directly if event is a TouchEvent.
         * If event is a jQuery event, return changedTouches of event.originalEvent
         */
        /**
         * Returns event.changedTouches directly if event is a TouchEvent.
         * If event is a jQuery event, return changedTouches of event.originalEvent
         * @param {?} event
         * @return {?}
         */
        CropHost.getChangedTouches = /**
         * Returns event.changedTouches directly if event is a TouchEvent.
         * If event is a jQuery event, return changedTouches of event.originalEvent
         * @param {?} event
         * @return {?}
         */
            function (event) {
                return event.changedTouches ? event.changedTouches : event.originalEvent.changedTouches;
            };
        /**
         * @param {?} e
         * @return {?}
         */
        CropHost.prototype.onMouseMove = /**
         * @param {?} e
         * @return {?}
         */
            function (e) {
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
            };
        /**
         * @param {?} e
         * @return {?}
         */
        CropHost.prototype.onMouseDown = /**
         * @param {?} e
         * @return {?}
         */
            function (e) {
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
            };
        /**
         * @param {?} e
         * @return {?}
         */
        CropHost.prototype.onMouseUp = /**
         * @param {?} e
         * @return {?}
         */
            function (e) {
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
            };
        /**
         * @return {?}
         */
        CropHost.prototype.getResultImageDataURI = /**
         * @return {?}
         */
            function () {
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
            };
        /**
         * @return {?}
         */
        CropHost.prototype.redraw = /**
         * @return {?}
         */
            function () {
                this.drawScene();
            };
        /**
         * @param {?} imageSource
         * @return {?}
         */
        CropHost.prototype.setNewImageSource = /**
         * @param {?} imageSource
         * @return {?}
         */
            function (imageSource) {
                var _this = this;
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
                    var self_1 = this;
                    newImage.onload = function () {
                        self_1.events.trigger('load-done');
                        CropEXIF.getData(newImage, function () {
                            /** @type {?} */
                            var orientation = CropEXIF.getTag(newImage, 'Orientation');
                            /** @type {?} */
                            var cw = newImage.width;
                            /** @type {?} */
                            var ch = newImage.height;
                            /** @type {?} */
                            var cx = 0;
                            /** @type {?} */
                            var cy = 0;
                            /** @type {?} */
                            var deg = 0;
                            /**
                             * @return {?}
                             */
                            function imageDone() {
                                console.debug('dims=' + cw + 'x' + ch);
                                /** @type {?} */
                                var canvasDims = self_1.resetCropHost(cw, ch);
                                self_1.setMaxDimensions(canvasDims[0], canvasDims[1]);
                                self_1.events.trigger('image-updated');
                                self_1.events.trigger('image-ready');
                            }
                            if ([3, 6, 8].indexOf(orientation) >= 0) {
                                /** @type {?} */
                                var canvas = document.createElement("canvas");
                                /** @type {?} */
                                var ctx = canvas.getContext("2d");
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
                                self_1.ctx.rotate(deg * Math.PI / 180);
                                self_1.ctx.drawImage(newImage, cx, cy);
                                self_1.image = new Image();
                                self_1.image.onload = function () {
                                    imageDone();
                                };
                                self_1.image.src = canvas.toDataURL("image/png");
                            }
                            else {
                                self_1.image = newImage;
                                imageDone();
                            }
                        });
                    };
                    newImage.onerror = function (error) {
                        _this.events.trigger('load-error', [error]);
                    };
                    this.events.trigger('load-start');
                    newImage.src = imageSource;
                }
            };
        /**
         * @param {?} width
         * @param {?} height
         * @return {?}
         */
        CropHost.prototype.setMaxDimensions = /**
         * @param {?} width
         * @param {?} height
         * @return {?}
         */
            function (width, height) {
                console.debug('setMaxDimensions(' + width + ', ' + height + ')');
                if (this.image !== null) {
                    /** @type {?} */
                    var curWidth = this.ctx.canvas.width;
                    /** @type {?} */
                    var curHeight = this.ctx.canvas.height;
                    /** @type {?} */
                    var ratioNewCurWidth = this.ctx.canvas.width / curWidth;
                    /** @type {?} */
                    var ratioNewCurHeight = this.ctx.canvas.height / curHeight;
                }
                this.maxCanvasDims = [width, height];
                return this.resetCropHost(width, height);
            };
        /**
         * @param {?} size
         * @return {?}
         */
        CropHost.prototype.setAreaMinSize = /**
         * @param {?} size
         * @return {?}
         */
            function (size) {
                size = parseInt(size, 10);
                if (!isNaN(size)) {
                    this.cropArea.setMinSize(size);
                    this.drawScene();
                }
            };
        /**
         * @param {?} size
         * @return {?}
         */
        CropHost.prototype.setResultImageSize = /**
         * @param {?} size
         * @return {?}
         */
            function (size) {
                size = parseInt(size, 10);
                if (!isNaN(size)) {
                    this.resultImageSize = size;
                }
            };
        /**
         * @param {?} format
         * @return {?}
         */
        CropHost.prototype.setResultImageFormat = /**
         * @param {?} format
         * @return {?}
         */
            function (format) {
                this.resultImageFormat = format;
            };
        /**
         * @param {?} quality
         * @return {?}
         */
        CropHost.prototype.setResultImageQuality = /**
         * @param {?} quality
         * @return {?}
         */
            function (quality) {
                quality = parseFloat(quality);
                if (!isNaN(quality) && quality >= 0 && quality <= 1) {
                    this.resultImageQuality = quality;
                }
            };
        /**
         * @param {?} type
         * @return {?}
         */
        CropHost.prototype.setAreaType = /**
         * @param {?} type
         * @return {?}
         */
            function (type) {
                /** @type {?} */
                var curSize = this.cropArea.getSize();
                /** @type {?} */
                var curMinSize = this.cropArea.getMinSize();
                /** @type {?} */
                var curX = this.cropArea.getX();
                /** @type {?} */
                var curY = this.cropArea.getY();
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
            };
        /**
         * @return {?}
         */
        CropHost.prototype.getAreaDetails = /**
         * @return {?}
         */
            function () {
                return {
                    x: this.cropArea.getX(),
                    y: this.cropArea.getY(),
                    size: this.cropArea.getSize(),
                    image: { width: this.cropArea.getImage().width, height: this.cropArea.getImage().height },
                    canvas: { width: this.ctx.canvas.width, height: this.ctx.canvas.height }
                };
            };
        /**
         * @param {?} elem
         * @return {?}
         */
        CropHost.getElementOffset = /**
         * @param {?} elem
         * @return {?}
         */
            function (elem) {
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
            };
        return CropHost;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    var FcImgCropComponent = /** @class */ (function () {
        function FcImgCropComponent(el, ref) {
            this.el = el;
            this.ref = ref;
            this.resultImageChange = new core.EventEmitter();
            this.areaDetailsChange = new core.EventEmitter();
            this.onChange = new core.EventEmitter();
            this.onLoadBegin = new core.EventEmitter();
            this.onLoadDone = new core.EventEmitter();
            this.onLoadError = new core.EventEmitter();
            this.onImageReady = new core.EventEmitter();
            this.events = new CropPubSub();
        }
        /**
         * @return {?}
         */
        FcImgCropComponent.prototype.ngOnInit = /**
         * @return {?}
         */
            function () {
                /** @type {?} */
                var events = this.events;
                /** @type {?} */
                var el = this.el.nativeElement.querySelector('canvas');
                this.cropHost = new CropHost(el, {}, events);
                /** @type {?} */
                var self = this;
                events
                    .on('load-start', function () {
                    self.onLoadBegin.emit({});
                    self.ref.detectChanges();
                })
                    .on('load-done', function () {
                    self.onLoadDone.emit({});
                    self.ref.detectChanges();
                })
                    .on('image-ready', function () {
                    if (self.onImageReady.emit({})) {
                        self.cropHost.redraw();
                        self.ref.detectChanges();
                    }
                })
                    .on('load-error', function () {
                    self.onLoadError.emit({});
                    self.ref.detectChanges();
                })
                    .on('area-move area-resize', function () {
                    if (!!self.changeOnFly) {
                        self.updateResultImage();
                        self.ref.detectChanges();
                    }
                })
                    .on('area-move-end area-resize-end image-updated', function () {
                    self.updateResultImage();
                    self.areaDetails = self.cropHost.getAreaDetails();
                    self.areaDetailsChange.emit(self.areaDetails);
                });
            };
        /**
         * @return {?}
         */
        FcImgCropComponent.prototype.updateResultImage = /**
         * @return {?}
         */
            function () {
                /** @type {?} */
                var resultImage = this.cropHost.getResultImageDataURI();
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
            };
        /**
         * @return {?}
         */
        FcImgCropComponent.prototype.ngOnDestroy = /**
         * @return {?}
         */
            function () {
                this.cropHost.destroy();
            };
        /**
         * Sync CropHost with Directive's options
         */
        /**
         * Sync CropHost with Directive's options
         * @param {?} changes
         * @return {?}
         */
        FcImgCropComponent.prototype.ngOnChanges = /**
         * Sync CropHost with Directive's options
         * @param {?} changes
         * @return {?}
         */
            function (changes) {
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
            };
        /**
         * @return {?}
         */
        FcImgCropComponent.prototype.ngAfterViewInit = /**
         * @return {?}
         */
            function () {
                var _this = this;
                this.observer = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        if (mutation.attributeName === 'clientWidth' || mutation.attributeName === 'clientHeight') {
                            _this.cropHost.setMaxDimensions(_this.el.nativeElement.clientWidth, _this.el.nativeElement.clientHeight);
                            _this.updateResultImage();
                        }
                    });
                });
                /** @type {?} */
                var config = { attributes: true, childList: true, characterData: true };
                this.observer.observe(this.el.nativeElement, config);
            };
        FcImgCropComponent.decorators = [
            { type: core.Component, args: [{
                        selector: 'fc-img-crop',
                        template: '<canvas></canvas>',
                        styles: [":host{width:100%;height:100%;display:block;position:relative;overflow:hidden}:host canvas{display:block;position:absolute;top:50%;left:50%;-webkit-tap-highlight-color:rgba(255,255,255,0)}"]
                    }] }
        ];
        /** @nocollapse */
        FcImgCropComponent.ctorParameters = function () {
            return [
                { type: core.ElementRef },
                { type: core.ChangeDetectorRef }
            ];
        };
        FcImgCropComponent.propDecorators = {
            image: [{ type: core.Input }],
            resultImage: [{ type: core.Input }],
            resultImageChange: [{ type: core.Output }],
            changeOnFly: [{ type: core.Input }],
            areaType: [{ type: core.Input }],
            areaMinSize: [{ type: core.Input }],
            areaDetails: [{ type: core.Input }],
            areaDetailsChange: [{ type: core.Output }],
            resultImageSize: [{ type: core.Input }],
            resultImageFormat: [{ type: core.Input }],
            resultImageQuality: [{ type: core.Input }],
            onChange: [{ type: core.Output }],
            onLoadBegin: [{ type: core.Output }],
            onLoadDone: [{ type: core.Output }],
            onLoadError: [{ type: core.Output }],
            onImageReady: [{ type: core.Output }]
        };
        return FcImgCropComponent;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */
    var CropModule = /** @class */ (function () {
        function CropModule() {
        }
        CropModule.decorators = [
            { type: core.NgModule, args: [{
                        declarations: [
                            FcImgCropComponent
                        ],
                        exports: [
                            FcImgCropComponent
                        ]
                    },] }
        ];
        return CropModule;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
     */

    exports.CropModule = CropModule;
    exports.ɵa = FcImgCropComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctaW1nLWNyb3AudW1kLmpzLm1hcCIsInNvdXJjZXMiOlsibmc6Ly9uZy1pbWctY3JvcC9zcmMvYXBwL2ZjLWltZy1jcm9wL2NsYXNzZXMvY3JvcC1wdWJzdWIudHMiLCJuZzovL25nLWltZy1jcm9wL3NyYy9hcHAvZmMtaW1nLWNyb3AvY2xhc3Nlcy9jcm9wLWV4aWYudHMiLCJub2RlX21vZHVsZXMvdHNsaWIvdHNsaWIuZXM2LmpzIiwibmc6Ly9uZy1pbWctY3JvcC9zcmMvYXBwL2ZjLWltZy1jcm9wL2NsYXNzZXMvY3JvcC1jYW52YXMudHMiLCJuZzovL25nLWltZy1jcm9wL3NyYy9hcHAvZmMtaW1nLWNyb3AvY2xhc3Nlcy9jcm9wLWFyZWEudHMiLCJuZzovL25nLWltZy1jcm9wL3NyYy9hcHAvZmMtaW1nLWNyb3AvY2xhc3Nlcy9jcm9wLWFyZWEtY2lyY2xlLnRzIiwibmc6Ly9uZy1pbWctY3JvcC9zcmMvYXBwL2ZjLWltZy1jcm9wL2NsYXNzZXMvY3JvcC1hcmVhLXNxdWFyZS50cyIsIm5nOi8vbmctaW1nLWNyb3Avc3JjL2FwcC9mYy1pbWctY3JvcC9jbGFzc2VzL2Nyb3AtaG9zdC50cyIsIm5nOi8vbmctaW1nLWNyb3Avc3JjL2FwcC9mYy1pbWctY3JvcC9mYy1pbWctY3JvcC5jb21wb25lbnQudHMiLCJuZzovL25nLWltZy1jcm9wL3NyYy9hcHAvZmMtaW1nLWNyb3AvZmMtaW1nLWNyb3AubW9kdWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBDcm9wUHViU3ViIHtcbiAgcHJpdmF0ZSBldmVudHMgPSB7fTtcblxuICBvbihuYW1lczogc3RyaW5nLCBoYW5kbGVyOiBGdW5jdGlvbikge1xuICAgIG5hbWVzLnNwbGl0KCcgJykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgIGlmICghdGhpcy5ldmVudHNbbmFtZV0pIHtcbiAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0gPSBbXTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZXZlbnRzW25hbWVdLnB1c2goaGFuZGxlcik7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gUHVibGlzaFxuICB0cmlnZ2VyKG5hbWU6IHN0cmluZywgYXJnczogYW55W10pIHtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmV2ZW50c1tuYW1lXTtcbiAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChoYW5kbGVyID0+IHtcbiAgICAgICAgaGFuZGxlci5jYWxsKG51bGwsIGFyZ3MpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xufSIsIi8qKlxuICogRVhJRiBzZXJ2aWNlIGlzIGJhc2VkIG9uIHRoZSBleGlmLWpzIGxpYnJhcnkgKGh0dHBzOi8vZ2l0aHViLmNvbS9qc2VpZGVsaW4vZXhpZi1qcylcbiAqL1xuZXhwb3J0IGNsYXNzIENyb3BFWElGIHtcblxuICBzdGF0aWMgRXhpZlRhZ3MgPSB7XG5cbiAgICAvLyB2ZXJzaW9uIHRhZ3NcbiAgICAnMHg5MDAwJzogXCJFeGlmVmVyc2lvblwiLCAgICAgICAgICAgICAvLyBFWElGIHZlcnNpb25cbiAgICAnMHhBMDAwJzogXCJGbGFzaHBpeFZlcnNpb25cIiwgICAgICAgICAvLyBGbGFzaHBpeCBmb3JtYXQgdmVyc2lvblxuXG4gICAgLy8gY29sb3JzcGFjZSB0YWdzXG4gICAgJzB4QTAwMSc6IFwiQ29sb3JTcGFjZVwiLCAgICAgICAgICAgICAgLy8gQ29sb3Igc3BhY2UgaW5mb3JtYXRpb24gdGFnXG5cbiAgICAvLyBpbWFnZSBjb25maWd1cmF0aW9uXG4gICAgJzB4QTAwMic6IFwiUGl4ZWxYRGltZW5zaW9uXCIsICAgICAgICAgLy8gVmFsaWQgd2lkdGggb2YgbWVhbmluZ2Z1bCBpbWFnZVxuICAgICcweEEwMDMnOiBcIlBpeGVsWURpbWVuc2lvblwiLCAgICAgICAgIC8vIFZhbGlkIGhlaWdodCBvZiBtZWFuaW5nZnVsIGltYWdlXG4gICAgJzB4OTEwMSc6IFwiQ29tcG9uZW50c0NvbmZpZ3VyYXRpb25cIiwgLy8gSW5mb3JtYXRpb24gYWJvdXQgY2hhbm5lbHNcbiAgICAnMHg5MTAyJzogXCJDb21wcmVzc2VkQml0c1BlclBpeGVsXCIsICAvLyBDb21wcmVzc2VkIGJpdHMgcGVyIHBpeGVsXG5cbiAgICAvLyB1c2VyIGluZm9ybWF0aW9uXG4gICAgJzB4OTI3Qyc6IFwiTWFrZXJOb3RlXCIsICAgICAgICAgICAgICAgLy8gQW55IGRlc2lyZWQgaW5mb3JtYXRpb24gd3JpdHRlbiBieSB0aGUgbWFudWZhY3R1cmVyXG4gICAgJzB4OTI4Nic6IFwiVXNlckNvbW1lbnRcIiwgICAgICAgICAgICAgLy8gQ29tbWVudHMgYnkgdXNlclxuXG4gICAgLy8gcmVsYXRlZCBmaWxlXG4gICAgJzB4QTAwNCc6IFwiUmVsYXRlZFNvdW5kRmlsZVwiLCAgICAgICAgLy8gTmFtZSBvZiByZWxhdGVkIHNvdW5kIGZpbGVcblxuICAgIC8vIGRhdGUgYW5kIHRpbWVcbiAgICAnMHg5MDAzJzogXCJEYXRlVGltZU9yaWdpbmFsXCIsICAgICAgICAvLyBEYXRlIGFuZCB0aW1lIHdoZW4gdGhlIG9yaWdpbmFsIGltYWdlIHdhcyBnZW5lcmF0ZWRcbiAgICAnMHg5MDA0JzogXCJEYXRlVGltZURpZ2l0aXplZFwiLCAgICAgICAvLyBEYXRlIGFuZCB0aW1lIHdoZW4gdGhlIGltYWdlIHdhcyBzdG9yZWQgZGlnaXRhbGx5XG4gICAgJzB4OTI5MCc6IFwiU3Vic2VjVGltZVwiLCAgICAgICAgICAgICAgLy8gRnJhY3Rpb25zIG9mIHNlY29uZHMgZm9yIERhdGVUaW1lXG4gICAgJzB4OTI5MSc6IFwiU3Vic2VjVGltZU9yaWdpbmFsXCIsICAgICAgLy8gRnJhY3Rpb25zIG9mIHNlY29uZHMgZm9yIERhdGVUaW1lT3JpZ2luYWxcbiAgICAnMHg5MjkyJzogXCJTdWJzZWNUaW1lRGlnaXRpemVkXCIsICAgICAvLyBGcmFjdGlvbnMgb2Ygc2Vjb25kcyBmb3IgRGF0ZVRpbWVEaWdpdGl6ZWRcblxuICAgIC8vIHBpY3R1cmUtdGFraW5nIGNvbmRpdGlvbnNcbiAgICAnMHg4MjlBJzogXCJFeHBvc3VyZVRpbWVcIiwgICAgICAgICAgICAvLyBFeHBvc3VyZSB0aW1lIChpbiBzZWNvbmRzKVxuICAgICcweDgyOUQnOiBcIkZOdW1iZXJcIiwgICAgICAgICAgICAgICAgIC8vIEYgbnVtYmVyXG4gICAgJzB4ODgyMic6IFwiRXhwb3N1cmVQcm9ncmFtXCIsICAgICAgICAgLy8gRXhwb3N1cmUgcHJvZ3JhbVxuICAgICcweDg4MjQnOiBcIlNwZWN0cmFsU2Vuc2l0aXZpdHlcIiwgICAgIC8vIFNwZWN0cmFsIHNlbnNpdGl2aXR5XG4gICAgJzB4ODgyNyc6IFwiSVNPU3BlZWRSYXRpbmdzXCIsICAgICAgICAgLy8gSVNPIHNwZWVkIHJhdGluZ1xuICAgICcweDg4MjgnOiBcIk9FQ0ZcIiwgICAgICAgICAgICAgICAgICAgIC8vIE9wdG9lbGVjdHJpYyBjb252ZXJzaW9uIGZhY3RvclxuICAgICcweDkyMDEnOiBcIlNodXR0ZXJTcGVlZFZhbHVlXCIsICAgICAgIC8vIFNodXR0ZXIgc3BlZWRcbiAgICAnMHg5MjAyJzogXCJBcGVydHVyZVZhbHVlXCIsICAgICAgICAgICAvLyBMZW5zIGFwZXJ0dXJlXG4gICAgJzB4OTIwMyc6IFwiQnJpZ2h0bmVzc1ZhbHVlXCIsICAgICAgICAgLy8gVmFsdWUgb2YgYnJpZ2h0bmVzc1xuICAgICcweDkyMDQnOiBcIkV4cG9zdXJlQmlhc1wiLCAgICAgICAgICAgIC8vIEV4cG9zdXJlIGJpYXNcbiAgICAnMHg5MjA1JzogXCJNYXhBcGVydHVyZVZhbHVlXCIsICAgICAgICAvLyBTbWFsbGVzdCBGIG51bWJlciBvZiBsZW5zXG4gICAgJzB4OTIwNic6IFwiU3ViamVjdERpc3RhbmNlXCIsICAgICAgICAgLy8gRGlzdGFuY2UgdG8gc3ViamVjdCBpbiBtZXRlcnNcbiAgICAnMHg5MjA3JzogXCJNZXRlcmluZ01vZGVcIiwgICAgICAgICAgICAvLyBNZXRlcmluZyBtb2RlXG4gICAgJzB4OTIwOCc6IFwiTGlnaHRTb3VyY2VcIiwgICAgICAgICAgICAgLy8gS2luZCBvZiBsaWdodCBzb3VyY2VcbiAgICAnMHg5MjA5JzogXCJGbGFzaFwiLCAgICAgICAgICAgICAgICAgICAvLyBGbGFzaCBzdGF0dXNcbiAgICAnMHg5MjE0JzogXCJTdWJqZWN0QXJlYVwiLCAgICAgICAgICAgICAvLyBMb2NhdGlvbiBhbmQgYXJlYSBvZiBtYWluIHN1YmplY3RcbiAgICAnMHg5MjBBJzogXCJGb2NhbExlbmd0aFwiLCAgICAgICAgICAgICAvLyBGb2NhbCBsZW5ndGggb2YgdGhlIGxlbnMgaW4gbW1cbiAgICAnMHhBMjBCJzogXCJGbGFzaEVuZXJneVwiLCAgICAgICAgICAgICAvLyBTdHJvYmUgZW5lcmd5IGluIEJDUFNcbiAgICAnMHhBMjBDJzogXCJTcGF0aWFsRnJlcXVlbmN5UmVzcG9uc2VcIiwgICAgLy9cbiAgICAnMHhBMjBFJzogXCJGb2NhbFBsYW5lWFJlc29sdXRpb25cIiwgICAvLyBOdW1iZXIgb2YgcGl4ZWxzIGluIHdpZHRoIGRpcmVjdGlvbiBwZXIgRm9jYWxQbGFuZVJlc29sdXRpb25Vbml0XG4gICAgJzB4QTIwRic6IFwiRm9jYWxQbGFuZVlSZXNvbHV0aW9uXCIsICAgLy8gTnVtYmVyIG9mIHBpeGVscyBpbiBoZWlnaHQgZGlyZWN0aW9uIHBlciBGb2NhbFBsYW5lUmVzb2x1dGlvblVuaXRcbiAgICAnMHhBMjEwJzogXCJGb2NhbFBsYW5lUmVzb2x1dGlvblVuaXRcIiwgICAgLy8gVW5pdCBmb3IgbWVhc3VyaW5nIEZvY2FsUGxhbmVYUmVzb2x1dGlvbiBhbmQgRm9jYWxQbGFuZVlSZXNvbHV0aW9uXG4gICAgJzB4QTIxNCc6IFwiU3ViamVjdExvY2F0aW9uXCIsICAgICAgICAgLy8gTG9jYXRpb24gb2Ygc3ViamVjdCBpbiBpbWFnZVxuICAgICcweEEyMTUnOiBcIkV4cG9zdXJlSW5kZXhcIiwgICAgICAgICAgIC8vIEV4cG9zdXJlIGluZGV4IHNlbGVjdGVkIG9uIGNhbWVyYVxuICAgICcweEEyMTcnOiBcIlNlbnNpbmdNZXRob2RcIiwgICAgICAgICAgIC8vIEltYWdlIHNlbnNvciB0eXBlXG4gICAgJzB4QTMwMCc6IFwiRmlsZVNvdXJjZVwiLCAgICAgICAgICAgICAgLy8gSW1hZ2Ugc291cmNlICgzID09IERTQylcbiAgICAnMHhBMzAxJzogXCJTY2VuZVR5cGVcIiwgICAgICAgICAgICAgICAvLyBTY2VuZSB0eXBlICgxID09IGRpcmVjdGx5IHBob3RvZ3JhcGhlZClcbiAgICAnMHhBMzAyJzogXCJDRkFQYXR0ZXJuXCIsICAgICAgICAgICAgICAvLyBDb2xvciBmaWx0ZXIgYXJyYXkgZ2VvbWV0cmljIHBhdHRlcm5cbiAgICAnMHhBNDAxJzogXCJDdXN0b21SZW5kZXJlZFwiLCAgICAgICAgICAvLyBTcGVjaWFsIHByb2Nlc3NpbmdcbiAgICAnMHhBNDAyJzogXCJFeHBvc3VyZU1vZGVcIiwgICAgICAgICAgICAvLyBFeHBvc3VyZSBtb2RlXG4gICAgJzB4QTQwMyc6IFwiV2hpdGVCYWxhbmNlXCIsICAgICAgICAgICAgLy8gMSA9IGF1dG8gd2hpdGUgYmFsYW5jZSwgMiA9IG1hbnVhbFxuICAgICcweEE0MDQnOiBcIkRpZ2l0YWxab29tUmF0aW9uXCIsICAgICAgIC8vIERpZ2l0YWwgem9vbSByYXRpb1xuICAgICcweEE0MDUnOiBcIkZvY2FsTGVuZ3RoSW4zNW1tRmlsbVwiLCAgIC8vIEVxdWl2YWxlbnQgZm9hY2wgbGVuZ3RoIGFzc3VtaW5nIDM1bW0gZmlsbSBjYW1lcmEgKGluIG1tKVxuICAgICcweEE0MDYnOiBcIlNjZW5lQ2FwdHVyZVR5cGVcIiwgICAgICAgIC8vIFR5cGUgb2Ygc2NlbmVcbiAgICAnMHhBNDA3JzogXCJHYWluQ29udHJvbFwiLCAgICAgICAgICAgICAvLyBEZWdyZWUgb2Ygb3ZlcmFsbCBpbWFnZSBnYWluIGFkanVzdG1lbnRcbiAgICAnMHhBNDA4JzogXCJDb250cmFzdFwiLCAgICAgICAgICAgICAgICAvLyBEaXJlY3Rpb24gb2YgY29udHJhc3QgcHJvY2Vzc2luZyBhcHBsaWVkIGJ5IGNhbWVyYVxuICAgICcweEE0MDknOiBcIlNhdHVyYXRpb25cIiwgICAgICAgICAgICAgIC8vIERpcmVjdGlvbiBvZiBzYXR1cmF0aW9uIHByb2Nlc3NpbmcgYXBwbGllZCBieSBjYW1lcmFcbiAgICAnMHhBNDBBJzogXCJTaGFycG5lc3NcIiwgICAgICAgICAgICAgICAvLyBEaXJlY3Rpb24gb2Ygc2hhcnBuZXNzIHByb2Nlc3NpbmcgYXBwbGllZCBieSBjYW1lcmFcbiAgICAnMHhBNDBCJzogXCJEZXZpY2VTZXR0aW5nRGVzY3JpcHRpb25cIiwgICAgLy9cbiAgICAnMHhBNDBDJzogXCJTdWJqZWN0RGlzdGFuY2VSYW5nZVwiLCAgICAvLyBEaXN0YW5jZSB0byBzdWJqZWN0XG5cbiAgICAvLyBvdGhlciB0YWdzXG4gICAgJzB4QTAwNSc6IFwiSW50ZXJvcGVyYWJpbGl0eUlGRFBvaW50ZXJcIixcbiAgICAnMHhBNDIwJzogXCJJbWFnZVVuaXF1ZUlEXCIgICAgICAgICAgICAvLyBJZGVudGlmaWVyIGFzc2lnbmVkIHVuaXF1ZWx5IHRvIGVhY2ggaW1hZ2VcbiAgfTtcblxuICBzdGF0aWMgVGlmZlRhZ3MgPSB7XG4gICAgJzB4MDEwMCc6IFwiSW1hZ2VXaWR0aFwiLFxuICAgICcweDAxMDEnOiBcIkltYWdlSGVpZ2h0XCIsXG4gICAgJzB4ODc2OSc6IFwiRXhpZklGRFBvaW50ZXJcIixcbiAgICAnMHg4ODI1JzogXCJHUFNJbmZvSUZEUG9pbnRlclwiLFxuICAgICcweEEwMDUnOiBcIkludGVyb3BlcmFiaWxpdHlJRkRQb2ludGVyXCIsXG4gICAgJzB4MDEwMic6IFwiQml0c1BlclNhbXBsZVwiLFxuICAgICcweDAxMDMnOiBcIkNvbXByZXNzaW9uXCIsXG4gICAgJzB4MDEwNic6IFwiUGhvdG9tZXRyaWNJbnRlcnByZXRhdGlvblwiLFxuICAgICcweDAxMTInOiBcIk9yaWVudGF0aW9uXCIsXG4gICAgJzB4MDExNSc6IFwiU2FtcGxlc1BlclBpeGVsXCIsXG4gICAgJzB4MDExQyc6IFwiUGxhbmFyQ29uZmlndXJhdGlvblwiLFxuICAgICcweDAyMTInOiBcIllDYkNyU3ViU2FtcGxpbmdcIixcbiAgICAnMHgwMjEzJzogXCJZQ2JDclBvc2l0aW9uaW5nXCIsXG4gICAgJzB4MDExQSc6IFwiWFJlc29sdXRpb25cIixcbiAgICAnMHgwMTFCJzogXCJZUmVzb2x1dGlvblwiLFxuICAgICcweDAxMjgnOiBcIlJlc29sdXRpb25Vbml0XCIsXG4gICAgJzB4MDExMSc6IFwiU3RyaXBPZmZzZXRzXCIsXG4gICAgJzB4MDExNic6IFwiUm93c1BlclN0cmlwXCIsXG4gICAgJzB4MDExNyc6IFwiU3RyaXBCeXRlQ291bnRzXCIsXG4gICAgJzB4MDIwMSc6IFwiSlBFR0ludGVyY2hhbmdlRm9ybWF0XCIsXG4gICAgJzB4MDIwMic6IFwiSlBFR0ludGVyY2hhbmdlRm9ybWF0TGVuZ3RoXCIsXG4gICAgJzB4MDEyRCc6IFwiVHJhbnNmZXJGdW5jdGlvblwiLFxuICAgICcweDAxM0UnOiBcIldoaXRlUG9pbnRcIixcbiAgICAnMHgwMTNGJzogXCJQcmltYXJ5Q2hyb21hdGljaXRpZXNcIixcbiAgICAnMHgwMjExJzogXCJZQ2JDckNvZWZmaWNpZW50c1wiLFxuICAgICcweDAyMTQnOiBcIlJlZmVyZW5jZUJsYWNrV2hpdGVcIixcbiAgICAnMHgwMTMyJzogXCJEYXRlVGltZVwiLFxuICAgICcweDAxMEUnOiBcIkltYWdlRGVzY3JpcHRpb25cIixcbiAgICAnMHgwMTBGJzogXCJNYWtlXCIsXG4gICAgJzB4MDExMCc6IFwiTW9kZWxcIixcbiAgICAnMHgwMTMxJzogXCJTb2Z0d2FyZVwiLFxuICAgICcweDAxM0InOiBcIkFydGlzdFwiLFxuICAgICcweDgyOTgnOiBcIkNvcHlyaWdodFwiXG4gIH07XG5cbiAgc3RhdGljIEdQU1RhZ3MgPSB7XG4gICAgJzB4MDAwMCc6IFwiR1BTVmVyc2lvbklEXCIsXG4gICAgJzB4MDAwMSc6IFwiR1BTTGF0aXR1ZGVSZWZcIixcbiAgICAnMHgwMDAyJzogXCJHUFNMYXRpdHVkZVwiLFxuICAgICcweDAwMDMnOiBcIkdQU0xvbmdpdHVkZVJlZlwiLFxuICAgICcweDAwMDQnOiBcIkdQU0xvbmdpdHVkZVwiLFxuICAgICcweDAwMDUnOiBcIkdQU0FsdGl0dWRlUmVmXCIsXG4gICAgJzB4MDAwNic6IFwiR1BTQWx0aXR1ZGVcIixcbiAgICAnMHgwMDA3JzogXCJHUFNUaW1lU3RhbXBcIixcbiAgICAnMHgwMDA4JzogXCJHUFNTYXRlbGxpdGVzXCIsXG4gICAgJzB4MDAwOSc6IFwiR1BTU3RhdHVzXCIsXG4gICAgJzB4MDAwQSc6IFwiR1BTTWVhc3VyZU1vZGVcIixcbiAgICAnMHgwMDBCJzogXCJHUFNET1BcIixcbiAgICAnMHgwMDBDJzogXCJHUFNTcGVlZFJlZlwiLFxuICAgICcweDAwMEQnOiBcIkdQU1NwZWVkXCIsXG4gICAgJzB4MDAwRSc6IFwiR1BTVHJhY2tSZWZcIixcbiAgICAnMHgwMDBGJzogXCJHUFNUcmFja1wiLFxuICAgICcweDAwMTAnOiBcIkdQU0ltZ0RpcmVjdGlvblJlZlwiLFxuICAgICcweDAwMTEnOiBcIkdQU0ltZ0RpcmVjdGlvblwiLFxuICAgICcweDAwMTInOiBcIkdQU01hcERhdHVtXCIsXG4gICAgJzB4MDAxMyc6IFwiR1BTRGVzdExhdGl0dWRlUmVmXCIsXG4gICAgJzB4MDAxNCc6IFwiR1BTRGVzdExhdGl0dWRlXCIsXG4gICAgJzB4MDAxNSc6IFwiR1BTRGVzdExvbmdpdHVkZVJlZlwiLFxuICAgICcweDAwMTYnOiBcIkdQU0Rlc3RMb25naXR1ZGVcIixcbiAgICAnMHgwMDE3JzogXCJHUFNEZXN0QmVhcmluZ1JlZlwiLFxuICAgICcweDAwMTgnOiBcIkdQU0Rlc3RCZWFyaW5nXCIsXG4gICAgJzB4MDAxOSc6IFwiR1BTRGVzdERpc3RhbmNlUmVmXCIsXG4gICAgJzB4MDAxQSc6IFwiR1BTRGVzdERpc3RhbmNlXCIsXG4gICAgJzB4MDAxQic6IFwiR1BTUHJvY2Vzc2luZ01ldGhvZFwiLFxuICAgICcweDAwMUMnOiBcIkdQU0FyZWFJbmZvcm1hdGlvblwiLFxuICAgICcweDAwMUQnOiBcIkdQU0RhdGVTdGFtcFwiLFxuICAgICcweDAwMUUnOiBcIkdQU0RpZmZlcmVudGlhbFwiXG4gIH07XG5cbiAgc3RhdGljIFN0cmluZ1ZhbHVlcyA9IHtcbiAgICBFeHBvc3VyZVByb2dyYW06IHtcbiAgICAgICcwJzogXCJOb3QgZGVmaW5lZFwiLFxuICAgICAgJzEnOiBcIk1hbnVhbFwiLFxuICAgICAgJzInOiBcIk5vcm1hbCBwcm9ncmFtXCIsXG4gICAgICAnMyc6IFwiQXBlcnR1cmUgcHJpb3JpdHlcIixcbiAgICAgICc0JzogXCJTaHV0dGVyIHByaW9yaXR5XCIsXG4gICAgICAnNSc6IFwiQ3JlYXRpdmUgcHJvZ3JhbVwiLFxuICAgICAgJzYnOiBcIkFjdGlvbiBwcm9ncmFtXCIsXG4gICAgICAnNyc6IFwiUG9ydHJhaXQgbW9kZVwiLFxuICAgICAgJzgnOiBcIkxhbmRzY2FwZSBtb2RlXCJcbiAgICB9LFxuICAgIE1ldGVyaW5nTW9kZToge1xuICAgICAgJzAnOiBcIlVua25vd25cIixcbiAgICAgICcxJzogXCJBdmVyYWdlXCIsXG4gICAgICAnMic6IFwiQ2VudGVyV2VpZ2h0ZWRBdmVyYWdlXCIsXG4gICAgICAnMyc6IFwiU3BvdFwiLFxuICAgICAgJzQnOiBcIk11bHRpU3BvdFwiLFxuICAgICAgJzUnOiBcIlBhdHRlcm5cIixcbiAgICAgICc2JzogXCJQYXJ0aWFsXCIsXG4gICAgICAnMjU1JzogXCJPdGhlclwiXG4gICAgfSxcbiAgICBMaWdodFNvdXJjZToge1xuICAgICAgJzAnOiBcIlVua25vd25cIixcbiAgICAgICcxJzogXCJEYXlsaWdodFwiLFxuICAgICAgJzInOiBcIkZsdW9yZXNjZW50XCIsXG4gICAgICAnMyc6IFwiVHVuZ3N0ZW4gKGluY2FuZGVzY2VudCBsaWdodClcIixcbiAgICAgICc0JzogXCJGbGFzaFwiLFxuICAgICAgJzknOiBcIkZpbmUgd2VhdGhlclwiLFxuICAgICAgJzEwJzogXCJDbG91ZHkgd2VhdGhlclwiLFxuICAgICAgJzExJzogXCJTaGFkZVwiLFxuICAgICAgJzEyJzogXCJEYXlsaWdodCBmbHVvcmVzY2VudCAoRCA1NzAwIC0gNzEwMEspXCIsXG4gICAgICAnMTMnOiBcIkRheSB3aGl0ZSBmbHVvcmVzY2VudCAoTiA0NjAwIC0gNTQwMEspXCIsXG4gICAgICAnMTQnOiBcIkNvb2wgd2hpdGUgZmx1b3Jlc2NlbnQgKFcgMzkwMCAtIDQ1MDBLKVwiLFxuICAgICAgJzE1JzogXCJXaGl0ZSBmbHVvcmVzY2VudCAoV1cgMzIwMCAtIDM3MDBLKVwiLFxuICAgICAgJzE3JzogXCJTdGFuZGFyZCBsaWdodCBBXCIsXG4gICAgICAnMTgnOiBcIlN0YW5kYXJkIGxpZ2h0IEJcIixcbiAgICAgICcxOSc6IFwiU3RhbmRhcmQgbGlnaHQgQ1wiLFxuICAgICAgJzIwJzogXCJENTVcIixcbiAgICAgICcyMSc6IFwiRDY1XCIsXG4gICAgICAnMjInOiBcIkQ3NVwiLFxuICAgICAgJzIzJzogXCJENTBcIixcbiAgICAgICcyNCc6IFwiSVNPIHN0dWRpbyB0dW5nc3RlblwiLFxuICAgICAgJzI1NSc6IFwiT3RoZXJcIlxuICAgIH0sXG4gICAgRmxhc2g6IHtcbiAgICAgICcweDAwMDAnOiBcIkZsYXNoIGRpZCBub3QgZmlyZVwiLFxuICAgICAgJzB4MDAwMSc6IFwiRmxhc2ggZmlyZWRcIixcbiAgICAgICcweDAwMDUnOiBcIlN0cm9iZSByZXR1cm4gbGlnaHQgbm90IGRldGVjdGVkXCIsXG4gICAgICAnMHgwMDA3JzogXCJTdHJvYmUgcmV0dXJuIGxpZ2h0IGRldGVjdGVkXCIsXG4gICAgICAnMHgwMDA5JzogXCJGbGFzaCBmaXJlZCwgY29tcHVsc29yeSBmbGFzaCBtb2RlXCIsXG4gICAgICAnMHgwMDBEJzogXCJGbGFzaCBmaXJlZCwgY29tcHVsc29yeSBmbGFzaCBtb2RlLCByZXR1cm4gbGlnaHQgbm90IGRldGVjdGVkXCIsXG4gICAgICAnMHgwMDBGJzogXCJGbGFzaCBmaXJlZCwgY29tcHVsc29yeSBmbGFzaCBtb2RlLCByZXR1cm4gbGlnaHQgZGV0ZWN0ZWRcIixcbiAgICAgICcweDAwMTAnOiBcIkZsYXNoIGRpZCBub3QgZmlyZSwgY29tcHVsc29yeSBmbGFzaCBtb2RlXCIsXG4gICAgICAnMHgwMDE4JzogXCJGbGFzaCBkaWQgbm90IGZpcmUsIGF1dG8gbW9kZVwiLFxuICAgICAgJzB4MDAxOSc6IFwiRmxhc2ggZmlyZWQsIGF1dG8gbW9kZVwiLFxuICAgICAgJzB4MDAxRCc6IFwiRmxhc2ggZmlyZWQsIGF1dG8gbW9kZSwgcmV0dXJuIGxpZ2h0IG5vdCBkZXRlY3RlZFwiLFxuICAgICAgJzB4MDAxRic6IFwiRmxhc2ggZmlyZWQsIGF1dG8gbW9kZSwgcmV0dXJuIGxpZ2h0IGRldGVjdGVkXCIsXG4gICAgICAnMHgwMDIwJzogXCJObyBmbGFzaCBmdW5jdGlvblwiLFxuICAgICAgJzB4MDA0MSc6IFwiRmxhc2ggZmlyZWQsIHJlZC1leWUgcmVkdWN0aW9uIG1vZGVcIixcbiAgICAgICcweDAwNDUnOiBcIkZsYXNoIGZpcmVkLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlLCByZXR1cm4gbGlnaHQgbm90IGRldGVjdGVkXCIsXG4gICAgICAnMHgwMDQ3JzogXCJGbGFzaCBmaXJlZCwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZSwgcmV0dXJuIGxpZ2h0IGRldGVjdGVkXCIsXG4gICAgICAnMHgwMDQ5JzogXCJGbGFzaCBmaXJlZCwgY29tcHVsc29yeSBmbGFzaCBtb2RlLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlXCIsXG4gICAgICAnMHgwMDREJzogXCJGbGFzaCBmaXJlZCwgY29tcHVsc29yeSBmbGFzaCBtb2RlLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlLCByZXR1cm4gbGlnaHQgbm90IGRldGVjdGVkXCIsXG4gICAgICAnMHgwMDRGJzogXCJGbGFzaCBmaXJlZCwgY29tcHVsc29yeSBmbGFzaCBtb2RlLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlLCByZXR1cm4gbGlnaHQgZGV0ZWN0ZWRcIixcbiAgICAgICcweDAwNTknOiBcIkZsYXNoIGZpcmVkLCBhdXRvIG1vZGUsIHJlZC1leWUgcmVkdWN0aW9uIG1vZGVcIixcbiAgICAgICcweDAwNUQnOiBcIkZsYXNoIGZpcmVkLCBhdXRvIG1vZGUsIHJldHVybiBsaWdodCBub3QgZGV0ZWN0ZWQsIHJlZC1leWUgcmVkdWN0aW9uIG1vZGVcIixcbiAgICAgICcweDAwNUYnOiBcIkZsYXNoIGZpcmVkLCBhdXRvIG1vZGUsIHJldHVybiBsaWdodCBkZXRlY3RlZCwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZVwiXG4gICAgfSxcbiAgICBTZW5zaW5nTWV0aG9kOiB7XG4gICAgICAnMSc6IFwiTm90IGRlZmluZWRcIixcbiAgICAgICcyJzogXCJPbmUtY2hpcCBjb2xvciBhcmVhIHNlbnNvclwiLFxuICAgICAgJzMnOiBcIlR3by1jaGlwIGNvbG9yIGFyZWEgc2Vuc29yXCIsXG4gICAgICAnNCc6IFwiVGhyZWUtY2hpcCBjb2xvciBhcmVhIHNlbnNvclwiLFxuICAgICAgJzUnOiBcIkNvbG9yIHNlcXVlbnRpYWwgYXJlYSBzZW5zb3JcIixcbiAgICAgICc3JzogXCJUcmlsaW5lYXIgc2Vuc29yXCIsXG4gICAgICAnOCc6IFwiQ29sb3Igc2VxdWVudGlhbCBsaW5lYXIgc2Vuc29yXCJcbiAgICB9LFxuICAgIFNjZW5lQ2FwdHVyZVR5cGU6IHtcbiAgICAgICcwJzogXCJTdGFuZGFyZFwiLFxuICAgICAgJzEnOiBcIkxhbmRzY2FwZVwiLFxuICAgICAgJzInOiBcIlBvcnRyYWl0XCIsXG4gICAgICAnMyc6IFwiTmlnaHQgc2NlbmVcIlxuICAgIH0sXG4gICAgU2NlbmVUeXBlOiB7XG4gICAgICAnMSc6IFwiRGlyZWN0bHkgcGhvdG9ncmFwaGVkXCJcbiAgICB9LFxuICAgIEN1c3RvbVJlbmRlcmVkOiB7XG4gICAgICAnMCc6IFwiTm9ybWFsIHByb2Nlc3NcIixcbiAgICAgICcxJzogXCJDdXN0b20gcHJvY2Vzc1wiXG4gICAgfSxcbiAgICBXaGl0ZUJhbGFuY2U6IHtcbiAgICAgICcwJzogXCJBdXRvIHdoaXRlIGJhbGFuY2VcIixcbiAgICAgICcxJzogXCJNYW51YWwgd2hpdGUgYmFsYW5jZVwiXG4gICAgfSxcbiAgICBHYWluQ29udHJvbDoge1xuICAgICAgJzAnOiBcIk5vbmVcIixcbiAgICAgICcxJzogXCJMb3cgZ2FpbiB1cFwiLFxuICAgICAgJzInOiBcIkhpZ2ggZ2FpbiB1cFwiLFxuICAgICAgJzMnOiBcIkxvdyBnYWluIGRvd25cIixcbiAgICAgICc0JzogXCJIaWdoIGdhaW4gZG93blwiXG4gICAgfSxcbiAgICBDb250cmFzdDoge1xuICAgICAgJzAnOiBcIk5vcm1hbFwiLFxuICAgICAgJzEnOiBcIlNvZnRcIixcbiAgICAgICcyJzogXCJIYXJkXCJcbiAgICB9LFxuICAgIFNhdHVyYXRpb246IHtcbiAgICAgICcwJzogXCJOb3JtYWxcIixcbiAgICAgICcxJzogXCJMb3cgc2F0dXJhdGlvblwiLFxuICAgICAgJzInOiBcIkhpZ2ggc2F0dXJhdGlvblwiXG4gICAgfSxcbiAgICBTaGFycG5lc3M6IHtcbiAgICAgICcwJzogXCJOb3JtYWxcIixcbiAgICAgICcxJzogXCJTb2Z0XCIsXG4gICAgICAnMic6IFwiSGFyZFwiXG4gICAgfSxcbiAgICBTdWJqZWN0RGlzdGFuY2VSYW5nZToge1xuICAgICAgJzAnOiBcIlVua25vd25cIixcbiAgICAgICcxJzogXCJNYWNyb1wiLFxuICAgICAgJzInOiBcIkNsb3NlIHZpZXdcIixcbiAgICAgICczJzogXCJEaXN0YW50IHZpZXdcIlxuICAgIH0sXG4gICAgRmlsZVNvdXJjZToge1xuICAgICAgJzMnOiBcIkRTQ1wiXG4gICAgfSxcblxuICAgIENvbXBvbmVudHM6IHtcbiAgICAgICcwJzogXCJcIixcbiAgICAgICcxJzogXCJZXCIsXG4gICAgICAnMic6IFwiQ2JcIixcbiAgICAgICczJzogXCJDclwiLFxuICAgICAgJzQnOiBcIlJcIixcbiAgICAgICc1JzogXCJHXCIsXG4gICAgICAnNic6IFwiQlwiXG4gICAgfVxuICB9O1xuXG4gIHN0YXRpYyBJcHRjRmllbGRNYXAgPSB7XG4gICAgJzB4NzgnOiAnY2FwdGlvbicsXG4gICAgJzB4NkUnOiAnY3JlZGl0JyxcbiAgICAnMHgxOSc6ICdrZXl3b3JkcycsXG4gICAgJzB4MzcnOiAnZGF0ZUNyZWF0ZWQnLFxuICAgICcweDUwJzogJ2J5bGluZScsXG4gICAgJzB4NTUnOiAnYnlsaW5lVGl0bGUnLFxuICAgICcweDdBJzogJ2NhcHRpb25Xcml0ZXInLFxuICAgICcweDY5JzogJ2hlYWRsaW5lJyxcbiAgICAnMHg3NCc6ICdjb3B5cmlnaHQnLFxuICAgICcweDBGJzogJ2NhdGVnb3J5J1xuICB9O1xuXG4gIHN0YXRpYyByZWFkSVBUQ0RhdGEoZmlsZSwgc3RhcnRPZmZzZXQsIHNlY3Rpb25MZW5ndGgpIHtcbiAgICB2YXIgZGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcoZmlsZSk7XG4gICAgdmFyIGRhdGEgPSB7fTtcbiAgICB2YXIgZmllbGRWYWx1ZSwgZmllbGROYW1lLCBkYXRhU2l6ZSwgc2VnbWVudFR5cGUsIHNlZ21lbnRTaXplO1xuICAgIHZhciBzZWdtZW50U3RhcnRQb3MgPSBzdGFydE9mZnNldDtcbiAgICB3aGlsZSAoc2VnbWVudFN0YXJ0UG9zIDwgc3RhcnRPZmZzZXQgKyBzZWN0aW9uTGVuZ3RoKSB7XG4gICAgICBpZiAoZGF0YVZpZXcuZ2V0VWludDgoc2VnbWVudFN0YXJ0UG9zKSA9PT0gMHgxQyAmJiBkYXRhVmlldy5nZXRVaW50OChzZWdtZW50U3RhcnRQb3MgKyAxKSA9PT0gMHgwMikge1xuICAgICAgICBzZWdtZW50VHlwZSA9IGRhdGFWaWV3LmdldFVpbnQ4KHNlZ21lbnRTdGFydFBvcyArIDIpO1xuICAgICAgICBpZiAoc2VnbWVudFR5cGUgaW4gQ3JvcEVYSUYuSXB0Y0ZpZWxkTWFwKSB7XG4gICAgICAgICAgZGF0YVNpemUgPSBkYXRhVmlldy5nZXRJbnQxNihzZWdtZW50U3RhcnRQb3MgKyAzKTtcbiAgICAgICAgICBzZWdtZW50U2l6ZSA9IGRhdGFTaXplICsgNTtcbiAgICAgICAgICBmaWVsZE5hbWUgPSBDcm9wRVhJRi5JcHRjRmllbGRNYXBbc2VnbWVudFR5cGVdO1xuICAgICAgICAgIGZpZWxkVmFsdWUgPSBDcm9wRVhJRi5nZXRTdHJpbmdGcm9tREIoZGF0YVZpZXcsIHNlZ21lbnRTdGFydFBvcyArIDUsIGRhdGFTaXplKTtcbiAgICAgICAgICAvLyBDaGVjayBpZiB3ZSBhbHJlYWR5IHN0b3JlZCBhIHZhbHVlIHdpdGggdGhpcyBuYW1lXG4gICAgICAgICAgaWYgKGRhdGEuaGFzT3duUHJvcGVydHkoZmllbGROYW1lKSkge1xuICAgICAgICAgICAgLy8gVmFsdWUgYWxyZWFkeSBzdG9yZWQgd2l0aCB0aGlzIG5hbWUsIGNyZWF0ZSBtdWx0aXZhbHVlIGZpZWxkXG4gICAgICAgICAgICBpZiAoZGF0YVtmaWVsZE5hbWVdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgZGF0YVtmaWVsZE5hbWVdLnB1c2goZmllbGRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgZGF0YVtmaWVsZE5hbWVdID0gW2RhdGFbZmllbGROYW1lXSwgZmllbGRWYWx1ZV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGF0YVtmaWVsZE5hbWVdID0gZmllbGRWYWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgfVxuICAgICAgc2VnbWVudFN0YXJ0UG9zKys7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgc3RhdGljIHJlYWRUYWdzKGZpbGUsIHRpZmZTdGFydCwgZGlyU3RhcnQsIHN0cmluZ3MsIGJpZ0VuZCk6IHsgW2tleTogc3RyaW5nXTogYW55IH0ge1xuICAgIHZhciBlbnRyaWVzID0gZmlsZS5nZXRVaW50MTYoZGlyU3RhcnQsICFiaWdFbmQpLFxuICAgICAgdGFncyA9IHt9LFxuICAgICAgZW50cnlPZmZzZXQsIHRhZyxcbiAgICAgIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgZW50cmllczsgaSsrKSB7XG4gICAgICBlbnRyeU9mZnNldCA9IGRpclN0YXJ0ICsgaSAqIDEyICsgMjtcbiAgICAgIHRhZyA9IHN0cmluZ3NbZmlsZS5nZXRVaW50MTYoZW50cnlPZmZzZXQsICFiaWdFbmQpXTtcbiAgICAgIGlmICh0YWcpIHtcbiAgICAgICAgdGFnc1t0YWddID0gQ3JvcEVYSUYucmVhZFRhZ1ZhbHVlKGZpbGUsIGVudHJ5T2Zmc2V0LCB0aWZmU3RhcnQsIGRpclN0YXJ0LCBiaWdFbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdVbmtub3duIHRhZzogJyArIGZpbGUuZ2V0VWludDE2KGVudHJ5T2Zmc2V0LCAhYmlnRW5kKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YWdzO1xuICB9XG5cbiAgc3RhdGljIHJlYWRUYWdWYWx1ZShmaWxlLCBlbnRyeU9mZnNldCwgdGlmZlN0YXJ0LCBkaXJTdGFydCwgYmlnRW5kKSB7XG4gICAgdmFyIHR5cGUgPSBmaWxlLmdldFVpbnQxNihlbnRyeU9mZnNldCArIDIsICFiaWdFbmQpLFxuICAgICAgbnVtVmFsdWVzID0gZmlsZS5nZXRVaW50MzIoZW50cnlPZmZzZXQgKyA0LCAhYmlnRW5kKSxcbiAgICAgIHZhbHVlT2Zmc2V0ID0gZmlsZS5nZXRVaW50MzIoZW50cnlPZmZzZXQgKyA4LCAhYmlnRW5kKSArIHRpZmZTdGFydCxcbiAgICAgIG9mZnNldCxcbiAgICAgIHZhbHMsIHZhbCwgbixcbiAgICAgIG51bWVyYXRvciwgZGVub21pbmF0b3I7XG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJzEnOiAvLyBieXRlLCA4LWJpdCB1bnNpZ25lZCBpbnRcbiAgICAgIGNhc2UgJzcnOiAvLyB1bmRlZmluZWQsIDgtYml0IGJ5dGUsIHZhbHVlIGRlcGVuZGluZyBvbiBmaWVsZFxuICAgICAgICBpZiAobnVtVmFsdWVzID09IDEpIHtcbiAgICAgICAgICByZXR1cm4gZmlsZS5nZXRVaW50OChlbnRyeU9mZnNldCArIDgsICFiaWdFbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9mZnNldCA9IG51bVZhbHVlcyA+IDQgPyB2YWx1ZU9mZnNldCA6IChlbnRyeU9mZnNldCArIDgpO1xuICAgICAgICAgIHZhbHMgPSBbXTtcbiAgICAgICAgICBmb3IgKG4gPSAwOyBuIDwgbnVtVmFsdWVzOyBuKyspIHtcbiAgICAgICAgICAgIHZhbHNbbl0gPSBmaWxlLmdldFVpbnQ4KG9mZnNldCArIG4pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdmFscztcbiAgICAgICAgfVxuXG4gICAgICBjYXNlICcyJzogLy8gYXNjaWksIDgtYml0IGJ5dGVcbiAgICAgICAgb2Zmc2V0ID0gbnVtVmFsdWVzID4gNCA/IHZhbHVlT2Zmc2V0IDogKGVudHJ5T2Zmc2V0ICsgOCk7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0cmluZ0Zyb21EQihmaWxlLCBvZmZzZXQsIG51bVZhbHVlcyAtIDEpO1xuXG4gICAgICBjYXNlICczJzogLy8gc2hvcnQsIDE2IGJpdCBpbnRcbiAgICAgICAgaWYgKG51bVZhbHVlcyA9PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIGZpbGUuZ2V0VWludDE2KGVudHJ5T2Zmc2V0ICsgOCwgIWJpZ0VuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2Zmc2V0ID0gbnVtVmFsdWVzID4gMiA/IHZhbHVlT2Zmc2V0IDogKGVudHJ5T2Zmc2V0ICsgOCk7XG4gICAgICAgICAgdmFscyA9IFtdO1xuICAgICAgICAgIGZvciAobiA9IDA7IG4gPCBudW1WYWx1ZXM7IG4rKykge1xuICAgICAgICAgICAgdmFsc1tuXSA9IGZpbGUuZ2V0VWludDE2KG9mZnNldCArIDIgKiBuLCAhYmlnRW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHM7XG4gICAgICAgIH1cblxuICAgICAgY2FzZSAnNCc6IC8vIGxvbmcsIDMyIGJpdCBpbnRcbiAgICAgICAgaWYgKG51bVZhbHVlcyA9PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIGZpbGUuZ2V0VWludDMyKGVudHJ5T2Zmc2V0ICsgOCwgIWJpZ0VuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFscyA9IFtdO1xuICAgICAgICAgIGZvciAobiA9IDA7IG4gPCBudW1WYWx1ZXM7IG4rKykge1xuICAgICAgICAgICAgdmFsc1tuXSA9IGZpbGUuZ2V0VWludDMyKHZhbHVlT2Zmc2V0ICsgNCAqIG4sICFiaWdFbmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdmFscztcbiAgICAgICAgfVxuXG4gICAgICBjYXNlICc1JzogICAgLy8gcmF0aW9uYWwgPSB0d28gbG9uZyB2YWx1ZXMsIGZpcnN0IGlzIG51bWVyYXRvciwgc2Vjb25kIGlzIGRlbm9taW5hdG9yXG4gICAgICAgIGlmIChudW1WYWx1ZXMgPT0gMSkge1xuICAgICAgICAgIG51bWVyYXRvciA9IGZpbGUuZ2V0VWludDMyKHZhbHVlT2Zmc2V0LCAhYmlnRW5kKTtcbiAgICAgICAgICBkZW5vbWluYXRvciA9IGZpbGUuZ2V0VWludDMyKHZhbHVlT2Zmc2V0ICsgNCwgIWJpZ0VuZCk7XG4gICAgICAgICAgdmFsID0gbmV3IE51bWJlcihudW1lcmF0b3IgLyBkZW5vbWluYXRvcik7XG4gICAgICAgICAgdmFsLm51bWVyYXRvciA9IG51bWVyYXRvcjtcbiAgICAgICAgICB2YWwuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcbiAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHMgPSBbXTtcbiAgICAgICAgICBmb3IgKG4gPSAwOyBuIDwgbnVtVmFsdWVzOyBuKyspIHtcbiAgICAgICAgICAgIG51bWVyYXRvciA9IGZpbGUuZ2V0VWludDMyKHZhbHVlT2Zmc2V0ICsgOCAqIG4sICFiaWdFbmQpO1xuICAgICAgICAgICAgZGVub21pbmF0b3IgPSBmaWxlLmdldFVpbnQzMih2YWx1ZU9mZnNldCArIDQgKyA4ICogbiwgIWJpZ0VuZCk7XG4gICAgICAgICAgICB2YWxzW25dID0gbmV3IE51bWJlcihudW1lcmF0b3IgLyBkZW5vbWluYXRvcik7XG4gICAgICAgICAgICB2YWxzW25dLm51bWVyYXRvciA9IG51bWVyYXRvcjtcbiAgICAgICAgICAgIHZhbHNbbl0uZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHM7XG4gICAgICAgIH1cblxuICAgICAgY2FzZSAnOSc6IC8vIHNsb25nLCAzMiBiaXQgc2lnbmVkIGludFxuICAgICAgICBpZiAobnVtVmFsdWVzID09IDEpIHtcbiAgICAgICAgICByZXR1cm4gZmlsZS5nZXRJbnQzMihlbnRyeU9mZnNldCArIDgsICFiaWdFbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHMgPSBbXTtcbiAgICAgICAgICBmb3IgKG4gPSAwOyBuIDwgbnVtVmFsdWVzOyBuKyspIHtcbiAgICAgICAgICAgIHZhbHNbbl0gPSBmaWxlLmdldEludDMyKHZhbHVlT2Zmc2V0ICsgNCAqIG4sICFiaWdFbmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdmFscztcbiAgICAgICAgfVxuXG4gICAgICBjYXNlICcxMCc6IC8vIHNpZ25lZCByYXRpb25hbCwgdHdvIHNsb25ncywgZmlyc3QgaXMgbnVtZXJhdG9yLCBzZWNvbmQgaXMgZGVub21pbmF0b3JcbiAgICAgICAgaWYgKG51bVZhbHVlcyA9PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIGZpbGUuZ2V0SW50MzIodmFsdWVPZmZzZXQsICFiaWdFbmQpIC8gZmlsZS5nZXRJbnQzMih2YWx1ZU9mZnNldCArIDQsICFiaWdFbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHMgPSBbXTtcbiAgICAgICAgICBmb3IgKG4gPSAwOyBuIDwgbnVtVmFsdWVzOyBuKyspIHtcbiAgICAgICAgICAgIHZhbHNbbl0gPSBmaWxlLmdldEludDMyKHZhbHVlT2Zmc2V0ICsgOCAqIG4sICFiaWdFbmQpIC8gZmlsZS5nZXRJbnQzMih2YWx1ZU9mZnNldCArIDQgKyA4ICogbiwgIWJpZ0VuZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB2YWxzO1xuICAgICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGFkZEV2ZW50KGVsZW1lbnQsIGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgaWYgKGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLCBmYWxzZSk7XG4gICAgfSBlbHNlIGlmIChlbGVtZW50LmF0dGFjaEV2ZW50KSB7XG4gICAgICBlbGVtZW50LmF0dGFjaEV2ZW50KFwib25cIiArIGV2ZW50LCBoYW5kbGVyKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgb2JqZWN0VVJMVG9CbG9iKHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgaHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xuICAgIGh0dHAucmVzcG9uc2VUeXBlID0gXCJibG9iXCI7XG4gICAgaHR0cC5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKHRoaXMuc3RhdHVzID09IDIwMCB8fCB0aGlzLnN0YXR1cyA9PT0gMCkge1xuICAgICAgICBjYWxsYmFjayh0aGlzLnJlc3BvbnNlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGh0dHAuc2VuZCgpO1xuICB9XG5cbiAgc3RhdGljIGhhbmRsZUJpbmFyeUZpbGUoYmluRmlsZSwgaW1nLCBjYWxsYmFjaz8pIHtcbiAgICB2YXIgZGF0YSA9IENyb3BFWElGLmZpbmRFWElGaW5KUEVHKGJpbkZpbGUpO1xuICAgIHZhciBpcHRjZGF0YSA9IENyb3BFWElGLmZpbmRJUFRDaW5KUEVHKGJpbkZpbGUpO1xuICAgIGltZy5leGlmZGF0YSA9IGRhdGEgfHwge307XG4gICAgaW1nLmlwdGNkYXRhID0gaXB0Y2RhdGEgfHwge307XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjay5jYWxsKGltZyk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGdldEltYWdlRGF0YShpbWcsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGltZy5zcmMpIHtcbiAgICAgIGlmICgvXmRhdGFcXDovaS50ZXN0KGltZy5zcmMpKSB7IC8vIERhdGEgVVJJXG4gICAgICAgIHZhciBhcnJheUJ1ZmZlciA9IENyb3BFWElGLmJhc2U2NFRvQXJyYXlCdWZmZXIoaW1nLnNyYyk7XG4gICAgICAgIHRoaXMuaGFuZGxlQmluYXJ5RmlsZShhcnJheUJ1ZmZlciwgaW1nLCBjYWxsYmFjayk7XG5cbiAgICAgIH0gZWxzZSBpZiAoL15ibG9iXFw6L2kudGVzdChpbWcuc3JjKSkgeyAvLyBPYmplY3QgVVJMXG4gICAgICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSAoZSkgPT4ge1xuICAgICAgICAgIHRoaXMuaGFuZGxlQmluYXJ5RmlsZShlLnRhcmdldC5yZXN1bHQsIGltZywgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgICAgICBDcm9wRVhJRi5vYmplY3RVUkxUb0Jsb2IoaW1nLnNyYywgZnVuY3Rpb24gKGJsb2IpIHtcbiAgICAgICAgICBmaWxlUmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBodHRwLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gMjAwIHx8IHRoaXMuc3RhdHVzID09PSAwKSB7XG4gICAgICAgICAgICBzZWxmLmhhbmRsZUJpbmFyeUZpbGUoaHR0cC5yZXNwb25zZSwgaW1nLCBjYWxsYmFjayk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IFwiQ291bGQgbm90IGxvYWQgaW1hZ2VcIjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaHR0cCA9IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIGh0dHAub3BlbihcIkdFVFwiLCBpbWcuc3JjLCB0cnVlKTtcbiAgICAgICAgaHR0cC5yZXNwb25zZVR5cGUgPSBcImFycmF5YnVmZmVyXCI7XG4gICAgICAgIGh0dHAuc2VuZChudWxsKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKEZpbGVSZWFkZXIgJiYgKGltZyBpbnN0YW5jZW9mIHdpbmRvdy5CbG9iIHx8IGltZyBpbnN0YW5jZW9mIEZpbGUpKSB7XG4gICAgICB2YXIgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IGUgPT4ge1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdnZXRJbWFnZURhdGE6IEdvdCBmaWxlIG9mIGxlbmd0aCAlbycsIGUudGFyZ2V0LnJlc3VsdC5ieXRlTGVuZ3RoKTtcbiAgICAgICAgdGhpcy5oYW5kbGVCaW5hcnlGaWxlKGUudGFyZ2V0LnJlc3VsdCwgaW1nLCBjYWxsYmFjayk7XG4gICAgICB9O1xuXG4gICAgICBmaWxlUmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGltZyk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGdldFN0cmluZ0Zyb21EQihidWZmZXIsIHN0YXJ0LCBsZW5ndGgpIHtcbiAgICB2YXIgb3V0c3RyID0gXCJcIjtcbiAgICBmb3IgKHZhciBuID0gc3RhcnQ7IG4gPCBzdGFydCArIGxlbmd0aDsgbisrKSB7XG4gICAgICBvdXRzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZmZXIuZ2V0VWludDgobikpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0c3RyO1xuICB9XG5cbiAgc3RhdGljIHJlYWRFWElGRGF0YShmaWxlLCBzdGFydCkge1xuICAgIGlmICh0aGlzLmdldFN0cmluZ0Zyb21EQihmaWxlLCBzdGFydCwgNCkgIT0gXCJFeGlmXCIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJOb3QgdmFsaWQgRVhJRiBkYXRhISBcIiArIHRoaXMuZ2V0U3RyaW5nRnJvbURCKGZpbGUsIHN0YXJ0LCA0KSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGJpZ0VuZCxcbiAgICAgIHRhZ3MsXG4gICAgICBleGlmRGF0YSwgZ3BzRGF0YSxcbiAgICAgIHRpZmZPZmZzZXQgPSBzdGFydCArIDY7XG4gICAgbGV0IHRhZzogc3RyaW5nO1xuXG4gICAgLy8gdGVzdCBmb3IgVElGRiB2YWxpZGl0eSBhbmQgZW5kaWFubmVzc1xuICAgIGlmIChmaWxlLmdldFVpbnQxNih0aWZmT2Zmc2V0KSA9PSAweDQ5NDkpIHtcbiAgICAgIGJpZ0VuZCA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoZmlsZS5nZXRVaW50MTYodGlmZk9mZnNldCkgPT0gMHg0RDREKSB7XG4gICAgICBiaWdFbmQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiTm90IHZhbGlkIFRJRkYgZGF0YSEgKG5vIDB4NDk0OSBvciAweDRENEQpXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChmaWxlLmdldFVpbnQxNih0aWZmT2Zmc2V0ICsgMiwgIWJpZ0VuZCkgIT0gMHgwMDJBKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiTm90IHZhbGlkIFRJRkYgZGF0YSEgKG5vIDB4MDAyQSlcIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGZpcnN0SUZET2Zmc2V0ID0gZmlsZS5nZXRVaW50MzIodGlmZk9mZnNldCArIDQsICFiaWdFbmQpO1xuXG4gICAgaWYgKGZpcnN0SUZET2Zmc2V0IDwgMHgwMDAwMDAwOCkge1xuICAgICAgY29uc29sZS5lcnJvcihcIk5vdCB2YWxpZCBUSUZGIGRhdGEhIChGaXJzdCBvZmZzZXQgbGVzcyB0aGFuIDgpXCIsIGZpbGUuZ2V0VWludDMyKHRpZmZPZmZzZXQgKyA0LCAhYmlnRW5kKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGFncyA9IENyb3BFWElGLnJlYWRUYWdzKGZpbGUsIHRpZmZPZmZzZXQsIHRpZmZPZmZzZXQgKyBmaXJzdElGRE9mZnNldCwgdGhpcy5UaWZmVGFncywgYmlnRW5kKTtcblxuICAgIGlmICh0YWdzLkV4aWZJRkRQb2ludGVyKSB7XG4gICAgICBleGlmRGF0YSA9IENyb3BFWElGLnJlYWRUYWdzKGZpbGUsIHRpZmZPZmZzZXQsIHRpZmZPZmZzZXQgKyB0YWdzLkV4aWZJRkRQb2ludGVyLCB0aGlzLkV4aWZUYWdzLCBiaWdFbmQpO1xuICAgICAgZm9yICh0YWcgaW4gZXhpZkRhdGEpIHtcbiAgICAgICAgc3dpdGNoICh0YWcpIHtcbiAgICAgICAgICBjYXNlIFwiTGlnaHRTb3VyY2VcIiA6XG4gICAgICAgICAgY2FzZSBcIkZsYXNoXCIgOlxuICAgICAgICAgIGNhc2UgXCJNZXRlcmluZ01vZGVcIiA6XG4gICAgICAgICAgY2FzZSBcIkV4cG9zdXJlUHJvZ3JhbVwiIDpcbiAgICAgICAgICBjYXNlIFwiU2Vuc2luZ01ldGhvZFwiIDpcbiAgICAgICAgICBjYXNlIFwiU2NlbmVDYXB0dXJlVHlwZVwiIDpcbiAgICAgICAgICBjYXNlIFwiU2NlbmVUeXBlXCIgOlxuICAgICAgICAgIGNhc2UgXCJDdXN0b21SZW5kZXJlZFwiIDpcbiAgICAgICAgICBjYXNlIFwiV2hpdGVCYWxhbmNlXCIgOlxuICAgICAgICAgIGNhc2UgXCJHYWluQ29udHJvbFwiIDpcbiAgICAgICAgICBjYXNlIFwiQ29udHJhc3RcIiA6XG4gICAgICAgICAgY2FzZSBcIlNhdHVyYXRpb25cIiA6XG4gICAgICAgICAgY2FzZSBcIlNoYXJwbmVzc1wiIDpcbiAgICAgICAgICBjYXNlIFwiU3ViamVjdERpc3RhbmNlUmFuZ2VcIiA6XG4gICAgICAgICAgY2FzZSBcIkZpbGVTb3VyY2VcIiA6XG4gICAgICAgICAgICBleGlmRGF0YVt0YWddID0gdGhpcy5TdHJpbmdWYWx1ZXNbdGFnXVtleGlmRGF0YVt0YWddXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBcIkV4aWZWZXJzaW9uXCIgOlxuICAgICAgICAgIGNhc2UgXCJGbGFzaHBpeFZlcnNpb25cIiA6XG4gICAgICAgICAgICBleGlmRGF0YVt0YWddID0gU3RyaW5nLmZyb21DaGFyQ29kZShleGlmRGF0YVt0YWddWzBdLCBleGlmRGF0YVt0YWddWzFdLCBleGlmRGF0YVt0YWddWzJdLCBleGlmRGF0YVt0YWddWzNdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBcIkNvbXBvbmVudHNDb25maWd1cmF0aW9uXCIgOlxuICAgICAgICAgICAgZXhpZkRhdGFbdGFnXSA9XG4gICAgICAgICAgICAgIHRoaXMuU3RyaW5nVmFsdWVzLkNvbXBvbmVudHNbZXhpZkRhdGFbdGFnXVswXV0gK1xuICAgICAgICAgICAgICB0aGlzLlN0cmluZ1ZhbHVlcy5Db21wb25lbnRzW2V4aWZEYXRhW3RhZ11bMV1dICtcbiAgICAgICAgICAgICAgdGhpcy5TdHJpbmdWYWx1ZXMuQ29tcG9uZW50c1tleGlmRGF0YVt0YWddWzJdXSArXG4gICAgICAgICAgICAgIHRoaXMuU3RyaW5nVmFsdWVzLkNvbXBvbmVudHNbZXhpZkRhdGFbdGFnXVszXV07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB0YWdzW3RhZ10gPSBleGlmRGF0YVt0YWddO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0YWdzLkdQU0luZm9JRkRQb2ludGVyKSB7XG4gICAgICBncHNEYXRhID0gdGhpcy5yZWFkVGFncyhmaWxlLCB0aWZmT2Zmc2V0LCB0aWZmT2Zmc2V0ICsgdGFncy5HUFNJbmZvSUZEUG9pbnRlciwgdGhpcy5HUFNUYWdzLCBiaWdFbmQpO1xuICAgICAgZm9yICh0YWcgaW4gZ3BzRGF0YSkge1xuICAgICAgICBzd2l0Y2ggKHRhZykge1xuICAgICAgICAgIGNhc2UgXCJHUFNWZXJzaW9uSURcIiA6XG4gICAgICAgICAgICBncHNEYXRhW3RhZ10gPSBncHNEYXRhW3RhZ11bMF0gK1xuICAgICAgICAgICAgICBcIi5cIiArIGdwc0RhdGFbdGFnXVsxXSArXG4gICAgICAgICAgICAgIFwiLlwiICsgZ3BzRGF0YVt0YWddWzJdICtcbiAgICAgICAgICAgICAgXCIuXCIgKyBncHNEYXRhW3RhZ11bM107XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICB0YWdzW3RhZ10gPSBncHNEYXRhW3RhZ107XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhZ3M7XG4gIH1cblxuICBzdGF0aWMgZ2V0RGF0YShpbWcsIGNhbGxiYWNrKSB7XG4gICAgaWYgKChpbWcgaW5zdGFuY2VvZiBJbWFnZSB8fCBpbWcgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50KSAmJiAhaW1nLmNvbXBsZXRlKSByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAoIXRoaXMuaW1hZ2VIYXNEYXRhKGltZykpIHtcbiAgICAgIENyb3BFWElGLmdldEltYWdlRGF0YShpbWcsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwoaW1nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgc3RhdGljIGdldFRhZyhpbWcsIHRhZykge1xuICAgIGlmICghdGhpcy5pbWFnZUhhc0RhdGEoaW1nKSkgcmV0dXJuO1xuICAgIHJldHVybiBpbWcuZXhpZmRhdGFbdGFnXTtcbiAgfTtcblxuICBzdGF0aWMgZ2V0QWxsVGFncyhpbWcpIHtcbiAgICBpZiAoIXRoaXMuaW1hZ2VIYXNEYXRhKGltZykpIHJldHVybiB7fTtcbiAgICB2YXIgYSxcbiAgICAgIGRhdGEgPSBpbWcuZXhpZmRhdGEsXG4gICAgICB0YWdzID0ge307XG4gICAgZm9yIChhIGluIGRhdGEpIHtcbiAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KGEpKSB7XG4gICAgICAgIHRhZ3NbYV0gPSBkYXRhW2FdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFncztcbiAgfTtcblxuICBzdGF0aWMgcHJldHR5KGltZykge1xuICAgIGlmICghdGhpcy5pbWFnZUhhc0RhdGEoaW1nKSkgcmV0dXJuIFwiXCI7XG4gICAgdmFyIGEsXG4gICAgICBkYXRhID0gaW1nLmV4aWZkYXRhLFxuICAgICAgc3RyUHJldHR5ID0gXCJcIjtcbiAgICBmb3IgKGEgaW4gZGF0YSkge1xuICAgICAgaWYgKGRhdGEuaGFzT3duUHJvcGVydHkoYSkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2FdID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICBpZiAoZGF0YVthXSBpbnN0YW5jZW9mIE51bWJlcikge1xuICAgICAgICAgICAgc3RyUHJldHR5ICs9IGEgKyBcIiA6IFwiICsgZGF0YVthXSArIFwiIFtcIiArIGRhdGFbYV0ubnVtZXJhdG9yICsgXCIvXCIgKyBkYXRhW2FdLmRlbm9taW5hdG9yICsgXCJdXFxyXFxuXCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0clByZXR0eSArPSBhICsgXCIgOiBbXCIgKyBkYXRhW2FdLmxlbmd0aCArIFwiIHZhbHVlc11cXHJcXG5cIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyUHJldHR5ICs9IGEgKyBcIiA6IFwiICsgZGF0YVthXSArIFwiXFxyXFxuXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0clByZXR0eTtcbiAgfVxuXG5cbiAgc3RhdGljIGZpbmRFWElGaW5KUEVHKGZpbGUpIHtcbiAgICB2YXIgZGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcoZmlsZSk7XG4gICAgdmFyIG1heE9mZnNldCA9IGRhdGFWaWV3LmJ5dGVMZW5ndGggLSA0O1xuXG4gICAgY29uc29sZS5kZWJ1ZygnZmluZEVYSUZpbkpQRUc6IEdvdCBmaWxlIG9mIGxlbmd0aCAlbycsIGZpbGUuYnl0ZUxlbmd0aCk7XG4gICAgaWYgKGRhdGFWaWV3LmdldFVpbnQxNigwKSAhPT0gMHhmZmQ4KSB7XG4gICAgICBjb25zb2xlLndhcm4oJ05vdCBhIHZhbGlkIEpQRUcnKTtcbiAgICAgIHJldHVybiBmYWxzZTsgLy8gbm90IGEgdmFsaWQganBlZ1xuICAgIH1cblxuICAgIHZhciBvZmZzZXQgPSAyO1xuICAgIHZhciBtYXJrZXI7XG5cbiAgICBmdW5jdGlvbiByZWFkQnl0ZSgpIHtcbiAgICAgIHZhciBzb21lQnl0ZSA9IGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCk7XG4gICAgICBvZmZzZXQrKztcbiAgICAgIHJldHVybiBzb21lQnl0ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWFkV29yZCgpIHtcbiAgICAgIHZhciBzb21lV29yZCA9IGRhdGFWaWV3LmdldFVpbnQxNihvZmZzZXQpO1xuICAgICAgb2Zmc2V0ID0gb2Zmc2V0ICsgMjtcbiAgICAgIHJldHVybiBzb21lV29yZDtcbiAgICB9XG5cbiAgICB3aGlsZSAob2Zmc2V0IDwgbWF4T2Zmc2V0KSB7XG4gICAgICB2YXIgc29tZUJ5dGUgPSByZWFkQnl0ZSgpO1xuICAgICAgaWYgKHNvbWVCeXRlICE9IDB4RkYpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignTm90IGEgdmFsaWQgbWFya2VyIGF0IG9mZnNldCAnICsgb2Zmc2V0ICsgXCIsIGZvdW5kOiBcIiArIHNvbWVCeXRlKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBub3QgYSB2YWxpZCBtYXJrZXIsIHNvbWV0aGluZyBpcyB3cm9uZ1xuICAgICAgfVxuICAgICAgbWFya2VyID0gcmVhZEJ5dGUoKTtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ01hcmtlcj0lbycsIG1hcmtlcik7XG5cbiAgICAgIC8vIHdlIGNvdWxkIGltcGxlbWVudCBoYW5kbGluZyBmb3Igb3RoZXIgbWFya2VycyBoZXJlLFxuICAgICAgLy8gYnV0IHdlJ3JlIG9ubHkgbG9va2luZyBmb3IgMHhGRkUxIGZvciBFWElGIGRhdGFcblxuICAgICAgdmFyIHNlZ21lbnRMZW5ndGggPSByZWFkV29yZCgpIC0gMjtcbiAgICAgIHN3aXRjaCAobWFya2VyKSB7XG4gICAgICAgIGNhc2UgJzB4RTEnOlxuICAgICAgICAgIHJldHVybiB0aGlzLnJlYWRFWElGRGF0YShkYXRhVmlldywgb2Zmc2V0LyosIHNlZ21lbnRMZW5ndGgqLyk7XG4gICAgICAgIGNhc2UgJzB4RTAnOiAvLyBKRklGXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgb2Zmc2V0ICs9IHNlZ21lbnRMZW5ndGg7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGZpbmRJUFRDaW5KUEVHKGZpbGUpIHtcbiAgICB2YXIgZGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcoZmlsZSk7XG5cbiAgICBjb25zb2xlLmRlYnVnKCdHb3QgZmlsZSBvZiBsZW5ndGggJyArIGZpbGUuYnl0ZUxlbmd0aCk7XG4gICAgaWYgKChkYXRhVmlldy5nZXRVaW50OCgwKSAhPSAweEZGKSB8fCAoZGF0YVZpZXcuZ2V0VWludDgoMSkgIT0gMHhEOCkpIHtcbiAgICAgIGNvbnNvbGUud2FybignTm90IGEgdmFsaWQgSlBFRycpO1xuICAgICAgcmV0dXJuIGZhbHNlOyAvLyBub3QgYSB2YWxpZCBqcGVnXG4gICAgfVxuXG4gICAgdmFyIG9mZnNldCA9IDIsXG4gICAgICBsZW5ndGggPSBmaWxlLmJ5dGVMZW5ndGg7XG5cblxuICAgIHZhciBpc0ZpZWxkU2VnbWVudFN0YXJ0ID0gZnVuY3Rpb24gKGRhdGFWaWV3LCBvZmZzZXQpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCkgPT09IDB4MzggJiZcbiAgICAgICAgZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0ICsgMSkgPT09IDB4NDIgJiZcbiAgICAgICAgZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0ICsgMikgPT09IDB4NDkgJiZcbiAgICAgICAgZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0ICsgMykgPT09IDB4NEQgJiZcbiAgICAgICAgZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0ICsgNCkgPT09IDB4MDQgJiZcbiAgICAgICAgZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0ICsgNSkgPT09IDB4MDRcbiAgICAgICk7XG4gICAgfTtcblxuICAgIHdoaWxlIChvZmZzZXQgPCBsZW5ndGgpIHtcbiAgICAgIGlmIChpc0ZpZWxkU2VnbWVudFN0YXJ0KGRhdGFWaWV3LCBvZmZzZXQpKSB7XG4gICAgICAgIC8vIEdldCB0aGUgbGVuZ3RoIG9mIHRoZSBuYW1lIGhlYWRlciAod2hpY2ggaXMgcGFkZGVkIHRvIGFuIGV2ZW4gbnVtYmVyIG9mIGJ5dGVzKVxuICAgICAgICB2YXIgbmFtZUhlYWRlckxlbmd0aCA9IGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCArIDcpO1xuICAgICAgICBpZiAobmFtZUhlYWRlckxlbmd0aCAlIDIgIT09IDApIG5hbWVIZWFkZXJMZW5ndGggKz0gMTtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIHByZSBwaG90b3Nob3AgNiBmb3JtYXRcbiAgICAgICAgaWYgKG5hbWVIZWFkZXJMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAvLyBBbHdheXMgNFxuICAgICAgICAgIG5hbWVIZWFkZXJMZW5ndGggPSA0O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN0YXJ0T2Zmc2V0ID0gb2Zmc2V0ICsgOCArIG5hbWVIZWFkZXJMZW5ndGg7XG4gICAgICAgIHZhciBzZWN0aW9uTGVuZ3RoID0gZGF0YVZpZXcuZ2V0VWludDE2KG9mZnNldCArIDYgKyBuYW1lSGVhZGVyTGVuZ3RoKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5yZWFkSVBUQ0RhdGEoZmlsZSwgc3RhcnRPZmZzZXQsIHNlY3Rpb25MZW5ndGgpO1xuICAgICAgfVxuXG4gICAgICAvLyBOb3QgdGhlIG1hcmtlciwgY29udGludWUgc2VhcmNoaW5nXG4gICAgICBvZmZzZXQrKztcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgcmVhZEZyb21CaW5hcnlGaWxlKGZpbGUpIHtcbiAgICByZXR1cm4gQ3JvcEVYSUYuZmluZEVYSUZpbkpQRUcoZmlsZSk7XG4gIH1cblxuICBzdGF0aWMgaW1hZ2VIYXNEYXRhKGltZykge1xuICAgIHJldHVybiAhIShpbWcuZXhpZmRhdGEpO1xuICB9XG5cbiAgc3RhdGljIGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0LCBjb250ZW50VHlwZT8pIHtcbiAgICBjb250ZW50VHlwZSA9IGNvbnRlbnRUeXBlIHx8IGJhc2U2NC5tYXRjaCgvXmRhdGFcXDooW15cXDtdKylcXDtiYXNlNjQsL21pKVsxXSB8fCAnJzsgLy8gZS5nLiAnZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwuLi4nID0+ICdpbWFnZS9qcGVnJ1xuICAgIGJhc2U2NCA9IGJhc2U2NC5yZXBsYWNlKC9eZGF0YVxcOihbXlxcO10rKVxcO2Jhc2U2NCwvZ21pLCAnJyk7XG4gICAgdmFyIGJpbmFyeSA9IGF0b2IoYmFzZTY0KTtcbiAgICB2YXIgbGVuID0gYmluYXJ5Lmxlbmd0aDtcbiAgICB2YXIgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGxlbik7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZpZXdbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxufSIsIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3QgdXNlXHJcbnRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlXHJcbkxpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcblxyXG5USElTIENPREUgSVMgUFJPVklERUQgT04gQU4gKkFTIElTKiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZXHJcbktJTkQsIEVJVEhFUiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBXSVRIT1VUIExJTUlUQVRJT04gQU5ZIElNUExJRURcclxuV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIFRJVExFLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSxcclxuTUVSQ0hBTlRBQkxJVFkgT1IgTk9OLUlORlJJTkdFTUVOVC5cclxuXHJcblNlZSB0aGUgQXBhY2hlIFZlcnNpb24gMi4wIExpY2Vuc2UgZm9yIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9uc1xyXG5hbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMClcclxuICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZShyZXN1bHQudmFsdWUpOyB9KS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2dlbmVyYXRvcih0aGlzQXJnLCBib2R5KSB7XHJcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xyXG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcclxuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XHJcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cclxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBleHBvcnRzKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmICghZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl0sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydFN0YXIobW9kKSB7XHJcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKE9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIHJlc3VsdFtrXSA9IG1vZFtrXTtcclxuICAgIHJlc3VsdC5kZWZhdWx0ID0gbW9kO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuIiwiZXhwb3J0IGNsYXNzIENyb3BDYW52YXMge1xuICAgIC8vIFNoYXBlID0gQXJyYXkgb2YgW3gseV07IFswLCAwXSAtIGNlbnRlclxuICAgIHNoYXBlQXJyb3dOVyA9IFtbLTAuNSwgLTJdLCBbLTMsIC00LjVdLCBbLTAuNSwgLTddLCBbLTcsIC03XSwgWy03LCAtMC41XSwgWy00LjUsIC0zXSwgWy0yLCAtMC41XV07XG4gICAgc2hhcGVBcnJvd05FID0gW1swLjUsIC0yXSwgWzMsIC00LjVdLCBbMC41LCAtN10sIFs3LCAtN10sIFs3LCAtMC41XSwgWzQuNSwgLTNdLCBbMiwgLTAuNV1dO1xuICAgIHNoYXBlQXJyb3dTVyA9IFtbLTAuNSwgMl0sIFstMywgNC41XSwgWy0wLjUsIDddLCBbLTcsIDddLCBbLTcsIDAuNV0sIFstNC41LCAzXSwgWy0yLCAwLjVdXTtcbiAgICBzaGFwZUFycm93U0UgPSBbWzAuNSwgMl0sIFszLCA0LjVdLCBbMC41LCA3XSwgWzcsIDddLCBbNywgMC41XSwgWzQuNSwgM10sIFsyLCAwLjVdXTtcbiAgICBzaGFwZUFycm93TiA9IFtbLTEuNSwgLTIuNV0sIFstMS41LCAtNl0sIFstNSwgLTZdLCBbMCwgLTExXSwgWzUsIC02XSwgWzEuNSwgLTZdLCBbMS41LCAtMi41XV07XG4gICAgc2hhcGVBcnJvd1cgPSBbWy0yLjUsIC0xLjVdLCBbLTYsIC0xLjVdLCBbLTYsIC01XSwgWy0xMSwgMF0sIFstNiwgNV0sIFstNiwgMS41XSwgWy0yLjUsIDEuNV1dO1xuICAgIHNoYXBlQXJyb3dTID0gW1stMS41LCAyLjVdLCBbLTEuNSwgNl0sIFstNSwgNl0sIFswLCAxMV0sIFs1LCA2XSwgWzEuNSwgNl0sIFsxLjUsIDIuNV1dO1xuICAgIHNoYXBlQXJyb3dFID0gW1syLjUsIC0xLjVdLCBbNiwgLTEuNV0sIFs2LCAtNV0sIFsxMSwgMF0sIFs2LCA1XSwgWzYsIDEuNV0sIFsyLjUsIDEuNV1dO1xuXG4gICAgLy8gQ29sb3JzXG4gICAgY29sb3JzID0ge1xuICAgICAgICBhcmVhT3V0bGluZTogJyNmZmYnLFxuICAgICAgICByZXNpemVCb3hTdHJva2U6ICcjZmZmJyxcbiAgICAgICAgcmVzaXplQm94RmlsbDogJyM0NDQnLFxuICAgICAgICByZXNpemVCb3hBcnJvd0ZpbGw6ICcjZmZmJyxcbiAgICAgICAgcmVzaXplQ2lyY2xlU3Ryb2tlOiAnI2ZmZicsXG4gICAgICAgIHJlc2l6ZUNpcmNsZUZpbGw6ICcjNDQ0JyxcbiAgICAgICAgbW92ZUljb25GaWxsOiAnI2ZmZidcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBjdHgpIHt9XG5cbiAgICAvLyBDYWxjdWxhdGUgUG9pbnRcbiAgICBjYWxjUG9pbnQocG9pbnQsIG9mZnNldCwgc2NhbGUpIHtcbiAgICAgICAgcmV0dXJuIFtzY2FsZSAqIHBvaW50WzBdICsgb2Zmc2V0WzBdLCBzY2FsZSAqIHBvaW50WzFdICsgb2Zmc2V0WzFdXTtcbiAgICB9O1xuXG4gICAgLy8gRHJhdyBGaWxsZWQgUG9seWdvblxuICAgIHByaXZhdGUgZHJhd0ZpbGxlZFBvbHlnb24oc2hhcGUsIGZpbGxTdHlsZSwgY2VudGVyQ29vcmRzLCBzY2FsZSkge1xuICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IGZpbGxTdHlsZTtcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIHZhciBwYywgcGMwID0gdGhpcy5jYWxjUG9pbnQoc2hhcGVbMF0sIGNlbnRlckNvb3Jkcywgc2NhbGUpO1xuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8ocGMwWzBdLCBwYzBbMV0pO1xuXG4gICAgICAgIGZvciAodmFyIHAgaW4gc2hhcGUpIHtcbiAgICAgICAgICAgIGxldCBwTnVtID0gcGFyc2VJbnQocCwgMTApO1xuICAgICAgICAgICAgaWYgKHBOdW0gPiAwKSB7XG4gICAgICAgICAgICAgICAgcGMgPSB0aGlzLmNhbGNQb2ludChzaGFwZVtwTnVtXSwgY2VudGVyQ29vcmRzLCBzY2FsZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHgubGluZVRvKHBjWzBdLCBwY1sxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmN0eC5saW5lVG8ocGMwWzBdLCBwYzBbMV0pO1xuICAgICAgICB0aGlzLmN0eC5maWxsKCk7XG4gICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG4gICAgfTtcblxuICAgIC8qIEljb25zICovXG5cbiAgICBkcmF3SWNvbk1vdmUoY2VudGVyQ29vcmRzLCBzY2FsZSkge1xuICAgICAgICB0aGlzLmRyYXdGaWxsZWRQb2x5Z29uKHRoaXMuc2hhcGVBcnJvd04sIHRoaXMuY29sb3JzLm1vdmVJY29uRmlsbCwgY2VudGVyQ29vcmRzLCBzY2FsZSk7XG4gICAgICAgIHRoaXMuZHJhd0ZpbGxlZFBvbHlnb24odGhpcy5zaGFwZUFycm93VywgdGhpcy5jb2xvcnMubW92ZUljb25GaWxsLCBjZW50ZXJDb29yZHMsIHNjYWxlKTtcbiAgICAgICAgdGhpcy5kcmF3RmlsbGVkUG9seWdvbih0aGlzLnNoYXBlQXJyb3dTLCB0aGlzLmNvbG9ycy5tb3ZlSWNvbkZpbGwsIGNlbnRlckNvb3Jkcywgc2NhbGUpO1xuICAgICAgICB0aGlzLmRyYXdGaWxsZWRQb2x5Z29uKHRoaXMuc2hhcGVBcnJvd0UsIHRoaXMuY29sb3JzLm1vdmVJY29uRmlsbCwgY2VudGVyQ29vcmRzLCBzY2FsZSk7XG4gICAgfVxuXG4gICAgZHJhd0ljb25SZXNpemVDaXJjbGUoY2VudGVyQ29vcmRzLCBjaXJjbGVSYWRpdXMsIHNjYWxlKSB7XG4gICAgICAgIHZhciBzY2FsZWRDaXJjbGVSYWRpdXMgPSBjaXJjbGVSYWRpdXMgKiBzY2FsZTtcbiAgICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IHRoaXMuY29sb3JzLnJlc2l6ZUNpcmNsZVN0cm9rZTtcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gMjtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcnMucmVzaXplQ2lyY2xlRmlsbDtcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIHRoaXMuY3R4LmFyYyhjZW50ZXJDb29yZHNbMF0sIGNlbnRlckNvb3Jkc1sxXSwgc2NhbGVkQ2lyY2xlUmFkaXVzLCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgIHRoaXMuY3R4LmZpbGwoKTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIHRoaXMuY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG4gICAgfVxuXG4gICAgZHJhd0ljb25SZXNpemVCb3hCYXNlIChjZW50ZXJDb29yZHMsIGJveFNpemUsIHNjYWxlKSB7XG4gICAgICAgIHZhciBzY2FsZWRCb3hTaXplID0gYm94U2l6ZSAqIHNjYWxlO1xuICAgICAgICB0aGlzLmN0eC5zYXZlKCk7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5jb2xvcnMucmVzaXplQm94U3Ryb2tlO1xuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSAyO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9ycy5yZXNpemVCb3hGaWxsO1xuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdChjZW50ZXJDb29yZHNbMF0gLSBzY2FsZWRCb3hTaXplIC8gMiwgY2VudGVyQ29vcmRzWzFdIC0gc2NhbGVkQm94U2l6ZSAvIDIsIHNjYWxlZEJveFNpemUsIHNjYWxlZEJveFNpemUpO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VSZWN0KGNlbnRlckNvb3Jkc1swXSAtIHNjYWxlZEJveFNpemUgLyAyLCBjZW50ZXJDb29yZHNbMV0gLSBzY2FsZWRCb3hTaXplIC8gMiwgc2NhbGVkQm94U2l6ZSwgc2NhbGVkQm94U2l6ZSk7XG4gICAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcbiAgICB9XG4gICAgZHJhd0ljb25SZXNpemVCb3hORVNXKGNlbnRlckNvb3JkcywgYm94U2l6ZSwgc2NhbGUpIHtcbiAgICAgICAgdGhpcy5kcmF3SWNvblJlc2l6ZUJveEJhc2UoY2VudGVyQ29vcmRzLCBib3hTaXplLCBzY2FsZSk7XG4gICAgICAgIHRoaXMuZHJhd0ZpbGxlZFBvbHlnb24odGhpcy5zaGFwZUFycm93TkUsIHRoaXMuY29sb3JzLnJlc2l6ZUJveEFycm93RmlsbCwgY2VudGVyQ29vcmRzLCBzY2FsZSk7XG4gICAgICAgIHRoaXMuZHJhd0ZpbGxlZFBvbHlnb24odGhpcy5zaGFwZUFycm93U1csIHRoaXMuY29sb3JzLnJlc2l6ZUJveEFycm93RmlsbCwgY2VudGVyQ29vcmRzLCBzY2FsZSk7XG4gICAgfVxuICAgIGRyYXdJY29uUmVzaXplQm94TldTRShjZW50ZXJDb29yZHMsIGJveFNpemUsIHNjYWxlKSB7XG4gICAgICAgIHRoaXMuZHJhd0ljb25SZXNpemVCb3hCYXNlKGNlbnRlckNvb3JkcywgYm94U2l6ZSwgc2NhbGUpO1xuICAgICAgICB0aGlzLmRyYXdGaWxsZWRQb2x5Z29uKHRoaXMuc2hhcGVBcnJvd05XLCB0aGlzLmNvbG9ycy5yZXNpemVCb3hBcnJvd0ZpbGwsIGNlbnRlckNvb3Jkcywgc2NhbGUpO1xuICAgICAgICB0aGlzLmRyYXdGaWxsZWRQb2x5Z29uKHRoaXMuc2hhcGVBcnJvd1NFLCB0aGlzLmNvbG9ycy5yZXNpemVCb3hBcnJvd0ZpbGwsIGNlbnRlckNvb3Jkcywgc2NhbGUpO1xuICAgIH1cblxuICAgIC8qIENyb3AgQXJlYSAqL1xuXG4gICAgZHJhd0Nyb3BBcmVhKGltYWdlLCBjZW50ZXJDb29yZHMsIHNpemUsIGZuRHJhd0NsaXBQYXRoKSB7XG4gICAgICAgIHZhciB4UmF0aW8gPSBpbWFnZS53aWR0aCAvIHRoaXMuY3R4LmNhbnZhcy53aWR0aCxcbiAgICAgICAgICAgIHlSYXRpbyA9IGltYWdlLmhlaWdodCAvIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQsXG4gICAgICAgICAgICB4TGVmdCA9IGNlbnRlckNvb3Jkc1swXSAtIHNpemUgLyAyLFxuICAgICAgICAgICAgeVRvcCA9IGNlbnRlckNvb3Jkc1sxXSAtIHNpemUgLyAyO1xuXG4gICAgICAgIHRoaXMuY3R4LnNhdmUoKTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLmNvbG9ycy5hcmVhT3V0bGluZTtcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gMjtcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGZuRHJhd0NsaXBQYXRoKHRoaXMuY3R4LCBjZW50ZXJDb29yZHMsIHNpemUpO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICAgICAgdGhpcy5jdHguY2xpcCgpO1xuXG4gICAgICAgIC8vIGRyYXcgcGFydCBvZiBvcmlnaW5hbCBpbWFnZVxuICAgICAgICBpZiAoc2l6ZSA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZShpbWFnZSwgeExlZnQgKiB4UmF0aW8sIHlUb3AgKiB5UmF0aW8sIHNpemUgKiB4UmF0aW8sIHNpemUgKiB5UmF0aW8sIHhMZWZ0LCB5VG9wLCBzaXplLCBzaXplKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBmbkRyYXdDbGlwUGF0aCh0aGlzLmN0eCwgY2VudGVyQ29vcmRzLCBzaXplKTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgICAgIHRoaXMuY3R4LmNsaXAoKTtcblxuICAgICAgICB0aGlzLmN0eC5yZXN0b3JlKCk7XG4gICAgfTtcbn0iLCJpbXBvcnQge0Nyb3BDYW52YXN9IGZyb20gXCIuL2Nyb3AtY2FudmFzXCI7XG5cbmV4cG9ydCBlbnVtIENyb3BBcmVhVHlwZSB7XG4gIFNxdWFyZSA9ICdzcXVhcmUnLFxuICBDaXJjbGUgPSAnY2lyY2xlJ1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ3JvcEFyZWEge1xuICBwcm90ZWN0ZWQgX21pblNpemUgPSA4MDtcbiAgcHJvdGVjdGVkIF9jcm9wQ2FudmFzOiBDcm9wQ2FudmFzO1xuICBwcm90ZWN0ZWQgX2ltYWdlID0gbmV3IEltYWdlKCk7XG4gIHByb3RlY3RlZCBfeCA9IDA7XG4gIHByb3RlY3RlZCBfeSA9IDA7XG4gIHByb3RlY3RlZCBfc2l6ZSA9IDIwMDtcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgX2N0eCwgcHJvdGVjdGVkIF9ldmVudHMpIHtcbiAgICB0aGlzLl9jcm9wQ2FudmFzID0gbmV3IENyb3BDYW52YXMoX2N0eCk7XG4gIH1cblxuICBnZXRJbWFnZSgpIHtcbiAgICByZXR1cm4gdGhpcy5faW1hZ2U7XG4gIH1cblxuICBzZXRJbWFnZShpbWFnZSkge1xuICAgIHRoaXMuX2ltYWdlID0gaW1hZ2U7XG4gIH07XG5cbiAgZ2V0WCgpIHtcbiAgICByZXR1cm4gdGhpcy5feDtcbiAgfTtcblxuICBzZXRYKHgpIHtcbiAgICB0aGlzLl94ID0geDtcbiAgICB0aGlzLl9kb250RHJhZ091dHNpZGUoKTtcbiAgfTtcblxuICBnZXRZKCkge1xuICAgIHJldHVybiB0aGlzLl95O1xuICB9O1xuXG4gIHNldFkoeSkge1xuICAgIHRoaXMuX3kgPSB5O1xuICAgIHRoaXMuX2RvbnREcmFnT3V0c2lkZSgpO1xuICB9O1xuXG4gIGdldFNpemUoKSA6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3NpemU7XG4gIH07XG5cbiAgc2V0U2l6ZShzaXplKSB7XG4gICAgdGhpcy5fc2l6ZSA9IE1hdGgubWF4KHRoaXMuX21pblNpemUsIHNpemUpO1xuICAgIHRoaXMuX2RvbnREcmFnT3V0c2lkZSgpO1xuICB9O1xuXG4gIGdldE1pblNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21pblNpemU7XG4gIH07XG5cbiAgc2V0TWluU2l6ZShzaXplKSB7XG4gICAgdGhpcy5fbWluU2l6ZSA9IHNpemU7XG4gICAgdGhpcy5fc2l6ZSA9IE1hdGgubWF4KHRoaXMuX21pblNpemUsIHRoaXMuX3NpemUpO1xuICAgIHRoaXMuX2RvbnREcmFnT3V0c2lkZSgpO1xuICB9O1xuXG4gIF9kb250RHJhZ091dHNpZGUoKSB7XG4gICAgdmFyIGggPSB0aGlzLl9jdHguY2FudmFzLmhlaWdodCxcbiAgICAgIHcgPSB0aGlzLl9jdHguY2FudmFzLndpZHRoO1xuICAgIGlmICh0aGlzLl9zaXplID4gdykge1xuICAgICAgdGhpcy5fc2l6ZSA9IHc7XG4gICAgfVxuICAgIGlmICh0aGlzLl9zaXplID4gaCkge1xuICAgICAgdGhpcy5fc2l6ZSA9IGg7XG4gICAgfVxuICAgIGlmICh0aGlzLl94IDwgdGhpcy5fc2l6ZSAvIDIpIHtcbiAgICAgIHRoaXMuX3ggPSB0aGlzLl9zaXplIC8gMjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3ggPiB3IC0gdGhpcy5fc2l6ZSAvIDIpIHtcbiAgICAgIHRoaXMuX3ggPSB3IC0gdGhpcy5fc2l6ZSAvIDI7XG4gICAgfVxuICAgIGlmICh0aGlzLl95IDwgdGhpcy5fc2l6ZSAvIDIpIHtcbiAgICAgIHRoaXMuX3kgPSB0aGlzLl9zaXplIC8gMjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3kgPiBoIC0gdGhpcy5fc2l6ZSAvIDIpIHtcbiAgICAgIHRoaXMuX3kgPSBoIC0gdGhpcy5fc2l6ZSAvIDI7XG4gICAgfVxuICB9O1xuXG4gIGFic3RyYWN0IF9kcmF3QXJlYShjdHgsIGNlbnRlckNvb3Jkcywgc2l6ZSk7XG5cbiAgZHJhdygpIHtcbiAgICB0aGlzLl9jcm9wQ2FudmFzLmRyYXdDcm9wQXJlYSh0aGlzLl9pbWFnZSwgW3RoaXMuX3gsIHRoaXMuX3ldLCB0aGlzLl9zaXplLCB0aGlzLl9kcmF3QXJlYSk7XG4gIH07XG5cbiAgYWJzdHJhY3QgcHJvY2Vzc01vdXNlTW92ZShtb3VzZUN1clg6IG51bWJlciwgbW91c2VDdXJZOiBudW1iZXIpO1xuXG4gIGFic3RyYWN0IHByb2Nlc3NNb3VzZURvd24obW91c2VEb3duWDogbnVtYmVyLCBtb3VzZURvd25ZOiBudW1iZXIpO1xuXG4gIGFic3RyYWN0IHByb2Nlc3NNb3VzZVVwKG1vdXNlRG93blg6IG51bWJlciwgbW91c2VEb3duWTogbnVtYmVyKTtcbn0iLCJpbXBvcnQge0Nyb3BBcmVhfSBmcm9tIFwiLi9jcm9wLWFyZWFcIjtcblxuZXhwb3J0IGNsYXNzIENyb3BBcmVhQ2lyY2xlIGV4dGVuZHMgQ3JvcEFyZWEge1xuICBfYm94UmVzaXplQmFzZVNpemUgPSAyMDtcbiAgX2JveFJlc2l6ZU5vcm1hbFJhdGlvID0gMC45O1xuICBfYm94UmVzaXplSG92ZXJSYXRpbyA9IDEuMjtcbiAgX2ljb25Nb3ZlTm9ybWFsUmF0aW8gPSAwLjk7XG4gIF9pY29uTW92ZUhvdmVyUmF0aW8gPSAxLjI7XG5cbiAgX3Bvc0RyYWdTdGFydFggPSAwO1xuICBfcG9zRHJhZ1N0YXJ0WSA9IDA7XG4gIF9wb3NSZXNpemVTdGFydFggPSAwO1xuICBfcG9zUmVzaXplU3RhcnRZID0gMDtcbiAgX3Bvc1Jlc2l6ZVN0YXJ0U2l6ZSA9IDA7XG5cbiAgX2JveFJlc2l6ZUlzSG92ZXIgPSBmYWxzZTtcbiAgX2FyZWFJc0hvdmVyID0gZmFsc2U7XG4gIF9ib3hSZXNpemVJc0RyYWdnaW5nID0gZmFsc2U7XG4gIF9hcmVhSXNEcmFnZ2luZyA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX2JveFJlc2l6ZU5vcm1hbFNpemU6IG51bWJlcjtcbiAgcHJpdmF0ZSBfYm94UmVzaXplSG92ZXJTaXplOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoY3R4LCBldmVudHMpIHtcbiAgICBzdXBlcihjdHgsIGV2ZW50cyk7XG5cbiAgICB0aGlzLl9ib3hSZXNpemVOb3JtYWxTaXplID0gdGhpcy5fYm94UmVzaXplQmFzZVNpemUgKiB0aGlzLl9ib3hSZXNpemVOb3JtYWxSYXRpbztcbiAgICB0aGlzLl9ib3hSZXNpemVIb3ZlclNpemUgPSB0aGlzLl9ib3hSZXNpemVCYXNlU2l6ZSAqIHRoaXMuX2JveFJlc2l6ZUhvdmVyUmF0aW87XG4gIH1cblxuICBfY2FsY0NpcmNsZVBlcmltZXRlckNvb3JkcyhhbmdsZURlZ3JlZXMpIHtcbiAgICB2YXIgaFNpemUgPSB0aGlzLl9zaXplIC8gMjtcbiAgICB2YXIgYW5nbGVSYWRpYW5zID0gYW5nbGVEZWdyZWVzICogKE1hdGguUEkgLyAxODApLFxuICAgICAgY2lyY2xlUGVyaW1ldGVyWCA9IHRoaXMuX3ggKyBoU2l6ZSAqIE1hdGguY29zKGFuZ2xlUmFkaWFucyksXG4gICAgICBjaXJjbGVQZXJpbWV0ZXJZID0gdGhpcy5feSArIGhTaXplICogTWF0aC5zaW4oYW5nbGVSYWRpYW5zKTtcbiAgICByZXR1cm4gW2NpcmNsZVBlcmltZXRlclgsIGNpcmNsZVBlcmltZXRlclldO1xuICB9XG5cbiAgX2NhbGNSZXNpemVJY29uQ2VudGVyQ29vcmRzKCkge1xuICAgIHJldHVybiB0aGlzLl9jYWxjQ2lyY2xlUGVyaW1ldGVyQ29vcmRzKC00NSk7XG4gIH1cblxuICBfaXNDb29yZFdpdGhpbkFyZWEoY29vcmQpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KChjb29yZFswXSAtIHRoaXMuX3gpICogKGNvb3JkWzBdIC0gdGhpcy5feCkgKyAoY29vcmRbMV0gLSB0aGlzLl95KSAqIChjb29yZFsxXSAtIHRoaXMuX3kpKSA8IHRoaXMuX3NpemUgLyAyO1xuICB9O1xuXG4gIF9pc0Nvb3JkV2l0aGluQm94UmVzaXplKGNvb3JkKSB7XG4gICAgdmFyIHJlc2l6ZUljb25DZW50ZXJDb29yZHMgPSB0aGlzLl9jYWxjUmVzaXplSWNvbkNlbnRlckNvb3JkcygpO1xuICAgIHZhciBoU2l6ZSA9IHRoaXMuX2JveFJlc2l6ZUhvdmVyU2l6ZSAvIDI7XG4gICAgcmV0dXJuIChjb29yZFswXSA+IHJlc2l6ZUljb25DZW50ZXJDb29yZHNbMF0gLSBoU2l6ZSAmJiBjb29yZFswXSA8IHJlc2l6ZUljb25DZW50ZXJDb29yZHNbMF0gKyBoU2l6ZSAmJlxuICAgICAgY29vcmRbMV0gPiByZXNpemVJY29uQ2VudGVyQ29vcmRzWzFdIC0gaFNpemUgJiYgY29vcmRbMV0gPCByZXNpemVJY29uQ2VudGVyQ29vcmRzWzFdICsgaFNpemUpO1xuICB9O1xuXG4gIF9kcmF3QXJlYShjdHgsIGNlbnRlckNvb3Jkcywgc2l6ZSkge1xuICAgIGN0eC5hcmMoY2VudGVyQ29vcmRzWzBdLCBjZW50ZXJDb29yZHNbMV0sIHNpemUgLyAyLCAwLCAyICogTWF0aC5QSSk7XG4gIH07XG5cbiAgZHJhdygpIHtcbiAgICBDcm9wQXJlYS5wcm90b3R5cGUuZHJhdy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgLy8gZHJhdyBtb3ZlIGljb25cbiAgICB0aGlzLl9jcm9wQ2FudmFzLmRyYXdJY29uTW92ZShbdGhpcy5feCwgdGhpcy5feV0sIHRoaXMuX2FyZWFJc0hvdmVyID8gdGhpcy5faWNvbk1vdmVIb3ZlclJhdGlvIDogdGhpcy5faWNvbk1vdmVOb3JtYWxSYXRpbyk7XG5cbiAgICAvLyBkcmF3IHJlc2l6ZSBjdWJlc1xuICAgIHRoaXMuX2Nyb3BDYW52YXMuZHJhd0ljb25SZXNpemVCb3hORVNXKHRoaXMuX2NhbGNSZXNpemVJY29uQ2VudGVyQ29vcmRzKCksIHRoaXMuX2JveFJlc2l6ZUJhc2VTaXplLCB0aGlzLl9ib3hSZXNpemVJc0hvdmVyID8gdGhpcy5fYm94UmVzaXplSG92ZXJSYXRpbyA6IHRoaXMuX2JveFJlc2l6ZU5vcm1hbFJhdGlvKTtcbiAgfTtcblxuICBwcm9jZXNzTW91c2VNb3ZlKG1vdXNlQ3VyWCwgbW91c2VDdXJZKSB7XG4gICAgdmFyIGN1cnNvciA9ICdkZWZhdWx0JztcbiAgICB2YXIgcmVzID0gZmFsc2U7XG5cbiAgICB0aGlzLl9ib3hSZXNpemVJc0hvdmVyID0gZmFsc2U7XG4gICAgdGhpcy5fYXJlYUlzSG92ZXIgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLl9hcmVhSXNEcmFnZ2luZykge1xuICAgICAgdGhpcy5feCA9IG1vdXNlQ3VyWCAtIHRoaXMuX3Bvc0RyYWdTdGFydFg7XG4gICAgICB0aGlzLl95ID0gbW91c2VDdXJZIC0gdGhpcy5fcG9zRHJhZ1N0YXJ0WTtcbiAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gdHJ1ZTtcbiAgICAgIGN1cnNvciA9ICdtb3ZlJztcbiAgICAgIHJlcyA9IHRydWU7XG4gICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1tb3ZlJyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9ib3hSZXNpemVJc0RyYWdnaW5nKSB7XG4gICAgICBjdXJzb3IgPSAnbmVzdy1yZXNpemUnO1xuICAgICAgdmFyIGlGUiwgaUZYLCBpRlk7XG4gICAgICBpRlggPSBtb3VzZUN1clggLSB0aGlzLl9wb3NSZXNpemVTdGFydFg7XG4gICAgICBpRlkgPSB0aGlzLl9wb3NSZXNpemVTdGFydFkgLSBtb3VzZUN1clk7XG4gICAgICBpZiAoaUZYID4gaUZZKSB7XG4gICAgICAgIGlGUiA9IHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0U2l6ZSArIGlGWSAqIDI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpRlIgPSB0aGlzLl9wb3NSZXNpemVTdGFydFNpemUgKyBpRlggKiAyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zaXplID0gTWF0aC5tYXgodGhpcy5fbWluU2l6ZSwgaUZSKTtcbiAgICAgIHRoaXMuX2JveFJlc2l6ZUlzSG92ZXIgPSB0cnVlO1xuICAgICAgcmVzID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2V2ZW50cy50cmlnZ2VyKCdhcmVhLXJlc2l6ZScpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5faXNDb29yZFdpdGhpbkJveFJlc2l6ZShbbW91c2VDdXJYLCBtb3VzZUN1clldKSkge1xuICAgICAgY3Vyc29yID0gJ25lc3ctcmVzaXplJztcbiAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gZmFsc2U7XG4gICAgICB0aGlzLl9ib3hSZXNpemVJc0hvdmVyID0gdHJ1ZTtcbiAgICAgIHJlcyA9IHRydWU7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9pc0Nvb3JkV2l0aGluQXJlYShbbW91c2VDdXJYLCBtb3VzZUN1clldKSkge1xuICAgICAgY3Vyc29yID0gJ21vdmUnO1xuICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSB0cnVlO1xuICAgICAgcmVzID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9kb250RHJhZ091dHNpZGUoKTtcbiAgICB0aGlzLl9jdHguY2FudmFzLnN0eWxlLmN1cnNvciA9IGN1cnNvcjtcblxuICAgIHJldHVybiByZXM7XG4gIH07XG5cbiAgcHJvY2Vzc01vdXNlRG93bihtb3VzZURvd25YOiBudW1iZXIsIG1vdXNlRG93blk6IG51bWJlcikge1xuICAgIGlmICh0aGlzLl9pc0Nvb3JkV2l0aGluQm94UmVzaXplKFttb3VzZURvd25YLCBtb3VzZURvd25ZXSkpIHtcbiAgICAgIHRoaXMuX2FyZWFJc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IGZhbHNlO1xuICAgICAgdGhpcy5fYm94UmVzaXplSXNEcmFnZ2luZyA9IHRydWU7XG4gICAgICB0aGlzLl9ib3hSZXNpemVJc0hvdmVyID0gdHJ1ZTtcbiAgICAgIHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WCA9IG1vdXNlRG93blg7XG4gICAgICB0aGlzLl9wb3NSZXNpemVTdGFydFkgPSBtb3VzZURvd25ZO1xuICAgICAgdGhpcy5fcG9zUmVzaXplU3RhcnRTaXplID0gdGhpcy5fc2l6ZTtcbiAgICAgIHRoaXMuX2V2ZW50cy50cmlnZ2VyKCdhcmVhLXJlc2l6ZS1zdGFydCcpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5faXNDb29yZFdpdGhpbkFyZWEoW21vdXNlRG93blgsIG1vdXNlRG93blldKSkge1xuICAgICAgdGhpcy5fYXJlYUlzRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSB0cnVlO1xuICAgICAgdGhpcy5fYm94UmVzaXplSXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5fYm94UmVzaXplSXNIb3ZlciA9IGZhbHNlO1xuICAgICAgdGhpcy5fcG9zRHJhZ1N0YXJ0WCA9IG1vdXNlRG93blggLSB0aGlzLl94O1xuICAgICAgdGhpcy5fcG9zRHJhZ1N0YXJ0WSA9IG1vdXNlRG93blkgLSB0aGlzLl95O1xuICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtbW92ZS1zdGFydCcpO1xuICAgIH1cbiAgfTtcblxuICBwcm9jZXNzTW91c2VVcCgvKm1vdXNlVXBYLCBtb3VzZVVwWSovKSB7XG4gICAgaWYgKHRoaXMuX2FyZWFJc0RyYWdnaW5nKSB7XG4gICAgICB0aGlzLl9hcmVhSXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtbW92ZS1lbmQnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2JveFJlc2l6ZUlzRHJhZ2dpbmcpIHtcbiAgICAgIHRoaXMuX2JveFJlc2l6ZUlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2V2ZW50cy50cmlnZ2VyKCdhcmVhLXJlc2l6ZS1lbmQnKTtcbiAgICB9XG4gICAgdGhpcy5fYXJlYUlzSG92ZXIgPSBmYWxzZTtcbiAgICB0aGlzLl9ib3hSZXNpemVJc0hvdmVyID0gZmFsc2U7XG5cbiAgICB0aGlzLl9wb3NEcmFnU3RhcnRYID0gMDtcbiAgICB0aGlzLl9wb3NEcmFnU3RhcnRZID0gMDtcbiAgfTtcblxufSIsImltcG9ydCB7Q3JvcEFyZWF9IGZyb20gXCIuL2Nyb3AtYXJlYVwiO1xuXG5leHBvcnQgY2xhc3MgQ3JvcEFyZWFTcXVhcmUgZXh0ZW5kcyBDcm9wQXJlYSB7XG4gICAgX3Jlc2l6ZUN0cmxCYXNlUmFkaXVzID0gMTA7XG4gICAgX3Jlc2l6ZUN0cmxOb3JtYWxSYXRpbyA9IDAuNzU7XG4gICAgX3Jlc2l6ZUN0cmxIb3ZlclJhdGlvID0gMTtcbiAgICBfaWNvbk1vdmVOb3JtYWxSYXRpbyA9IDAuOTtcbiAgICBfaWNvbk1vdmVIb3ZlclJhdGlvID0gMS4yO1xuXG4gICAgX3Bvc0RyYWdTdGFydFggPSAwO1xuICAgIF9wb3NEcmFnU3RhcnRZID0gMDtcbiAgICBfcG9zUmVzaXplU3RhcnRYID0gMDtcbiAgICBfcG9zUmVzaXplU3RhcnRZID0gMDtcbiAgICBfcG9zUmVzaXplU3RhcnRTaXplID0gMDtcblxuICAgIF9yZXNpemVDdHJsSXNIb3ZlciA9IC0xO1xuICAgIF9hcmVhSXNIb3ZlciA9IGZhbHNlO1xuICAgIF9yZXNpemVDdHJsSXNEcmFnZ2luZyA9IC0xO1xuICAgIF9hcmVhSXNEcmFnZ2luZyA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfcmVzaXplQ3RybE5vcm1hbFJhZGl1czogbnVtYmVyO1xuICAgIHByaXZhdGUgX3Jlc2l6ZUN0cmxIb3ZlclJhZGl1czogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IoY3R4LCBldmVudHMpIHtcbiAgICAgICAgc3VwZXIoY3R4LCBldmVudHMpO1xuXG4gICAgICAgIHRoaXMuX3Jlc2l6ZUN0cmxOb3JtYWxSYWRpdXMgPSB0aGlzLl9yZXNpemVDdHJsQmFzZVJhZGl1cyAqIHRoaXMuX3Jlc2l6ZUN0cmxOb3JtYWxSYXRpbztcbiAgICAgICAgdGhpcy5fcmVzaXplQ3RybEhvdmVyUmFkaXVzID0gdGhpcy5fcmVzaXplQ3RybEJhc2VSYWRpdXMgKiB0aGlzLl9yZXNpemVDdHJsSG92ZXJSYXRpbztcbiAgICB9O1xuXG4gICAgX2NhbGNTcXVhcmVDb3JuZXJzKCkge1xuICAgICAgICB2YXIgaFNpemUgPSB0aGlzLl9zaXplIC8gMjtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIFt0aGlzLl94IC0gaFNpemUsIHRoaXMuX3kgLSBoU2l6ZV0sXG4gICAgICAgICAgICBbdGhpcy5feCArIGhTaXplLCB0aGlzLl95IC0gaFNpemVdLFxuICAgICAgICAgICAgW3RoaXMuX3ggLSBoU2l6ZSwgdGhpcy5feSArIGhTaXplXSxcbiAgICAgICAgICAgIFt0aGlzLl94ICsgaFNpemUsIHRoaXMuX3kgKyBoU2l6ZV1cbiAgICAgICAgXTtcbiAgICB9XG5cbiAgICBfY2FsY1NxdWFyZURpbWVuc2lvbnMoKSB7XG4gICAgICAgIHZhciBoU2l6ZSA9IHRoaXMuX3NpemUgLyAyO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogdGhpcy5feCAtIGhTaXplLFxuICAgICAgICAgICAgdG9wOiB0aGlzLl95IC0gaFNpemUsXG4gICAgICAgICAgICByaWdodDogdGhpcy5feCArIGhTaXplLFxuICAgICAgICAgICAgYm90dG9tOiB0aGlzLl95ICsgaFNpemVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfaXNDb29yZFdpdGhpbkFyZWEoY29vcmQpIHtcbiAgICAgICAgdmFyIHNxdWFyZURpbWVuc2lvbnMgPSB0aGlzLl9jYWxjU3F1YXJlRGltZW5zaW9ucygpO1xuICAgICAgICByZXR1cm4gKGNvb3JkWzBdID49IHNxdWFyZURpbWVuc2lvbnMubGVmdCAmJiBjb29yZFswXSA8PSBzcXVhcmVEaW1lbnNpb25zLnJpZ2h0ICYmIGNvb3JkWzFdID49IHNxdWFyZURpbWVuc2lvbnMudG9wICYmIGNvb3JkWzFdIDw9IHNxdWFyZURpbWVuc2lvbnMuYm90dG9tKTtcbiAgICB9XG5cbiAgICBfaXNDb29yZFdpdGhpblJlc2l6ZUN0cmwoY29vcmQpIHtcbiAgICAgICAgdmFyIHJlc2l6ZUljb25zQ2VudGVyQ29vcmRzID0gdGhpcy5fY2FsY1NxdWFyZUNvcm5lcnMoKTtcbiAgICAgICAgdmFyIHJlcyA9IC0xO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcmVzaXplSWNvbnNDZW50ZXJDb29yZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByZXNpemVJY29uQ2VudGVyQ29vcmRzID0gcmVzaXplSWNvbnNDZW50ZXJDb29yZHNbaV07XG4gICAgICAgICAgICBpZiAoY29vcmRbMF0gPiByZXNpemVJY29uQ2VudGVyQ29vcmRzWzBdIC0gdGhpcy5fcmVzaXplQ3RybEhvdmVyUmFkaXVzICYmIGNvb3JkWzBdIDwgcmVzaXplSWNvbkNlbnRlckNvb3Jkc1swXSArIHRoaXMuX3Jlc2l6ZUN0cmxIb3ZlclJhZGl1cyAmJlxuICAgICAgICAgICAgICAgIGNvb3JkWzFdID4gcmVzaXplSWNvbkNlbnRlckNvb3Jkc1sxXSAtIHRoaXMuX3Jlc2l6ZUN0cmxIb3ZlclJhZGl1cyAmJiBjb29yZFsxXSA8IHJlc2l6ZUljb25DZW50ZXJDb29yZHNbMV0gKyB0aGlzLl9yZXNpemVDdHJsSG92ZXJSYWRpdXMpIHtcbiAgICAgICAgICAgICAgICByZXMgPSBpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgX2RyYXdBcmVhKGN0eCwgY2VudGVyQ29vcmRzLCBzaXplKSB7XG4gICAgICAgIHZhciBoU2l6ZSA9IHNpemUgLyAyO1xuICAgICAgICBjdHgucmVjdChjZW50ZXJDb29yZHNbMF0gLSBoU2l6ZSwgY2VudGVyQ29vcmRzWzFdIC0gaFNpemUsIHNpemUsIHNpemUpO1xuICAgIH1cblxuICAgIGRyYXcoKSB7XG4gICAgICAgIENyb3BBcmVhLnByb3RvdHlwZS5kcmF3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgLy8gZHJhdyBtb3ZlIGljb25cbiAgICAgICAgdGhpcy5fY3JvcENhbnZhcy5kcmF3SWNvbk1vdmUoW3RoaXMuX3gsIHRoaXMuX3ldLCB0aGlzLl9hcmVhSXNIb3ZlciA/IHRoaXMuX2ljb25Nb3ZlSG92ZXJSYXRpbyA6IHRoaXMuX2ljb25Nb3ZlTm9ybWFsUmF0aW8pO1xuXG4gICAgICAgIC8vIGRyYXcgcmVzaXplIGN1YmVzXG4gICAgICAgIHZhciByZXNpemVJY29uc0NlbnRlckNvb3JkcyA9IHRoaXMuX2NhbGNTcXVhcmVDb3JuZXJzKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSByZXNpemVJY29uc0NlbnRlckNvb3Jkcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdmFyIHJlc2l6ZUljb25DZW50ZXJDb29yZHMgPSByZXNpemVJY29uc0NlbnRlckNvb3Jkc1tpXTtcbiAgICAgICAgICAgIHRoaXMuX2Nyb3BDYW52YXMuZHJhd0ljb25SZXNpemVDaXJjbGUocmVzaXplSWNvbkNlbnRlckNvb3JkcywgdGhpcy5fcmVzaXplQ3RybEJhc2VSYWRpdXMsIHRoaXMuX3Jlc2l6ZUN0cmxJc0hvdmVyID09PSBpID8gdGhpcy5fcmVzaXplQ3RybEhvdmVyUmF0aW8gOiB0aGlzLl9yZXNpemVDdHJsTm9ybWFsUmF0aW8pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc01vdXNlTW92ZShtb3VzZUN1clgsIG1vdXNlQ3VyWSkge1xuICAgICAgICB2YXIgY3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgICAgICB2YXIgcmVzID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5fcmVzaXplQ3RybElzSG92ZXIgPSAtMTtcbiAgICAgICAgdGhpcy5fYXJlYUlzSG92ZXIgPSBmYWxzZTtcblxuICAgICAgICBpZiAodGhpcy5fYXJlYUlzRHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX3ggPSBtb3VzZUN1clggLSB0aGlzLl9wb3NEcmFnU3RhcnRYO1xuICAgICAgICAgICAgdGhpcy5feSA9IG1vdXNlQ3VyWSAtIHRoaXMuX3Bvc0RyYWdTdGFydFk7XG4gICAgICAgICAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IHRydWU7XG4gICAgICAgICAgICBjdXJzb3IgPSAnbW92ZSc7XG4gICAgICAgICAgICByZXMgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtbW92ZScpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Jlc2l6ZUN0cmxJc0RyYWdnaW5nID4gLTEpIHtcbiAgICAgICAgICAgIHZhciB4TXVsdGksIHlNdWx0aTtcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5fcmVzaXplQ3RybElzRHJhZ2dpbmcpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IC8vIFRvcCBMZWZ0XG4gICAgICAgICAgICAgICAgICAgIHhNdWx0aSA9IC0xO1xuICAgICAgICAgICAgICAgICAgICB5TXVsdGkgPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gJ253c2UtcmVzaXplJztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiAvLyBUb3AgUmlnaHRcbiAgICAgICAgICAgICAgICAgICAgeE11bHRpID0gMTtcbiAgICAgICAgICAgICAgICAgICAgeU11bHRpID0gLTE7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9ICduZXN3LXJlc2l6ZSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjogLy8gQm90dG9tIExlZnRcbiAgICAgICAgICAgICAgICAgICAgeE11bHRpID0gLTE7XG4gICAgICAgICAgICAgICAgICAgIHlNdWx0aSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9ICduZXN3LXJlc2l6ZSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzogLy8gQm90dG9tIFJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHhNdWx0aSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIHlNdWx0aSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9ICdud3NlLXJlc2l6ZSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGlGWCA9IChtb3VzZUN1clggLSB0aGlzLl9wb3NSZXNpemVTdGFydFgpICogeE11bHRpO1xuICAgICAgICAgICAgdmFyIGlGWSA9IChtb3VzZUN1clkgLSB0aGlzLl9wb3NSZXNpemVTdGFydFkpICogeU11bHRpO1xuICAgICAgICAgICAgdmFyIGlGUjtcbiAgICAgICAgICAgIGlmIChpRlggPiBpRlkpIHtcbiAgICAgICAgICAgICAgICBpRlIgPSB0aGlzLl9wb3NSZXNpemVTdGFydFNpemUgKyBpRlk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlGUiA9IHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0U2l6ZSArIGlGWDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB3YXNTaXplID0gdGhpcy5fc2l6ZTtcbiAgICAgICAgICAgIHRoaXMuX3NpemUgPSBNYXRoLm1heCh0aGlzLl9taW5TaXplLCBpRlIpO1xuICAgICAgICAgICAgdmFyIHBvc01vZGlmaWVyID0gKHRoaXMuX3NpemUgLSB3YXNTaXplKSAvIDI7XG4gICAgICAgICAgICB0aGlzLl94ICs9IHBvc01vZGlmaWVyICogeE11bHRpO1xuICAgICAgICAgICAgdGhpcy5feSArPSBwb3NNb2RpZmllciAqIHlNdWx0aTtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZUN0cmxJc0hvdmVyID0gdGhpcy5fcmVzaXplQ3RybElzRHJhZ2dpbmc7XG4gICAgICAgICAgICByZXMgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtcmVzaXplJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgaG92ZXJlZFJlc2l6ZUJveCA9IHRoaXMuX2lzQ29vcmRXaXRoaW5SZXNpemVDdHJsKFttb3VzZUN1clgsIG1vdXNlQ3VyWV0pO1xuICAgICAgICAgICAgaWYgKGhvdmVyZWRSZXNpemVCb3ggPiAtMSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoaG92ZXJlZFJlc2l6ZUJveCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3IgPSAnbndzZS1yZXNpemUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvciA9ICduZXN3LXJlc2l6ZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gJ25lc3ctcmVzaXplJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3IgPSAnbndzZS1yZXNpemUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVzaXplQ3RybElzSG92ZXIgPSBob3ZlcmVkUmVzaXplQm94O1xuICAgICAgICAgICAgICAgIHJlcyA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzQ29vcmRXaXRoaW5BcmVhKFttb3VzZUN1clgsIG1vdXNlQ3VyWV0pKSB7XG4gICAgICAgICAgICAgICAgY3Vyc29yID0gJ21vdmUnO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZG9udERyYWdPdXRzaWRlKCk7XG4gICAgICAgIHRoaXMuX2N0eC5jYW52YXMuc3R5bGUuY3Vyc29yID0gY3Vyc29yO1xuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgcHJvY2Vzc01vdXNlRG93bihtb3VzZURvd25YLCBtb3VzZURvd25ZKSB7XG4gICAgICAgIHZhciBpc1dpdGhpblJlc2l6ZUN0cmwgPSB0aGlzLl9pc0Nvb3JkV2l0aGluUmVzaXplQ3RybChbbW91c2VEb3duWCwgbW91c2VEb3duWV0pO1xuICAgICAgICBpZiAoaXNXaXRoaW5SZXNpemVDdHJsID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuX2FyZWFJc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9hcmVhSXNIb3ZlciA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fcmVzaXplQ3RybElzRHJhZ2dpbmcgPSBpc1dpdGhpblJlc2l6ZUN0cmw7XG4gICAgICAgICAgICB0aGlzLl9yZXNpemVDdHJsSXNIb3ZlciA9IGlzV2l0aGluUmVzaXplQ3RybDtcbiAgICAgICAgICAgIHRoaXMuX3Bvc1Jlc2l6ZVN0YXJ0WCA9IG1vdXNlRG93blg7XG4gICAgICAgICAgICB0aGlzLl9wb3NSZXNpemVTdGFydFkgPSBtb3VzZURvd25ZO1xuICAgICAgICAgICAgdGhpcy5fcG9zUmVzaXplU3RhcnRTaXplID0gdGhpcy5fc2l6ZTtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cy50cmlnZ2VyKCdhcmVhLXJlc2l6ZS1zdGFydCcpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzQ29vcmRXaXRoaW5BcmVhKFttb3VzZURvd25YLCBtb3VzZURvd25ZXSkpIHtcbiAgICAgICAgICAgIHRoaXMuX2FyZWFJc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZUN0cmxJc0RyYWdnaW5nID0gLTE7XG4gICAgICAgICAgICB0aGlzLl9yZXNpemVDdHJsSXNIb3ZlciA9IC0xO1xuICAgICAgICAgICAgdGhpcy5fcG9zRHJhZ1N0YXJ0WCA9IG1vdXNlRG93blggLSB0aGlzLl94O1xuICAgICAgICAgICAgdGhpcy5fcG9zRHJhZ1N0YXJ0WSA9IG1vdXNlRG93blkgLSB0aGlzLl95O1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtbW92ZS1zdGFydCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc01vdXNlVXAoLyptb3VzZVVwWCwgbW91c2VVcFkqLykge1xuICAgICAgICBpZiAodGhpcy5fYXJlYUlzRHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2FyZWFJc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHMudHJpZ2dlcignYXJlYS1tb3ZlLWVuZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9yZXNpemVDdHJsSXNEcmFnZ2luZyA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNpemVDdHJsSXNEcmFnZ2luZyA9IC0xO1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzLnRyaWdnZXIoJ2FyZWEtcmVzaXplLWVuZCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2FyZWFJc0hvdmVyID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZUN0cmxJc0hvdmVyID0gLTE7XG5cbiAgICAgICAgdGhpcy5fcG9zRHJhZ1N0YXJ0WCA9IDA7XG4gICAgICAgIHRoaXMuX3Bvc0RyYWdTdGFydFkgPSAwO1xuICAgIH1cbn0iLCJpbXBvcnQge0Nyb3BFWElGfSBmcm9tIFwiLi9jcm9wLWV4aWZcIjtcbmltcG9ydCB7Q3JvcEFyZWFDaXJjbGV9IGZyb20gXCIuL2Nyb3AtYXJlYS1jaXJjbGVcIjtcbmltcG9ydCB7Q3JvcEFyZWFTcXVhcmV9IGZyb20gXCIuL2Nyb3AtYXJlYS1zcXVhcmVcIjtcbmltcG9ydCB7Q3JvcEFyZWFUeXBlLCBDcm9wQXJlYX0gZnJvbSBcIi4vY3JvcC1hcmVhXCI7XG5pbXBvcnQge0Nyb3BBcmVhRGV0YWlsc30gZnJvbSBcIi4uL2ZjLWltZy1jcm9wLmNvbXBvbmVudFwiO1xuXG5leHBvcnQgY2xhc3MgQ3JvcEhvc3Qge1xuXG4gIGN0eCA9IG51bGw7XG4gIGltYWdlID0gbnVsbDtcblxuICBjcm9wQXJlYTogQ3JvcEFyZWE7XG5cbiAgLy8gRGltZW5zaW9uc1xuICBtaW5DYW52YXNEaW1zID0gWzEwMCwgMTAwXTtcbiAgbWF4Q2FudmFzRGltcyA9IFszMDAsIDMwMF07XG5cbiAgcmVzdWx0SW1hZ2VTaXplID0gMjAwO1xuICByZXN1bHRJbWFnZUZvcm1hdCA9ICdpbWFnZS9wbmcnO1xuXG4gIHJlc3VsdEltYWdlUXVhbGl0eTtcblxuICBwcml2YXRlIGVsZW1lbnQ6IGFueTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsQ2FudmFzLCBwcml2YXRlIG9wdHMsIHByaXZhdGUgZXZlbnRzKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxDYW52YXMucGFyZW50RWxlbWVudDtcblxuICAgIHRoaXMuY3R4ID0gZWxDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIHRoaXMuY3JvcEFyZWEgPSBuZXcgQ3JvcEFyZWFDaXJjbGUodGhpcy5jdHgsIGV2ZW50cyk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICAgIGVsQ2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Nb3VzZURvd24uYmluZCh0aGlzKSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZVVwLmJpbmQodGhpcykpO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vbk1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICBlbENhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Nb3VzZVVwLmJpbmQodGhpcykpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uTW91c2VNb3ZlKTtcbiAgICB0aGlzLmVsQ2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Nb3VzZURvd24pO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uTW91c2VNb3ZlKTtcblxuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Nb3VzZU1vdmUpO1xuICAgIHRoaXMuZWxDYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25Nb3VzZURvd24pO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vbk1vdXNlTW92ZSk7XG5cbiAgICB0aGlzLmVsQ2FudmFzLnJlbW92ZSgpO1xuICB9XG5cbiAgZHJhd1NjZW5lKCkge1xuICAgIC8vIGNsZWFyIGNhbnZhc1xuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmN0eC5jYW52YXMud2lkdGgsIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQpO1xuXG4gICAgaWYgKHRoaXMuaW1hZ2UgIT09IG51bGwpIHtcbiAgICAgIC8vIGRyYXcgc291cmNlIHRoaXMuaW1hZ2VcbiAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZSh0aGlzLmltYWdlLCAwLCAwLCB0aGlzLmN0eC5jYW52YXMud2lkdGgsIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgdGhpcy5jdHguc2F2ZSgpO1xuXG4gICAgICAvLyBhbmQgbWFrZSBpdCBkYXJrZXJcbiAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDAsIDAsIDAsIDAuNjUpJztcbiAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KDAsIDAsIHRoaXMuY3R4LmNhbnZhcy53aWR0aCwgdGhpcy5jdHguY2FudmFzLmhlaWdodCk7XG5cbiAgICAgIHRoaXMuY3R4LnJlc3RvcmUoKTtcblxuICAgICAgdGhpcy5jcm9wQXJlYS5kcmF3KCk7XG4gICAgfVxuICB9XG5cbiAgcmVzZXRDcm9wSG9zdChjdz8sIGNoPykge1xuICAgIGlmICh0aGlzLmltYWdlICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmNyb3BBcmVhLnNldEltYWdlKHRoaXMuaW1hZ2UpO1xuICAgICAgdmFyIGltYWdlV2lkdGggPSB0aGlzLmltYWdlLndpZHRoIHx8IGN3O1xuICAgICAgdmFyIGltYWdlSGVpZ2h0ID0gdGhpcy5pbWFnZS5oZWlnaHQgfHwgY2g7XG4gICAgICB2YXIgaW1hZ2VEaW1zID0gW2ltYWdlV2lkdGgsIGltYWdlSGVpZ2h0XTtcblxuICAgICAgLy8gQ29tcHV0ZSBjYW52YXMgZGltZW5zaW9ucyB0byBmaXQgZnVsbCBkaXNwbGF5IGludG8gaG9zdFxuICAgICAgdmFyIGltYWdlUmF0aW8gPSBpbWFnZVdpZHRoIC8gaW1hZ2VIZWlnaHQ7XG4gICAgICB2YXIgY2FudmFzRGltcyA9IGltYWdlRGltcztcbiAgICAgIGlmIChjYW52YXNEaW1zWzBdID4gdGhpcy5tYXhDYW52YXNEaW1zWzBdKSB7XG4gICAgICAgIGNhbnZhc0RpbXNbMF0gPSB0aGlzLm1heENhbnZhc0RpbXNbMF07XG4gICAgICAgIGNhbnZhc0RpbXNbMV0gPSBjYW52YXNEaW1zWzBdIC8gaW1hZ2VSYXRpbztcbiAgICAgIH0gZWxzZSBpZiAoY2FudmFzRGltc1swXSA8IHRoaXMubWluQ2FudmFzRGltc1swXSkge1xuICAgICAgICBjYW52YXNEaW1zWzBdID0gdGhpcy5taW5DYW52YXNEaW1zWzBdO1xuICAgICAgICBjYW52YXNEaW1zWzFdID0gY2FudmFzRGltc1swXSAvIGltYWdlUmF0aW87XG4gICAgICB9XG4gICAgICBpZiAoY2FudmFzRGltc1sxXSA+IHRoaXMubWF4Q2FudmFzRGltc1sxXSkge1xuICAgICAgICBjYW52YXNEaW1zWzFdID0gdGhpcy5tYXhDYW52YXNEaW1zWzFdO1xuICAgICAgICBjYW52YXNEaW1zWzBdID0gY2FudmFzRGltc1sxXSAqIGltYWdlUmF0aW87XG4gICAgICB9IGVsc2UgaWYgKGNhbnZhc0RpbXNbMV0gPCB0aGlzLm1pbkNhbnZhc0RpbXNbMV0pIHtcbiAgICAgICAgY2FudmFzRGltc1sxXSA9IHRoaXMubWluQ2FudmFzRGltc1sxXTtcbiAgICAgICAgY2FudmFzRGltc1swXSA9IGNhbnZhc0RpbXNbMV0gKiBpbWFnZVJhdGlvO1xuICAgICAgfVxuICAgICAgdmFyIHcgPSBNYXRoLmZsb29yKGNhbnZhc0RpbXNbMF0pO1xuICAgICAgdmFyIGggPSBNYXRoLmZsb29yKGNhbnZhc0RpbXNbMV0pO1xuICAgICAgY2FudmFzRGltc1swXSA9IHc7XG4gICAgICBjYW52YXNEaW1zWzFdID0gaDtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ2NhbnZhcyByZXNldCA9JyArIHcgKyAneCcgKyBoKTtcbiAgICAgIHRoaXMuZWxDYW52YXMud2lkdGggPSB3O1xuICAgICAgdGhpcy5lbENhbnZhcy5oZWlnaHQgPSBoO1xuXG4gICAgICAvLyBDb21wZW5zYXRlIENTUyA1MCUgY2VudGVyaW5nIG9mIGNhbnZhcyBpbnNpZGUgaG9zdFxuICAgICAgdGhpcy5lbENhbnZhcy5zdHlsZS5tYXJnaW5MZWZ0ID0gLXcgLyAyICsgJ3B4JztcbiAgICAgIHRoaXMuZWxDYW52YXMuc3R5bGUubWFyZ2luVG9wID0gLWggLyAyICsgJ3B4JztcblxuICAgICAgLy8gQ2VudGVyIGNyb3AgYXJlYSBieSBkZWZhdWx0XG4gICAgICB0aGlzLmNyb3BBcmVhLnNldFgodGhpcy5jdHguY2FudmFzLndpZHRoIC8gMik7XG4gICAgICB0aGlzLmNyb3BBcmVhLnNldFkodGhpcy5jdHguY2FudmFzLmhlaWdodCAvIDIpO1xuXG4gICAgICB0aGlzLmNyb3BBcmVhLnNldFNpemUoTWF0aC5taW4oMjAwLCB0aGlzLmN0eC5jYW52YXMud2lkdGggLyAyLCB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0IC8gMikpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVsQ2FudmFzLndpZHRoID0gMDtcbiAgICAgIHRoaXMuZWxDYW52YXMuaGVpZ2h0ID0gMDtcbiAgICAgIHRoaXMuZWxDYW52YXMuc3R5bGUubWFyZ2luTGVmdCA9IDA7XG4gICAgICB0aGlzLmVsQ2FudmFzLnN0eWxlLm1hcmdpblRvcCA9IDA7XG4gICAgfVxuXG4gICAgdGhpcy5kcmF3U2NlbmUoKTtcblxuICAgIHJldHVybiBjYW52YXNEaW1zO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgZXZlbnQuY2hhbmdlZFRvdWNoZXMgZGlyZWN0bHkgaWYgZXZlbnQgaXMgYSBUb3VjaEV2ZW50LlxuICAgKiBJZiBldmVudCBpcyBhIGpRdWVyeSBldmVudCwgcmV0dXJuIGNoYW5nZWRUb3VjaGVzIG9mIGV2ZW50Lm9yaWdpbmFsRXZlbnRcbiAgICovXG4gIHN0YXRpYyBnZXRDaGFuZ2VkVG91Y2hlcyhldmVudCkge1xuICAgIHJldHVybiBldmVudC5jaGFuZ2VkVG91Y2hlcyA/IGV2ZW50LmNoYW5nZWRUb3VjaGVzIDogZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlcztcbiAgfVxuXG4gIG9uTW91c2VNb3ZlKGUpIHtcbiAgICBpZiAodGhpcy5pbWFnZSAhPT0gbnVsbCkge1xuICAgICAgdmFyIG9mZnNldCA9IENyb3BIb3N0LmdldEVsZW1lbnRPZmZzZXQodGhpcy5jdHguY2FudmFzKSxcbiAgICAgICAgcGFnZVgsIHBhZ2VZO1xuICAgICAgaWYgKGUudHlwZSA9PT0gJ3RvdWNobW92ZScpIHtcbiAgICAgICAgcGFnZVggPSBDcm9wSG9zdC5nZXRDaGFuZ2VkVG91Y2hlcyhlKVswXS5wYWdlWDtcbiAgICAgICAgcGFnZVkgPSBDcm9wSG9zdC5nZXRDaGFuZ2VkVG91Y2hlcyhlKVswXS5wYWdlWTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhZ2VYID0gZS5wYWdlWDtcbiAgICAgICAgcGFnZVkgPSBlLnBhZ2VZO1xuICAgICAgfVxuICAgICAgdGhpcy5jcm9wQXJlYS5wcm9jZXNzTW91c2VNb3ZlKHBhZ2VYIC0gb2Zmc2V0LmxlZnQsIHBhZ2VZIC0gb2Zmc2V0LnRvcCk7XG4gICAgICB0aGlzLmRyYXdTY2VuZSgpO1xuICAgIH1cbiAgfVxuXG4gIG9uTW91c2VEb3duKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBpZiAodGhpcy5pbWFnZSAhPT0gbnVsbCkge1xuICAgICAgdmFyIG9mZnNldCA9IENyb3BIb3N0LmdldEVsZW1lbnRPZmZzZXQodGhpcy5jdHguY2FudmFzKSxcbiAgICAgICAgcGFnZVgsIHBhZ2VZO1xuICAgICAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnKSB7XG4gICAgICAgIHBhZ2VYID0gQ3JvcEhvc3QuZ2V0Q2hhbmdlZFRvdWNoZXMoZSlbMF0ucGFnZVg7XG4gICAgICAgIHBhZ2VZID0gQ3JvcEhvc3QuZ2V0Q2hhbmdlZFRvdWNoZXMoZSlbMF0ucGFnZVk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYWdlWCA9IGUucGFnZVg7XG4gICAgICAgIHBhZ2VZID0gZS5wYWdlWTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY3JvcEFyZWEucHJvY2Vzc01vdXNlRG93bihwYWdlWCAtIG9mZnNldC5sZWZ0LCBwYWdlWSAtIG9mZnNldC50b3ApO1xuICAgICAgdGhpcy5kcmF3U2NlbmUoKTtcbiAgICB9XG4gIH1cblxuICBvbk1vdXNlVXAoZSkge1xuICAgIGlmICh0aGlzLmltYWdlICE9PSBudWxsKSB7XG4gICAgICB2YXIgb2Zmc2V0ID0gQ3JvcEhvc3QuZ2V0RWxlbWVudE9mZnNldCh0aGlzLmN0eC5jYW52YXMpLFxuICAgICAgICBwYWdlWCwgcGFnZVk7XG4gICAgICBpZiAoZS50eXBlID09PSAndG91Y2hlbmQnKSB7XG4gICAgICAgIHBhZ2VYID0gQ3JvcEhvc3QuZ2V0Q2hhbmdlZFRvdWNoZXMoZSlbMF0ucGFnZVg7XG4gICAgICAgIHBhZ2VZID0gQ3JvcEhvc3QuZ2V0Q2hhbmdlZFRvdWNoZXMoZSlbMF0ucGFnZVk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYWdlWCA9IGUucGFnZVg7XG4gICAgICAgIHBhZ2VZID0gZS5wYWdlWTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY3JvcEFyZWEucHJvY2Vzc01vdXNlVXAocGFnZVggLSBvZmZzZXQubGVmdCwgcGFnZVkgLSBvZmZzZXQudG9wKTtcbiAgICAgIHRoaXMuZHJhd1NjZW5lKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UmVzdWx0SW1hZ2VEYXRhVVJJKCkge1xuICAgIHZhciB0ZW1wX2NhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdDQU5WQVMnKTtcbiAgICB2YXIgdGVtcF9jdHggPSB0ZW1wX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHRlbXBfY2FudmFzLndpZHRoID0gdGhpcy5yZXN1bHRJbWFnZVNpemU7XG4gICAgdGVtcF9jYW52YXMuaGVpZ2h0ID0gdGhpcy5yZXN1bHRJbWFnZVNpemU7XG4gICAgaWYgKHRoaXMuaW1hZ2UgIT09IG51bGwpIHtcbiAgICAgIHRlbXBfY3R4LmRyYXdJbWFnZSh0aGlzLmltYWdlLFxuICAgICAgICAodGhpcy5jcm9wQXJlYS5nZXRYKCkgLSB0aGlzLmNyb3BBcmVhLmdldFNpemUoKSAvIDIpICogKHRoaXMuaW1hZ2Uud2lkdGggLyB0aGlzLmN0eC5jYW52YXMud2lkdGgpLFxuICAgICAgICAodGhpcy5jcm9wQXJlYS5nZXRZKCkgLSB0aGlzLmNyb3BBcmVhLmdldFNpemUoKSAvIDIpICogKHRoaXMuaW1hZ2UuaGVpZ2h0IC8gdGhpcy5jdHguY2FudmFzLmhlaWdodCksXG4gICAgICAgIHRoaXMuY3JvcEFyZWEuZ2V0U2l6ZSgpICogKHRoaXMuaW1hZ2Uud2lkdGggLyB0aGlzLmN0eC5jYW52YXMud2lkdGgpLFxuICAgICAgICB0aGlzLmNyb3BBcmVhLmdldFNpemUoKSAqICh0aGlzLmltYWdlLmhlaWdodCAvIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQpLFxuICAgICAgICAwLCAwLCB0aGlzLnJlc3VsdEltYWdlU2l6ZSwgdGhpcy5yZXN1bHRJbWFnZVNpemUpO1xuICAgIH1cbiAgICBpZiAodGhpcy5yZXN1bHRJbWFnZVF1YWxpdHkgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0ZW1wX2NhbnZhcy50b0RhdGFVUkwodGhpcy5yZXN1bHRJbWFnZUZvcm1hdCwgdGhpcy5yZXN1bHRJbWFnZVF1YWxpdHkpO1xuICAgIH1cbiAgICByZXR1cm4gdGVtcF9jYW52YXMudG9EYXRhVVJMKHRoaXMucmVzdWx0SW1hZ2VGb3JtYXQpO1xuICB9XG5cbiAgcmVkcmF3KCkge1xuICAgIHRoaXMuZHJhd1NjZW5lKCk7XG4gIH1cblxuICBzZXROZXdJbWFnZVNvdXJjZShpbWFnZVNvdXJjZSkge1xuICAgIHRoaXMuaW1hZ2UgPSBudWxsO1xuICAgIHRoaXMucmVzZXRDcm9wSG9zdCgpO1xuICAgIHRoaXMuZXZlbnRzLnRyaWdnZXIoJ2ltYWdlLXVwZGF0ZWQnKTtcbiAgICBpZiAoISFpbWFnZVNvdXJjZSkge1xuICAgICAgdmFyIG5ld0ltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICBpZiAoaW1hZ2VTb3VyY2Uuc3Vic3RyaW5nKDAsIDQpLnRvTG93ZXJDYXNlKCkgPT09ICdodHRwJykge1xuICAgICAgICBuZXdJbWFnZS5jcm9zc09yaWdpbiA9ICdhbm9ueW1vdXMnO1xuICAgICAgfVxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICBuZXdJbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYuZXZlbnRzLnRyaWdnZXIoJ2xvYWQtZG9uZScpO1xuXG4gICAgICAgIENyb3BFWElGLmdldERhdGEobmV3SW1hZ2UsICgpID0+IHtcbiAgICAgICAgICB2YXIgb3JpZW50YXRpb24gPSBDcm9wRVhJRi5nZXRUYWcobmV3SW1hZ2UsICdPcmllbnRhdGlvbicpO1xuICAgICAgICAgIGxldCBjdyA9IG5ld0ltYWdlLndpZHRoLCBjaCA9IG5ld0ltYWdlLmhlaWdodCwgY3ggPSAwLCBjeSA9IDAsIGRlZyA9IDA7XG5cbiAgICAgICAgICBmdW5jdGlvbiBpbWFnZURvbmUoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdkaW1zPScgKyBjdyArICd4JyArIGNoKTtcbiAgICAgICAgICAgIHZhciBjYW52YXNEaW1zID0gc2VsZi5yZXNldENyb3BIb3N0KGN3LCBjaCk7XG4gICAgICAgICAgICBzZWxmLnNldE1heERpbWVuc2lvbnMoY2FudmFzRGltc1swXSwgY2FudmFzRGltc1sxXSk7XG4gICAgICAgICAgICBzZWxmLmV2ZW50cy50cmlnZ2VyKCdpbWFnZS11cGRhdGVkJyk7XG4gICAgICAgICAgICBzZWxmLmV2ZW50cy50cmlnZ2VyKCdpbWFnZS1yZWFkeScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChbMywgNiwgOF0uaW5kZXhPZihvcmllbnRhdGlvbikgPj0gMCkge1xuICAgICAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgICAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgICAgICBzd2l0Y2ggKG9yaWVudGF0aW9uKSB7XG4gICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBjeCA9IC1uZXdJbWFnZS53aWR0aDtcbiAgICAgICAgICAgICAgICBjeSA9IC1uZXdJbWFnZS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgZGVnID0gMTgwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgY3cgPSBuZXdJbWFnZS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgY2ggPSBuZXdJbWFnZS53aWR0aDtcbiAgICAgICAgICAgICAgICBjeSA9IC1uZXdJbWFnZS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgZGVnID0gOTA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgICAgICBjdyA9IG5ld0ltYWdlLmhlaWdodDtcbiAgICAgICAgICAgICAgICBjaCA9IG5ld0ltYWdlLndpZHRoO1xuICAgICAgICAgICAgICAgIGN4ID0gLW5ld0ltYWdlLndpZHRoO1xuICAgICAgICAgICAgICAgIGRlZyA9IDI3MDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IGN3O1xuICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IGNoO1xuICAgICAgICAgICAgc2VsZi5jdHgucm90YXRlKGRlZyAqIE1hdGguUEkgLyAxODApO1xuICAgICAgICAgICAgc2VsZi5jdHguZHJhd0ltYWdlKG5ld0ltYWdlLCBjeCwgY3kpO1xuXG4gICAgICAgICAgICBzZWxmLmltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICBzZWxmLmltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgaW1hZ2VEb25lKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2VsZi5pbWFnZS5zcmMgPSBjYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLmltYWdlID0gbmV3SW1hZ2U7XG4gICAgICAgICAgICBpbWFnZURvbmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIG5ld0ltYWdlLm9uZXJyb3IgPSBlcnJvciA9PiB7XG4gICAgICAgIHRoaXMuZXZlbnRzLnRyaWdnZXIoJ2xvYWQtZXJyb3InLCBbZXJyb3JdKTtcbiAgICAgIH07XG4gICAgICB0aGlzLmV2ZW50cy50cmlnZ2VyKCdsb2FkLXN0YXJ0Jyk7XG4gICAgICBuZXdJbWFnZS5zcmMgPSBpbWFnZVNvdXJjZTtcbiAgICB9XG4gIH1cblxuICBzZXRNYXhEaW1lbnNpb25zKHdpZHRoLCBoZWlnaHQpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdzZXRNYXhEaW1lbnNpb25zKCcgKyB3aWR0aCArICcsICcgKyBoZWlnaHQgKyAnKScpO1xuICAgIGlmICh0aGlzLmltYWdlICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBjdXJXaWR0aCA9IHRoaXMuY3R4LmNhbnZhcy53aWR0aCxcbiAgICAgICAgY3VySGVpZ2h0ID0gdGhpcy5jdHguY2FudmFzLmhlaWdodDtcblxuICAgICAgY29uc3QgcmF0aW9OZXdDdXJXaWR0aCA9IHRoaXMuY3R4LmNhbnZhcy53aWR0aCAvIGN1cldpZHRoLFxuICAgICAgICByYXRpb05ld0N1ckhlaWdodCA9IHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQgLyBjdXJIZWlnaHQsXG4gICAgICAgIHJhdGlvTWluID0gTWF0aC5taW4ocmF0aW9OZXdDdXJXaWR0aCwgcmF0aW9OZXdDdXJIZWlnaHQpO1xuICAgIH1cbiAgICB0aGlzLm1heENhbnZhc0RpbXMgPSBbd2lkdGgsIGhlaWdodF07XG4gICAgcmV0dXJuIHRoaXMucmVzZXRDcm9wSG9zdCh3aWR0aCwgaGVpZ2h0KTtcbiAgfVxuXG4gIHNldEFyZWFNaW5TaXplKHNpemUpIHtcbiAgICBzaXplID0gcGFyc2VJbnQoc2l6ZSwgMTApO1xuICAgIGlmICghaXNOYU4oc2l6ZSkpIHtcbiAgICAgIHRoaXMuY3JvcEFyZWEuc2V0TWluU2l6ZShzaXplKTtcbiAgICAgIHRoaXMuZHJhd1NjZW5lKCk7XG4gICAgfVxuICB9XG5cbiAgc2V0UmVzdWx0SW1hZ2VTaXplKHNpemUpIHtcbiAgICBzaXplID0gcGFyc2VJbnQoc2l6ZSwgMTApO1xuICAgIGlmICghaXNOYU4oc2l6ZSkpIHtcbiAgICAgIHRoaXMucmVzdWx0SW1hZ2VTaXplID0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBzZXRSZXN1bHRJbWFnZUZvcm1hdChmb3JtYXQpIHtcbiAgICB0aGlzLnJlc3VsdEltYWdlRm9ybWF0ID0gZm9ybWF0O1xuICB9XG5cbiAgc2V0UmVzdWx0SW1hZ2VRdWFsaXR5KHF1YWxpdHkpIHtcbiAgICBxdWFsaXR5ID0gcGFyc2VGbG9hdChxdWFsaXR5KTtcbiAgICBpZiAoIWlzTmFOKHF1YWxpdHkpICYmIHF1YWxpdHkgPj0gMCAmJiBxdWFsaXR5IDw9IDEpIHtcbiAgICAgIHRoaXMucmVzdWx0SW1hZ2VRdWFsaXR5ID0gcXVhbGl0eTtcbiAgICB9XG4gIH1cblxuICBzZXRBcmVhVHlwZSh0eXBlOiBDcm9wQXJlYVR5cGUpIHtcbiAgICBjb25zdCBjdXJTaXplID0gdGhpcy5jcm9wQXJlYS5nZXRTaXplKCksXG4gICAgICBjdXJNaW5TaXplID0gdGhpcy5jcm9wQXJlYS5nZXRNaW5TaXplKCksXG4gICAgICBjdXJYID0gdGhpcy5jcm9wQXJlYS5nZXRYKCksXG4gICAgICBjdXJZID0gdGhpcy5jcm9wQXJlYS5nZXRZKCk7XG5cbiAgICBpZiAodHlwZSA9PT0gQ3JvcEFyZWFUeXBlLlNxdWFyZSkge1xuICAgICAgdGhpcy5jcm9wQXJlYSA9IG5ldyBDcm9wQXJlYVNxdWFyZSh0aGlzLmN0eCwgdGhpcy5ldmVudHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNyb3BBcmVhID0gbmV3IENyb3BBcmVhQ2lyY2xlKHRoaXMuY3R4LCB0aGlzLmV2ZW50cyk7XG4gICAgfVxuICAgIHRoaXMuY3JvcEFyZWEuc2V0TWluU2l6ZShjdXJNaW5TaXplKTtcbiAgICB0aGlzLmNyb3BBcmVhLnNldFNpemUoY3VyU2l6ZSk7XG4gICAgdGhpcy5jcm9wQXJlYS5zZXRYKGN1clgpO1xuICAgIHRoaXMuY3JvcEFyZWEuc2V0WShjdXJZKTtcblxuICAgIC8vIHRoaXMucmVzZXRDcm9wSG9zdCgpO1xuICAgIGlmICh0aGlzLmltYWdlICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmNyb3BBcmVhLnNldEltYWdlKHRoaXMuaW1hZ2UpO1xuICAgIH1cbiAgICB0aGlzLmRyYXdTY2VuZSgpO1xuICB9XG5cbiAgZ2V0QXJlYURldGFpbHMoKSA6IENyb3BBcmVhRGV0YWlscyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHRoaXMuY3JvcEFyZWEuZ2V0WCgpLFxuICAgICAgeTogdGhpcy5jcm9wQXJlYS5nZXRZKCksXG4gICAgICBzaXplOiB0aGlzLmNyb3BBcmVhLmdldFNpemUoKSxcbiAgICAgIGltYWdlOiB7d2lkdGg6IHRoaXMuY3JvcEFyZWEuZ2V0SW1hZ2UoKS53aWR0aCwgaGVpZ2h0OiB0aGlzLmNyb3BBcmVhLmdldEltYWdlKCkuaGVpZ2h0fSxcbiAgICAgIGNhbnZhczoge3dpZHRoOiB0aGlzLmN0eC5jYW52YXMud2lkdGgsIGhlaWdodDogdGhpcy5jdHguY2FudmFzLmhlaWdodH1cbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGdldEVsZW1lbnRPZmZzZXQoZWxlbSkge1xuICAgIHZhciBib3ggPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuICAgIHZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG4gICAgdmFyIHNjcm9sbFRvcCA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2NFbGVtLnNjcm9sbFRvcCB8fCBib2R5LnNjcm9sbFRvcDtcbiAgICB2YXIgc2Nyb2xsTGVmdCA9IHdpbmRvdy5wYWdlWE9mZnNldCB8fCBkb2NFbGVtLnNjcm9sbExlZnQgfHwgYm9keS5zY3JvbGxMZWZ0O1xuXG4gICAgdmFyIGNsaWVudFRvcCA9IGRvY0VsZW0uY2xpZW50VG9wIHx8IGJvZHkuY2xpZW50VG9wIHx8IDA7XG4gICAgdmFyIGNsaWVudExlZnQgPSBkb2NFbGVtLmNsaWVudExlZnQgfHwgYm9keS5jbGllbnRMZWZ0IHx8IDA7XG5cbiAgICB2YXIgdG9wID0gYm94LnRvcCArIHNjcm9sbFRvcCAtIGNsaWVudFRvcDtcbiAgICB2YXIgbGVmdCA9IGJveC5sZWZ0ICsgc2Nyb2xsTGVmdCAtIGNsaWVudExlZnQ7XG5cbiAgICByZXR1cm4ge3RvcDogTWF0aC5yb3VuZCh0b3ApLCBsZWZ0OiBNYXRoLnJvdW5kKGxlZnQpfTtcbiAgfVxufSIsImltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgU2ltcGxlQ2hhbmdlcywgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Nyb3BQdWJTdWJ9IGZyb20gXCIuL2NsYXNzZXMvY3JvcC1wdWJzdWJcIjtcbmltcG9ydCB7Q3JvcEhvc3R9IGZyb20gXCIuL2NsYXNzZXMvY3JvcC1ob3N0XCI7XG5pbXBvcnQge0Nyb3BBcmVhVHlwZX0gZnJvbSBcIi4vY2xhc3Nlcy9jcm9wLWFyZWFcIjtcblxuZXhwb3J0IGludGVyZmFjZSBDcm9wQXJlYURldGFpbHMge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbiAgc2l6ZTogbnVtYmVyO1xuICBpbWFnZTogeyB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciB9O1xuICBjYW52YXM6IHsgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgfTtcbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZmMtaW1nLWNyb3AnLFxuICB0ZW1wbGF0ZTogJzxjYW52YXM+PC9jYW52YXM+JyxcbiAgc3R5bGVVcmxzOiBbJ2ZjLWltZy1jcm9wLmNvbXBvbmVudC5zY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgRmNJbWdDcm9wQ29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkluaXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG5cbiAgQElucHV0KCkgaW1hZ2U7XG5cbiAgQElucHV0KCkgcmVzdWx0SW1hZ2U7XG4gIEBPdXRwdXQoKSByZXN1bHRJbWFnZUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBASW5wdXQoKSBjaGFuZ2VPbkZseTtcbiAgQElucHV0KCkgYXJlYVR5cGU6IENyb3BBcmVhVHlwZTtcbiAgQElucHV0KCkgYXJlYU1pblNpemU7XG5cbiAgQElucHV0KCkgYXJlYURldGFpbHM6IENyb3BBcmVhRGV0YWlscztcbiAgQE91dHB1dCgpIGFyZWFEZXRhaWxzQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxDcm9wQXJlYURldGFpbHM+KCk7XG5cbiAgQElucHV0KCkgcmVzdWx0SW1hZ2VTaXplO1xuICBASW5wdXQoKSByZXN1bHRJbWFnZUZvcm1hdDogc3RyaW5nO1xuICBASW5wdXQoKSByZXN1bHRJbWFnZVF1YWxpdHk7XG5cbiAgQE91dHB1dCgpIG9uQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgb25Mb2FkQmVnaW4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBvbkxvYWREb25lID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgb25Mb2FkRXJyb3IgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBvbkltYWdlUmVhZHkgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgcHJpdmF0ZSBldmVudHMgPSBuZXcgQ3JvcFB1YlN1YigpO1xuICBwcml2YXRlIGNyb3BIb3N0OiBDcm9wSG9zdDtcbiAgcHJpdmF0ZSBvYnNlcnZlcjogTXV0YXRpb25PYnNlcnZlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsOiBFbGVtZW50UmVmLCBwcml2YXRlIHJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYpIHtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMuZXZlbnRzO1xuXG4gICAgLy8gSW5pdCBDcm9wIEhvc3RcbiAgICBsZXQgZWwgPSB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XG4gICAgdGhpcy5jcm9wSG9zdCA9IG5ldyBDcm9wSG9zdChlbCwge30sIGV2ZW50cyk7XG5cbiAgICAvLyBTZXR1cCBDcm9wSG9zdCBFdmVudCBIYW5kbGVyc1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGV2ZW50c1xuICAgICAgLm9uKCdsb2FkLXN0YXJ0JywgKCkgPT4ge1xuICAgICAgICBzZWxmLm9uTG9hZEJlZ2luLmVtaXQoe30pO1xuICAgICAgICBzZWxmLnJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICB9KVxuICAgICAgLm9uKCdsb2FkLWRvbmUnLCAoKSA9PiB7XG4gICAgICAgIHNlbGYub25Mb2FkRG9uZS5lbWl0KHt9KTtcbiAgICAgICAgc2VsZi5yZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgfSlcbiAgICAgIC5vbignaW1hZ2UtcmVhZHknLCAoKSA9PiB7XG4gICAgICAgIGlmIChzZWxmLm9uSW1hZ2VSZWFkeS5lbWl0KHt9KSkge1xuICAgICAgICAgIHNlbGYuY3JvcEhvc3QucmVkcmF3KCk7XG4gICAgICAgICAgc2VsZi5yZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLm9uKCdsb2FkLWVycm9yJywgKCkgPT4ge1xuICAgICAgICBzZWxmLm9uTG9hZEVycm9yLmVtaXQoe30pO1xuICAgICAgICBzZWxmLnJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICB9KVxuICAgICAgLm9uKCdhcmVhLW1vdmUgYXJlYS1yZXNpemUnLCAoKSA9PiB7XG4gICAgICAgIGlmICghIXNlbGYuY2hhbmdlT25GbHkpIHtcbiAgICAgICAgICBzZWxmLnVwZGF0ZVJlc3VsdEltYWdlKCk7XG4gICAgICAgICAgc2VsZi5yZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLm9uKCdhcmVhLW1vdmUtZW5kIGFyZWEtcmVzaXplLWVuZCBpbWFnZS11cGRhdGVkJywgKCkgPT4ge1xuICAgICAgICBzZWxmLnVwZGF0ZVJlc3VsdEltYWdlKCk7XG4gICAgICAgIHNlbGYuYXJlYURldGFpbHMgPSBzZWxmLmNyb3BIb3N0LmdldEFyZWFEZXRhaWxzKCk7XG4gICAgICAgIHNlbGYuYXJlYURldGFpbHNDaGFuZ2UuZW1pdChzZWxmLmFyZWFEZXRhaWxzKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLy8gU3RvcmUgUmVzdWx0IEltYWdlIHRvIGNoZWNrIGlmIGl0J3MgY2hhbmdlZFxuICBzdG9yZWRSZXN1bHRJbWFnZTtcblxuICB1cGRhdGVSZXN1bHRJbWFnZSgpIHtcbiAgICBjb25zdCByZXN1bHRJbWFnZSA9IHRoaXMuY3JvcEhvc3QuZ2V0UmVzdWx0SW1hZ2VEYXRhVVJJKCk7XG4gICAgaWYgKHRoaXMuc3RvcmVkUmVzdWx0SW1hZ2UgIT09IHJlc3VsdEltYWdlKSB7XG4gICAgICB0aGlzLnN0b3JlZFJlc3VsdEltYWdlID0gcmVzdWx0SW1hZ2U7XG4gICAgICB0aGlzLnJlc3VsdEltYWdlID0gcmVzdWx0SW1hZ2U7XG4gICAgICBpZiAodGhpcy5yZXN1bHRJbWFnZUNoYW5nZS5vYnNlcnZlcnMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMucmVzdWx0SW1hZ2VDaGFuZ2UuZW1pdCh0aGlzLnJlc3VsdEltYWdlKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9uQ2hhbmdlLm9ic2VydmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMub25DaGFuZ2UuZW1pdCh7JGRhdGFVUkk6IHRoaXMucmVzdWx0SW1hZ2V9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmNyb3BIb3N0LmRlc3Ryb3koKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5jIENyb3BIb3N0IHdpdGggRGlyZWN0aXZlJ3Mgb3B0aW9uc1xuICAgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIGlmICh0aGlzLmNyb3BIb3N0KSB7XG4gICAgICBpZiAoY2hhbmdlcy5pbWFnZSkge1xuICAgICAgICB0aGlzLmNyb3BIb3N0LnNldE5ld0ltYWdlU291cmNlKHRoaXMuaW1hZ2UpO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZXMuYXJlYVR5cGUpIHtcbiAgICAgICAgdGhpcy5jcm9wSG9zdC5zZXRBcmVhVHlwZSh0aGlzLmFyZWFUeXBlKTtcbiAgICAgICAgdGhpcy51cGRhdGVSZXN1bHRJbWFnZSgpO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZXMuYXJlYU1pblNpemUpIHtcbiAgICAgICAgdGhpcy5jcm9wSG9zdC5zZXRBcmVhTWluU2l6ZSh0aGlzLmFyZWFNaW5TaXplKTtcbiAgICAgICAgdGhpcy51cGRhdGVSZXN1bHRJbWFnZSgpO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZXMucmVzdWx0SW1hZ2VTaXplKSB7XG4gICAgICAgIHRoaXMuY3JvcEhvc3Quc2V0UmVzdWx0SW1hZ2VTaXplKHRoaXMucmVzdWx0SW1hZ2VTaXplKTtcbiAgICAgICAgdGhpcy51cGRhdGVSZXN1bHRJbWFnZSgpO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZXMucmVzdWx0SW1hZ2VGb3JtYXQpIHtcbiAgICAgICAgdGhpcy5jcm9wSG9zdC5zZXRSZXN1bHRJbWFnZUZvcm1hdCh0aGlzLnJlc3VsdEltYWdlRm9ybWF0KTtcbiAgICAgICAgdGhpcy51cGRhdGVSZXN1bHRJbWFnZSgpO1xuICAgICAgfVxuICAgICAgaWYgKGNoYW5nZXMucmVzdWx0SW1hZ2VRdWFsaXR5KSB7XG4gICAgICAgIHRoaXMuY3JvcEhvc3Quc2V0UmVzdWx0SW1hZ2VRdWFsaXR5KHRoaXMucmVzdWx0SW1hZ2VRdWFsaXR5KTtcbiAgICAgICAgdGhpcy51cGRhdGVSZXN1bHRJbWFnZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLm9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobXV0YXRpb25zID0+IHtcbiAgICAgIG11dGF0aW9ucy5mb3JFYWNoKChtdXRhdGlvbjogTXV0YXRpb25SZWNvcmQpID0+IHtcbiAgICAgICAgaWYgKG11dGF0aW9uLmF0dHJpYnV0ZU5hbWUgPT09ICdjbGllbnRXaWR0aCcgfHwgbXV0YXRpb24uYXR0cmlidXRlTmFtZSA9PT0gJ2NsaWVudEhlaWdodCcpIHtcbiAgICAgICAgICB0aGlzLmNyb3BIb3N0LnNldE1heERpbWVuc2lvbnModGhpcy5lbC5uYXRpdmVFbGVtZW50LmNsaWVudFdpZHRoLCB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuY2xpZW50SGVpZ2h0KTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVJlc3VsdEltYWdlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGNvbnN0IGNvbmZpZyA9IHthdHRyaWJ1dGVzOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IHRydWV9O1xuICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQsIGNvbmZpZyk7XG4gIH1cbn0iLCJpbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtGY0ltZ0Nyb3BDb21wb25lbnR9IGZyb20gXCIuL2ZjLWltZy1jcm9wLmNvbXBvbmVudFwiO1xuXG5ATmdNb2R1bGUoe1xuICAgIGRlY2xhcmF0aW9uczogW1xuICAgICAgICBGY0ltZ0Nyb3BDb21wb25lbnRcbiAgICBdLFxuICAgIGV4cG9ydHM6IFtcbiAgICAgICAgRmNJbWdDcm9wQ29tcG9uZW50XG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBDcm9wTW9kdWxlIHtcbn1cbiJdLCJuYW1lcyI6WyJ0c2xpYl8xLl9fZXh0ZW5kcyIsIkV2ZW50RW1pdHRlciIsIkNvbXBvbmVudCIsIkVsZW1lbnRSZWYiLCJDaGFuZ2VEZXRlY3RvclJlZiIsIklucHV0IiwiT3V0cHV0IiwiTmdNb2R1bGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFBQSxJQUFBOzswQkFDbUIsRUFBRTs7Ozs7OztRQUVuQix1QkFBRTs7Ozs7WUFBRixVQUFHLEtBQWEsRUFBRSxPQUFpQjtnQkFBbkMsaUJBUUM7Z0JBUEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO29CQUMzQixJQUFJLENBQUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDdEIsS0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7cUJBQ3hCO29CQUNELEtBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUNqQyxDQUFDLENBQUM7Z0JBQ0gsT0FBTyxJQUFJLENBQUM7YUFDYjs7Ozs7OztRQUdELDRCQUFPOzs7OztZQUFQLFVBQVEsSUFBWSxFQUFFLElBQVc7O2dCQUMvQixJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLFNBQVMsRUFBRTtvQkFDYixTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTzt3QkFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7cUJBQzFCLENBQUMsQ0FB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QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dDQUMzRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOytCQUNyRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7K0JBQy9FLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzsrQkFDL0UsQ0FBQyxDQUFDLENBQUMs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