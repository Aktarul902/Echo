import express from "express"
import axios from "axios";
const router = express.Router()
const api = "AIzaSyDYpC9svEETVLiO89nJZRsQQajlt7e2LJc"
router.get("/search",async (req,res)=>{
 try {
    const query = req.query.q || "Bollywood songs";

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          type: "video",
          maxResults: 20,
          regionCode: "IN",
          relevanceLanguage: "hi",
          key:api,
        },
      }
    );

    const songs = response.data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      artwork: item.snippet.thumbnails?.high?.url,
      publishedAt: item.snippet.publishedAt,
    }));

    res.json(songs);
  } catch (error) {
    console.error(
      "YouTube API error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to search YouTube",
      error: error.response?.data || error.message,
    });
  }
})
export default router