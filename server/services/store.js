import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createSeedStore } from "../data/seed.js"

const directory = path.dirname(fileURLToPath(import.meta.url))
const defaultPath = path.resolve(directory, "../data/store.json")
const storePath = process.env.BHARAT_EVOTE_DATA_PATH || defaultPath

export const readStore = () => {
  if (!fs.existsSync(storePath)) {
    fs.mkdirSync(path.dirname(storePath), { recursive: true })
    fs.writeFileSync(storePath, JSON.stringify(createSeedStore(), null, 2))
  }
  return JSON.parse(fs.readFileSync(storePath, "utf8"))
}

export const writeStore = (store) => {
  const temporaryPath = `${storePath}.tmp`
  fs.writeFileSync(temporaryPath, JSON.stringify(store, null, 2))
  fs.renameSync(temporaryPath, storePath)
}
