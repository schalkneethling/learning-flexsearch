import main, {
  indexData,
  indexDataCustomTokenizer,
  indexTitleData,
} from "./index.js";

describe("search indexTitleData index", () => {
  let index;

  beforeEach(() => {
    index = indexTitleData();
  });

  test("shoudld return a single result", () => {
    const expected = [{ id: 1, title: "Mozilla Firefox", engine: "Gecko" }];
    const response = main(index, "mozilla");

    expect(response).toEqual(expected);
  });

  test("searching for partial query string returns no results", () => {
    const expected = [];
    // the default tokenizer option is "strict" so only whole words are indexed.
    // this uses less memory but, partial words will return no results.
    const response = main(index, "mozi");

    expect(response).toEqual(expected);
  });

  test("shoud return no results", () => {
    const expected = [];
    const response = main(index, "gecko");

    expect(response).toEqual(expected);
  });
});

describe("search indexData index", () => {
  let index;

  beforeEach(() => {
    index = indexData();
  });

  test("searching for engine returns a result", () => {
    const expected = [{ id: 1, title: "Mozilla Firefox", engine: "Gecko" }];
    const response = main(index, "gecko");

    expect(response).toEqual(expected);
  });

  test("searching for partial engine name returns no results", () => {
    const expected = [];
    // the default tokenizer option is "strict" so only whole words are indexed.
    // this uses less memory but, partial words will return no results.
    const response = main(index, "gec");

    expect(response).toEqual(expected);
  });

  test("searching for title keyword returns a result", () => {
    const expected = [{ id: 2, title: "Google Chrome", engine: "Chromium" }];
    const response = main(index, "chrome");

    expect(response).toEqual(expected);
  });
});

describe("search index which uses a forward tokenizer", () => {
  let index;

  beforeEach(() => {
    index = indexDataCustomTokenizer("forward");
  });

  test("searching for full engine name returns a result", () => {
    const expected = [{ id: 1, title: "Mozilla Firefox", engine: "Gecko" }];
    const response = main(index, "gecko");

    expect(response).toEqual(expected);
  });

  test("searching for partial engine name returns a result", () => {
    const expected = [{ id: 1, title: "Mozilla Firefox", engine: "Gecko" }];
    // we now use a forward tokenizer which incrementally index words in forward direction.
    // for example: "gecko" will be indexed as "g", "ge", "gec", "geck", "gecko"
    const response = main(index, "ge");

    expect(response).toEqual(expected);
  });

  test("searching for partial engine name that should return multiple results", () => {
    const expected = [
      { id: 2, title: "Google Chrome", engine: "Chromium" },
      { id: 3, title: "Microsoft Edge", engine: "Chromium" },
    ];
    // we now use a forward tokenizer which incrementally index words in forward direction.
    // for example: "chromium" will be indexed as "c", "ch", "chr", "chro", "chrom", "chromi", "chromiu", "chromium"
    const response = main(index, "chr");

    expect(response.length).toEqual(2);
    expect(response).toEqual(expected);
  });

  test("search using a query string that starts in the middle of the word returnes no results", () => {
    // a forward tokenizer which incrementally index words in forward direction.
    // for example: "chromium" will be indexed as "c", "ch", "chr", "chro", "chrom", "chromi", "chromiu", "chromium"
    // as such there will be no index for "hro" so no results will be returned.
    const response = main(index, "hro");

    expect(response.length).toEqual(0);
  });
});

describe("search index which uses a reverse tokenizer", () => {
  let index;

  beforeEach(() => {
    index = indexDataCustomTokenizer("reverse");
  });

  test("searching for full engine name returns a result", () => {
    const expected = [{ id: 1, title: "Mozilla Firefox", engine: "Gecko" }];
    const response = main(index, "gecko");

    expect(response).toEqual(expected);
  });

  test("searching for partial engine name returns a result", () => {
    const expected = [{ id: 1, title: "Mozilla Firefox", engine: "Gecko" }];
    // we now use a reverse tokenizer which incrementally index words in both directions.
    // for example: "gecko" will be indexed as "g", "ge", "gec", "geck", "gecko", "ecko", "cko", "ko", "o"
    const response = main(index, "gec");

    expect(response).toEqual(expected);
  });

  test("searching for partial engine name that should return multiple results", () => {
    const expected = [
      { id: 2, title: "Google Chrome", engine: "Chromium" },
      { id: 3, title: "Microsoft Edge", engine: "Chromium" },
    ];
    // we now use a reverse tokenizer which incrementally index words in both directions.
    // for example: "chromium" will be indexed as "c", "ch", "chr", "chro", "chrom", "chromi",
    // "chromiu", "chromium", "hromium", "romium", "mium", "ium", "um", "m"
    const response = main(index, "chr");

    expect(response.length).toEqual(2);
    expect(response).toEqual(expected);
  });

  test("search using a query string that starts with the last 3 characters of a word should return multiple results", () => {
    const expected = [
      { id: 2, title: "Google Chrome", engine: "Chromium" },
      { id: 3, title: "Microsoft Edge", engine: "Chromium" },
    ];
    // we now use a reverse tokenizer which incrementally index words in both directions.
    // for example: "chromium" will be indexed as "c", "ch", "chr", "chro", "chrom", "chromi",
    // "chromiu", "chromium", "hromium", "romium", "mium", "ium", "um", "m"
    const response = main(index, "ium");

    expect(response.length).toEqual(2);
    expect(response).toEqual(expected);
  });

  test("search using a query string that starts in the middle of a word should return no results", () => {
    // we now use a reverse tokenizer which incrementally index words in both directions but,
    // it still does not match every possible combination of characters.
    const response = main(index, "hro");

    expect(response.length).toEqual(0);
  });
});

describe("search index which uses a `full` tokenizer", () => {
  let index;

  beforeEach(() => {
    index = indexDataCustomTokenizer("full");
  });

  test("searching for full engine name returns a result", () => {
    const expected = [{ id: 1, title: "Mozilla Firefox", engine: "Gecko" }];
    const response = main(index, "gecko");

    expect(response).toEqual(expected);
  });

  test("search using forward, backward and middle string queries returns multiple results", () => {
    const expected = [
      { id: 2, title: "Google Chrome", engine: "Chromium" },
      { id: 3, title: "Microsoft Edge", engine: "Chromium" },
    ];
    // we now use a full tokenizer which index every possible combination.
    // Memory Factor (n = length of word): * n * (n - 1)
    let response = main(index, "chr");

    expect(response.length).toEqual(2);
    expect(response).toEqual(expected);

    response = main(index, "ium");

    expect(response.length).toEqual(2);
    expect(response).toEqual(expected);

    response = main(index, "omi");

    expect(response.length).toEqual(2);
    expect(response).toEqual(expected);
  });
});
