export function crossPdt(v1, v2) {
	const normVec = [
		v1[1] * v2[2] - v2[1] * v1[2],
		v2[0] * v1[2] - v1[0] * v2[2],
		v1[0] * v2[1] - v2[0] * v1[1],
	]

	return normVec
}

export function dotPdt(v1, v2) {
	return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]
}

export function getIndex([x, y, _], width) {
	return y * width * 4 + x * 4 // 4 because 4 channels per pixel
}

// For Normalize and denormalize functions
const SCALING_FAC = 1 // for the models i have use 30 for sphere and 1 for cylinder

export function denormalize(vertices, w, h) {
	// This function can be used if your wireframe co-ords are normalized. In my case it is true.
	// Here both x,y and z cords are normalized from -1 to 1. Change this fn. as per your choice of cordinates.
	// I am converting this into the co-ords that fits my html canvas

	return vertices.map((vert) => {
		// This distorts the model so i am going to multiply by a common scaling factor.
		// Here I am mult by w/2 since i don't want the last pts to be at the edge of the canvas. Again change it as per your wish.
		// 	const x = (vert[0] / 2) * (w / 2) + w / 2
		// 	const y = (vert[1] / 2) * (h / 2) + h / 2
		// 	const z = vert[2] + 2
		const x = vert[0] * SCALING_FAC + w / 2
		const y = vert[1] * SCALING_FAC + h / 2
		const z = vert[2]
		console.log(x, y, z)

		return [Math.floor(x), Math.floor(y), z]
	})
}

export function convertToMatrix(vertices) {
	const matrix = [[], [], []]
	vertices.forEach((vert) => {
		matrix[0].push(vert[0])
		matrix[1].push(vert[1])
		matrix[2].push(vert[2])
	})
	return matrix
}

export function convertToArr(mat) {
	const vertices = []

	for (let i = 0; i < mat[0].length; i++) {
		vertices.push([mat[0][i], mat[1][i], mat[2][i]])
	}

	return vertices
}

export function vecLen(v) {
	return Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)
}

export function getArea(v1, v2, v3) {
	return (
		0.5 *
		Math.abs(
			v1[0] * (v2[1] - v3[1]) +
				v2[0] * (v3[1] - v1[1]) +
				v3[0] * (v1[1] - v2[1]),
		)
	)
}

export function matrixMultiply(m1, m2) {
	const res = Array.from({ length: m1.length }, () =>
		Array(m2[0].length).fill(0),
	)

	for (let i = 0; i < m1.length; i++) {
		for (let j = 0; j < m2[0].length; j++) {
			res[i][j] = 0
			for (let k = 0; k < m1[0].length; k++) {
				res[i][j] += m1[i][k] * m2[k][j]
			}
		}
	}

	return res
}
