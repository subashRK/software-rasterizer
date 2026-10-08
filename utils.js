export function crossPdt(v1, v2) {
	const normVec = [
		v1[1] * v2[2] - v2[1] * v1[2],
		v2[0] * v1[2] - v1[0] * v2[2],
		v1[0] * v2[1] - v2[0] * v1[0],
	]

	return normVec
}

export function dotPdt(v1, v2) {
	return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]
}

export function getIndex([x, y, _], width) {
	return y * width * 4 + x * 4 // 4 because 4 channels per pixel
}

export function denormalize(vertices, w, h) {
	// This function can be used if your wireframe co-ords are normalized. In my case it is true.
	return vertices.map((vert) => [
		Math.round(vert[0] * w),
		Math.round(vert[1] * h),
		vert[2],
	])
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
