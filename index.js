
const express = require('express');
const app = express();
const fs = require('fs');
const csv = require('csv-parser')
const request = require("request");
const results = [];
process.env.PORT = 3001;

async function readingFile() {
    return fs.createReadStream('./files/2018_01_Sites_mobiles_2G_3G_4G_France_metropolitaine_L93.csv', 'utf8').pipe(csv({ separator: ';' }))
        .on('data', (data) => {
            results.push(data);
        })
        .on('end', () => {
        });
}

app.get('/getBestOperator/:q/:postcode', function (req, res) {

    const q = req.params.q.replace(/\s/g, "+");
    var options = {
        uri: 'https://api-adresse.data.gouv.fr/search/?q='+q+'&postcode='+req.params.postcode,
        method: 'GET'
    };

    request(options, function(error, response, body) {

        if (error) {
            return res.status(401).send(error);
        }

        const obj = JSON.parse(body);
        const listOfOperatorForThisAddress = [];

        obj.features.forEach( feature => {
        
            const X = Math.trunc(feature.properties.x);
            const Y = Math.trunc(feature.properties.y);
            
            results.forEach(elem => {
                if (elem.X == X || elem.Y == Y) {
                    switch (elem.Operateur) {
                        case '20801':
                            listOfOperatorForThisAddress.push({"Orange": {"2G": elem['2G'] == 1 ? 'True' : 'False', "3G": elem['3G'] == 1 ? 'True' : 'False', "4G": elem['4G'] == 1 ? 'True' : 'False'}});               
                            break;
                        case '20810':
                            listOfOperatorForThisAddress.push({"SFR": {"2G": elem['2G'] == 1 ? 'True' : 'False', "3G": elem['3G'] == 1 ? 'True' : 'False',"4G": elem['4G'] == 1 ? 'True' : 'False'}});
                            break;
                        case '20815':
                            listOfOperatorForThisAddress.push({"Free": {"2G": elem['2G'] == 1 ? 'True' : 'False', "3G": elem['3G'] == 1 ? 'True' : 'False',"4G": elem['4G'] == 1 ? 'True' : 'False'}});
                            break;
                        case '20820':
                            listOfOperatorForThisAddress.push({"Bouygue": {"2G": elem['2G'] == 1 ? 'True' : 'False', "3G": elem['3G'] == 1 ? 'True' : 'False',"4G": elem['4G'] == 1 ? 'True' : 'False'}});
                        break;
                    }
                }
            });
        });
        return res.status(200).json(listOfOperatorForThisAddress);
    });
    
});

app.get('/', function (req, res) {
  res.send('Hello World!');
})

async function startingServer() {
    app.listen(3001, async () => {
        console.log('Papernest app is now using port: '+process.env.PORT+' !');
    })
}

async function starting() {
    console.log('Loading ... ');
    await readingFile();
    await startingServer();
}
starting();
