// Se importan los módulos
const http = require('http')
const axios = require('axios')
const fs = require('fs')

// Se crea la función que consume la url del pokemon
const getPokeDetalles = async (url) => {
    return await axios(url)
}

// Función asíncrona que consume la API, con promesas
const getPokemones = async () => {

    // Retorno de la data consumida con axios a la API
    return new Promise( async (resolve, reject) => {
    const data = await axios('https://pokeapi.co/api/v2/pokemon?limit=150')
    
    const dataPokemones = data.data.results
    
    // Array vacío que guarda las promesas
    const promesaDetalle = []

    // Array vacío que guarda la data final que se consumirá a través del index.html
    const dataConsolidada = []
    
    dataPokemones.forEach(pokemon => {
    
        promesaDetalle.push(getPokeDetalles(pokemon.url))
        
    });

    Promise.all(promesaDetalle).then((dataArray) => {
        dataArray.forEach((data, i) => {
            const img = data.data.sprites.front_default
            const nombre = dataPokemones[i].name
            dataConsolidada.push({nombre, img})
        })
        resolve(dataConsolidada)
    })
    })
}

http.createServer( async (req, res) => {

    // Ruta para consumir el endpoint final
    if(req.url === '/pokemones') {
        const pokemones = await getPokemones()
        res.writeHead(200, {'Content-type': 'application/json'})
        res.write(JSON.stringify(pokemones))
        res.end()
    }

    // Ruta que lee el archivo HTML
    if(req.url === '/') {
        res.writeHead(200, {'Content-type': 'text/html'})
        fs.readFile('index.html', (err, html) => {
            res.end(html)
        })
    }
}).listen(3000, () => console.log('Servidor ON Puerto 3000'))