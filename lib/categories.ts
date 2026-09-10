export type CategoryNode = {
  slug: string;
  title: string;
  children?: CategoryNode[];
};

/** A category annotated with its problem count. Empty categories are pruned. */
export type CountedNode = {
  slug: string;
  title: string;
  count: number;
  children: CountedNode[];
};

export const PRACTICE: CategoryNode = { slug: "practice", title: "Practice Ladder" };

// Topic hierarchy mirrored from the atcoder-categories index page. Slugs are
// the category keys in data/catalog.json; entries without data are hidden.
export const CATEGORY_TREE: CategoryNode[] = [
  {
    slug: "sorting",
    title: "Sorting & Searching",
    children: [
      { slug: "inversions", title: "Inversions" },
      {
        slug: "binary_search",
        title: "Binary Search",
        children: [{ slug: "binary_search_on_answer", title: "Binary Search Over Solution" }],
      },
      { slug: "two_pointers", title: "Two Pointers / Sliding Window" },
      { slug: "stacks_queues", title: "Min Stack, Queue / Monotonic Deque" },
      { slug: "heap", title: "Binary Heap / Priority Queue" },
    ],
  },
  { slug: "greedy", title: "Greedy Algorithms" },
  { slug: "bitwise", title: "Bitwise Operations" },
  {
    slug: "dp",
    title: "Dynamic Programming",
    children: [
      { slug: "dp_knapsack", title: "Knapsack" },
      { slug: "dp_bitmask", title: "Bit DP / DP on Subsets / DP on Profile" },
      { slug: "dp_digit", title: "Digit DP" },
      { slug: "dp_count", title: "Counting using DP" },
      { slug: "dp_dag", title: "DP on DAG" },
      { slug: "dp_lcs", title: "LCS" },
      { slug: "dp_lis", title: "LIS" },
      { slug: "dp_tree", title: "Tree DP", children: [{ slug: "dp_reroot", title: "Reroot DP" }] },
    ],
  },
  {
    slug: "graph",
    title: "Graph Algorithms",
    children: [
      { slug: "bfs_dfs", title: "BFS / DFS" },
      { slug: "topo", title: "Topological Sorting" },
      { slug: "scc", title: "SCC / 2-SAT" },
      { slug: "tarjan", title: "Tarjan's Algorithm" },
      { slug: "euler", title: "Euler Path / Cycle" },
      { slug: "hamiltonian", title: "Hamiltonian Path / Cycle" },
      { slug: "bridges", title: "Bridges / Articulation Points" },
      { slug: "dsu", title: "Disjoint Set Union" },
      { slug: "mst", title: "Spanning Trees / MST" },
      {
        slug: "shortest_path",
        title: "Shortest Path",
        children: [
          { slug: "dijkstra", title: "Dijkstra's Algorithm" },
          { slug: "bellman_ford", title: "Bellman-Ford Algorithm" },
          { slug: "floyd_warshall", title: "Floyd-Warshall Algorithm" },
        ],
      },
      {
        slug: "tree",
        title: "Tree Algorithms",
        children: [
          { slug: "lca", title: "Binary Lifting / LCA" },
          { slug: "hld", title: "Heavy-Light Decomposition" },
          { slug: "centroid", title: "Centroid Decomposition" },
        ],
      },
      {
        slug: "matching",
        title: "Matchings",
        children: [
          { slug: "hopcroft_karp", title: "Hopcroft-Karp Algorithm" },
          { slug: "hungarian", title: "Assignment Problem / Hungarian Algorithm" },
        ],
      },
      {
        slug: "flows",
        title: "Flows / Cuts",
        children: [
          { slug: "ford_fulkerson", title: "Ford-Fulkerson Algorithm" },
          { slug: "dinic", title: "Dinic's Algorithm" },
          { slug: "min_cost_flow", title: "Minimum Cost Flows" },
        ],
      },
    ],
  },
  {
    slug: "range",
    title: "Range Queries",
    children: [
      { slug: "prefix_sum", title: "Prefix Sums" },
      { slug: "segment_tree", title: "Segment Tree" },
      { slug: "fenwick", title: "Fenwick Tree" },
      { slug: "sparse_table", title: "Sparse Table" },
      { slug: "splay", title: "Splay Tree" },
      { slug: "yfast", title: "Y-Fast Trie" },
      { slug: "sqrt_decomposition", title: "Sqrt Decomposition / Mo's Algorithm" },
      { slug: "sqrt_tree", title: "Sqrt Tree" },
    ],
  },
  {
    slug: "counting",
    title: "Combinatorics / Counting",
    children: [
      { slug: "inclusion_exclusion", title: "Inclusion / Exclusion" },
      { slug: "pigeonhole", title: "Pigeonhole Principle" },
      { slug: "gf", title: "FPS / Generating Functions" },
      { slug: "burnside_polya", title: "Burnside's Lemma / Pólya Enumeration" },
    ],
  },
  { slug: "probability", title: "Probability / Expected Value" },
  {
    slug: "nt",
    title: "Number Theory",
    children: [
      {
        slug: "nt_divisibility",
        title: "Divisibility / Factorization",
        children: [
          { slug: "nt_factorization", title: "Factorization Techniques" },
          { slug: "nt_primes", title: "Prime Numbers" },
          { slug: "nt_gcd", title: "GCD / Euclid / Extended Euclidean" },
          { slug: "nt_lcm", title: "LCM" },
          { slug: "nt_uf", title: "Unique Factorization" },
        ],
      },
      { slug: "binary_exp", title: "Matrix / Binary Exponentiation" },
      { slug: "nt_diophantine", title: "Diophantine Equations" },
      {
        slug: "nt_modular",
        title: "Modular Arithmetic",
        children: [
          { slug: "nt_crt", title: "Chinese Remainder Theorem" },
          { slug: "nt_mult_order", title: "Multiplicative Order" },
          { slug: "nt_prim_roots", title: "Primitive Roots" },
        ],
      },
      {
        slug: "nt_functions",
        title: "Number-Theoretic Functions",
        children: [
          { slug: "nt_num_div", title: "Number of Divisors / Sum of Divisors" },
          { slug: "nt_totient", title: "Euler's Totient" },
          { slug: "nt_mobius", title: "Möbius Function / Inversion" },
        ],
      },
      { slug: "fft", title: "Fast Fourier Transform / NTT" },
    ],
  },
  {
    slug: "game_theory",
    title: "Game Theory",
    children: [
      { slug: "nim", title: "Nim" },
      { slug: "sprague_grundy", title: "Sprague-Grundy" },
      { slug: "graph_games", title: "Graph Games" },
      { slug: "hackenbush", title: "Green Hackenbush / Colon / Fusion Principle" },
    ],
  },
  {
    slug: "strings",
    title: "String Algorithms",
    children: [
      { slug: "kmp", title: "KMP / Z-Algorithm" },
      { slug: "aho_corasick", title: "Aho-Corasick Algorithm" },
      { slug: "trie", title: "Finite State Automata / Trie" },
      { slug: "suffix_array", title: "Suffix Array" },
      { slug: "suffix_tree", title: "Suffix Tree" },
    ],
  },
  { slug: "subarrays_subsequences", title: "Subarrays / Subsequences" },
  { slug: "subsets", title: "Subsets / Set Partitions" },
  { slug: "lp", title: "Linear Programming" },
  { slug: "geometry", title: "Geometry" },
  { slug: "interactive", title: "Interactive Problems" },
  {
    slug: "misc",
    title: "Miscellaneous",
    children: [
      { slug: "minmax", title: "Min/Max" },
      { slug: "mex", title: "MEX" },
    ],
  },
  { slug: "other", title: "Other / Uncategorized" },
];

type Found = { node: CategoryNode; ancestors: CategoryNode[] };

export function findCategory(slug: string): Found | undefined {
  if (slug === PRACTICE.slug) return { node: PRACTICE, ancestors: [] };

  const walk = (nodes: CategoryNode[], ancestors: CategoryNode[]): Found | undefined => {
    for (const node of nodes) {
      if (node.slug === slug) return { node, ancestors };
      const found = node.children && walk(node.children, [...ancestors, node]);
      if (found) return found;
    }
  };
  return walk(CATEGORY_TREE, []);
}
