const xml = require("./metodos")

const directoryPath =
  "C:/Users/servi/OneDrive/SERVIMAHZ/Importaciones/Septiembre2023/Mereti"

console.log("---------------------esta es mi data-----------------------------")

xml.leerxmls(directoryPath).then((data) => {
  console.log(data)
  console.log(typeof data)

  xml.generateExcelFile(data, directoryPath)
})
