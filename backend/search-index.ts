// Searchable index data structure
//
// This data structure maps a string key to a data structure value.
// Every prefix of the key at least 3 characters long also maps to the
// value.
//
// The index is structured as a trie.

// Only store keys of at least length 3
const MIN_KEY_DEPTH: number = 3;

export class SearchIndex<T> {
    // The root of the keyspace
    private root: Node<T>;
    private values: Map<T, Array<Match<T>>>;

    constructor() {
        this.root = new Node(0);
        this.values = new Map();
    }

    // Insert a value into the index under many keys
    public insert(keys: string, value: T) {
        for (const key of keys.split(/\s+/)) {
            this.insert_single(key, value);
        }
    }

    // Invalidate all of the matches for a particular value
    //
    // This is similar to deleting a value from the map. The matches
    // remain in the tree but the value is never returned as a result
    // for the existing matches.
    //
    // New matches for the value remain valid
    public invalidate(value: T) {
        if (this.values.has(value)) {
            for (const match of this.values.get(value)) {
                match.invalidate();
            }
        }
    }

    // Look up multiple terms
    //
    // Matches are ordered by number of times they appear then closeness
    // to terms
    public search(terms: string): T[] {
        const aggregator = new MatchAggregator(this);

        for (let term of terms.split(/\s+/)) {
            term = term.replace(/[^a-zA-Z0-9]/, "").toLowerCase();
            aggregator.search(term);
        }

        return aggregator.aggregate_results();
    }

    // Find all of the matches for a particlar term
    //
    // Do not use this outside of this file.
    public find(term: string): Array<Match<T>> {
        return this.root.find(term);
    }

    // Insert a value into the index with a given key
    private insert_single(key: string, value: T) {
        // Remove non alpha-numeric values from key and make lowercase
        key = key.replace(/[^a-zA-Z0-9]/, "").toLowerCase();

        const match = new Match(key, value);

        // Add match for value
        if (!this.values.has(value)) {
            this.values.set(value, []);
        }
        this.values.get(value).push(match);

        // Insert into trie
        this.root.insert(key, match);
    }
}

// A node in the trie strucure
class Node<T> {
    // The depth in the tree (depths greater than 3 may store values)
    private depth: number;
    // Any matches for this node in the tree
    private matches: Array<Match<T>>;
    // Child nodes
    private children: Map<string, Node<T>>;

    constructor(depth: number) {
        this.depth = depth;
        this.matches = [];
        this.children = new Map();
    }

    public insert(key: string, match: Match<T>) {
        if (this.depth >= MIN_KEY_DEPTH) {
            this.matches.push(match);
        }

        if (key.length > 0) {
            const [next, rest] = split_key(key);

            if (!this.children.has(next)) {
                this.children.set(next, new Node(this.depth + 1));
            }

            this.children.get(next).insert(rest, match);
        }
    }

    public find(term: string): Array<Match<T>> {
        if (term.length === 0) {
            return this.matches;
        } else {
            const [next, rest] = split_key(term);

            if (this.children.has(next)) {
                return this.children.get(next).find(rest);
            } else {
                return [];
            }
        }
    }
}

/// Split a key into its first character and the rest
function split_key(key: string): [string, string] {
    if (key.length > 0) {
        return [key.substring(0, 1), key.substring(1, key.length)];
    } else {
        throw new TypeError("Cannot split key of length 0");
    }
}

class Match<T> {
    public readonly key: string;
    public readonly value: T;
    private valid: boolean;

    constructor(key: string, value: T) {
        this.key = key;
        this.value = value;
        this.valid = true;
    }

    public is_valid(): boolean {
        return this.valid;
    }

    public invalidate() {
        this.valid = false;
    }

    // How far from the term is the key for the match
    public distance(term: string): number {
        return this.key.length - term.length;
    }
}

/// Aggregates matches for terms in the tree
class MatchAggregator<T> {
    private readonly index: SearchIndex<T>;
    private matches: Map<T, Score>;

    constructor(index: SearchIndex<T>) {
        this.index = index;
        this.matches = new Map();
    }

    /// Search for an additional term and add it to the results
    public search(term: string) {
        const matches = this.index.find(term);

        // Update the score for each matched value
        for (const match of matches) {
            const distance = match.distance(term);

            if (!match.is_valid()) {
                // Ignore invalid matches
                continue;
            }

            if (!this.matches.has(match.value)) {
                this.matches.set(
                    match.value,
                    { count: 0, closest: distance },
                );
            }

            const score = this.matches.get(match.value);
            score.count += 1;
            if (distance < score.closest) {
                score.closest = distance;
            }
        }
    }

    /// Aggregate all of the results and return them in priority order
    public aggregate_results(): T[] {
        const results = Array.from(this.matches);

        // Sort the scored results
        results.sort(([_value1, score1], [_value2, score2]) => {
            // Higher score comes first
            if (score1.count > score2.count) {
                return -1;
            }
            if (score1.count < score2.count) {
                return 1;
            }

            // Lower closest comes first
            if (score1.closest < score2.closest) {
                return -1;
            }
            if (score1.closest > score2.closest) {
                return 1;
            }

            // Equal scores
            return 0;
        });

        // Return the sorted values
        return results.map(([value, _score]) => value);
    }
}

interface Score {
    // Closeness of the closest term in the match
    closest: number;
    // Number of positive matches
    count: number;
}
