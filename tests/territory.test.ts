import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EXAMPLE_ZIPS,
  formatNodeId,
  isTerritoryZip,
  lookupZip,
} from "@/lib/territory";

const KNOWN: Array<[string, string, string, string]> = [
  ["12207", "Albany", "Albany", "Capitol"],
  ["12180", "Troy", "Rensselaer", "Collar City"],
  ["12305", "Schenectady", "Schenectady", "Stockade"],
  ["12866", "Saratoga Springs", "Saratoga", "The Spa"],
  ["12065", "Clifton Park", "Saratoga", "Northway Exit 9"],
  ["12534", "Hudson", "Columbia", "Warren Street"],
  ["12414", "Catskill", "Greene", "Catskill"],
  ["12901", "Plattsburgh", "Clinton", "North Country"],
];

const OUTSIDE = [
  "",
  "1220",
  "122077",
  "abcde",
  "12207 ",
  "12 207",
  "10001",
  "12500",
  "12400",
  "00000",
  "99999",
];

describe("territory ZIP lookup", () => {
  it("resolves known Capital Region ZIPs", () => {
    for (const [zip, city, county, node] of KNOWN) {
      assert.equal(isTerritoryZip(zip), true, zip);
      const place = lookupZip(zip);
      assert.ok(place, zip);
      assert.equal(place.zip, zip);
      assert.equal(place.city, city);
      assert.equal(place.county, county);
      assert.equal(place.node, node);
    }
  });

  it("falls back to the prefix region for an unlisted in-territory ZIP", () => {
    const albany = lookupZip("12299");
    assert.ok(albany);
    assert.equal(albany.city, "Albany");
    assert.equal(albany.county, "Albany");
    assert.equal(albany.node, "Capitol");

    const capital = lookupZip("12000");
    assert.ok(capital);
    assert.equal(capital.city, "Capital District");
    assert.equal(capital.county, "Albany");
    assert.equal(capital.node, "West / Mohawk");

    const north = lookupZip("12999");
    assert.ok(north);
    assert.equal(north.city, "North Country");
    assert.equal(north.county, "Clinton");
    assert.equal(north.node, "North Country");
  });

  it("rejects bad and out-of-territory ZIP input", () => {
    for (const zip of OUTSIDE) {
      assert.equal(isTerritoryZip(zip), false, JSON.stringify(zip));
      assert.equal(lookupZip(zip), null, JSON.stringify(zip));
    }
  });

  it("formats a node id and resolves the example ZIPs", () => {
    assert.equal(formatNodeId("12207", "Albany"), "518-12207-ALBANY");
    assert.equal(formatNodeId("12180", "East Greenbush"), "518-12180-EASTGR");
    assert.equal(formatNodeId("12207", "troy"), "518-12207-TROY");
    assert.equal(formatNodeId("12207", "!!!"), "518-12207-NODE");
    assert.equal(formatNodeId("12207", ""), "518-12207-NODE");
    assert.equal(formatNodeId("12207", "123"), "518-12207-NODE");

    assert.ok(EXAMPLE_ZIPS.length >= 5);
    for (const example of EXAMPLE_ZIPS) {
      assert.equal(isTerritoryZip(example.zip), true, example.zip);
      const place = lookupZip(example.zip);
      assert.ok(place, example.zip);
      assert.equal(place.zip, example.zip);
      assert.equal(place.city.includes(example.label), true, example.label);
    }
  });
});
