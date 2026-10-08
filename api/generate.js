export default async function handler(req, res) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: "REPLICATE_API_TOKEN не настроен в Vercel"
    });
  }

  // Проверка статуса существующей генерации
  if (req.method === "GET") {
    const { id } = req.query || {};

    if (!id) {
      return res.status(400).json({
        error: "ID генерации не указан"
      });
    }

    try {
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.detail || data?.error || "Ошибка Replicate",
          details: data
        });
      }

      return res.status(200).json({
        id: data.id,
        status: data.status,
        output: data.output || null,
        error: data.error || null
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Ошибка проверки генерации",
        details: error.message
      });
    }
  }

  // Создание новой генерации
  if (req.method === "POST") {
    try {
      const { image, trend } = req.body || {};

      if (!image) {
        return res.status(400).json({
          error: "Фото не найдено"
        });
      }

      const prompts = {
        "Рақси вирусӣ":
          "A person performs a stylish energetic viral dance, natural realistic human movement, smooth full-body motion, dynamic camera movement, preserve the person's identity and appearance from the input image.",

        "Кинематикӣ":
          "Create a cinematic realistic video from the input photo. The person moves naturally and confidently, subtle cinematic camera movement, realistic lighting, detailed face and clothing, premium movie look.",

        "Luxury Dubai":
          "Create a luxurious cinematic Dubai-style video from the input photo. The person moves naturally in a glamorous high-end environment, realistic motion, elegant camera movement, premium luxury atmosphere.",

        "Меми аниматсионӣ":
          "Create a funny energetic realistic meme-style video from the input photo. Exaggerated but natural movement, expressive body motion, playful camera movement, highly entertaining.",

        "Тағйирёбӣ":
          "Create a smooth cinematic transformation video from the input photo. The person remains recognizable while the scene and style transform dramatically, realistic motion and seamless transition.",

        "Тренди ду нафар":
          "Create a viral social-media style video with natural energetic human movement. Preserve the person's identity and appearance, realistic body motion, dynamic camera movement and entertaining choreography."
      };

      const prompt =
        prompts[trend] ||
        "Create a realistic cinematic viral social-media video from this photo. Natural human movement, smooth camera motion, realistic lighting, preserve the person's identity and appearance.";

      const response = await fetch(
        "https://api.replicate.com/v1/models/wan-video/wan-2.2-5b-fast/predictions",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            input: {
              image,
              prompt,
              go_fast: true,
              num_frames: 81,
              resolution: "480p",
              aspect_ratio: "9:16",
              sample_shift: 5,
              frames_per_second: 24
            }
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error: data?.detail || data?.error || "Ошибка Replicate",
          details: data
        });
      }

      return res.status(200).json({
        id: data.id,
        status: data.status,
        output: data.output || null
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Ошибка сервера",
        details: error.message
      });
    }
  }

  return res.status(405).json({
    error: "Method not allowed"
  });
}
