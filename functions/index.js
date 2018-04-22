const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');

const gcsConfig = {
    projectId: 'udemy-ng-http-a37ab',
    keyFileName: 'udemy-ng-http-a37ab-firebase-adminsdk-gprba-be6f662f71.json'
};

const gcs = require('@google-cloud/storage')(gcsConfig);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions


exports.uploadFile = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        if (req.method !== 'POST') {
            res.status(500).json({
                message: 'Not Allowed!'
            });
        }

        const busboy = new Busboy({headers: req.headers});
        let uploadData = null;

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            const filepath = path.join(os.tmpdir(), filename);
            uploadData = {file: filepath, type: mimetype};
            file.pipe(fs.createWriteStream(filepath));
        });

        busboy.on('finish', () => {
            const bucket = gcs.bucket('udemy-ng-http-a37ab.appspot.com');
            bucket.upload(uploadData.file, {
                uploadType: 'media',
                metadata: {
                    metadata: {
                        contentType: uploadData.type
                    }
                }
            }).then(() => {
                res.status(200).json({
                    message: 'File Uploaded Succesfully!'
                });
            }).catch(err => {
                res.status(500).json({
                    error: err 
                });                
            });
        });

        busboy.end(req.rawBody);
    });
});