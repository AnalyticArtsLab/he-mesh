import { HEMesh } from "../src/he-mesh";
import {
  checkVerticesOfFace,
  checkFaceConsistency,
  checkEdgeConsistency,
  findEdgeBetweenVertices,
} from "./utils";
import { square, tee } from "./meshes";

describe("Tests for the split function", () => {
  let mesh;

  describe("Tests for splitting edges of a simple square", () => {
    beforeEach(() => {
      mesh = new HEMesh(square.points, square.faces);
    });

    describe("split function tests - main diagonal", () => {
      let splitReturnValue
      beforeEach(() => {
        const edge01 = findEdgeBetweenVertices(mesh, 0, 1);
        splitReturnValue = edge01.split();
      });

      test("splitting an edge adds a new vertex", () => {
        expect(mesh.vertices.length).toBe(5);
      });

      test("splitting an edge adds two new faces", () => {
        expect(mesh.faces.length).toBe(4);
      });

      test("splitting an edge adds three new edges", () => {
        expect(mesh.edges.length).toBe(8);
      });

      test("splitting an edge adds six new half edges", () => {
        expect(mesh.halfEdges.length).toBe(12);
      });

      test("splitting an edge creates consistent edges", () => {
        mesh.edges.forEach(checkEdgeConsistency);
      });

      test("splitting an edge creates the correct edges edges", () => {
        const edge04 = findEdgeBetweenVertices(mesh, 0, 4);
        expect(edge04).toBeDefined();

        const edge14 = findEdgeBetweenVertices(mesh, 1, 4);
        expect(edge14).toBeDefined();

        const edge24 = findEdgeBetweenVertices(mesh, 2, 4);
        expect(edge24).toBeDefined();

        const edge34 = findEdgeBetweenVertices(mesh, 3, 4);
        expect(edge34).toBeDefined();

        const edge01 = findEdgeBetweenVertices(mesh, 0, 1);
        expect(edge01).not.toBeDefined();
      });

      test("splitting an edge creates consistent faces", () => {
        mesh.faces.forEach(checkFaceConsistency);
      });

      test("new vertex is in the correct position", () => {
        const expectedVertex = mesh.vertices[0].position
          .add(mesh.vertices[1].position);

          expectedVertex.scaleInPlace(0.5);
       

        expect(mesh.vertices[4].position).toEqual(expectedVertex);
      });

      test("Splitting an edge creates the correct faces", () => {
        let expectedVertices = [
          mesh.vertices[0],
          mesh.vertices[4],
          mesh.vertices[2],
        ];
        let foundVertices = mesh.faces[0].getVertices();
        checkVerticesOfFace(expectedVertices, foundVertices);

        expectedVertices = [
          mesh.vertices[0],
          mesh.vertices[3],
          mesh.vertices[4],
        ];
        foundVertices = mesh.faces[1].getVertices();
        checkVerticesOfFace(expectedVertices, foundVertices);

        expectedVertices = [
          mesh.vertices[2],
          mesh.vertices[4],
          mesh.vertices[1],
        ];
        foundVertices = mesh.faces[2].getVertices();
        checkVerticesOfFace(expectedVertices, foundVertices);

        expectedVertices = [
          mesh.vertices[1],
          mesh.vertices[4],
          mesh.vertices[3],
        ];
        foundVertices = mesh.faces[3].getVertices();
        checkVerticesOfFace(expectedVertices, foundVertices);
      });

      test("split returns the correct objects when splitting the middle edge", () => {
        expect(splitReturnValue).toBeDefined();
        expect(splitReturnValue.vertex).toBeDefined();
        expect(splitReturnValue.edge24).toBeDefined();
        expect(splitReturnValue.edge14).toBeDefined();
        expect(splitReturnValue.edge34).toBeDefined();

        expect(Object.is(splitReturnValue.vertex, mesh.vertices[4])).toBeTruthy();
        const edge24 = findEdgeBetweenVertices(mesh, 2, 4);
        expect(Object.is(splitReturnValue.edge24, edge24)).toBeTruthy();

        const edge14 = findEdgeBetweenVertices(mesh, 1, 4);
        expect(Object.is(splitReturnValue.edge14, edge14)).toBeTruthy();

        const edge34 = findEdgeBetweenVertices(mesh, 3, 4);
        expect(Object.is(splitReturnValue.edge34, edge34)).toBeTruthy();
      });

      test("Splitting leaves vertices with valid half edge connections", ()=>{
        mesh.vertices.forEach((v)=>{
          expect(v.halfEdge).toBeDefined();
          expect(Object.is(v.halfEdge.vertex,v)).toBeTruthy();
       
        });
      });
    });

    describe("split function tests - borders", () => {
      const splitAndCheckBorder = (v0, v1) => {
        const edge = findEdgeBetweenVertices(mesh, v0, v1);
        edge.split();

        expect(mesh.vertices.length).toBe(5);

        const splitEdge = findEdgeBetweenVertices(mesh, v0, v1);
        expect(splitEdge).not.toBeDefined();

        const originalEdges = [
          [0, 1],
          [0, 2],
          [0, 3],
          [1, 2],
          [1, 3],
        ];

        // remove the edge we split
        const expectedEdges = originalEdges.filter(
          (pair) =>
            !(pair[0] === v0 && pair[1] === v1) &&
            !(pair[0] === v1 && pair[1] === v0)
        );

        expectedEdges.push([v0, 4]);
        expectedEdges.push([v1, 4]);

        expectedEdges.forEach((pair) => {
          const edge = findEdgeBetweenVertices(mesh, pair[0], pair[1]);
          expect(edge).toBeDefined();
          checkEdgeConsistency(edge);
        });

        expect(mesh.faces.length).toBe(3);
        mesh.faces.forEach(checkFaceConsistency);

        const expectedVertex = mesh.vertices[v0].position
          .add(mesh.vertices[v1].position)
          .multiplyByFloats(0.5, 0.5, 0.5);

        expect(mesh.vertices[4].position).toEqual(expectedVertex);
      };

      test("splitting edge12", () => {
        splitAndCheckBorder(1, 2);
      });

      test("splitting edge02", () => {
        splitAndCheckBorder(0, 2);
      });

      test("splitting edge03", () => {
        splitAndCheckBorder(0, 3);
      });

      test("splitting edge13", () => {
        splitAndCheckBorder(1, 3);
      });

      test("Splitting a border creates the correct faces", () => {
        const edge = findEdgeBetweenVertices(mesh, 0, 2);
        edge.split();

        let expectedVertices = [
          mesh.vertices[2],
          mesh.vertices[4],
          mesh.vertices[1],
        ];
        let foundVertices = mesh.faces[0].getVertices();

        checkVerticesOfFace(expectedVertices, foundVertices);

        expectedVertices = [
          mesh.vertices[0],
          mesh.vertices[3],
          mesh.vertices[1],
        ];
        foundVertices = mesh.faces[1].getVertices();
        checkVerticesOfFace(expectedVertices, foundVertices);

        expectedVertices = [
          mesh.vertices[1],
          mesh.vertices[4],
          mesh.vertices[0],
        ];
        foundVertices = mesh.faces[2].getVertices();
        checkVerticesOfFace(expectedVertices, foundVertices);
      });

      test("splitting a border returns the correct objects", () => {
        const edge = findEdgeBetweenVertices(mesh, 0, 2);
        const returnObject = edge.split();

        expect(returnObject).toBeDefined();
        expect(returnObject.vertex).toBeDefined();
        expect(returnObject.edge24).toBeDefined();
        expect(returnObject.edge14).toBeDefined();
        expect(returnObject.edge34).not.toBeDefined();

        expect(Object.is(returnObject.vertex, mesh.vertices[4])).toBeTruthy();
        
        // these numbers look funny because the returned numbers
        // are based on the original square, and we are splitting
        // the edge now
        const edge04 = findEdgeBetweenVertices(mesh, 0, 4);
        expect(Object.is(returnObject.edge14, edge04)).toBeTruthy();

        const edge14 = findEdgeBetweenVertices(mesh, 1, 4);
        expect(Object.is(returnObject.edge24, edge14)).toBeTruthy();



      });

  
    });
  });


  describe("Test for splitting an edge in a Tee mesh", () => {

    beforeAll(() => {
      mesh = new HEMesh(tee.points, tee.faces);

      const edge56 = findEdgeBetweenVertices(mesh, 5, 6);
      edge56.split();
    });


    test("splitting the edge creates the correct number of elements", () => {
      expect(mesh.vertices.length).toBe(11);
      expect(mesh.faces.length).toBe(10);
      expect(mesh.edges.length).toBe(20);
      expect(mesh.halfEdges.length).toBe(30);
    });

    test("splitting the edge creates consistent edges", () => {
      mesh.edges.forEach(checkEdgeConsistency);
    });

    test("splitting an edge creates consistent faces", () => {
      mesh.faces.forEach(checkFaceConsistency);
    });

    test("splitting an edge creates the correct faces", () => {
      let expectedVertices = [mesh.vertices[2], mesh.vertices[5], mesh.vertices[10]];
      let foundVertices = mesh.faces[3].getVertices();
      checkVerticesOfFace(expectedVertices, foundVertices);

      expectedVertices = [mesh.vertices[5], mesh.vertices[8], mesh.vertices[10]];
      foundVertices = mesh.faces[6].getVertices();
      checkVerticesOfFace(expectedVertices, foundVertices);

      expectedVertices = [mesh.vertices[2], mesh.vertices[10], mesh.vertices[6]];
      foundVertices = mesh.faces[8].getVertices();
      checkVerticesOfFace(expectedVertices, foundVertices);

      expectedVertices = [mesh.vertices[10], mesh.vertices[8], mesh.vertices[6]];
      foundVertices = mesh.faces[9].getVertices();
      checkVerticesOfFace(expectedVertices, foundVertices);

    });

    test("Splitting leaves vertices with valid half edge connections", ()=>{
      mesh.vertices.forEach((v)=>{
        expect(v.halfEdge).toBeDefined();
        expect(Object.is(v.halfEdge.vertex,v)).toBeTruthy();
     
      });
    });


  });


  describe("Detecting the error of the incorrect half edge", () => {
    test("Detecting the error of the incorrect half edge", () => {
      const mesh = new HEMesh(square.points, square.faces);
      const edge01 = findEdgeBetweenVertices(mesh, 0, 1);

       // force v1 to have its half edge on the edge we are splitting
      if (edge01.halfEdge.vertex === mesh.vertices[1]){
        mesh.vertices[1].halfEdge = edge01.halfEdge;
      }else{
        mesh.vertices[1].halfEdge = edge01.halfEdge.twin;
      }

      edge01.split();
      mesh.vertices.forEach((v)=>{
        expect(v.halfEdge).toBeDefined();
        expect(Object.is(v.halfEdge.vertex,v)).toBeTruthy();
     
      });

    
    });
  });
});
