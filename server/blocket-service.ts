import type { BlocketAdRequest, BlocketAdResponse } from "@shared/blocket-types";

export class BlocketService {
  private baseUrl = "https://api.blocket.se/pro-import-api/v3";
  private authToken: string;

  constructor(authToken: string) {
    this.authToken = authToken;
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": this.authToken,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Blocket API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async createAd(adData: BlocketAdRequest): Promise<BlocketAdResponse> {
    return this.makeRequest<BlocketAdResponse>("POST", "/ad", adData);
  }

  async getAd(sourceId: string): Promise<BlocketAdResponse> {
    return this.makeRequest<BlocketAdResponse>("GET", `/ad/${sourceId}`);
  }

  async updateAd(sourceId: string, adData: Partial<BlocketAdRequest>): Promise<BlocketAdResponse> {
    return this.makeRequest<BlocketAdResponse>("PUT", `/ad/${sourceId}`, adData);
  }

  async deleteAd(sourceId: string): Promise<void> {
    await this.makeRequest<void>("DELETE", `/ad/${sourceId}`);
  }

  async bumpAd(
    sourceId: string, 
    options?: { exclude_blocket?: boolean; exclude_bytbil?: boolean }
  ): Promise<BlocketAdResponse> {
    const params = new URLSearchParams();
    if (options?.exclude_blocket) params.append("exclude_blocket", "true");
    if (options?.exclude_bytbil) params.append("exclude_bytbil", "true");
    
    const endpoint = `/ad/${sourceId}/bump${params.toString() ? `?${params}` : ""}`;
    return this.makeRequest<BlocketAdResponse>("GET", endpoint);
  }

  // Helper method to convert vehicle data to Blocket ad format
  static vehicleToBlocketAd(
    vehicle: any,
    dealerCode: string,
    contactInfo: any,
    sourceId?: string
  ): BlocketAdRequest {
    return {
      source_id: sourceId || `vehicle-${vehicle.id}-${Date.now()}`,
      dealer_code: dealerCode,
      category_id: 1020, // Default to cars category
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ""}`,
      body: `Beautiful ${vehicle.year} ${vehicle.make} ${vehicle.model} in ${vehicle.color} color. 
      ${vehicle.mileage ? `Mileage: ${vehicle.mileage} km` : ""} 
      VIN: ${vehicle.vin}
      
      Contact us for more information and to schedule a test drive!`,
      price: [
        {
          amount: parseInt(vehicle.price || "0"),
          currency: "SEK",
          type: "negotiable" as const,
        },
      ],
      contact: {
        name: contactInfo.name,
        phone: contactInfo.phone,
        email: contactInfo.email,
        company: contactInfo.company,
      },
    };
  }
}