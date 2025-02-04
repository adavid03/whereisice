export async function geocodeLocation(address: string): Promise<GeocodingResult> {
  const geocoder = new window.mapkit.Geocoder({ language: "en-US" });
  
  return new Promise((resolve, reject) => {
    geocoder.lookup(address, (error: any, data: any) => {
      if (error) reject(error);
      if (data && data.results[0]) resolve(data.results[0]);
      else reject(new Error('Location not found'));
    });
  });
} 