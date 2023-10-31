/**
 * This checks a list of positions against a known list of positions.
 * For a face, the start point isn't important, but the order is, so
 * this will find the first match and then use that as an offset to check the rest.
 * @param {*} expectedVertices
 * @param {*} foundVertices
 */
export function checkVerticesOfFace(expectedVertices, foundVertices) {
  const start = expectedVertices.findIndex((v) => foundVertices[0] === v);
  expect(start).not.toBe(-1);
  for (let i = 0; i < expectedVertices.length; i++) {
    expect(foundVertices[i]).toEqual(
      expectedVertices[(start + i) % expectedVertices.length]
    );
  }
}

export function checkFaceConsistency(face,i) {
 
  const halfEdge = face.halfEdge;
  expect(halfEdge).toBeDefined();
  expect(Object.is(halfEdge.face,face)).toBeTruthy();

  expect(halfEdge.next).toBeDefined();
  expect(Object.is(halfEdge.next.face,face)).toBeTruthy();

 
  expect(halfEdge.next.next).toBeDefined();
  expect(Object.is(halfEdge.next.next.face,face)).toBeTruthy();
}

export function checkEdgeConsistency(edge) {
  const halfEdge = edge.halfEdge;
  expect(halfEdge).toBeDefined();
  expect(Object.is(halfEdge.edge,edge)).toBeTruthy();


  const ends = edge.ends();
  expect(ends.length).toBe(2);

  if (halfEdge.vertex === ends[0]) {
    expect(halfEdge.next.vertex).toBe(ends[1]);
  } else {
    expect(halfEdge.next.vertex).toBe(ends[0]);
  }

  if (halfEdge.twin) {
    const twin = halfEdge.twin;
    expect(Object.is(twin.edge,edge)).toBeTruthy();
    expect(Object.is(twin.twin,halfEdge)).toBeTruthy();
   
    expect(twin.face).not.toBe(halfEdge.face);
    if (twin.vertex === ends[0]) {
      expect(halfEdge.vertex).toBe(ends[1]);
      expect(twin.next.vertex).toBe(ends[1]);
    } else {
      expect(halfEdge.vertex).toBe(ends[0]);
      expect(twin.next.vertex).toBe(ends[0]);
    }
  }
}

export function findEdgeBetweenVertices(mesh, index0, index1) {
  const v0 = mesh.vertices[index0];
  const v1 = mesh.vertices[index1];

  return mesh.edges.find((e) => {
    const ends = e.ends();
    return (
      (ends[0] === v0 && ends[1] === v1) || (ends[0] === v1 && ends[1] === v0)
    );
  });
}

export function findEdgeIndexBetweenVertices(mesh, index0, index1) {
  const v0 = mesh.vertices[index0];
  const v1 = mesh.vertices[index1];

  return mesh.edges.findIndex((e) => {
    const ends = e.ends();
    return (
      (ends[0] === v0 && ends[1] === v1) || (ends[0] === v1 && ends[1] === v0)
    );
  });
}

export function findVertexBetweenVertices(mesh, index0, index1){
  const v0 = mesh.vertices[index0];
  const v1 = mesh.vertices[index1];

  return mesh.vertices.findIndex((v)=>{
    const neighbors = v.getNeighbors();
    return neighbors.includes(v0) && neighbors.includes(v1);
  });
}

export function findFaceFromVertices(mesh, vertices) {
  return mesh.faces.find((f) => {
    const faceVertices = f.getVertices().map((f)=>mesh.vertices.findIndex((v)=>v===f));
    return vertices.every((v) => faceVertices.includes(v));
  });
}