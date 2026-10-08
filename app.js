import { vertices, edges } from "./models/cylinder.js"

const canvasEl = document.querySelector("#render-screen")
const ctx = canvasEl.getContext("2d")

const width = canvasEl.width
const height = canvasEl.height

const imageData = ctx.createImageData(width, height)
const pixels = imageData.data

console.log(pixels)
