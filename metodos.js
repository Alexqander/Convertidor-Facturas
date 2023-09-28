const fs = require("fs")
const util = require("util")
const parseString = require("xml2js").parseString
const Excel = require("exceljs")
const { error } = require("console")

function consolidateData(data) {
  const map = {}

  data.forEach((item) => {
    const key = item.NoIdentificacion

    const keyExists = key === undefined ? true : false

    if (key === undefined) {
      //* Clonamos el objeto para no modificar el original
      map[key] = { ...item, Cantidad: parseFloat(item.Cantidad) }
    }

    if (!map[key]) {
      //* Clonamos el objeto para no modificar el original
      map[key] = { ...item, Cantidad: parseFloat(item.Cantidad) }
    } else {
      //* Sumamos las cantidades
      map[key].Cantidad += parseFloat(item.Cantidad)
    }
  })

  //* Convertimos el mapa a una matriz de valores
  return Object.values(map)
}

const leerxmls = async (path) => {
  const readdir = util.promisify(fs.readdir)
  const readFile = util.promisify(fs.readFile)
  try {
    const filenames = await readdir(path)
    const arrayProductos = []
    for (const filename of filenames) {
      if (filename.endsWith(".xml") || filename.endsWith(".XML")) {
        const xmlfile = await readFile(`${path}/${filename}`, "utf8")
        parseString(xmlfile, function (err, objetojson) {
          // ? Verifica si ocurrió un error al parsear el XML
          if (err) {
            console.error(`Error al parsear el archivo ${file}:`, err)
            return error
          }
          var cfdi = objetojson[["cfdi:Comprobante"]]
          const conceptos = cfdi["cfdi:Conceptos"]
          const emisor = cfdi["cfdi:Emisor"]
          const fecha = cfdi["$"]["Fecha"]
          const nombreEmisor = emisor[0]["$"]["Nombre"]

          const productoConceptos = conceptos[0]["cfdi:Concepto"]
          productoConceptos.forEach((producto) => {
            arrayProductos.push({
              ...producto["$"],
              Provedor: nombreEmisor,
              Fecha: fecha
            })
          })
          // ? Haz algo con el JSON aquí
        })
      }
    }
    return consolidateData(arrayProductos)
  } catch (error) {
    return error.message
  }
}

const generateExcelFile = async (productos, directoryPath) => {
  if (!Array.isArray(productos)) {
    console.error("productos:s debe ser un array")
    return
  }
  const generateFileName = (directory) => {
    const filename = directory.slice(34)
    const cleanedFilename = filename.replace(/\//g, "")
    return `${cleanedFilename}.xlsx`
  }
  const generateNameWorksheet = (filename) => {
    const name = filename.slice(8, -5)
    return name
  }
  const filename = generateFileName(directoryPath)
  const workbook = new Excel.Workbook()
  const nameWorksheet = generateNameWorksheet(filename)
  const worksheet = workbook.addWorksheet(nameWorksheet)
  const filepath = `C:/Users/servi/OneDrive/SERVIMAHZ/PEDIDOS/Agosto2023/EXCEL/${filename}`

  const columns = [
    { header: "ClaveSat", key: "ClaveProdServ", width: 20 },
    { header: "ClaveProducto", key: "NoIdentificacion", width: 20 },
    { header: "Cantidad", key: "Cantidad", width: 10 },
    { header: "Clave U", key: "ClaveUnidad", width: 10 },
    { header: "Unidad", key: "Unidad", width: 10 },
    { header: "Descripcion", key: "Descripcion", width: 80 },
    { header: "Precio U", key: "ValorUnitario", width: 20 },
    { header: "Importe", key: "Importe", width: 20 },
    { header: "Precio C/IVA", key: "PrecioConIVA", width: 20 },
    { header: "PrecioConGanancia", key: "PrecioConGanancia", width: 20 },
    { header: "Provedor", key: "Provedor", width: 40 },
    { header: "FechaEmision", key: "Fecha", width: 50 }
  ]
  // Agregar la fila de cabecera con estilo
  const headerRow = worksheet.addRow(columns.map((col) => col.header))
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0070C0" } // Relleno azul
    }
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" } // Texto blanco
    }
  })
  // Agregar los datos
  productos.forEach((product) => {
    const precioConIVA = product.ValorUnitario * 1.16
    const precioConGanancia = product.ValorUnitario * 1.3
    product.PrecioConIVA = precioConIVA
    product.PrecioConGanancia = precioConGanancia
    worksheet.addRow(product)
  })

  // Agregar la tabla
  const table = worksheet.addTable({
    name: "Productos",
    ref: "A1",
    headerRow: true,
    columns: columns.map((col) => ({
      name: col.header,
      filterButton: true
    })),
    rows: productos.map((product) => columns.map((col) => product[col.key])),
    style: {
      theme: "TableStyleMedium9",
      showRowStripes: true
    }
  })

  // * Establecer el ancho de las columnas
  columns.forEach((col, index) => {
    const column = worksheet.getColumn(index + 1)
    column.width = col.width
  })

  await workbook.xlsx.writeFile(filepath)
  console.log(`Archivo generado con éxito en ${filepath}!`)
}

module.exports = { leerxmls, generateExcelFile }
