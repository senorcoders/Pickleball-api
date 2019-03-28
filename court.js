const jsdom = require("jsdom"), fs = require("fs"),
    mongoose = require("mongoose"), moment = require("moment"),
    local = require("./config/local");
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
                        resolve([lng, lat]);
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
        JSDOM.fromURL("https://www.places2play.org/state/alabama", {}).then(dom => {
            resolve(dom.serialize());
        });
    })
}

async function getContentPrincipe(state) {
    return await new Promise((resolve) => {
        JSDOM.fromURL(`https://www.places2play.org/state/${state}`, {}).then(dom => {
            resolve(dom.serialize());
        });
    })
}

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

const init = async () => {
    await connect();
    console.log("haber");
    const { document } = new JSDOM(await getContent()).window;
    let container = document.querySelectorAll("div.container-fluid")[1];
    let rows = container.querySelectorAll("div.row");
    await obteinedCourts("alabama");
    let i=2;
    for (let row of rows) {
        for (let div of row.querySelectorAll("div")) {
            let a = div.querySelector("a");
            if (a !== null) {
                await obteinedCourts(a.href.split("/").pop());
            }
        }
        console.log(i+ " => "+ row.length);
        i += 1;
    }


}
init();

async function obteinedCourts(state) {
    const { document } = new JSDOM(await getContentPrincipe(state)).window;
    let table = document.querySelector("table.table.table-striped");
    try {
        let rows = table.rows, start = false;
        let courts = [];
        for (let row of rows) {
            let court = {};
            if (start === false) {
                start = true;
                continue;
            }
            let tds = row.querySelectorAll("td");
            for (let i = 1; i < tds.length; i++) {
                let td = tds[i];
                court = proccesCourt(i, td, court);
            }
            if (court.address) {
                court.coordinates = await getLatLng(court.address);
            }
            // console.log(court);
            //Agregamos el court
            courts.push(court);
        }
        await save(courts);
    }
    catch (e) {
        console.log("\n\n", table, state);
        console.error(e);
    }
}

function proccesCourt(i, td, court) {
    try {
        if (i === 1) {
            //el segundo td tiene el nombre 
            //y updated
            // console.log(cleanText(td.innerHTML).slice(-10));
            court['updated'] = moment(cleanText(td.innerHTML).slice(-10), "MM/DD/YYYY").toDate().getTime();
            court['name'] = td.querySelector("a").innerHTML;
        }

        if (i === 2) {
            court['address'] = cleanText(td.innerHTML);
        }

        if (i === 3) {
            court['city'] = cleanText(td.innerHTML);
        }

        if (i === 4) {
            //list in and out
            let props = td.innerHTML.split("<b>");
            for (let prop of props) {
                let tsz = prop.split("</b>");
                if (tsz.length > 1) {
                    tsz[0] = tsz[0].replace(":", "");
                    court[cleanText(tsz[0])] = Number(tsz[1]);
                }
            }
        }

        if (i === 5) {
            let txt = td.innerHTML.split("<br>");
            for (let t of txt) {
                //los que tiene <b> and </b>
                //son llaves y valores
                //Para obtener cosa como fees
                let key = t.replace("<b>", "");
                if (key.includes(":</b>") === true) {
                    let keyParser = key.split(":</b>");
                    if (keyParser.length === 2) {
                        court[cleanText(keyParser[0])] = cleanText(keyParser[1]);
                    }
                }
            }
            let as = td.querySelector("div.contact").querySelectorAll("a");
            if (as[0]) {
                court["nameContact"] = cleanText(as[0].innerHTML);
            }
            if (as[1]) {
                court["telephone"] = cleanText(as[1].innerHTML);
            }
        }

        return court;
    } catch (error) {
        console.log(error);
        return court;
    }
}

function cleanText(str) {
    return str.toString().trim().replace(/<\/?[^>]+(>|$)/g, "").replace(/(\r\n|\n|\r|\t|\s\s)/g, "");
}


let save = function (courts) {
    return new Promise(function (resolve, reject) {
        db.collection("courtstate").insertMany(courts, function (err) {
            if (err) { return reject(err); }
            resolve();
        });
    });
}