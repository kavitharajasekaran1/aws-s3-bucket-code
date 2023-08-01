require('dotenv').config();

const express = require('express');
const app = express();

app.listen(4001);

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

aws.config.update({
    secretAccessKey : process.env.ACCESS_SECRET,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION
});

const BUCKET = process.env.BUCKET;
const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: BUCKET,
        key: function(req,file, cb) {
            console.log(file);
            cb(null, file.originalname)
        }
    })
})

app.post('/upload', upload.single('file'), async(req,res, next)=>{
    res.send('successfully uploaded' + req.file.location + 'location')
})

app.get('list', async(req,res)=>{
    let r = await s3.listObjectsV2({Bucket: BUCKET}).promise();
    let x = r.Contents.map(item=> item.key);
    res.send(x)
})

app.get('download/:fileName' , async(req,res)=>{

    const fileName = req.params.fileName;
    let x = await s3.getObject({Bucket: BUCKET, key: fileName}).promise();
    res.send(x.Body)
})

app.delete('/delete/:fileName', async(req,res)=>{
    const fileName = req.params.fileName;
    await s3.deleteObject({Bucket: BUCKET, key: fileName}).promise();
    res.send("File Deleted Successfully")
})