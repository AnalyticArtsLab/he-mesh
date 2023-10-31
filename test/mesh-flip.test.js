import { HEMesh } from "../src/he-mesh";
import {
  checkVerticesOfFace,
  checkFaceConsistency,
  checkEdgeConsistency,
  findEdgeBetweenVertices,
} from "./utils";
import { square, tee } from "./meshes";

describe("Flip function tests", () => {
  let mesh;

  describe("Flipping a simple square", () => {
    beforeEach(() => {
      mesh = new HEMesh(square.points, square.faces);
      const edge01 = findEdgeBetweenVertices(mesh, 0, 1);
      edge01.flip();
    });

    test("flipping an edge removes the old diagonal and adds a new one", () => {
      // diagonal which shouldn't have an edge
      const edge01 = findEdgeBetweenVertices(mesh, 0, 1);
      expect(edge01).not.toBeDefined();

      const edge23 = findEdgeBetweenVertices(mesh, 2, 3);

      expect(edge23).toBeDefined();
      expect(edge23.halfEdge).toBeDefined();
      expect(edge23.halfEdge.twin).toBeDefined();
    });

    test("flipping an edge leaves the edge consistent", () => {
      const edge23 = findEdgeBetweenVertices(mesh, 2, 3);
      checkEdgeConsistency(edge23);
    });

    test("flipping an edge connects the half edges correctly", () => {
      const edge23 = findEdgeBetweenVertices(mesh, 2, 3);
      const halfEdge = edge23.halfEdge;

      expect(Object.is(halfEdge.vertex, mesh.vertices[2])).toBeTruthy();
      expect(Object.is(halfEdge.next.vertex, mesh.vertices[3])).toBeTruthy();
      expect(Object.is(halfEdge.next.next.vertex, mesh.vertices[1])).toBeTruthy();

      const twin = halfEdge.twin;
      expect(Object.is(twin.vertex, mesh.vertices[3])).toBeTruthy();
      expect(Object.is(twin.next.vertex, mesh.vertices[2])).toBeTruthy();
      expect(Object.is(twin.next.next.vertex, mesh.vertices[0])).toBeTruthy();

      expect(Object.is(halfEdge.edge, edge23)).toBeTruthy();
      expect(Object.is(twin.edge, edge23)).toBeTruthy();
    });

    test("flipping an edge connects the faces correctly", () => {
      const edge23 = findEdgeBetweenVertices(mesh, 2, 3);
      const halfEdge = edge23.halfEdge;
      expect(Object.is(halfEdge.face, mesh.faces[0])).toBeTruthy();
      expect(Object.is(halfEdge, mesh.faces[0].halfEdge)).toBeTruthy();
      checkFaceConsistency(mesh.faces[0]);

      const twin = halfEdge.twin;
      expect(Object.is(twin.face, mesh.faces[1])).toBeTruthy();
      expect(Object.is(twin, mesh.faces[1].halfEdge)).toBeTruthy();
      checkFaceConsistency(mesh.faces[1]);
    });

    test("Confirm that the faces have the correct vertices", () => {
      const edge23 = findEdgeBetweenVertices(mesh, 2, 3);
      const halfEdge = edge23.halfEdge;

      let expectedVertices = [mesh.vertices[2], mesh.vertices[3], mesh.vertices[1]];
      let foundVertices = halfEdge.face.getVertices();
      checkVerticesOfFace(expectedVertices, foundVertices);

      expectedVertices = [mesh.vertices[2], mesh.vertices[0], mesh.vertices[3]];
      foundVertices = halfEdge.twin.face.getVertices();
      checkVerticesOfFace(expectedVertices, foundVertices);
    });

    test("Flipping an edge leaves vertices with valid half edge connections", ()=>{
      mesh.vertices.forEach((v)=>{
        expect(v.halfEdge).toBeDefined();
        expect(Object.is(v.halfEdge.vertex,v)).toBeTruthy();
     
      });
    });
  });

  describe("Flipping edges in a Tee mesh", () => {
    beforeEach(() => {
      mesh = new HEMesh(tee.points, tee.faces);
    });

    test("flipping an edge removes the old diagonal and adds a new one", () => {
      const edge16Orig = findEdgeBetweenVertices(mesh, 1, 6);
      expect(edge16Orig).not.toBeDefined();

      const edge25Orig = findEdgeBetweenVertices(mesh, 2, 5);
      expect(edge25Orig).toBeDefined();

      edge25Orig.flip();

      // old edge should be gone
      const edge25 = findEdgeBetweenVertices(mesh, 2, 5);
      expect(edge25).not.toBeDefined();

      // new edge should be created
      const edge16 = findEdgeBetweenVertices(mesh, 1, 6);

      expect(edge16).toBeDefined();
      expect(edge16.halfEdge).toBeDefined();
      expect(edge16.halfEdge.twin).toBeDefined();
    });

    test("flipping an edge leaves the edge consistent", () => {
      const edge25 = findEdgeBetweenVertices(mesh, 2, 5);
      edge25.flip();

      const edge16 = findEdgeBetweenVertices(mesh, 1, 6);
      checkEdgeConsistency(edge16);
    });

    test("flipping an edge connects the half edges correctly", () => {
      const edge25 = findEdgeBetweenVertices(mesh, 2, 5);
      edge25.flip();

      const edge16 = findEdgeBetweenVertices(mesh, 1, 6);
      const halfEdge = edge16.halfEdge;
      expect( Object.is(halfEdge.vertex, mesh.vertices[1])).toBeTruthy();
      expect(Object.is(halfEdge.next.vertex, mesh.vertices[6])).toBeTruthy();
      expect(Object.is(halfEdge.next.next.vertex, mesh.vertices[2])).toBeTruthy();

      const twin = halfEdge.twin;
      expect(Object.is(twin.vertex, mesh.vertices[6])).toBeTruthy();
      expect(Object.is(twin.next.vertex, mesh.vertices[1])).toBeTruthy();
      expect(Object.is(twin.next.next.vertex, mesh.vertices[5])).toBeTruthy();


      expect(Object.is(halfEdge.edge,edge16)).toBeTruthy();
      expect(Object.is(twin.edge,edge16)).toBeTruthy();
    });

    test("flipping an edge connects the faces correctly", () => {
      const edge25 = findEdgeBetweenVertices(mesh, 2, 5);
      edge25.flip();

      const edge16 = findEdgeBetweenVertices(mesh, 1, 6);
      const halfEdge = edge16.halfEdge;
      expect(Object.is(halfEdge.face, mesh.faces[2])).toBeTruthy();
      expect(Object.is(halfEdge, mesh.faces[2].halfEdge)).toBeTruthy();
      checkFaceConsistency(mesh.faces[2]);

      const twin = halfEdge.twin;
      expect(Object.is(twin.face, mesh.faces[3])).toBeTruthy();
      expect(Object.is(twin, mesh.faces[3].halfEdge)).toBeTruthy();
      checkFaceConsistency(mesh.faces[3]);
    });

    test("Confirm that the faces have the correct vertices", () => {
      const edge25 = findEdgeBetweenVertices(mesh, 2, 5);
      edge25.flip();

      const edge16 = findEdgeBetweenVertices(mesh, 1, 6);
      const halfEdge = edge16.halfEdge;

      let expectedVertices = [mesh.vertices[1], mesh.vertices[6], mesh.vertices[2]];
      let foundVertices = halfEdge.face.getVertices();
      checkVerticesOfFace(expectedVertices, foundVertices);

      expectedVertices = [mesh.vertices[1], mesh.vertices[5], mesh.vertices[6]];
      foundVertices = halfEdge.twin.face.getVertices();
      checkVerticesOfFace(expectedVertices, foundVertices);
    });

    test("Flipping an edge leaves vertices with valid half edge connections", ()=>{
      mesh.vertices.forEach((v)=>{
        expect(v.halfEdge).toBeDefined();
        expect(Object.is(v.halfEdge.vertex,v)).toBeTruthy();
     
      });
    });
  });
});
