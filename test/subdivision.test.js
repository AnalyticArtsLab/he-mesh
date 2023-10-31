import {
  calcEvenPositions,
  calcOddPositions,
  subdivideSurface,
  loopSubdivision
} from "../src/subdivision";
import {
  findEdgeBetweenVertices,
  findEdgeIndexBetweenVertices,
  checkEdgeConsistency,
  checkFaceConsistency,
  findFaceFromVertices,
} from "./utils";
import { HEMesh } from "../src/he-mesh";
import { square, grid, cube } from "./meshes";


describe("calcEvenPositions tests", () => {
  let mesh;
  let points;
  beforeAll(() => {
    mesh = new HEMesh(grid.points, grid.faces);
    points = calcEvenPositions(mesh);
  });

  test("calcEvenPositions returns the correct number of points", () => {
    expect(points.length).toBe(grid.points.length);
  });

  test("Check weight of central points", () => {
    const beta = 3 / (8 * 6);

    const expected = grid.points[6].scale(1 - beta * 6);
    expected.addInPlace(grid.points[1].scale(beta));
    expected.addInPlace(grid.points[2].scale(beta));
    expected.addInPlace(grid.points[5].scale(beta));
    expected.addInPlace(grid.points[7].scale(beta));
    expected.addInPlace(grid.points[10].scale(beta));
    expected.addInPlace(grid.points[11].scale(beta));

    expect(points[6]).toEqual(expected);
  });

  test("Check weight of edge points", () => {
    const expected = grid.points[1].scale(3 / 4);
    expected.addInPlace(grid.points[0].scale(1 / 8));
    expected.addInPlace(grid.points[2].scale(1 / 8));
    expect(points[1]).toEqual(expected);
  });

  test("Check weight of corner points", () => {
    let expected = grid.points[0].scale(3 / 4);
    expected.addInPlace(grid.points[1].scale(1 / 8));
    expected.addInPlace(grid.points[5].scale(1 / 8));
    expect(points[0]).toEqual(expected);

    expected = grid.points[4].scale(3 / 4);
    expected.addInPlace(grid.points[3].scale(1 / 8));
    expected.addInPlace(grid.points[9].scale(1 / 8));
    expect(points[4]).toEqual(expected);
  });
});


/** 
 * Added because box corners are not moving correctly
 */
describe("calcEvenPositions [cube] tests", () => {
  let mesh;
  let points;
  beforeAll(() => {
    mesh = new HEMesh(cube.points, cube.faces);
    points = calcEvenPositions(mesh);
  });

  test("Calculate 4 neighbor corner", () => {
    const beta = 3 / (8 * 4);

    const expected = cube.points[1].scale(1 - beta * 4);
    expected.addInPlace(cube.points[0].scale(beta));
    expected.addInPlace(cube.points[3].scale(beta));
    expected.addInPlace(cube.points[5].scale(beta));
    expected.addInPlace(cube.points[7].scale(beta));

    expect(points[1]).toEqual(expected);
  });

  test("Calculate 5 neighbor corner", () => {
    const beta = 3 / (8 * 5);

    const expected = cube.points[0].scale(1 - beta * 4);
    expected.addInPlace(cube.points[1].scale(beta));
    expected.addInPlace(cube.points[2].scale(beta));
    expected.addInPlace(cube.points[3].scale(beta));
    expected.addInPlace(cube.points[4].scale(beta));
    expected.addInPlace(cube.points[5].scale(beta));

    expect(points[0]).toEqual(expected);
  });
});


describe("calcOddPositions tests", () => {
  // Us a cube grid so the opposing points affect the point position
  test("Check weight of central points", () => {
    const mesh = new HEMesh(cube.points, cube.faces);
    const points = calcOddPositions(mesh);

    // find edge 7-12 in the middle of the grid
    const edgeIndex = findEdgeIndexBetweenVertices(mesh, 2, 3);

    const expected = cube.points[2].scale(3 / 8);
    expected.addInPlace(cube.points[3].scale(3 / 8));
    expected.addInPlace(cube.points[7].scale(1 / 8));
    expected.addInPlace(cube.points[0].scale(1 / 8));

    expect(points[edgeIndex]).toEqual(expected);
  });

  test("Check weight of edge points", () => {
    const mesh = new HEMesh(grid.points, grid.faces);
    const points = calcOddPositions(mesh);

    // find edge 1-2 on the boundary
    const edgeIndex = findEdgeIndexBetweenVertices(mesh, 7, 12);

    const expected = grid.points[7].scale(1 / 2);
    expected.addInPlace(grid.points[12].scale(1 / 2));
    expect(points[edgeIndex]).toEqual(expected);
  });
});

