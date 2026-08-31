import destinationsData from "./data/destinationsData";

export const destinations = destinationsData.map(d => ({
  id: d.id,
  name: d.name,
  image: d.image,
  tagline: d.tagline,
  category: d.category,
  altitude: d.altitude
}));

export default destinations;