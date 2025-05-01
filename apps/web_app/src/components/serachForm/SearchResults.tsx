export default function SearchResults({ properties }: { properties: any[] }) {
  return (
    <div>
      {properties.length > 0 ? (
        properties.map((property: any) => (
          <div key={property.id}>
            <h2>{property.name}</h2>
            <p>{property.description}</p>
            <p>{property.rent}</p>
            <p>{property.availability}</p>
            <p>{property.condition}</p>
            <p>{property.sqft}</p>
            <p>{property.brokerage}</p>
            <p>{property.status}</p>
          </div>
        ))
      ) : (
        <p>No properties found</p>
      )}
    </div>
  );
}