describe("subdivideSurface tests", () => {
  let mesh;
  let v02, v13, v01, v12, v03;
  beforeAll(() => {
    mesh = new HEMesh(square.points, square.faces);
    subdivideSurface(mesh);

    v02 = mesh.vertices.findIndex(
      (v) => v === mesh.vertices[0].findConnectingVertex(mesh.vertices[2])
    );
    v13 = mesh.vertices.findIndex(
      (v) => v === mesh.vertices[1].findConnectingVertex(mesh.vertices[3])
    );
    v01 = mesh.vertices.findIndex(
      (v) => v === mesh.vertices[0].findConnectingVertex(mesh.vertices[1])
    );
    v12 = mesh.vertices.findIndex(
      (v) => v === mesh.vertices[1].findConnectingVertex(mesh.vertices[2])
    );
    v03 = mesh.vertices.findIndex(
      (v) => v === mesh.vertices[0].findConnectingVertex(mesh.vertices[3])
    );
  });

  test("Mesh has the correct number of structural elements", () => {
    expect(mesh.vertices.length).toBe(9);
    expect(mesh.faces.length).toBe(8);
    expect(mesh.edges.length).toBe(16);
    expect(mesh.halfEdges.length).toBe(24);
  });

  test("vertices have been added to all edges", () => {
    expect(findEdgeBetweenVertices(mesh, 0, 1)).not.toBeDefined();
    expect(findEdgeBetweenVertices(mesh, 0, 2)).not.toBeDefined();
    expect(findEdgeBetweenVertices(mesh, 0, 3)).not.toBeDefined();
    expect(findEdgeBetweenVertices(mesh, 1, 2)).not.toBeDefined();
    expect(findEdgeBetweenVertices(mesh, 2, 3)).not.toBeDefined();

    expect(v02).not.toBe(-1);
    expect(v13).not.toBe(-1);
    expect(v01).not.toBe(-1);
    expect(v12).not.toBe(-1);
    expect(v03).not.toBe(-1);
  });

  test("The appropriate edges have been made", () => {
    const edgePairs = [
      [0, v02],
      [v02, 2],
      [2, v12],
      [v12, 1],
      [1, v13],
      [v13, 3],
      [3, v03],
      [v03, 0],
      [v01, v03],
      [v01, v12],
      [v01, v13],
      [v01, v03],
      [v01, 0],
      [v01, 1],
      [v02, v12],
      [v03, v13],
    ];

    edgePairs.forEach((pair) => {
      const edge = findEdgeBetweenVertices(mesh, pair[0], pair[1]);
      expect(edge).toBeDefined();
      checkEdgeConsistency(edge);
    });
  });

  test("The appropriate faces have been created", () => {
    mesh.faces.forEach(checkFaceConsistency);

    const faceVertices = [
      [0, v01, v02],
      [0, v03, v01],
      [v02, v12, 2],
      [v02, v01, v12],
      [v03, v13, v01],
      [v03, 3, v13],
      [v01, 1, v12],
      [v01, v13, 1],
    ];

    faceVertices.forEach((vertices) => {
      const face = findFaceFromVertices(mesh, vertices);
      expect(face).toBeDefined();
      checkFaceConsistency(face);
    });
  });
  test("Subdivision leaves vertices with valid half edge connections", ()=>{
    mesh.vertices.forEach((v)=>{
      expect(v.halfEdge).toBeDefined();
      expect(Object.is(v.halfEdge.vertex,v)).toBeTruthy();
   
    });
  });
});

