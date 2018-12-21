const jsdom = require("jsdom"), fs = require("fs"),
    mongoose = require("mongoose"), moment = require("moment"),
    local = require("../config/local");
const { JSDOM } = jsdom;
const googleMapsClient = require('@google/maps').createClient({
    key: local.google.maps.key
});

async function getLatLng(address) {
    return await new Promise(resolve => {
        googleMapsClient.geocode({
            address,
        }, function (err, response) {
            try {
                if (!err) {
                    // console.log(response.json.results);
                    let res = response.json.results[0];
                    if (res.geometry) {
                        let lat = res.geometry.location.lat;
                        let lng = res.geometry.location.lng;
                        resolve({ lat, lng });
                    }
                }
            } catch (e) {
                console.error(e);
                resolve();
            }
        });
    })
}

async function getContent() {
    return await new Promise((resolve) => {
        JSDOM.fromURL("https://pickleballtournaments.com/pbt_tlisting.pl?when=F", {}).then(dom => {
            resolve(dom.serialize());
        });
    })
}

(async () => {
    let details;
    try {
        console.log("loading, wait...");
        const { document } = new JSDOM(await getContent()).window;

        let tournments = [], tournmentsString = "", tournment = {};
        let table = document.querySelectorAll("table")[1],
            type = 1;
        for (let i = 0; i < table.rows.length; i++) {
            let row = table.rows[i];
            //Si es uno es titulo si es 2 es detalles y linea de division
            if (type === 1) {
                tournment = {};
                tournment.title = row.innerHTML.replace(/<\/?[^>]+(>|$)/g, "");
            } else if (type === 2) {
                //Para obtener las imagenes
                // console.log(row.cells);
                let imgs = [];
                for (let img of row.cells[0].querySelectorAll("img")) {
                    imgs.push(img.src);
                }
                tournment.imgs = imgs;
                // console.log(imgs, row.cells[1].innerHTML.split("<br>"));
                details = row.cells[1].innerHTML.split("<br>");
                for (let ii = 0; ii < details.length; ii++) {
                    details[ii] = details[ii].replace(/<\/?[^>]+(>|$)/g, "").replace("\n", "");
                }
                // console.log(details);
                tournment.address = details[0];
                tournment.dates = details[1];
                if (details[2].split("s:")[1])
                    tournment.registrationStart = details[2].split("s:")[1].replace(" ", "");
                if (details[3].split("e:")[1])
                    tournment.endRegistration = details[3].split("e:")[1].replace(" ", "");
                if (details[4])
                    tournment.finalDeadLine = details[4].split("e:")[1] ? details[4].split("e:")[1].replace(" ", "") : '';
                if (details[5]) {
                    if (details[5].includes("More Info") === false) {
                        tournment.note = details[5];
                    }
                }
                let latLng = await getLatLng(tournment.address);
                if (latLng) {
                    tournment.latLng = latLng;
                }
                tournments.push(tournment);
                tournmentsString += "\n\n" + JSON.stringify(tournment);
            }
            if (type === 3) {
                type = 1;
            } else
                type += 1;
        }

        // fs.writeFileSync("./tournaments.log", tournmentsString, { encoding: "utf-8" });
        // console.log("open file ./tournaments.log");
        await saveTorneos(tournments);
    }
    catch (e) {
        console.error(e, details);
    }
})
    ()


//#region Trabajando con guardar los torneos que no han sido guardados
var db;
let connect = function () {
    mongoose.connect(`mongodb://${local.db.mongo.username}:${local.db.mongo.password}@${local.db.mongo.host}:${local.db.mongo.port}/${local.db.mongo.dbName}`, { useNewUrlParser: true })
    db = mongoose.connection;
    return new Promise(function (resolve, reject) {
        db.on('error', function (err) {
            console.error(err);
            reject(err);
        });

        db.once('open', function () {
            console.log("connect");
            resolve();
        });
    });
}

let isSave = function (title) {
    return new Promise(function (resolve, reject) {
        db.collection("tournaments").find({ title }, function (err, collection) {
            if (err) { return reject(err); }

            collection.toArray(function (err, tournaments) {
                if (err) { return console.error(err); }
                let valid = tournaments.length > 0;
                resolve(valid);
            });
        });
    });
}

let save = function (tour) {
    if (tour.registrationStart)
        tour.registrationStart = moment(tour.registrationStart.toLowerCase(), "MM/DD/YY hh:mm:a").toISOString();
    if (tour.endRegistration)
        tour.endRegistration = moment(tour.endRegistration.toLowerCase(), "ddd MM/DD/YY").toISOString();
    if (tour.latLng)
        tour.coordinates = [tour.latLng.lng, tour.latLng.lat];
    return new Promise(function (resolve, reject) {
        db.collection("tournaments").insertOne(tour, function (err) {
            if (err) { return reject(err); }
            resolve();
        });
    });
}

async function saveTorneos(tournaments) {
    await connect();
    for (let tour of tournaments) {
        if (await isSave(tour.title) === false) {
            await save(tour);
        }
    }
    await db.close();
}