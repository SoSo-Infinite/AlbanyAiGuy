export type Place = {
  zip: string;
  city: string;
  county: string;
  node: string;
};

const PLACES: Place[] = [
  { zip: "12207", city: "Albany", county: "Albany", node: "Capitol" },
  { zip: "12210", city: "Albany", county: "Albany", node: "Center Square" },
  { zip: "12203", city: "Albany", county: "Albany", node: "Uptown" },
  { zip: "12208", city: "Albany", county: "Albany", node: "Pine Hills" },
  { zip: "12206", city: "Albany", county: "Albany", node: "West Hill" },
  { zip: "12202", city: "Albany", county: "Albany", node: "South End" },
  { zip: "12204", city: "Albany", county: "Albany", node: "North Albany" },
  { zip: "12209", city: "Albany", county: "Albany", node: "Delaware" },
  { zip: "12205", city: "Colonie", county: "Albany", node: "Wolf Road" },
  { zip: "12211", city: "Loudonville", county: "Albany", node: "Northway" },
  { zip: "12110", city: "Latham", county: "Albany", node: "Airport" },
  { zip: "12054", city: "Delmar", county: "Albany", node: "Bethlehem" },
  { zip: "12077", city: "Glenmont", county: "Albany", node: "Bethlehem" },
  { zip: "12158", city: "Selkirk", county: "Albany", node: "Rail" },
  { zip: "12067", city: "Feura Bush", county: "Albany", node: "Helderberg" },
  { zip: "12084", city: "Guilderland", county: "Albany", node: "Crossgates" },
  { zip: "12009", city: "Altamont", county: "Albany", node: "Helderberg" },
  { zip: "12159", city: "Slingerlands", county: "Albany", node: "New Scotland" },
  { zip: "12186", city: "Voorheesville", county: "Albany", node: "New Scotland" },
  { zip: "12047", city: "Cohoes", county: "Albany", node: "Harmony Mills" },
  { zip: "12189", city: "Watervliet", county: "Albany", node: "Arsenal" },
  { zip: "12182", city: "Troy", county: "Rensselaer", node: "Lansingburgh" },
  { zip: "12180", city: "Troy", county: "Rensselaer", node: "Collar City" },
  { zip: "12183", city: "Troy", county: "Rensselaer", node: "Green Island" },
  { zip: "12144", city: "Rensselaer", county: "Rensselaer", node: "Bath" },
  { zip: "12061", city: "East Greenbush", county: "Rensselaer", node: "Route 4" },
  { zip: "12198", city: "Wynantskill", county: "Rensselaer", node: "North Greenbush" },
  { zip: "12018", city: "Averill Park", county: "Rensselaer", node: "Sand Lake" },
  { zip: "12153", city: "Sand Lake", county: "Rensselaer", node: "Sand Lake" },
  { zip: "12033", city: "Castleton", county: "Rensselaer", node: "Schodack" },
  { zip: "12123", city: "Nassau", county: "Rensselaer", node: "Nassau" },
  { zip: "12063", city: "East Schodack", county: "Rensselaer", node: "Schodack" },
  { zip: "12140", city: "Poestenkill", county: "Rensselaer", node: "Poestenkill" },
  { zip: "12305", city: "Schenectady", county: "Schenectady", node: "Stockade" },
  { zip: "12307", city: "Schenectady", county: "Schenectady", node: "Hamilton Hill" },
  { zip: "12308", city: "Schenectady", county: "Schenectady", node: "GE Realty" },
  { zip: "12304", city: "Schenectady", county: "Schenectady", node: "Upper Union" },
  { zip: "12309", city: "Niskayuna", county: "Schenectady", node: "Research" },
  { zip: "12302", city: "Scotia", county: "Schenectady", node: "Glenville" },
  { zip: "12306", city: "Rotterdam", county: "Schenectady", node: "Altamont Ave" },
  { zip: "12303", city: "Rotterdam", county: "Schenectady", node: "South" },
  { zip: "12065", city: "Clifton Park", county: "Saratoga", node: "Northway Exit 9" },
  { zip: "12019", city: "Ballston Lake", county: "Saratoga", node: "Burnt Hills" },
  { zip: "12020", city: "Ballston Spa", county: "Saratoga", node: "Malta" },
  { zip: "12866", city: "Saratoga Springs", county: "Saratoga", node: "The Spa" },
  { zip: "12118", city: "Mechanicville", county: "Saratoga", node: "Hudson" },
  { zip: "12151", city: "Round Lake", county: "Saratoga", node: "Exit 11" },
  { zip: "12170", city: "Stillwater", county: "Saratoga", node: "Stillwater" },
  { zip: "12188", city: "Waterford", county: "Saratoga", node: "Champlain Canal" },
  { zip: "12831", city: "Gansevoort", county: "Saratoga", node: "Wilton" },
  { zip: "12833", city: "Greenfield Center", county: "Saratoga", node: "Greenfield" },
  { zip: "12850", city: "Middle Grove", county: "Saratoga", node: "Greenfield" },
  { zip: "12871", city: "Schuylerville", county: "Saratoga", node: "Victory" },
  { zip: "12803", city: "South Glens Falls", county: "Saratoga", node: "Moreau" },
  { zip: "12801", city: "Glens Falls", county: "Warren", node: "The Queen" },
  { zip: "12804", city: "Queensbury", county: "Warren", node: "Aviation" },
  { zip: "12845", city: "Lake George", county: "Warren", node: "The Lake" },
  { zip: "12885", city: "Warrensburg", county: "Warren", node: "Adirondack" },
  { zip: "12846", city: "Lake Luzerne", county: "Warren", node: "Hudson" },
  { zip: "12814", city: "Bolton Landing", county: "Warren", node: "Bolton" },
  { zip: "12839", city: "Hudson Falls", county: "Washington", node: "Kingsbury" },
  { zip: "12809", city: "Argyle", county: "Washington", node: "Argyle" },
  { zip: "12832", city: "Granville", county: "Washington", node: "Slate" },
  { zip: "12834", city: "Greenwich", county: "Washington", node: "Battenkill" },
  { zip: "12865", city: "Salem", county: "Washington", node: "Salem" },
  { zip: "12010", city: "Amsterdam", county: "Montgomery", node: "Mohawk" },
  { zip: "12068", city: "Fonda", county: "Montgomery", node: "Mohawk" },
  { zip: "12095", city: "Johnstown", county: "Fulton", node: "Fulton" },
  { zip: "12078", city: "Gloversville", county: "Fulton", node: "Glove City" },
  { zip: "12043", city: "Cobleskill", county: "Schoharie", node: "Schoharie" },
  { zip: "12157", city: "Schoharie", county: "Schoharie", node: "Schoharie" },
  { zip: "12534", city: "Hudson", county: "Columbia", node: "Warren Street" },
  { zip: "12106", city: "Kinderhook", county: "Columbia", node: "Kinderhook" },
  { zip: "12184", city: "Valatie", county: "Columbia", node: "Kinderhook" },
  { zip: "12513", city: "Claverack", county: "Columbia", node: "Claverack" },
  { zip: "12521", city: "Copake", county: "Columbia", node: "Copake" },
  { zip: "12523", city: "Craryville", county: "Columbia", node: "Taghkanic" },
  { zip: "12526", city: "Germantown", county: "Columbia", node: "River" },
  { zip: "12529", city: "Hillsdale", county: "Columbia", node: "Hillsdale" },
  { zip: "12565", city: "Philmont", county: "Columbia", node: "Philmont" },
  { zip: "12583", city: "Stuyvesant", county: "Columbia", node: "River" },
  { zip: "12414", city: "Catskill", county: "Greene", node: "Catskill" },
  { zip: "12413", city: "Cairo", county: "Greene", node: "Cairo" },
  { zip: "12442", city: "Hunter", county: "Greene", node: "Mountain" },
  { zip: "12485", city: "Tannersville", county: "Greene", node: "Mountain" },
  { zip: "12496", city: "Windham", county: "Greene", node: "Windham" },
  { zip: "12450", city: "Lanesville", county: "Greene", node: "Mountain" },
  { zip: "12423", city: "East Durham", county: "Greene", node: "Durham" },
  { zip: "12901", city: "Plattsburgh", county: "Clinton", node: "North Country" },
  { zip: "12903", city: "Plattsburgh", county: "Clinton", node: "North Country" },
  { zip: "12946", city: "Lake Placid", county: "Essex", node: "Olympic" },
  { zip: "12983", city: "Saranac Lake", county: "Franklin", node: "Tri-Lakes" },
  { zip: "12932", city: "Elizabethtown", county: "Essex", node: "Essex" },
];

