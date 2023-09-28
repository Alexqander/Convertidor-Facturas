const readDir = await fs.readdir(path, (err, files) => {
  if (err) {
    console.error(`Error reading directory ${directoryPath}: ${err}`)
    return
  }
  files.forEach((file) => {
    console.log("entre al foreach")
    console.log(file)

    fs.readFile(`${directoryPath}/${file}`, "utf8", function (err, xml) {
      // Verifica si ocurrió un error al leer el archivo
      if (err) {
        console.error(`Error al leer el archivo ${file}:`, err)
        return
      }

      // Convierte el contenido del archivo XML a JSON
      parser.parseString(xml, function (err, objetojson) {
        // Verifica si ocurrió un error al parsear el XML
        if (err) {
          console.error(`Error al parsear el archivo ${file}:`, err)
          return
        }
        var cfdi = objetojson[["cfdi:Comprobante"]]
        const conceptos = cfdi["cfdi:Conceptos"]
        const productoConceptos = conceptos[0]["cfdi:Concepto"]

        const arrayProductos = []

        productoConceptos.forEach((producto) => {
          arrayProductos.push({ ...producto["$"] })
        })
        // Haz algo con el JSON aquí
        //console.log(productoConceptos)
        return arrayProductos
        console.log(arrayProductos)
        console.log("-----------------archivo terminado-------------------")
      })
    })
  })
})
