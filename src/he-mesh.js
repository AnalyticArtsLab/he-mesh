import { Vector3 } from "@babylonjs/core/Maths/math.vector";

const positionString = (v) => `${v.position.x},${v.position.y},${v.position.z}`;

export class Vertex {
  constructor(position) {
    this.position = position;
    this.halfEdge = null;
  }

  getNeighbors() {
    const neighbors = [];
    let he = this.halfEdge;

    he = this.halfEdge;

    do {
      neighbors.push(he.next.next.vertex);
      he = he.next.next.twin;
    } while (he && he !== this.halfEdge);

    if (!he) {
      // we are on a boundary and need to work in the opposite direction as well
      he = this.halfEdge;
      let done = false;
      do {
        neighbors.push(he.next.vertex);
        if (he.twin) {
          he = he.twin.next;
        } else {
          done = true;
        }
      } while (!done);
    }

    return neighbors;
  }


  /**
   * This returns the vertex that is between this vertex and the vertex parameter. If there is no such vertex, this returns undefined.
   * @param {*} vertex 
   */
  findConnectingVertex(vertex){
    const neighbors = this.getNeighbors();

    return neighbors.find((v)=>v.getNeighbors().includes(vertex)); 

  }

  /**
   * If the vertex is on a boundary, it returns the two edges along the boundary
   * Otherwise, this returns an empty list
   *
   * @returns an array of edges on the boundary containing this vertex
   */
  getBoundingEdges() {
    let he = this.halfEdge;

    while (he.twin) {
      he = he.twin.next;
      if (he === this.halfEdge) {
        // not on a boundary
        return [];
      }
    }

    const edges = [he.edge];

    // on, the border, now look in the other direction
    he = this.halfEdge.next.next;
    while (he.twin) {
      he = he.twin.next.next;
    }
    edges.push(he.edge);
    return edges;
  }
}

export class Face {
  constructor(halfEdge = null) {
    this.halfEdge = halfEdge;
  }

  getVertices() {
    const vertices = [];
    let he = this.halfEdge;
    do {
      vertices.push(he.vertex);
      he = he.next;
    } while (he !== this.halfEdge);

    return vertices;
  }

  halfEdges() {
    const edges = [];
    let he = this.halfEdge;
    do {
      edges.push(he);
      he = he.next;
    } while (he !== this.halfEdge);

    return edges;
  }
}

export class Edge {
  constructor(mesh, halfEdge = null) {
    this.mesh = mesh;
    this.halfEdge = halfEdge;
  }

  ends() {
    return [this.halfEdge.vertex, this.halfEdge.next.vertex];
  }

  /**
   * Flip the edge, which swaps the two faces
   */
  flip(){
    const he = this.halfEdge;
    const {twin } = he;

    if (!twin) {
      throw new Error("can't flip a boundary edge");
    }

    const he1 = he.next;
    const he2 = he1.next;
    const twin1 = twin.next;
    const twin2 = twin1.next;

    const v0 = he.vertex; // origin of the he
    const v1 = twin.vertex; // origin of the twin (opposite v0)
    const v2 = he2.vertex; // third vertex on he side
    const v3 = twin2.vertex; // third vertex on twin side

    const face0 = he.face; // face on he side
    const face1 = twin.face; // face on twin side

    // update face 0
    he.vertex = v2;
    he.next = twin2;
    twin2.next = he1;
    he1.next = he;
    twin2.face = face0;

    face0.halfEdge = he;

    // update face1
    twin.vertex = v3;
    twin.next = he2;
    he2.next = twin1;
    twin1.next = twin;
    he2.face = face1;

    face1.halfEdge = twin;

    // update the original vertices half edges
    v0.halfEdge = twin1;
    v1.halfEdge = he1;

  }



  /**
   * Split the edge, which inserts a new vertex
   */
  split() {
    // Naming convention:
    // f0 - face 0 (face associated with this edge's halfEdge)
    // f1 - face 1 (new face created by dividing the original face)
    // f2 - face 2 (face associated with the twin's halfEdge)
    // f3 - face 3 (new face created by dividing the twin's face)
    // v0 - vertex 0 (vertex associated with this edge's halfEdge)
    // v1 - vertex 1 (vertex associated with halfEdge.next)
    // v2 - vertex 2 (vertex associated with halfEdge.next.next)
    // v3 - vertex 3 (vertex associated with twin.next.next halfEdge)
    // v4 - vertex 4 (new vertex created by dividing the edge)
    // e14 - edge connecting v1 and v4 (specified in ascending order)
    // e24 - edge connecting v2 and v4
    // e34 - edge connecting v3 and v4
    // he24 - half edge for e24, from v2 to v4
    // he42 - half edge for e24, from v4 to v2

    // we are going to return the new vertex and the new edges
    const newObjs = {};

    // start by splitting the face associated with this edge's half edge

    const he = this.halfEdge;
    const twin = he.twin;
    const f0 = he.face;

    f0.halfEdge = he;
    const [he04, he12, he20] = f0.halfEdges();
    const [v0, v1, v2] = f0.getVertices();

    // calculate the new point location
    const newPosition = v0.position.add(v1.position);
    newPosition.scaleInPlace(0.5);

    // create the new vertex
    const v4 = this.mesh.addVertex(newPosition);

    newObjs.vertex = v4;

    // -------------- face0 --------------
    const e24 = this.mesh.addEdge(); // create the new bisecting edge
    newObjs.edge24 = e24;

    const he42 = this.mesh.addHalfEdge(v4, f0, e24);

    he42.next = he20;                                     // he42 -> he20
    he04.next = he42;

    e24.halfEdge = he42;
    v4.halfEdge = he42;

    // -------------- face1 --------------
    const f1 = this.mesh.addFace();
    const e14 = this.mesh.addEdge();
    newObjs.edge14 = e14;
    he12.face = f1;

    v1.halfEdge = he12;

    // make the two new half edges
    const he24 = this.mesh.addHalfEdge(v2, f1, e24);
    f1.halfEdge = he24;

    he24.twin = he42;
    he42.twin = he24;

    const he41 = this.mesh.addHalfEdge(v4, f1, e14);
    e14.halfEdge = he41;

    he24.next = he41;
    he41.next = he12;
    he12.next = he24;

    if (twin) {
      const v3 = twin.next.next.vertex;
      twin.face.halfEdge = twin;
      const [he40, he03, he31] = twin.face.halfEdges();

      // -------------- face2 ----------------

      const f2 = twin.face; // reusing the second face

      he40.vertex = v4;

      const e34 = this.mesh.addEdge(); // create the new bisecting edge
      newObjs.edge34 = e34;

      const he34 = this.mesh.addHalfEdge(v3, f2, e34);

      he34.next = he40;
      he03.next = he34;

      e34.halfEdge = he34;

      // -------------- face3 --------------
      const f3 = this.mesh.addFace();
      he31.face = f3;

      const he43 = this.mesh.addHalfEdge(v4, f3, e34);

      f3.halfEdge = he43;
      he43.twin = he34;
      he34.twin = he43;

      const he14 = this.mesh.addHalfEdge(v1, f3, e14);
      he14.twin = he41;
      he41.twin = he14;

      he14.next = he43;
      he43.next = he31;
      he31.next = he14;
    }

    return newObjs;
  }
}

