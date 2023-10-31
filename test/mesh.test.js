import { HEMesh } from "../src/he-mesh";
import {
  checkVerticesOfFace,
  checkFaceConsistency,
  checkEdgeConsistency,
  findEdgeBetweenVertices,
} from "./utils";
import { square, tee } from "./meshes";

describe("test mesh construction", () => {
  describe("Tests for the half-edge mesh structure - simple box", () => {
    let mesh;
    beforeEach(() => {
      mesh = new HEMesh(square.points, square.faces);
    });

    test("Mesh has the correct nu,ber of structural elements", ()=>{
      expect(mesh.vertices.length).toBe(4);
      expect(mesh.faces.length).toBe(2);
      expect(mesh.edges.length).toBe(5);
      expect(mesh.halfEdges.length).toBe(6);
    });


    test("Mesh has the expected vertices", ()=>{
      expect(mesh.vertices[0].position).toEqual(square.points[0]);
      expect(mesh.vertices[1].position).toEqual(square.points[1]);
      expect(mesh.vertices[2].position).toEqual(square.points[2]);
      expect(mesh.vertices[3].position).toEqual(square.points[3]);
    });

    test("The appropriate faces have been created", ()=>{
      for (let i = 0; i < mesh.faces.length; i++) {
        const face = mesh.faces[i];
        checkFaceConsistency(face);
        const faceVertices = face.getVertices().map((v) => v.position);
        const expectedVertices = square.faces[i].map((j) => square.points[j]);
        checkVerticesOfFace(expectedVertices, faceVertices);
      }
    });



    test("The edges and half edges are consistent", () => {
      // check the edges
      mesh.edges.forEach(checkEdgeConsistency);

      const borderEdgePairs = [
        [0, 2],
        [0, 3],
        [1, 3],
        [1, 2],
      ];

      borderEdgePairs.forEach((pair) => {
        const edge = findEdgeBetweenVertices(mesh, pair[0], pair[1]);
        expect(edge).toBeDefined();
        expect(edge.halfEdge.twin).not.toBeDefined();
      });

      // diagonal edge
      const edge01 = findEdgeBetweenVertices(mesh, 0, 1);
      expect(edge01).toBeDefined();
      expect(edge01.halfEdge).toBeDefined();
      expect(edge01.halfEdge.twin).toBeDefined();

      // diagonal which shouldn't have an edge
      const edge23 = findEdgeBetweenVertices(mesh, 2, 3);
      expect(edge23).not.toBeDefined();
    });
  });
});
