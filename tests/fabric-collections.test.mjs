import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { publicFabrics } from "../lib/public-catalog.ts";

const modelUrl = new URL("../lib/fabric-collections.ts", import.meta.url);
const loadCollections = async () => {
  assert.ok(existsSync(modelUrl), "The collection presentation model must exist");
  return import(modelUrl.href);
};

test("all 104 source articles map once into the approved 45/42/17 collections", async () => {
  const { fabricCollections, getFabricCollectionId } = await loadCollections();
  assert.equal(publicFabrics.length, 104);
  assert.equal(new Set(publicFabrics.map((fabric) => fabric.id)).size, 104);
  assert.equal(new Set(publicFabrics.map((fabric) => fabric.articleNumber)).size, 104);
  assert.deepEqual(fabricCollections.map(({ id, count }) => [id, count]), [
    ["structured", 45], ["soft-touch", 42], ["textured", 17],
  ]);
  for (const fabric of publicFabrics) {
    const groups = fabricCollections.filter((group) => group.series.includes(fabric.series));
    assert.equal(groups.length, 1, `${fabric.articleNumber} needs exactly one collection`);
    assert.equal(getFabricCollectionId(fabric), groups[0].id);
  }
  for (const collection of fabricCollections) {
    assert.equal(collection.count, publicFabrics.filter((fabric) => getFabricCollectionId(fabric) === collection.id).length);
    assert.ok(existsSync(new URL(`../public${collection.image}`, import.meta.url)));
  }
  assert.equal(getFabricCollectionId({ series: "Unknown wool blend" }), null);
  assert.equal(getFabricCollectionId({}), null);
});

test("measurement formatting preserves documented ranges and missing-value confirmation labels", async () => {
  const { formatFabricMeasurement } = await loadCollections();
  const unknown = publicFabrics.find((fabric) => fabric.articleNumber === "GD2591");
  assert.equal(formatFabricMeasurement(unknown, "weight"), "Confirm GSM");
  assert.equal(formatFabricMeasurement(unknown, "width"), "Confirm usable width");
  const ranged = publicFabrics.find((fabric) => fabric.articleNumber === "GD2652");
  assert.equal(formatFabricMeasurement(ranged, "weight"), "250-260 GSM");
  assert.equal(formatFabricMeasurement({ ...ranged, weightLabel: undefined }, "weight"), "250 GSM");
  assert.equal(formatFabricMeasurement({ ...ranged, widthLabel: undefined }, "width"), "165 cm");
  assert.equal(formatFabricMeasurement({ ...unknown, weightLabel: undefined }, "weight"), "To be confirmed");
  assert.equal(formatFabricMeasurement({ ...unknown, widthLabel: undefined }, "width"), "To be confirmed");
});

test("collection search and article filters combine without changing source records", async () => {
  const { filterCollectionFabrics } = await loadCollections();
  const snapshot = JSON.stringify(publicFabrics);
  const missing = filterCollectionFabrics(publicFabrics, { query: "  gd2591  " });
  assert.deepEqual(missing.map((fabric) => fabric.articleNumber), ["GD2591"]);
  const raised = filterCollectionFabrics(publicFabrics, { collection: "textured", series: "Raised-pile" });
  assert.deepEqual(raised.map((fabric) => fabric.articleNumber), ["GD2650", "GD2652"]);
  assert.deepEqual(filterCollectionFabrics(publicFabrics, { collection: "structured", series: "Raised-pile" }), []);
  const wool = filterCollectionFabrics(publicFabrics, { collection: "textured", series: "Raised-pile", material: "wool", weight: "under-250" });
  assert.deepEqual(wool.map((fabric) => fabric.articleNumber), ["GD2650"]);
  assert.ok(filterCollectionFabrics(publicFabrics, { query: "combed cotton" }).length > 0);
  assert.equal(JSON.stringify(publicFabrics), snapshot);
});

test("weight bands include their stated boundaries and exclude unconfirmed weights", async () => {
  const { filterCollectionFabrics } = await loadCollections();
  const samples = [0, 249, 250, 350, 351].map((weight) => ({ ...publicFabrics[0], id: `weight-${weight}`, weight }));
  const weights = (weight) => filterCollectionFabrics(samples, { weight }).map((fabric) => fabric.weight);
  assert.deepEqual(weights("all"), [0, 249, 250, 350, 351]);
  assert.deepEqual(weights("under-250"), [249]);
  assert.deepEqual(weights("250-350"), [250, 350]);
  assert.deepEqual(weights("over-350"), [351]);
});

test("default article order introduces each available series before remaining records", async () => {
  const { filterCollectionFabrics } = await loadCollections();
  const result = filterCollectionFabrics(publicFabrics);
  const series = [...new Set(publicFabrics.map((fabric) => fabric.series))];
  assert.deepEqual(result.slice(0, series.length).map((fabric) => fabric.series), series);
  assert.equal(result.length, publicFabrics.length);
  assert.equal(new Set(result.map((fabric) => fabric.id)).size, result.length);
  assert.equal(result[0], publicFabrics[0]);
  assert.equal(result[series.length], publicFabrics[1]);
});