export class HalfEdge {
  constructor(vertex, face, edge) {
    this.vertex = vertex;
    this.face = face;
    this.edge = edge;
    this.next = null;
    this.twin = null;
  }
}

export class HEMesh {
  vertices = [];
  faces = [];
  edges = [];
  halfEdges = [];

  /**
   * Construct a half-edge mesh from polygon soup, where the vertices are specified with BABYLON.Vector3 objects
   *
   * @param {*} vertices
   * @param {*} faces
   */
  constructor(vertices, faces) {
    // create the vertices
    this.vertices = vertices.map((v, i) => new Vertex(v));

    this.faces = faces.map((f, j) => {
      const face = this.addFace();
      const points = f.map((v) => this.vertices[v]);

      let last = null;
      const halfEdges = points.map((v) => {
        const he = this.addHalfEdge(v, face);
        if (!v.halfEdge) {
          // vertex doesn't have a half edge yet, so set it
          v.halfEdge = he;
        }

        if (last) {
          last.next = he;
        }

        last = he;
        return he;
      });

      halfEdges[2].next = halfEdges[0];

      face.halfEdge = halfEdges[0];

      return face;
    });

    // the faces are all free standing, so now marry them, setting the twins and creating edges
    this.halfEdges.forEach((he) => {
      if (!he.twin) {
        // create the edge
        const edge = this.addEdge(he);
        he.edge = edge;

        // find the twin
        const twin = this.halfEdges.find(
          (other) =>
            other.vertex === he.next.vertex && other.next.vertex === he.vertex
        );
        // connect the twins
        he.twin = twin;
        if (twin) {
          twin.edge = edge;
          twin.twin = he;
        }
      }
    });
  }

  addFace(halfEdge = null) {
    const face = new Face(halfEdge);
    this.faces.push(face);
    return face;
  }

  addVertex(position) {
    const vertex = new Vertex(position);
    this.vertices.push(vertex);
    return vertex;
  }

  addEdge(halfEdge = null) {
    const edge = new Edge(this, halfEdge);
    this.edges.push(edge);
    return edge;
  }

  addHalfEdge(vertex, face, edge = null) {
    const halfEdge = new HalfEdge( vertex, face, edge);
    this.halfEdges.push(halfEdge);
    return halfEdge;
  }

  debug() {
    this.vertices.forEach((v, i) => {
      console.log(`v${i} ${positionString(v)} ${v.odd ? "odd" : ""}`);
    });
    // debugger;
    const faces = this.faces.map((f, i) =>
      f.getVertices().map((v) => this.vertices.indexOf(v))
    );

    faces.forEach((f, i) => {
      console.log(`f${i} ${f.join(" ")}`);
    });

    this.edges.forEach((e, i) => {
      const edgeEnds = e.ends().map((v) => this.vertices.indexOf(v));
      console.log(`e${i} ${edgeEnds.join(" ")}`);
    });

    this.halfEdges.forEach((he, i) => {
      console.log(
        `he${i} e${this.edges.indexOf(he.edge)} ${this.vertices.indexOf(
          he.vertex
        )} ${this.vertices.indexOf(
          he.next.vertex
        )} twin he${this.halfEdges.indexOf(he.twin)} f${this.faces.indexOf(
          he.face
        )}`
      );
    });
  }

  /**
   * Converts the mesh into a polygon soup, returning an array of BABYLON.Vector3 objects and and array of face triplets
   *
   * @returns object with points and faces arrays
   */
  toPolygonSoup() {
    const points = [];
    const faces = [];

    this.faces.forEach((face) => {
      const vertices = face.getVertices();
      const indices = vertices.map((v) => {
        const index = points.findIndex((p) => p.equals(v.position));
        if (index !== -1) {
          return index;
        }
        points.push(v.position);
        return points.length - 1;
      });
      faces.push(indices);
    });

    return { points, faces };
  }
}
