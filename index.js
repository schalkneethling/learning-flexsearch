import pkg from "flexsearch";
const { Document } = pkg;

const data = [
  {
    id: 1,
    title: "Mozilla Firefox",
    engine: "Gecko",
    tag: ["servo", "rust", "spider monkey"],
  },
  {
    id: 2,
    title: "Google Chrome",
    engine: "Chromium",
    tag: ["blink", "v8"],
  },
  {
    id: 3,
    title: "Microsoft Edge",
    engine: "Chromium",
    tag: ["blink", "chakra"],
  },
  {
    id: 4,
    title: "Apple Safari",
    engine: "Webkit",
    tag: ["JavaScriptCore", "SquirrelFish", "nitro"],
  },
];

export const indexData = () => {
  const index = new Document({ index: ["engine", "title"] });
  data.forEach((item) => index.add(item));

  return index;
};

export const indexDataCustomTokenizer = (tokenizerType = "strict") => {
  const index = new Document({
    document: { index: ["engine", "title"], tag: "tag" },
    tokenize: tokenizerType,
  });
  data.forEach((item) => index.add(item));

  return index;
};

export const indexTitleData = () => {
  const index = new Document({ document: "title" });
  data.forEach((item) => index.add(item));

  return index;
};

function main(searchIndex, searchString) {
  const q = searchString || process.argv.slice(2).join(" ");
  console.log(q);

  const resultSet = searchIndex.search(q, { tag: q });
  // when you have multiple indexes (`index: ["engine", "title"]`),
  // your result set can look something like this:
  // [
  //   { field: 'engine', result: [ 2, 3 ] },
  //   { field: 'title', result: [ 2 ] }
  // ]
  // We first create a flat array with all the matched ids called `allMatches`.
  // We initialize a new Set passing `allMatches` to remove duplicates. We can
  // now use our Set, to get the matched results from our data.
  const allMatches = resultSet.flatMap(({ result }) => result);
  const uniqueMatches = new Set(allMatches);
  const results = Array.from(uniqueMatches).map((result) =>
    data.find((item) => item.id === result)
  );

  console.log(resultSet);
  console.log(results);
  return results;
}

const index = indexDataCustomTokenizer("forward");
main(index);

export default main;