const PLACE_BY_ZIP = new Map(PLACES.map((p) => [p.zip, p]));

const GREENE_COLUMBIA = new Set(
  PLACES.filter((p) => p.county === "Greene" || p.county === "Columbia").map((p) => p.zip),
);

const PREFIX_REGION: Record<string, { city: string; county: string; node: string; label: string }> = {
  "120": { city: "Capital District", county: "Albany", node: "West / Mohawk", label: "120xx · Capital District / Mohawk" },
  "121": { city: "Capital District", county: "Rensselaer", node: "East / North", label: "121xx · Rensselaer / Saratoga fringe" },
  "122": { city: "Albany", county: "Albany", node: "Capitol", label: "122xx · City of Albany" },
  "123": { city: "Schenectady", county: "Schenectady", node: "Electric City", label: "123xx · Schenectady County" },
  "128": { city: "North Capital", county: "Saratoga", node: "Northway", label: "128xx · Saratoga / Warren / Washington" },
  "129": { city: "North Country", county: "Clinton", node: "North Country", label: "129xx · Clinton / Essex / Franklin" },
};

export const MUNICIPALITIES = [
  { name: "Albany", county: "Albany", status: "core" },
  { name: "Colonie", county: "Albany", status: "core" },
  { name: "Guilderland", county: "Albany", status: "core" },
  { name: "Bethlehem", county: "Albany", status: "core" },
  { name: "Latham", county: "Albany", status: "core" },
  { name: "Cohoes", county: "Albany", status: "core" },
  { name: "Watervliet", county: "Albany", status: "core" },
  { name: "Troy", county: "Rensselaer", status: "core" },
  { name: "East Greenbush", county: "Rensselaer", status: "core" },
  { name: "Rensselaer", county: "Rensselaer", status: "core" },
  { name: "Schenectady", county: "Schenectady", status: "core" },
  { name: "Niskayuna", county: "Schenectady", status: "core" },
  { name: "Rotterdam", county: "Schenectady", status: "core" },
  { name: "Scotia", county: "Schenectady", status: "core" },
  { name: "Clifton Park", county: "Saratoga", status: "core" },
  { name: "Saratoga Springs", county: "Saratoga", status: "core" },
  { name: "Malta", county: "Saratoga", status: "core" },
  { name: "Ballston Spa", county: "Saratoga", status: "core" },
  { name: "Halfmoon", county: "Saratoga", status: "core" },
  { name: "Wilton", county: "Saratoga", status: "live" },
  { name: "Glens Falls", county: "Warren", status: "live" },
  { name: "Queensbury", county: "Warren", status: "live" },
  { name: "Lake George", county: "Warren", status: "live" },
  { name: "Hudson Falls", county: "Washington", status: "live" },
  { name: "Amsterdam", county: "Montgomery", status: "live" },
  { name: "Johnstown", county: "Fulton", status: "live" },
  { name: "Gloversville", county: "Fulton", status: "live" },
  { name: "Cobleskill", county: "Schoharie", status: "live" },
  { name: "Hudson", county: "Columbia", status: "live" },
  { name: "Kinderhook", county: "Columbia", status: "live" },
  { name: "Catskill", county: "Greene", status: "live" },
  { name: "Windham", county: "Greene", status: "edge" },
  { name: "Plattsburgh", county: "Clinton", status: "edge" },
  { name: "Lake Placid", county: "Essex", status: "edge" },
  { name: "Saranac Lake", county: "Franklin", status: "edge" },
] as const;

export function isTerritoryZip(zip: string): boolean {
  if (!/^\d{5}$/.test(zip)) return false;
  const prefix = zip.slice(0, 3);
  if (prefix in PREFIX_REGION) return true;
  return GREENE_COLUMBIA.has(zip);
}

export function lookupZip(zip: string): Place | null {
  if (!isTerritoryZip(zip)) return null;
  const known = PLACE_BY_ZIP.get(zip);
  if (known) return known;
  const prefix = PREFIX_REGION[zip.slice(0, 3)];
  if (!prefix) return null;
  return {
    zip,
    city: prefix.city,
    county: prefix.county,
    node: prefix.node,
  };
}

export function formatNodeId(zip: string, city: string): string {
  const slug = city
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 6);
  return `518-${zip}-${slug || "NODE"}`;
}

export const PREFIX_GUIDE = Object.values(PREFIX_REGION);

export const EXAMPLE_ZIPS = [
  { zip: "12207", label: "Albany" },
  { zip: "12180", label: "Troy" },
  { zip: "12305", label: "Schenectady" },
  { zip: "12866", label: "Saratoga" },
  { zip: "12065", label: "Clifton Park" },
] as const;
