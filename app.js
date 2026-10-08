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
} from "./utils.js"

// This library is for matrix multiplication it is GPU-Accelerated. Might look like an overhead. But if the no. of polygons is large, it will be useful.
// import { matrixMultiply } from "https://cdn.jsdelivr.net/npm/matmul-gpu/+esm"

const SURF_COLOR = [200, 200, 200, 1]
const LIGHT_VEC = [0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2]

const canvasEl = document.querySelector("#render-screen")
const ctx = canvasEl.getContext("2d")

const width = canvasEl.width
const height = canvasEl.height

const imageData = ctx.createImageData(width, height)

function normalMap(triangles, vertices) {
	return triangles.map((tri) => {
		const normVec = crossPdt(vertices[tri[0]], vertices[tri[1]])
		const len = vecLen(normVec)

		normVec[0] /= len
		normVec[1] /= len
		normVec[2] /= len

		return normVec
	})
}

function projectTo2D(vertices) {
	return vertices.map((vert) => {
		const z = vert[2] != 0 ? vert[2] : 1
		return [vert[0] / z, vert[1] / z, vert[2]]
	})
}

// Here I'm dividing by 2, otherwise the object will occupy the entire canvas
// let vertices = denormalize(norm_vertices, width / 2, height / 2)
let vertices = norm_vertices
// All the vertices are now in matrix format. So that I can apply transformations
const vertMat = convertToMatrix(vertices)

// Final Stage: Rasterization. Creating polygons and filling pixels
vertices = convertToArr(vertMat)
const normals = normalMap(triangles, vertices)

// Keep it last, otherwise normals would all be perpendicular to the screen surface
vertices = projectTo2D(vertices)

const frameBuffer = new Array(height).fill(new Array(width).fill(0))
const zBuffer = new Array(height).fill(new Array(width).fill(Infinity))

triangles.forEach((triangle, ind) => {
	const v1 = vertices[triangle[0]]
	const v2 = vertices[triangle[1]]
	const v3 = vertices[triangle[2]]

	const maxX = Math.max(v1[0], v2[0], v3[0])
	const minX = Math.min(v1[0], v2[0], v3[0])
	const maxY = Math.max(v1[1], v2[1], v3[1])
	const minY = Math.min(v1[1], v2[1], v3[1])

	const avgZ = (v1[2] + v2[2] + v3[2]) / 3

	for (let i = Math.round(minX); i < Math.round(maxX) - 1; i++) {
		for (let j = Math.round(minY); j < Math.round(maxY) - 1; j++) {
			if (avgZ >= zBuffer[j][i]) continue

			// A vertex P is inside a triangle if the area formed by the triangles PAB, PAC, PBC is equal to the area formed by ABC, otherwise the pt. is outside the triangle. Quite simple and intiutive.
			zBuffer[j][i] = avgZ
			const localVert = [i, j]
			const isInside =
				getArea(v1, v2, v3) ===
				getArea(v1, v2, localVert) +
					getArea(v1, v3, localVert) +
					getArea(v2, v3, localVert)
			console.log(isInside, "intensity")
			if (!isInside) continue

			const intensity = Math.abs(dotPdt(normals[ind], LIGHT_VEC))
			frameBuffer[i][j] = SURF_COLOR
			frameBuffer[i][j][3] = intensity
			console.log(intensity, "intensity")
		}
	}
})

frameBuffer.forEach((row, rowI) => {
	row.forEach((col, colI) => {
		const ind = getIndex([rowI, colI, 1], width)
		imageData.data[ind] = col[0]
		imageData.data[ind + 1] = col[1]
		imageData.data[ind + 2] = col[2]
		imageData.data[ind + 3] = col[3]
	})
})

ctx.putImageData(imageData, 0, 0)
