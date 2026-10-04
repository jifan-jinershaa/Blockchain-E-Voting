import path from "node:path"
import { fileURLToPath } from "node:url"
import express from "express"
import { app } from "./app.js"

const directory = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT || 3000)
const dist = path.resolve(directory, "../dist")

app.use(express.static(dist))
app.get("/{*splat}", (_request, response) =>
  response.sendFile(path.join(dist, "index.html")),
)

app.listen(port, () => {
  console.log(`BHARAT E-VOTE prototype running on http://localhost:${port}`)
})
