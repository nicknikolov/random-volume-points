const boundingBox = require('pex-geom/AABB')
const vec3 = require('pex-math/Vec3')
const intersection = require('ray-geom-intersections')
const assert = require('assert')
const triangulate = require('geom-triangulate')

// give me a geometry and i'll fill it in with random points
module.exports = function (vertices, faces, numPoints) {
  numPoints = numPoints || 500
  assert.ok(Array.isArray(vertices), 'volume-points: vertices should be an array')
  assert.ok(Array.isArray(faces), 'volume-points: faces should be an array')

  // wrap the geometry in a bounding box
  let bbox = boundingBox.fromPoints(vertices)
  let xMulti = -bbox[0][0] + bbox[1][0]
  let yMulti = -bbox[0][1] + bbox[1][1]
  let zMulti = -bbox[0][2] + bbox[1][2]

  let pointsCounter = 0
  let generatedPoints = []

  // iterate this loop until we have the desired amount of points
  for (let i = 0; ; i++) {
    if (pointsCounter >= numPoints) break

    let boxFace = (Math.floor(Math.random() * 6) + 1)

    let topX = (Math.random() - 0.5) * xMulti
    let bottomX = (Math.random() - 0.5) * xMulti
    let topY = bbox[1][1]
    let topZ = (Math.random() - 0.5) * zMulti
    let bottomZ = (Math.random() - 0.5) * zMulti
    let bottomY = bbox[0][1]

    let leftX = bbox[0][0]
    let leftY = (Math.random() - 0.5) * yMulti
    let rightY = (Math.random() - 0.5) * yMulti
    let leftZ = (Math.random() - 0.5) * zMulti
    let rightZ = (Math.random() - 0.5) * zMulti
    let rightX = bbox[1][0]

    let backX = (Math.random() - 0.5) * xMulti
    let frontX = (Math.random() - 0.5) * xMulti
    let backY = (Math.random() - 0.5) * yMulti
    let frontY = (Math.random() - 0.5) * yMulti
    let backZ = bbox[0][2]
    let frontZ = bbox[1][2]

    let A = []
    let B = []

    // randomly choose direction for ray (from face A to face B)
    switch (boxFace) {
      case 1:
        A = [leftX, leftY, leftZ]
        B = [rightX, rightY, rightZ]
        break

      case 2:
        A = [rightX, rightY, rightZ]
        B = [leftX, leftY, leftZ]
        break

      case 3:
        A = [topX, topY, topZ]
        B = [bottomX, bottomY, bottomY]
        break

      case 4:
        A = [bottomX, bottomY, bottomZ]
        B = [topX, topY, topZ]
        break

      case 5:
        A = [backX, backY, backZ]
        B = [frontX, frontY, frontZ]
        break

      case 6:
        A = [frontX, frontY, frontZ]
        B = [backX, backY, backZ]
        break

      default:
        break
    }

    let rayOrigin = vec3.copy(A)
    let rayDirection = vec3.normalize(vec3.sub(vec3.copy(B), A))

    let triangulatedGeom = triangulate(faces)
    let intersectionPoints = intersection([], rayOrigin, rayDirection, vertices, triangulatedGeom)

    if (intersectionPoints.length < 2) continue
    // make a point somewhere between the fist 2 intersection points
    let pointA = intersectionPoints[0]
    let pointB = intersectionPoints[1]
    let direction = vec3.sub(vec3.copy(pointB), pointA)

    let distanceTravelled = vec3.distance(intersectionPoints[0], intersectionPoints[1])
    let density = 5 // num points per meter
    let numPointsToGenerate = Math.floor(distanceTravelled * density) // round it up so we always get at least one point

    for (let j = 0; j < numPointsToGenerate; j++) {
      let randomPoint = vec3.add(vec3.scale(vec3.copy(direction), Math.random()), pointA)
      pointsCounter++
      generatedPoints.push(randomPoint)
    }
  }

  return generatedPoints
}

