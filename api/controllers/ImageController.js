const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const IMAGES = path.resolve(__dirname, '../../images/');
const rimraf = require("rimraf");
var mmm = require('mmmagic'),
    Magic = mmm.Magic;

const writeImage = async function (nameFile, directory, image) {
    return new Promise(function (resolve, reject) {

        fs.writeFile(path.join(directory, nameFile + '.jpg'), image, function (err) {

            if (err) {
                return reject(err);
            }

            resolve({ message: "success" });

        });

    });
}

const resizeSave = async function (nameFile, directory, image, size) {

    return new Promise(function (resolve, reject) {

        sharp(image).resize(size.width, size.height)
            .crop(sharp.strategy.entropy)
            .toBuffer(async function (err, data, info) {
                if (err) { return reject(err); }

                try {
                    let write = await writeImage(nameFile, directory, data);
                    resolve(directory, data, info, true);
                }
                catch (e) {
                    reject(e);
                }

            });

    });
}

const getMimeType = function (dirname) {
    return new Promise(function (resolve, reject) {
        var magic = new Magic(mmm.MAGIC_MIME_TYPE);
        magic.detectFile(dirname, function (err, result) {
            if (err) { return reject(err); };
            console.log(result);
            resolve(result);
        });
    });
}

//check if exits the directory
const directorys = {
    users: path.join(IMAGES, "users")
};
for (let name of Object.keys(directorys)) {
    if (fs.existsSync(directorys[name]) === false) {
        fs.mkdirSync(directorys[name]);
    }
}

module.exports = {

    saveImageUser: catchErrors(async (req, res) => {
        await new Promise(async (resolve, reject) => {
            try {

                let user = await User.findOne({ id: req.param("userId") });
                if (user === undefined) {
                    res.status(500);
                    return res.send("user not found");
                }

                let _namefile;
                req.file("image").upload({
                    dirname: directorys.users,
                    maxBytes: 5000000,
                    saveAs: function (stream, cb) {
                        _namefile = req.param("userId") + "." + stream.filename.split(".").pop();
                        console.log(_namefile);
                        cb(null, _namefile);
                    }
                }, async function (err, uploadedFiles) {
                    if (err) {
                        reject(err);
                        if (res) {
                            return reject(err);
                        }
                    }

                    let image = {};
                    for (let file of uploadedFiles) {
                        console.log(file);
                        if (file.type.includes("image/") && file["status"] === "finished") {
                            image = {
                                type: file.type,
                                filename: file.filename,
                                src: "/images/users/" + _namefile + "/" + req.param("userId")
                            };
                        }
                    }

                    let upda = await User.update({ id: user.id }, { image }).fetch();

                    resolve(upda);
                    if (res) {
                        res.json(upda);
                    }
                })
            }
            catch (e) {
                console.error(e);
                reject(e);
                if (res !== false) {
                    res.serverError(e);
                }
            }
        });
    }),

    getImage: catchErrors(async (req, res) => {
        let type = req.param("type"), nameFile = req.param("nameFile"), id = req.param("id");
        let dirname = path.join(IMAGES, type, nameFile);

        // read binary data
        var data = fs.readFileSync(dirname);

        // convert binary data to base64 encoded string
        res.contentType(await getMimeType(dirname));
        res.send(data);
    })
};

