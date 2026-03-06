import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface TennisTripReport {
  tournament: string;
  location: string;
  dates: string;
  transportation: string;
  courtSurface: 'clay' | 'grass' | 'hard' | 'unknown';
  ticketInfo: {
    officialWebsite: string;
    buyingGuide: string;
  };
  travelCosts: {
    median: string;
    range: string;
    details: string;
    bookingLinks: { name: string; url: string }[];
  };
  accommodationCosts: {
    twoStar: { median: string; range: string };
    threeStar: { median: string; range: string };
    fourStar: { median: string; range: string };
    fiveStar: { median: string; range: string };
    others: { median: string; range: string };
    bookingLinks: { name: string; url: string }[];
  };
  destinationOverview: {
    weather: string;
    weatherSourceUrl: string;
    sightseeing: string[];
    generalInfo: string;
    guideLinks: { name: string; url: string }[];
  };
  sources: string[];
}

export async function getTournamentDates(tournament: string): Promise<{ startDate: string; endDate: string } | null> {
  const prompt = `
    Find the official start and end dates for the tennis tournament "${tournament}" in the year 2026.
    Return the dates in YYYY-MM-DD format.
    Return the data in a structured JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          startDate: { type: Type.STRING, description: "YYYY-MM-DD" },
          endDate: { type: Type.STRING, description: "YYYY-MM-DD" },
        },
        required: ["startDate", "endDate"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "null");
  } catch (e) {
    return null;
  }
}

export async function generateTennisTripReport(
  tournament: string,
  departure: string,
  startDate: string,
  endDate: string,
  transportation: string
): Promise<TennisTripReport> {
  const prompt = `
    Generate a detailed travel report for a tennis fan attending the following tournament:
    Tournament: ${tournament}
    Departing From: ${departure}
    Dates: From ${startDate} to ${endDate}
    Transportation Method: ${transportation}

    Please provide:
    1. Location: The city and country where the tournament is held.
    2. Court Surface: Identify if the tournament is played on 'clay', 'grass', or 'hard' court.
    3. Ticket information: Official website URL and a brief guide on where/how to buy tickets.
    4. Travel costs: Median and price range for ${transportation} from ${departure} to the tournament location during these dates. 
       CRITICAL: Generate 2-3 direct booking links. 
       - For Expedia Flights: Use format https://www.expedia.com/Flights-Search?leg1=from:${departure},to:[CityName],departure:${startDate}&leg2=from:[CityName],to:${departure},departure:${endDate}&mode=search
       - Replace [CityName] with the actual city where the tournament is held.
       - Avoid Google Flights.
    5. Accommodation costs: Median and price range for hotels grouped by 2, 3, 4, and 5 stars, plus "others". 
       CRITICAL: Generate 2-3 booking links. 
       - For Expedia Hotels: Use format https://www.expedia.com/Hotel-Search?destination=[CityName]&startDate=${startDate}&endDate=${endDate}
       - For Booking.com: Use format https://www.booking.com/searchresults.html?ss=[CityName]&checkin=${startDate}&checkout=${endDate}
       - Replace [CityName] with the actual city where the tournament is held.
    6. Destination overview: Weather forecast for the dates, top sightseeing spots, and general info. Include a specific URL for the weather forecast source.
    7. Guide links: Include 2-3 destination guide links (e.g., TripAdvisor, official city tourism site). Ensure links are valid.

    Return the data in a structured JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tournament: { type: Type.STRING },
          location: { type: Type.STRING },
          dates: { type: Type.STRING },
          transportation: { type: Type.STRING },
          courtSurface: { type: Type.STRING, enum: ['clay', 'grass', 'hard', 'unknown'] },
          ticketInfo: {
            type: Type.OBJECT,
            properties: {
              officialWebsite: { type: Type.STRING },
              buyingGuide: { type: Type.STRING },
            },
            required: ["officialWebsite", "buyingGuide"],
          },
          travelCosts: {
            type: Type.OBJECT,
            properties: {
              median: { type: Type.STRING },
              range: { type: Type.STRING },
              details: { type: Type.STRING },
              bookingLinks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { name: { type: Type.STRING }, url: { type: Type.STRING } },
                  required: ["name", "url"],
                },
              },
            },
            required: ["median", "range", "details", "bookingLinks"],
          },
          accommodationCosts: {
            type: Type.OBJECT,
            properties: {
              twoStar: {
                type: Type.OBJECT,
                properties: { median: { type: Type.STRING }, range: { type: Type.STRING } },
              },
              threeStar: {
                type: Type.OBJECT,
                properties: { median: { type: Type.STRING }, range: { type: Type.STRING } },
              },
              fourStar: {
                type: Type.OBJECT,
                properties: { median: { type: Type.STRING }, range: { type: Type.STRING } },
              },
              fiveStar: {
                type: Type.OBJECT,
                properties: { median: { type: Type.STRING }, range: { type: Type.STRING } },
              },
              others: {
                type: Type.OBJECT,
                properties: { median: { type: Type.STRING }, range: { type: Type.STRING } },
              },
              bookingLinks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { name: { type: Type.STRING }, url: { type: Type.STRING } },
                  required: ["name", "url"],
                },
              },
            },
            required: ["twoStar", "threeStar", "fourStar", "fiveStar", "others", "bookingLinks"],
          },
          destinationOverview: {
            type: Type.OBJECT,
            properties: {
              weather: { type: Type.STRING },
              weatherSourceUrl: { type: Type.STRING },
              sightseeing: { type: Type.ARRAY, items: { type: Type.STRING } },
              generalInfo: { type: Type.STRING },
              guideLinks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { name: { type: Type.STRING }, url: { type: Type.STRING } },
                  required: ["name", "url"],
                },
              },
            },
            required: ["weather", "weatherSourceUrl", "sightseeing", "generalInfo", "guideLinks"],
          },
        },
        required: [
          "tournament",
          "location",
          "dates",
          "transportation",
          "courtSurface",
          "ticketInfo",
          "travelCosts",
          "accommodationCosts",
          "destinationOverview",
        ],
      },
    },
  });

  const report = JSON.parse(response.text || "{}") as TennisTripReport;
  
  // Extract sources from grounding metadata
  const sources: string[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri) sources.push(chunk.web.uri);
    });
  }
  report.sources = Array.from(new Set(sources));

  return report;
}
