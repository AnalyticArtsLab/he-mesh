import { grid } from "./meshes";
import { HEMesh } from "../src/he-mesh";

describe("Test of the vertex methods", () => {
  let mesh;

  beforeAll(() => {
    mesh = new HEMesh(grid.points, grid.faces);
  });

  describe("Tests for the getNeighbors method", () => {
    test("getNeighbors returns the correct number of neighbors", () => {
      let neighbors = mesh.vertices[0].getNeighbors();
      expect(neighbors.length).toBe(2);

      neighbors = mesh.vertices[4].getNeighbors();
      expect(neighbors.length).toBe(3);

      neighbors = mesh.vertices[7].getNeighbors();
      expect(neighbors.length).toBe(6);
    });

    test("getNeighbors returns the correct neighbors in the middle of the grid", () => {
      const neighbors = mesh.vertices[7].getNeighbors();
      const expectedNeighbors = [2, 3, 6, 8, 11, 12];
      expectedNeighbors.forEach((i) => {
        expect(neighbors).toContain(mesh.vertices[i]);
      });
    });

    test("getNeighbors returns the correct neighbors on the top border of the grid", () => {
      let neighbors = mesh.vertices[2].getNeighbors();
      const expectedNeighbors = [1, 6, 7, 3];
      expectedNeighbors.forEach((i) => {
        expect(neighbors).toContain(mesh.vertices[i]);
      });
    });

    test("getNeighbors returns the correct neighbors on the left border of the grid", () => {
      let neighbors = mesh.vertices[5].getNeighbors();
      const expectedNeighbors = [0, 1, 6, 10];
      expectedNeighbors.forEach((i) => {
        expect(neighbors).toContain(mesh.vertices[i]);
      });
    });

    test("getNeighbors returns the correct neighbors on the right border of the grid", () => {
      let neighbors = mesh.vertices[9].getNeighbors();
      const expectedNeighbors = [4, 8, 13, 14];
      expectedNeighbors.forEach((i) => {
        expect(neighbors).toContain(mesh.vertices[i]);
      });
    });

    test("getNeighbors returns the correct neighbors on the bottom border of the grid", () => {
      let neighbors = mesh.vertices[17].getNeighbors();
      const expectedNeighbors = [16, 12, 13, 18];
      expectedNeighbors.forEach((i) => {
        expect(neighbors).toContain(mesh.vertices[i]);
      });
    });

    test("getNeighbors returns the correct neighbors on the corner w/o diagonal", () => {
      const neighbors = mesh.vertices[0].getNeighbors();
      const expectedNeighbors = [1, 5];
      expectedNeighbors.forEach((i) => {
        expect(neighbors).toContain(mesh.vertices[i]);
      });
    });

    test("getNeighbors returns the correct neighbors on the corner w/ diagonal", () => {
      const neighbors = mesh.vertices[4].getNeighbors();
      const expectedNeighbors = [3, 8, 9];
      expectedNeighbors.forEach((i) => {
        expect(neighbors).toContain(mesh.vertices[i]);
      });
    });
  });

  describe("Test for getBoundingEdges", () => {
    test("Interior vertices have no bounding edges", () => {
      const edges = mesh.vertices[7].getBoundingEdges();
      expect(edges.length).toBe(0);
    });


    test("top vertices return the correct edges", () => {
      const p = 2;
      const edges = mesh.vertices[p].getBoundingEdges();
      const expectedEdgeEnds = [1,3];
      
      const edgeEnds = edges.map((e)=>e.ends().filter(v=>v !== mesh.vertices[p])[0]);

      expectedEdgeEnds.forEach((i)=>{
        expect(edgeEnds).toContain(mesh.vertices[i]);
      });
    });

    test("bottom vertices return the correct edges", () => {
      const p = 17;
      const edges = mesh.vertices[p].getBoundingEdges();
      const expectedEdgeEnds = [16, 18];
      
      const edgeEnds = edges.map((e)=>e.ends().filter(v=>v !== mesh.vertices[p])[0]);

      expectedEdgeEnds.forEach((i)=>{
        expect(edgeEnds).toContain(mesh.vertices[i]);
      });
    });

    test("left vertices return the correct edges", () => {
      const p = 10;
      const edges = mesh.vertices[p].getBoundingEdges();
      const expectedEdgeEnds = [5,15];
      
      const edgeEnds = edges.map((e)=>e.ends().filter(v=>v !== mesh.vertices[p])[0]);

      expectedEdgeEnds.forEach((i)=>{
        expect(edgeEnds).toContain(mesh.vertices[i]);
      });
    });

    test("right vertices return the correct edges", () => {
      const p = 9;
      const edges = mesh.vertices[p].getBoundingEdges();
      const expectedEdgeEnds = [4, 14];
      
      const edgeEnds = edges.map((e)=>e.ends().filter(v=>v !== mesh.vertices[p])[0]);

      expectedEdgeEnds.forEach((i)=>{
        expect(edgeEnds).toContain(mesh.vertices[i]);
      });
    });

    test("corners w/o diagonals return the correct edges", () => {
      const p = 0;
      const edges = mesh.vertices[p].getBoundingEdges();
      const expectedEdgeEnds = [1,5];
      
      const edgeEnds = edges.map((e)=>e.ends().filter(v=>v !== mesh.vertices[p])[0]);

      expectedEdgeEnds.forEach((i)=>{
        expect(edgeEnds).toContain(mesh.vertices[i]);
      });
    });

    test("corners w/ diagonals return the correct edges", () => {
      const p = 4;
      const edges = mesh.vertices[p].getBoundingEdges();
      const expectedEdgeEnds = [3,9];
      
      const edgeEnds = edges.map((e)=>e.ends().filter(v=>v !== mesh.vertices[p])[0]);

      expectedEdgeEnds.forEach((i)=>{
        expect(edgeEnds).toContain(mesh.vertices[i]);
      });
    });

  });
});
