import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export const square = {
  points: [
    new Vector3(0, 0, 0),
    new Vector3(1, 1, 1),
    new Vector3(0, 0.5, 1),
    new Vector3(1, 0.5, 0),
  ],

  faces: [
    [0, 1, 2],
    [0, 3, 1],
  ],
};

export const tee = {
  points: [
    new Vector3(0, 0, 0),
    new Vector3(1, 0, 0),
    new Vector3(2, 0, 0),
    new Vector3(3, 0, 0),

    new Vector3(0, 0, 1),
    new Vector3(1, 0, 1),
    new Vector3(2, 0, 1),
    new Vector3(3, 0, 1),

    new Vector3(1, 0, 2),
    new Vector3(2, 0, 2),
  ],

  faces: [
    [0, 4, 1],
    [1, 4, 5],
    [1, 5, 2],
    [2, 5, 6],
    [2, 6, 3],
    [3, 6, 7],
    [5, 8, 6],
    [6, 8, 9],
  ],
};

export const tee3D = {
  points: [
    new Vector3(0, 0, 0),
    new Vector3(1, 0, 0),
    new Vector3(2, 0, 0),
    new Vector3(3, 0, 0),

    new Vector3(0, 0, 1),
    new Vector3(1, 0, 1),
    new Vector3(2, 0, 1),
    new Vector3(3, 0, 1),

    new Vector3(1, 0, 2),
    new Vector3(2, 0, 2),

    new Vector3( 0, 1, 0),
    new Vector3(1, 1, 0),
    new Vector3(2, 1, 0),
    new Vector3(3, 1, 0),
    new Vector3( 0, 1, 1),
    new Vector3(1, 1, 1),
    new Vector3(2, 1, 1),
    new Vector3(3, 1, 1),
    new Vector3(1, 1, 2),
    new Vector3(2, 1, 2),
  ],

  faces: [
    [0, 4, 1],
    [1, 4, 5],
    [1, 5, 2],
    [2, 5, 6],
    [2, 6, 3],
    [3, 6, 7],
    [5, 8, 6],
    [6, 8, 9],

    [10,11,14],
    [11,15,14],
    [11,12,15],
    [12,16,15],
    [12,13,16],
    [13,17,16],
    [15,16,18],
    [16,19,18],

    [0,10,4],
    [4,10,14],
    [4,14,5],
    [5,14,15],
    [5,15,18],
    [5,18,8],
    [8,18,19],
    [8,19,9],

    [9,19,6],
    [6,19,16],
    [6,16,7],
    [7,16,17],
    [7,17,3],
    [3,17,13],
    [3,13,2],
    [2,13,12],
    [2,12,1],
    [1,12,11],
    [1,11,0],
    [0,11,10],
  ],
};

export const cube = {
  points: [
    new Vector3(0, 0, 0),
    new Vector3(1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(1, 1, 0),

    new Vector3(0, 0, 1),
    new Vector3(1, 0, 1),
    new Vector3(0, 1, 1),
    new Vector3(1, 1, 1),
  ],

  faces: [
    [0, 1, 3],
    [0, 3, 2],

    [1, 7, 3],
    [1, 5, 7],

    [5, 6, 7],
    [5, 4, 6],

    [4, 2, 6],
    [4, 0, 2],

    [2, 7, 6],
    [2, 3, 7],

    [0, 4, 5],
    [0, 5, 1],
  ],
};

export const grid = {
  points: new Array(20)
    .fill(0)
    .map((_, i) => new Vector3(i % 5, 0, Math.floor(i / 5))),
  faces: new Array(24).fill(0).map((_, i) => {
    const x = Math.floor(i/2) + Math.floor(i/8);
   
    if (i % 2 === 0) {
      return [x, x + 1, x + 5];
    } else {
      return [x + 1, x + 6, x + 5];
    }
  }),
};
