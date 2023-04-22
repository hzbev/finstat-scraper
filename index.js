var axios = require('axios');
var HTMLParser = require('node-html-parser');
var fs = require('fs');
const he = require('he');

let AllData = JSON.parse(fs.readFileSync("data.json", "utf-8"))


async function parse(page) {
    let { data } = await axios.get(`https://finstat.sk/databaza-firiem-organizacii?page=${page}`)
    var root = HTMLParser.parse(data);

    let parsed = root.querySelector("#screener-table > tbody").querySelectorAll("tr")
    for (let i of parsed) {
        let ico = i.querySelectorAll(".clr-gray")[1].innerText,
            name = he.decode(i.querySelector(".truncate.openwindow").innerText.trim()),
            vznik = i.querySelector(".small.nowrap.text-right").innerText.trim()
        AllData[ico] = {
            name: name,
            ico: ico,
            vznik: vznik
        }
    }
    fs.writeFileSync("data.json", JSON.stringify(AllData))
    console.log(`parsed ${page}`)
    return true;
}

async function start() {
    let promises = [];
    for (let i = 17259; i < 27946; i += 10) {
        const pagePromises = [];
        for (let j = i; j < i + 10; j++) {
            pagePromises.push(parse(j));
        }
        const result = await Promise.all(pagePromises);
        promises.push(...result);
    }
    await Promise.all(promises);
}
start()