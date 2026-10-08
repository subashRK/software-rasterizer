import { vertices as norm_vertices, triangles } from "./models/cylinder.js"
// This library is for matrix multiplication it is GPU-Accelerated. Might look like an overhead. But if the no. of polygons is large, it will be useful.
import { matrixMultiply } from "https://cdn.jsdelivr.net/npm/matmul-gpu/+esm"

const SURF_COLOR = [200, 200, 200, 1]

const canvasEl = document.querySelector("#render-screen")
const ctx = canvasEl.getContext("2d")

const width = canvasEl.width
const height = canvasEl.height

const imageData = ctx.createImageData(width, height)

function getIndex([x, y, _], width) {
	return y * width * 4 + x * 4 // 4 because 4 channels per pixel
}

function denormalize(vertices, w, h) {
	// This function can be used if your wireframe co-ords are normalized. In my case it is true.
	return vertices.map((vert) => [
		Math.round(vert[0] * w),
		Math.round(vert[1] * h),
		vert[2],
	])
}

function convertToMatrix(vertices) {
	const matrix = [[], [], []]
	vertices.forEach((vert) => {
		matrix[0].push(vert[0])
		matrix[1].push(vert[1])
		matrix[2].push(vert[2])
	})
	return matrix
}

// Here I'm dividing by 2, otherwise the object will occupy the entire canvas
const vertices = denormalize(norm_vertices, width / 2, height / 2)
// All the vertices are now in matrix format. So that I can apply transformations
const vertMat = convertToMatrix(vertices)

// Final Stage: Rasterization. Creating polygons and filling pixels
const polygons = []

vertices.forEach((vertex) => {
	const ind = getIndex(vertex, width)
	imageData.data[ind + 0] = SURF_COLOR[0]
	imageData.data[ind + 1] = SURF_COLOR[1]
	imageData.data[ind + 2] = SURF_COLOR[2]
	imageData.data[ind + 3] = SURF_COLOR[3]
})

ctx.putImageData(imageData, 0, 0)
