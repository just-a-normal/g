import { warmup1, warmup2 } from './warmup.js';
import { string1, string2, string3 } from './strings.js';
import { array1, array2, array3 } from './arrays.js';
import { logic1, logic2 } from './logic.js';
import { recursion1, recursion2 } from './recursion.js';
import { functional1, functional2 } from './functional.js';
import { objects } from './objects.js';
import { collections } from './collections.js';
import { streams } from './streams.js';
import { structures } from './structures.js';
import { search } from './search.js';

export const tracks = [
  { name: 'Core Java', topics: [warmup1, warmup2, string1, string2, string3, array1, array2, array3, logic1, logic2, recursion1, recursion2, functional1, functional2] },
  { name: 'Expanded Java', topics: [objects, collections, streams, structures, search] }
];

export const topics = tracks.flatMap(track => track.topics);
export const total = topics.reduce((sum, topic) => sum + topic.problems.length, 0);