describe("subdivideMesh tests", () => {
  let mesh;
  let v02, v13, v01, v12, v03;
  beforeAll(() => {
    mesh = new HEMesh(square.points, square.faces);
    loopSubdivision(mesh);

    v02 = mesh.vertices.findIndex(
      (v) => v === mesh.vertices[0].findConnectingVertex(mesh.vertices[2])
    );
    v13 = mesh.vertices.findIndex(
      (v) => v === mesh.vertices[1].findConnectingVertex(mesh.vertices[3])
    );
    v01 = mesh.vertices.findIndex(
      (v) => v === mesh.vertices[0].findConnectingVertex(mesh.vertices[1])
    );
    v12 = mesh.vertices.findIndex(
      (v) => v === mesh.vertices[1].findConnectingVertex(mesh.vertices[2])
    );
    v03 = mesh.vertices.findIndex(
      (v) => v === mesh.vertices[0].findConnectingVertex(mesh.vertices[3])
    );
  });


  test("Mesh has the correct number of structural elements", () => {
    expect(mesh.vertices.length).toBe(9);
    expect(mesh.faces.length).toBe(8);
    expect(mesh.edges.length).toBe(16);
    expect(mesh.halfEdges.length).toBe(24);
  });

  test("vertices have been added to all edges", () => {
    expect(findEdgeBetweenVertices(mesh, 0, 1)).not.toBeDefined();
    expect(findEdgeBetweenVertices(mesh, 0, 2)).not.toBeDefined();
    expect(findEdgeBetweenVertices(mesh, 0, 3)).not.toBeDefined();
    expect(findEdgeBetweenVertices(mesh, 1, 2)).not.toBeDefined();
    expect(findEdgeBetweenVertices(mesh, 2, 3)).not.toBeDefined();

    expect(v02).not.toBe(-1);
    expect(v13).not.toBe(-1);
    expect(v01).not.toBe(-1);
    expect(v12).not.toBe(-1);
    expect(v03).not.toBe(-1);
  });

  test("The appropriate edges have been made", () => {
    const edgePairs = [
      [0, v02],
      [v02, 2],
      [2, v12],
      [v12, 1],
      [1, v13],
      [v13, 3],
      [3, v03],
      [v03, 0],
      [v01, v03],
      [v01, v12],
      [v01, v13],
      [v01, v03],
      [v01, 0],
      [v01, 1],
      [v02, v12],
      [v03, v13],
    ];

    edgePairs.forEach((pair) => {
      const edge = findEdgeBetweenVertices(mesh, pair[0], pair[1]);
      expect(edge).toBeDefined();
      checkEdgeConsistency(edge);
    });
  });

  test("The appropriate faces have been created", () => {
    mesh.faces.forEach(checkFaceConsistency);

    const faceVertices = [
      [0, v01, v02],
      [0, v03, v01],
      [v02, v12, 2],
      [v02, v01, v12],
      [v03, v13, v01],
      [v03, 3, v13],
      [v01, 1, v12],
      [v01, v13, 1],
    ];

    faceVertices.forEach((vertices) => {
      const face = findFaceFromVertices(mesh, vertices);
      expect(face).toBeDefined();
      checkFaceConsistency(face);
    });
  });

  test("The original vertices have been moved to the correct positions", () => {
    const v0Expected = square.points[0].scale(3 / 4);
    v0Expected.addInPlace(square.points[2].scale(1 / 8));
    v0Expected.addInPlace(square.points[3].scale(1 / 8));
    expect(mesh.vertices[0].position).toEqual(v0Expected);

    const v1Expected = square.points[1].scale(3 / 4);
    v1Expected.addInPlace(square.points[2].scale(1 / 8));
    v1Expected.addInPlace(square.points[3].scale(1 / 8));
    expect(mesh.vertices[1].position).toEqual(v1Expected);

    const v2Expected = square.points[2].scale(3 / 4);
    v2Expected.addInPlace(square.points[1].scale(1 / 8));
    v2Expected.addInPlace(square.points[0].scale(1 / 8));
    expect(mesh.vertices[2].position).toEqual(v2Expected);

    const v3Expected = square.points[3].scale(3 / 4);
    v3Expected.addInPlace(square.points[1].scale(1 / 8));
    v3Expected.addInPlace(square.points[0].scale(1 / 8));
    expect(mesh.vertices[3].position).toEqual(v3Expected);

  });

  test("The new border vertices have been moved to the right position", () => {
    const vertexSets = [
      [0, v02, 2],
      [2, v12, 1],
      [1, v13, 3],
      [3, v03, 0],
    ];

    vertexSets.forEach((vertices) => {
      const vertex = mesh.vertices[vertices[1]];

      const expected = square.points[vertices[0]].add(square.points[vertices[2]]);
      expected.scaleInPlace(1 / 2);
      expected.scaleInPlace(3 / 4);
      expected.addInPlace(square.points[vertices[0]].scale(1 / 8));
      expected.addInPlace(square.points[vertices[2]].scale(1 / 8));
      expect(vertex.position).toEqual(expected);
    });


  });


  test("The new center vertex has the right position", () => {
    const vertex = mesh.vertices[v01];

    const expected = square.points[0].add(square.points[1]);
    expected.scaleInPlace(3/8);
    expected.addInPlace(square.points[2].scale(1/8));
    expected.addInPlace(square.points[3].scale(1/8));

    expect(vertex.position).toEqual(expected);
  });




});



describe("Finding broken hale edge problem", () => {
  let mesh;

  beforeAll(() => {
    mesh = new HEMesh(cube.points, cube.faces);
    
  });

  test("Subdividing leaves vertices with valid half edge connections", ()=>{
    loopSubdivision(mesh);
    mesh.vertices.forEach((v)=>{
      expect(v.halfEdge).toBeDefined();
      expect(Object.is(v.halfEdge.vertex,v)).toBeTruthy();
   
    });

    mesh.edges.forEach((edge) => {

      const [v0, v1] = edge.ends();
      const { vertex, edge34, edge24 } = edge.split();
      expect(Object.is(vertex.halfEdge.vertex,vertex)).toBeTruthy();

      expect(Object.is(v0.halfEdge.vertex,v0)).toBeTruthy();
      expect(Object.is(v1.halfEdge.vertex,v1)).toBeTruthy();

      const ends34 = edge34.ends();
      ends34.forEach((v)=>{
        expect(Object.is(v.halfEdge.vertex,v)).toBeTruthy();
      });

      const ends24 = edge24.ends();
      ends24.forEach((v)=>{
        expect(Object.is(v.halfEdge.vertex,v)).toBeTruthy();
      });


      
    });


    mesh.vertices.forEach((v)=>{
      expect(v.halfEdge).toBeDefined();
      expect(Object.is(v.halfEdge.vertex,v)).toBeTruthy();
   
    });
  });


});
