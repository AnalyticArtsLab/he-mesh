import { Vector3 } from "@babylonjs/core/Maths/math.vector";
/**
 * This calculates new positions for the existing (even) vertices.
 * This uses the Warren values for the new positions.
 *
 * The neighbors are all weighted by beta, and the current value is weighted by 1 - n * beta.
 * beta is 3/16 if n=3 and 3/(8*n) otherwise.
 * @param {*} mesh
 */

export function calcEvenPositions(mesh) {
  const newPoints = mesh.vertices.map((v, i) => {
    const boundingEdges = v.getBoundingEdges();
    if (boundingEdges.length > 0) {
      // we are on an edge or seam
      const neighbors = boundingEdges
        .map((e) => e.ends())
        .flat()
        .filter((ev) => ev !== v);

      const newPosition = neighbors.reduce(
        (acc, ev) => acc.add(ev.position),
        new Vector3()
      );

      newPosition.scaleInPlace(1 / 8);
      newPosition.addInPlace(v.position.scale(3 / 4));

      return newPosition;
    }

    

    const neighbors = v.getNeighbors();
    const beta = neighbors.length === 3 ? 3 / 16 : 3 / (8 * neighbors.length);

    const newPosition = neighbors.reduce(
      (acc, ev) => acc.add(ev.position),
      new Vector3()
    );
   
    newPosition.scaleInPlace(beta);
    newPosition.addInPlace(v.position.scale(1 - (neighbors.length * beta)));

  
 
    return newPosition;
  });
  return newPoints;
}

/**
 * This function generates the points that are in the middle of each edge.
 *
 * @param {*} mesh
 */
export function calcOddPositions(mesh) {
  const newPoints = mesh.edges.map((e,i) => {
    const ends = e.ends();
    const p1 = ends[0].position;
    const p2 = ends[1].position;
    const newPoint = p1.add(p2);

    const he = e.halfEdge;

    if (he.twin) {
      // not on a border so we need to find the opposing points
      const p3 = he.next.next.vertex.position;
      const p4 = he.twin.next.next.vertex.position;

      newPoint.scaleInPlace(3 / 8);
      newPoint.addInPlace(p3.scale(1 / 8));
      newPoint.addInPlace(p4.scale(1 / 8));
    } else {
      // on a border, just split the difference between the two ends
      newPoint.scaleInPlace(1 / 2);
     
    }

    return newPoint;
  });

  return newPoints;
}

export function subdivideSurface(mesh) {
  // divide all of the edges
  const toFix = [];

  mesh.edges.forEach((edge) => {
    const { vertex, edge34, edge24 } = edge.split();
    vertex.odd = true;
    toFix.push(edge24);
    if (edge34) {
      toFix.push(edge34);
    }
  });


  toFix.forEach((edge) => {
    const [v0, v1] = edge.ends();
    if (v0.odd ^ v1.odd) {
      edge.flip();
    }
  });

}

export function loopSubdivision(mesh) {
  const evenPositions = calcEvenPositions(mesh);
  const oddPositions = calcOddPositions(mesh);

  subdivideSurface(mesh);

  evenPositions.forEach((p, i) => {
    mesh.vertices[i].position = p;
  });

  oddPositions.forEach((p, i) => {
    const edge = mesh.edges[i];
    const [v0, v1] = edge.ends();
    if (v0.odd) {
      v0.position = p;
      v0.odd = false;
    } else {
      v1.position = p;
      v1.odd = false;
    }
  });



}
