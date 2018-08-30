

export default class Loader {

    private filesToLoad : string[];
    private totalLength : number;

    private files : string[] | HTMLImageElement[];
    private isImage : boolean[];
    private progress : number[];

    private totalLoaded : number;

    onComplete(files : string[] | HTMLImageElement[]) {}
    onProgress(percentComplete : number, numBytesRecieved : number, totalBytes : number) {}

    constructor(filesToLoad : string[]) {
        this.filesToLoad = filesToLoad;
        this.totalLength = 0;

        //this.onProgressChanged = undefined
        //this.onComplete = undefined

        this.files = [];
        this.isImage = [];
        this.progress = [];
    }

    loadFileSizes(callback) {
        const _this = this;

        var filesChecked = 0;

        this.totalLength = 0;
        var onChecked = function(length) {

            _this.totalLength += length;
            filesChecked++;

            if (filesChecked == _this.filesToLoad.length) {
                callback && callback();
            }
        }

        for (var i = 0; i < this.filesToLoad.length; i++) {
            const index = i;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == XMLHttpRequest.DONE) {
                    _this.isImage[index] = this.getResponseHeader('Content-Type').indexOf('image') !== -1;
                    onChecked(parseInt(this.getResponseHeader('Content-Length')));
                }
            }
            xhr.open('HEAD', this.filesToLoad[i], true);
            xhr.send(null);
        }


    }

    loadImage() {
    }

    loadContent() {
        const _this = this;

        this.totalLoaded = 0;

        var numLoaded = 0;

        this.files = [];
        for (var i = 0; i < this.filesToLoad.length; i++) {
            this.progress[i] = 0;

            const index = i;

            var progress = function (event) {
                _this.totalLoaded += event.loaded - _this.progress[index];
                _this.onProgress && _this.onProgress(_this.totalLoaded / _this.totalLength * 100, _this.totalLoaded, _this.totalLength);
                _this.progress[index] = event.loaded
            }

            if (this.isImage[i]) {

                console.log("loading image: " + this.filesToLoad[i])

                var image = new Image();

                image.addEventListener('progress', progress, false);

                image.addEventListener('load', function() {
                    _this.files[index] = this;

                    numLoaded++;

                    if (numLoaded == _this.filesToLoad.length) {
                        _this.onComplete && _this.onComplete(_this.files);
                    }
                }, false);

                image.src = this.filesToLoad[i];

            } else {

                var xhr = new XMLHttpRequest();

                xhr.onreadystatechange = function() {
                    if (this.readyState == XMLHttpRequest.DONE) {
                        _this.files[index] = this.responseText;

                        numLoaded++;

                        if (numLoaded == _this.filesToLoad.length) {
                            _this.onComplete && _this.onComplete(_this.files);
                        }
                    }
                }

                xhr.addEventListener("progress", progress, false);

                console.log("loading file: " + this.filesToLoad[i])
                xhr.open('GET', this.filesToLoad[i], true);
                xhr.send(null);

            }
        }
    }

    start() {
        this.loadFileSizes(this.loadContent.bind(this));
    }

}