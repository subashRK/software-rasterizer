import { vertices as norm_vertices, triangles } from "./models/cylinder.js"
import {
	convertToArr,
	convertToMatrix,
	crossPdt,
	denormalize,
	getArea,
	getIndex,
	vecLen,
	dotPdt,
	matrixMultiply,
} from "./utils.js"

// This library is for matrix multiplication it is GPU-Accelerated. Might look like an overhead. But if the no. of polygons is large, it will be useful.

// import { matrixMultiply } from "https://cdn.jsdelivr.net/npm/matmul-gpu/+esm"

const SURF_COLOR = [255, 255, 255, 255]
// const LIGHT_VEC = [0, Math.sqrt(2) / 2, Math.sqrt(2) / 2]
// const LIGHT_VEC = [-Math.SQRT1_2, -Math.SQRT1_2, Math.SQRT1_2]
const LIGHT_VEC = [0, 1, 1]

const canvasEl = document.querySelector("#render-screen")
const ctx = canvasEl.getContext("2d")

const width = canvasEl.width
const height = canvasEl.height

const imageData = ctx.createImageData(width, height)

function normalMap(triangles, vertices) {
	return triangles.map((tri) => {
		const v1 = vertices[tri[0]]
		const v2 = vertices[tri[1]]
		const v3 = vertices[tri[2]]

		const e1 = [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]]
		const e2 = [v1[0] - v3[0], v1[1] - v3[1], v1[2] - v3[2]]

		const normVec = crossPdt(e1, e2)
		const len = vecLen(normVec)

		normVec[0] /= len
		normVec[1] /= len
		normVec[2] /= len

		return normVec
	})
}

function projectTo2D(vertices) {
	return vertices.map((vert) => {
		const z = vert[2]
		return [Math.ceil(vert[0] / z), Math.ceil(vert[1] / z), z]
	})
}

// All the vertices are now in matrix format. So that I can apply transformations
let vertMat = convertToMatrix(norm_vertices)
console.log(vertMat)
vertMat = matrixMultiply(
	[
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1],
	],
	vertMat,
)
console.log(vertMat)
// Final Stage: Rasterization. Creating polygons and filling pixels
let vertices = convertToArr(vertMat)
vertices = projectTo2D(vertices)
const normals = normalMap(triangles, vertices)
vertices = denormalize(vertices, width, height)

const frameBuffer = Array.from({ length: height }, () =>
	Array.from({ length: width }, () => [0, 0, 0, 0]),
)
const zBuffer = Array.from({ length: height }, () =>
	Array.from({ length: width }, () => Infinity),
)

triangles.forEach((triangle, ind) => {
	const v1 = vertices[triangle[0]]
	const v2 = vertices[triangle[1]]
	const v3 = vertices[triangle[2]]

	const maxX = Math.max(v1[0], v2[0], v3[0])
	const minX = Math.min(v1[0], v2[0], v3[0])
	const maxY = Math.max(v1[1], v2[1], v3[1])
	const minY = Math.min(v1[1], v2[1], v3[1])

	const avgZ = (v1[2] + v2[2] + v3[2]) / 3
	const area = getArea(v1, v2, v3)

	for (let i = Math.round(minX); i < Math.floor(maxX) - 1; i++) {
		for (let j = Math.round(minY); j < Math.floor(maxY) - 1; j++) {
			if (i >= width || j >= height || i < 0 || j < 0) continue
			if (avgZ >= zBuffer[j][i]) continue

			// A vertex P is inside a triangle if the area formed by the triangles PAB, PAC, PBC is equal to the area formed by ABC, otherwise the pt. is outside the triangle. Quite simple and intiutive.
			const localVert = [i, j]
			const isInside =
				area ===
				getArea(v1, v2, localVert) +
					getArea(v1, v3, localVert) +
					getArea(v2, v3, localVert)
			if (!isInside) continue

			zBuffer[j][i] = avgZ
			const intensity = Math.abs(dotPdt(normals[ind], LIGHT_VEC))
			frameBuffer[j][i][0] = SURF_COLOR[0]
			frameBuffer[j][i][1] = SURF_COLOR[1]
			frameBuffer[j][i][2] = SURF_COLOR[2]
			frameBuffer[j][i][3] = SURF_COLOR[3] * intensity
		}
	}
})

frameBuffer.forEach((row, rowI) => {
	row.forEach((col, colI) => {
		const ind = getIndex([colI, rowI, 0], width)
		imageData.data[ind] = col[0]
		imageData.data[ind + 1] = col[1]
		imageData.data[ind + 2] = col[2]
		imageData.data[ind + 3] = col[3]
	})
})

ctx.putImageData(imageData, 0, 0)
