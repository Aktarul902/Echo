export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ message: "Method not allowed" });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ message: "YouTube API is not configured" });
  }

  const query = new URL(request.url, "http://localhost").searchParams.get("q") || "Bollywood songs";
  const youtubeUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  youtubeUrl.search = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "20",
    regionCode: "IN",
    relevanceLanguage: "hi",
    key: apiKey,
  });

  try {
    const youtubeResponse = await fetch(youtubeUrl);
    const data = await youtubeResponse.json();

    if (!youtubeResponse.ok) {
      console.error("YouTube API error:", data.error?.message || youtubeResponse.statusText);
      return response.status(502).json({ message: "Failed to search YouTube" });
    }

    const songs = (data.items || []).map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      artwork: item.snippet.thumbnails?.high?.url,
      publishedAt: item.snippet.publishedAt,
    }));

    return response.status(200).json(songs);
  } catch (error) {
    console.error("YouTube API request failed:", error.message);
    return response.status(502).json({ message: "Failed to search YouTube" });
  }
}